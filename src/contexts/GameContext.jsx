/* src/contexts/GameContext.jsx */
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { ACHIEVEMENTS } from '../utils/achievements';

const GameContext = createContext();

const STORAGE_KEY = 'learningjemz-game-state';

const defaultState = {
  xp: 0,
  level: 1,
  streak: 0,
  maxStreak: 0,
  lastVisit: null,
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
  achievements: []
};

function getLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

export function GameProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(defaultState);
  const isInitialized = useRef(false);

  // Initialize and Sync
  useEffect(() => {
    let isMounted = true;
    isInitialized.current = false; // Prevent saving old state while fetching

    const initializeState = async () => {
      const localState = getLocalState();
      
      if (!user) {
        // If not logged in, just use local state
        if (isMounted) {
          setState(localState);
          isInitialized.current = true;
        }
        return;
      }

      // User is logged in, fetch from Supabase
      const [progressResponse, achievementsResponse] = await Promise.all([
        supabase.from('game_progress').select('*').eq('id', user.id).single(),
        supabase.from('achievements').select('*').eq('user_id', user.id)
      ]);
      const { data, error } = progressResponse;
      const achievementsData = achievementsResponse.data || [];

      if (!isMounted) return;

      if (data) {
        // We have remote data, use it (camelCase it because DB uses snake_case)
        const remoteState = {
          xp: data.xp,
          level: data.level,
          streak: data.streak,
          maxStreak: data.max_streak,
          lastVisit: data.last_visit,
          chessWins: data.chess_wins,
          puzzlesSolved: data.puzzles_solved,
          provincesCorrect: data.provinces_correct,
          readingMinutes: data.reading_minutes,
          flashcardsMastered: data.flashcards_mastered,
          booksReading: data.books_reading,
          quizHighScore: data.quiz_high_score,
          botStats: data.bot_stats || defaultState.botStats,
          achievements: achievementsData.map(a => ({ id: a.achievement_id, unlockedAt: a.unlocked_at }))
        };
        setState(remoteState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
      } else if (error && error.code === 'PGRST116') {
        // No row exists (first login), migrate local data to Supabase
        const dbPayload = {
          id: user.id,
          xp: localState.xp,
          level: localState.level,
          streak: localState.streak,
          max_streak: localState.maxStreak,
          last_visit: localState.lastVisit,
          chess_wins: localState.chessWins,
          puzzles_solved: localState.puzzlesSolved,
          provinces_correct: localState.provincesCorrect,
          reading_minutes: localState.readingMinutes,
          flashcards_mastered: localState.flashcardsMastered,
          books_reading: localState.booksReading,
          quiz_high_score: localState.quizHighScore,
          bot_stats: localState.botStats,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
          avatar: user.user_metadata?.avatar || '👤'
        };
        await supabase.from('game_progress').insert([dbPayload]);
        setState(localState);
      }
      
      isInitialized.current = true;
    };

    initializeState();

    return () => { isMounted = false; };
  }, [user]);

  // Streak is now handled by recordActivity called upon completing a game/puzzle
  const recordActivity = () => {
    const today = new Date().toDateString();
    if (state.lastVisit === today) return false;

    setState(prev => {
      if (prev.lastVisit === today) return prev;
      let newStreak = prev.streak;
      if (prev.lastVisit) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (prev.lastVisit === yesterday.toDateString()) {
          newStreak = prev.streak + 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
      return { ...prev, streak: newStreak, maxStreak: Math.max(prev.maxStreak || 0, newStreak), lastVisit: today };
    });
    return true;
  };

  // Save to DB and LocalStorage whenever state changes
  useEffect(() => {
    if (!isInitialized.current) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    if (user) {
      const dbPayload = {
        id: user.id,
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        max_streak: state.maxStreak,
        last_visit: state.lastVisit,
        chess_wins: state.chessWins,
        puzzles_solved: state.puzzlesSolved,
        provinces_correct: state.provincesCorrect,
        reading_minutes: state.readingMinutes,
        flashcards_mastered: state.flashcardsMastered,
        books_reading: state.booksReading,
        quiz_high_score: state.quizHighScore,
        bot_stats: state.botStats,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
        avatar: user.user_metadata?.avatar || '👤'
      };
      
      supabase.from('game_progress').upsert(dbPayload).then();
    }
  }, [state, user]);

  const unlockAchievement = async (achievementId) => {
    if (state.achievements.some(a => a.id === achievementId)) return;
    
    const newAchievement = { id: achievementId, unlockedAt: new Date().toISOString() };
    setState(prev => ({ ...prev, achievements: [...prev.achievements, newAchievement] }));
    
    if (user) {
      await supabase.from('achievements').insert([{
        user_id: user.id,
        achievement_id: achievementId,
        unlocked_at: newAchievement.unlockedAt
      }]);
    }
  };

  // Auto-evaluate achievements
  useEffect(() => {
    if (!isInitialized.current) return;
    
    ACHIEVEMENTS.forEach(ach => {
      if (ach.condition(state) && !state.achievements.some(a => a.id === ach.id)) {
        unlockAchievement(ach.id);
      }
    });
  }, [state]);

  const addXp = (amount) => {
    setState(prev => {
      const newTotal = prev.xp + amount;
      const newLevel = Math.floor(newTotal / 100) + 1;
      return { ...prev, xp: newTotal, level: newLevel };
    });
  };

  const winChessGame = (difficulty = 'Easy') => {
    const xpReward = difficulty === 'Hard' ? 20 : difficulty === 'Medium' ? 15 : 10;
    setState(prev => ({ ...prev, chessWins: prev.chessWins + 1 }));
    addXp(xpReward);
    return xpReward;
  };

  const recordChessGame = (difficulty, won) => {
    setState(prev => {
      const currentStats = prev.botStats || defaultState.botStats;
      const diffStats = currentStats[difficulty] || { played: 0, won: 0, lost: 0 };
      
      return {
        ...prev,
        botStats: {
          ...currentStats,
          [difficulty]: {
            ...diffStats,
            played: diffStats.played + 1,
            won: diffStats.won + (won ? 1 : 0),
            lost: diffStats.lost + (won ? 0 : 1)
          }
        }
      };
    });
  };

  const solvePuzzle = () => {
    setState(prev => ({ ...prev, puzzlesSolved: prev.puzzlesSolved + 1 }));
    addXp(5);
  };

  const answerProvinceCorrect = () => {
    setState(prev => ({ ...prev, provincesCorrect: prev.provincesCorrect + 1 }));
    addXp(2);
  };

  const masterFlashcard = () => {
    setState(prev => ({ ...prev, flashcardsMastered: prev.flashcardsMastered + 1 }));
    addXp(2);
  };

  const readForMinutes = (mins) => {
    setState(prev => ({ ...prev, readingMinutes: prev.readingMinutes + mins }));
    addXp(mins);
  };

  const startReadingBook = () => {
    setState(prev => ({ ...prev, booksReading: prev.booksReading + 1 }));
  };

  const updateQuizHighScore = (score) => {
    setState(prev => ({ ...prev, quizHighScore: Math.max(prev.quizHighScore, score) }));
  };

  const hasPlayedToday = state.lastVisit === new Date().toDateString();

  const value = { 
    ...state, 
    hasPlayedToday,
    addXp,
    winChessGame,
    recordChessGame,
    solvePuzzle,
    answerProvinceCorrect,
    masterFlashcard,
    readForMinutes,
    startReadingBook,
    updateQuizHighScore,
    recordActivity
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
