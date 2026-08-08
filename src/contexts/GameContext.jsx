/* src/contexts/GameContext.jsx */
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { ACHIEVEMENTS } from '../utils/achievements';
import { resetStreakShownForUser } from '../components/StreakScreen';
import { getLocalDateString, backfillPlayedDates } from '../utils/dateUtils';

const GameContext = createContext();

const defaultState = {
  xp: 0,
  level: 1,
  streak: 0,
  previousStreak: 0,
  maxStreak: 0,
  lastVisit: null,
  playedDates: [],
  chessWins: 0,
  puzzlesSolved: 0,
  provincesCorrect: 0,
  readingMinutes: 0,
  flashcardsMastered: 0,
  booksReading: 0,
  quizHighScore: 0,
  botStats: {
    Easy: { played: 0, won: 0, lost: 0 },
    Medium: { played: 0, won: 0, lost: 0 },
    Hard: { played: 0, won: 0, lost: 0 }
  },
  illuminateStats: {
    easy: null,
    medium: null,
    hard: null
  },
  achievements: []
};

export function getStorageKey(userId) {
  return userId ? `learningjemz-game-state_${userId}` : 'learningjemz-game-state_guest';
}

export function getLocalState(userId) {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return defaultState;
    const parsed = { ...defaultState, ...JSON.parse(raw) };
    parsed.playedDates = backfillPlayedDates(parsed.streak, parsed.lastVisit, parsed.playedDates);
    return parsed;
  } catch {
    return defaultState;
  }
}

export function GameProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(defaultState);
  const isInitialized = useRef(false);

  // Initialize and Sync per logged-in User Account
  useEffect(() => {
    let isMounted = true;
    isInitialized.current = false; // Prevent saving old state while fetching

    if (!user) {
      if (isMounted) {
        const local = getLocalState(null);
        setState(local);
        isInitialized.current = true;
      }
      return;
    }

    // Reset to defaultState while fetching new user's progress from cloud
    setState(defaultState);

    const initializeState = async () => {
      const [progressResponse, achievementsResponse] = await Promise.all([
        supabase.from('game_progress').select('*').eq('id', user.id).single(),
        supabase.from('achievements').select('*').eq('user_id', user.id)
      ]);
      const { data, error } = progressResponse;
      const achievementsData = achievementsResponse.data || [];

      if (!isMounted) return;

      if (data) {
        const rawDates = Array.isArray(data.played_dates) 
          ? data.played_dates 
          : Array.isArray(data.bot_stats?.playedDates) 
            ? data.bot_stats.playedDates 
            : getLocalState(user.id).playedDates || [];

        const streakCount = data.streak || 0;
        const lastVisitDate = data.last_visit || null;
        const filledPlayedDates = backfillPlayedDates(streakCount, lastVisitDate, rawDates);

        let initialPrevStreak = Math.max(0, streakCount - 1);
        if (lastVisitDate) {
          const lastVisitStr = getLocalDateString(new Date(lastVisitDate));
          const todayStr = getLocalDateString(new Date());
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = getLocalDateString(yesterday);

          if (lastVisitStr === yesterdayStr) {
            // User visited yesterday! Their streak as of yesterday was streakCount
            initialPrevStreak = streakCount;
          } else if (lastVisitStr === todayStr) {
            // Already visited today
            initialPrevStreak = Math.max(0, streakCount - 1);
          }
        }

        // Remote data exists -> camelCase DB snake_case fields
        const remoteState = {
          xp: data.xp || 0,
          level: data.level || 1,
          streak: streakCount,
          previousStreak: initialPrevStreak,
          maxStreak: data.max_streak || 0,
          lastVisit: lastVisitDate,
          playedDates: filledPlayedDates,
          chessWins: data.chess_wins || 0,
          puzzlesSolved: data.puzzles_solved || 0,
          provincesCorrect: data.provinces_correct || 0,
          readingMinutes: data.reading_minutes || 0,
          flashcardsMastered: data.flashcards_mastered || 0,
          booksReading: data.books_reading || 0,
          quizHighScore: data.quiz_high_score || 0,
          botStats: data.bot_stats || defaultState.botStats,
          illuminateStats: data.illuminate_stats || data.bot_stats?.illuminate || defaultState.illuminateStats,
          achievements: achievementsData.map(a => ({ id: a.achievement_id, unlockedAt: a.unlocked_at }))
        };
        setState(remoteState);
        localStorage.setItem(getStorageKey(user.id), JSON.stringify(remoteState));
      } else if (error && error.code === 'PGRST116') {
        // NEW USER ACCOUNT! Start fresh with defaultState (0 streak, 0 XP, level 1)
        const cleanState = { ...defaultState };
        const dbPayload = {
          id: user.id,
          xp: cleanState.xp,
          level: cleanState.level,
          streak: cleanState.streak,
          max_streak: cleanState.maxStreak,
          last_visit: cleanState.lastVisit,
          played_dates: cleanState.playedDates,
          chess_wins: cleanState.chessWins,
          puzzles_solved: cleanState.puzzlesSolved,
          provinces_correct: cleanState.provincesCorrect,
          reading_minutes: cleanState.readingMinutes,
          flashcards_mastered: cleanState.flashcardsMastered,
          books_reading: cleanState.booksReading,
          quiz_high_score: cleanState.quizHighScore,
          bot_stats: { ...cleanState.botStats, illuminate: cleanState.illuminateStats, playedDates: cleanState.playedDates },
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
          avatar: user.user_metadata?.avatar || '👤'
        };
        await supabase.from('game_progress').insert([dbPayload]);
        setState(cleanState);
        localStorage.setItem(getStorageKey(user.id), JSON.stringify(cleanState));
      }
      
      isInitialized.current = true;
    };

    initializeState();

    return () => { isMounted = false; };
  }, [user]);

  // Streak activity recording with exact transition calculation & auto-backfill
  const recordActivity = useCallback(() => {
    const today = new Date();
    const todayStr = getLocalDateString(today);

    let streakResult = { previousStreak: 0, currentStreak: 0, isNewDay: false };

    setState(prev => {
      let lastVisitStr = prev.lastVisit ? getLocalDateString(new Date(prev.lastVisit)) : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);

      const prevStreakCount = prev.streak || 0;
      let newStreak = 1;
      let prevStreakForAnim = prevStreakCount;

      if (lastVisitStr === todayStr) {
        // User already played today
        newStreak = prevStreakCount > 0 ? prevStreakCount : 1;
        prevStreakForAnim = Math.max(0, newStreak - 1);
      } else if (lastVisitStr === yesterdayStr) {
        // Active consecutive day! Increment streak (e.g., 1 -> 2)
        prevStreakForAnim = prevStreakCount;
        newStreak = prevStreakCount + 1;
      } else if (!lastVisitStr && prevStreakCount > 0) {
        prevStreakForAnim = prevStreakCount;
        newStreak = prevStreakCount + 1;
      } else {
        // Streak broken
        prevStreakForAnim = 0;
        newStreak = 1;
      }

      const currentPlayed = Array.isArray(prev.playedDates) ? prev.playedDates : [];
      const updatedPlayedDates = backfillPlayedDates(
        newStreak,
        todayStr,
        currentPlayed.includes(todayStr) ? currentPlayed : [...currentPlayed, todayStr]
      );

      // Dual-sync to local storage fallback key for external direct readers
      try {
        const legacyKey = user?.id ? `learningjemz_played_dates_${user.id}` : 'learningjemz_played_dates_guest';
        localStorage.setItem(legacyKey, JSON.stringify(updatedPlayedDates));
      } catch {}

      streakResult = {
        previousStreak: prevStreakForAnim,
        currentStreak: newStreak,
        isNewDay: lastVisitStr !== todayStr
      };

      return {
        ...prev,
        streak: newStreak,
        previousStreak: prevStreakForAnim,
        maxStreak: Math.max(prev.maxStreak || 0, newStreak),
        lastVisit: todayStr,
        playedDates: updatedPlayedDates
      };
    });

    return streakResult;
  }, [user?.id]);

  // Save to DB and LocalStorage whenever state changes for current user
  useEffect(() => {
    if (!isInitialized.current) return;

    const storageKey = getStorageKey(user?.id);
    localStorage.setItem(storageKey, JSON.stringify(state));

    if (user) {
      const dbPayload = {
        id: user.id,
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        max_streak: state.maxStreak,
        last_visit: state.lastVisit,
        played_dates: state.playedDates,
        chess_wins: state.chessWins,
        puzzles_solved: state.puzzlesSolved,
        provinces_correct: state.provincesCorrect,
        reading_minutes: state.readingMinutes,
        flashcards_mastered: state.flashcardsMastered,
        books_reading: state.booksReading,
        quiz_high_score: state.quizHighScore,
        bot_stats: { ...state.botStats, illuminate: state.illuminateStats, playedDates: state.playedDates },
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
        avatar: user.user_metadata?.avatar || '👤'
      };
      
      supabase.from('game_progress').upsert(dbPayload).then();
    }
  }, [state, user]);

  const resetProgress = useCallback(async () => {
    setState(defaultState);
    const storageKey = getStorageKey(user?.id);
    localStorage.setItem(storageKey, JSON.stringify(defaultState));
    resetStreakShownForUser(user?.id);

    if (user) {
      const dbPayload = {
        id: user.id,
        xp: 0,
        level: 1,
        streak: 0,
        max_streak: 0,
        last_visit: null,
        played_dates: [],
        chess_wins: 0,
        puzzles_solved: 0,
        provinces_correct: 0,
        reading_minutes: 0,
        flashcards_mastered: 0,
        books_reading: 0,
        quiz_high_score: 0,
        bot_stats: defaultState.botStats,
        illuminate_stats: defaultState.illuminateStats,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
        avatar: user.user_metadata?.avatar || '👤'
      };
      
      await supabase.from('game_progress').upsert(dbPayload);
      await supabase.from('achievements').delete().eq('user_id', user.id);
    }
  }, [user]);

  const unlockAchievement = useCallback(async (achievementId) => {
    if (state.achievements.some(a => a.id === achievementId)) return;
    
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    const unlockedAt = new Date().toISOString();
    
    setState(prev => ({
      ...prev,
      achievements: [...prev.achievements, { id: achievementId, unlockedAt }]
    }));

    if (user) {
      await supabase.from('achievements').insert([{
        user_id: user.id,
        achievement_id: achievementId,
        unlocked_at: unlockedAt
      }]);
    }
  }, [state.achievements, user]);

  const addXP = useCallback((amount) => {
    setState(prev => {
      const newXP = (prev.xp || 0) + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      return {
        ...prev,
        xp: newXP,
        level: newLevel
      };
    });
  }, []);

  const winChessGame = useCallback((difficulty) => {
    const xpGained = difficulty === 'Hard' ? 30 : difficulty === 'Medium' ? 20 : 10;
    addXP(xpGained);
    return xpGained;
  }, [addXP]);

  const recordChessGame = useCallback((difficulty, won) => {
    setState(prev => {
      const currentBot = prev.botStats?.[difficulty] || { played: 0, won: 0, lost: 0 };
      return {
        ...prev,
        chessWins: won ? (prev.chessWins || 0) + 1 : (prev.chessWins || 0),
        botStats: {
          ...prev.botStats,
          [difficulty]: {
            played: currentBot.played + 1,
            won: won ? currentBot.won + 1 : currentBot.won,
            lost: won ? currentBot.lost : currentBot.lost + 1
          }
        }
      };
    });
  }, []);

  const recordIlluminateTime = useCallback((difficulty, timeInSeconds) => {
    let isNewBest = false;
    setState(prev => {
      const currentStats = prev.illuminateStats || { easy: null, medium: null, hard: null };
      const currentBest = currentStats[difficulty];
      isNewBest = currentBest === null || timeInSeconds < currentBest;
      if (isNewBest) {
        return {
          ...prev,
          illuminateStats: {
            ...currentStats,
            [difficulty]: timeInSeconds
          }
        };
      }
      return prev;
    });
    return isNewBest;
  }, []);

  const hasPlayedToday = (() => {
    if (!state.lastVisit) return false;
    return getLocalDateString(new Date(state.lastVisit)) === getLocalDateString(new Date());
  })();

  return (
    <GameContext.Provider value={{
      ...state,
      playedDates: state.playedDates || [],
      hasPlayedToday,
      recordActivity,
      unlockAchievement,
      addXP,
      addXp: addXP,
      winChessGame,
      recordChessGame,
      recordIlluminateTime,
      resetProgress
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
