/* src/contexts/GameContext.jsx */
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { ACHIEVEMENTS } from '../utils/achievements';
import { resetStreakShownForUser } from '../components/StreakScreen';
import { getLocalDateString, backfillPlayedDates, toLocalDateString, pruneFuturePlayedDates, applyDayRollover } from '../utils/dateUtils';
import { savePendingSync, getPendingSync, hasUnsyncedChanges, clearPendingSync, markSynced, isPristineDefaultState } from '../utils/pendingSync';

const GameContext = createContext();

// Hard cap for a single upsert attempt. A request that hangs (flaky mobile
// network) must never stall the flush queue, or every later snapshot would wait
// behind it forever and the server row would lag the app.
const UPSERT_TIMEOUT_MS = 10000;

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
    parsed.playedDates = pruneFuturePlayedDates(
      backfillPlayedDates(parsed.streak, parsed.lastVisit, parsed.playedDates),
      toLocalDateString(parsed.lastVisit)
    );
    return parsed;
  } catch {
    return defaultState;
  }
}

export function GameProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(defaultState);
  const isInitialized = useRef(false);
  const initializedUserIdRef = useRef(null);
  const initFinishedRef = useRef(false);
  const offlineFallbackRef = useRef(false);
  const flushChainRef = useRef(Promise.resolve());
  const flushTimerRef = useRef(null);
  const flushPendingRef = useRef(null);

  // Debounced flush trigger — coalesces rapid XP/streak updates into one write.
  const triggerFlush = useCallback(() => {
    const flush = flushPendingRef.current;
    if (!flush) return;
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => { flush(); }, 400);
  }, []);

  // Pushes the newest pending snapshot to Supabase and clears the queue only on
  // success. Failures (offline, session expiry, network flake) are non-destructive:
  // the pending snapshot survives and the next trigger retries it.
  const flushPending = useCallback(async () => {
    const userId = user?.id;
    if (!userId || !isInitialized.current || !initFinishedRef.current || initializedUserIdRef.current !== userId || offlineFallbackRef.current || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      return;
    }
    flushChainRef.current = flushChainRef.current.then(async () => {
      const pending = getPendingSync(userId);
      if (!pending || !pending.state) return;
      if (isPristineDefaultState(pending.state)) {
        // A fabricated default snapshot (stuck init, offline first-load fallback)
        // holds no real progress — never flush it over real server data.
        clearPendingSync(userId);
        markSynced(userId, pending.savedAt);
        return;
      }
      try {
        const s = pending.state;
        const dbPayload = {
          id: userId,
          xp: s.xp,
          level: s.level,
          streak: s.streak,
          max_streak: s.maxStreak,
          last_visit: s.lastVisit,
          played_dates: s.playedDates,
          chess_wins: s.chessWins,
          puzzles_solved: s.puzzlesSolved,
          provinces_correct: s.provincesCorrect,
          reading_minutes: s.readingMinutes,
          flashcards_mastered: s.flashcardsMastered,
          books_reading: s.booksReading,
          quiz_high_score: s.quizHighScore,
          bot_stats: { ...(s.botStats || {}), illuminate: s.illuminateStats || {}, playedDates: s.playedDates || [] },
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
          avatar: user.user_metadata?.avatar || '👤'
        };
        const { error } = await Promise.race([
          supabase.from('game_progress').upsert(dbPayload),
          new Promise((_, reject) => setTimeout(() => reject(new Error('sync timeout')), UPSERT_TIMEOUT_MS))
        ]);
        if (error) {
          console.warn('[learningjemz] progress sync failed (queued for retry):', error);
          return;
        }
        clearPendingSync(userId);
        markSynced(userId, pending.savedAt);
      } catch (err) {
        console.warn('[learningjemz] progress sync failed (queued for retry):', err);
      }
    });
    return flushChainRef.current;
  }, [user]);

  // Exposes the latest flushPending callback stably so init/persist listeners can
  // trigger a flush without re-running effects when the user object changes.
  useEffect(() => {
    flushPendingRef.current = flushPending;
  }, [flushPending]);

  // Immediate flush (bypasses the debounce), self-healed by UPSERT_TIMEOUT_MS so
  // callers awaiting it (e.g. the leaderboard) can never hang on a dead queue.
  const flushNow = useCallback(() => {
    const userId = user?.id;
    if (!userId) return Promise.resolve();
    clearTimeout(flushTimerRef.current);
    const chain = flushPendingRef.current ? flushPendingRef.current() : Promise.resolve();
    return Promise.race([
      chain,
      new Promise((resolve) => setTimeout(resolve, UPSERT_TIMEOUT_MS))
    ]);
  }, [user]);

  // Initialize and Sync per logged-in User Account. Keyed on the account ID (not
  // the user object identity) so auth token refreshes never wipe in-flight local
  // progress. Unsynced local progress (pending queue) wins over the server row.
  useEffect(() => {
    let isMounted = true;
    const userId = user?.id || null;
    isInitialized.current = false; // Prevent saving old state while fetching
    initFinishedRef.current = false;
    offlineFallbackRef.current = false;

    if (!userId) {
      initializedUserIdRef.current = null;
      if (isMounted) {
        const local = getLocalState(null);
        setState(local);
        isInitialized.current = true;
        initFinishedRef.current = true;
      }
      return;
    }

    if (initializedUserIdRef.current === userId && initFinishedRef.current) {
      // Same account with a COMPLETED initialization — an identity refresh (e.g.
      // session token renewal) must not reset in-memory progress. A mid-flight
      // (aborted) init falls through and re-initializes below.
      isInitialized.current = true;
      return;
    }

    // First time initializing this account in this provider lifetime
    initializedUserIdRef.current = userId;
    setState(defaultState);

    const initializeState = async () => {
      const [progressResponse, achievementsResponse] = await Promise.all([
        supabase.from('game_progress').select('*').eq('id', userId).single(),
        supabase.from('achievements').select('*').eq('user_id', userId)
      ]);
      const { data, error } = progressResponse;
      const achievementsData = achievementsResponse.data || [];

      if (!isMounted) return;

      if (data) {
        const rawDates = Array.isArray(data.played_dates) 
          ? data.played_dates 
          : Array.isArray(data.bot_stats?.playedDates) 
            ? data.bot_stats.playedDates 
            : getLocalState(userId).playedDates || [];

        const streakCount = data.streak || 0;
        const lastVisitDate = data.last_visit || null;
        const lastVisitStr = toLocalDateString(lastVisitDate);
        const filledPlayedDates = pruneFuturePlayedDates(
          backfillPlayedDates(streakCount, lastVisitDate, rawDates),
          lastVisitStr
        );

        let initialPrevStreak = Math.max(0, streakCount - 1);
        if (lastVisitStr) {
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

        // Local progress written offline (or after a failed sync) is newer than
        // the server row — restore it so XP/streak gains are never lost. A queue
        // holding a pristine default (no progress at all) is a fabrication from a
        // stuck init/offline fallback — discard it instead of letting it override
        // the fetched row.
        const pending = getPendingSync(userId);
        if (pending && hasUnsyncedChanges(userId)) {
          if (isPristineDefaultState(pending.state) && !isPristineDefaultState(remoteState)) {
            clearPendingSync(userId);
          } else {
            const merged = { ...remoteState, ...pending.state };
            setState(merged);
            localStorage.setItem(getStorageKey(userId), JSON.stringify(merged));
            isInitialized.current = true;
            initFinishedRef.current = true;
            triggerFlush();
            return;
          }
        }

        setState(remoteState);
        localStorage.setItem(getStorageKey(userId), JSON.stringify(remoteState));
      } else if (error && error.code === 'PGRST116') {
        // No row exists on the server. A pending snapshot holding REAL progress
        // (e.g. the row was deleted, or the account was recreated while this
        // device still had unsynced play) must win over a fresh zero-state —
        // restore it and flush so the row other learners see is never reset.
        const pending = getPendingSync(userId);
        if (pending && hasUnsyncedChanges(userId) && !isPristineDefaultState(pending.state)) {
          const restored = { ...defaultState, ...pending.state };
          setState(restored);
          localStorage.setItem(getStorageKey(userId), JSON.stringify(restored));
          isInitialized.current = true;
          initFinishedRef.current = true;
          triggerFlush();
          return;
        }

        // NEW USER ACCOUNT! Start fresh with defaultState (0 streak, 0 XP, level 1)
        const cleanState = { ...defaultState };
        const dbPayload = {
          id: userId,
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
        const insertResult = await supabase.from('game_progress').insert([dbPayload]);
        if (insertResult.error) {
          // Insert failed (offline/transient, or the row raced into existence).
          // Do NOT queue/persist this fresh 0-state snapshot: a real row may
          // already exist and a later flush would overwrite it. The next real
          // activity (or the next app load) creates or fetches the row normally.
        } else {
          markSynced(userId);
          setState(cleanState);
          localStorage.setItem(getStorageKey(userId), JSON.stringify(cleanState));
        }
      } else {
        // Fetch failed (offline / transient) — fall back to the local snapshot so
        // the session still works. Only flush when real pending progress exists,
        // so we never overwrite the server row with an empty default state.
        const local = getLocalState(userId);
        // On a device with NO local progress the fallback is an empty default.
        // Any activity from that base would look like real progress and could
        // overwrite the server row — block syncing until a fetch succeeds.
        offlineFallbackRef.current = isPristineDefaultState(local);
        setState(local);
        localStorage.setItem(getStorageKey(userId), JSON.stringify(local));
        const pending = getPendingSync(userId);
        if (pending && hasUnsyncedChanges(userId)) {
          isInitialized.current = true;
          initFinishedRef.current = true;
          triggerFlush();
          return;
        }
      }

      isInitialized.current = true;
      initFinishedRef.current = true;
    };

    initializeState();

    return () => { isMounted = false; };
  }, [user, triggerFlush]);

  // Streak activity recording with exact transition calculation & auto-backfill
  const recordActivity = useCallback(() => {
    const today = new Date();
    const todayStr = getLocalDateString(today);

    let streakResult = { previousStreak: 0, currentStreak: 0, isNewDay: false };

    setState(prev => {
      let lastVisitStr = prev.lastVisit ? toLocalDateString(prev.lastVisit) : null;
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

  // Persist locally + enqueue a pending snapshot whenever state changes. The
  // cloud upsert happens through the debounced queued flush (never fire-and-forget).
  useEffect(() => {
    if (!isInitialized.current || !initFinishedRef.current) return;

    const userId = user?.id || null;
    if (userId && initializedUserIdRef.current !== userId) return;

    const storageKey = getStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(state));

    if (userId && offlineFallbackRef.current) {
      // Offline first-load fallback: never queue anything that could overwrite
      // the real row. The local snapshot is kept for display, sync resumes on
      // the next successful fetch.
      return;
    }

    if (userId) {
      savePendingSync(userId, state);
      triggerFlush();
    }
  }, [state, user?.id, triggerFlush]);

  // Re-flush when connectivity returns or the tab becomes visible (backgrounded
  // sessions may have missed the debounced flush). Mobile browsers also throttle
  // timers hard once the page is hidden or closed, so fire an IMMEDIATE flush on
  // pagehide / visibility-hidden instead of relying on the debounce — otherwise
  // the newest XP/streak snapshot may only reach the cloud on the next app start.
  const flushNowRef = useRef(flushNow);
  useEffect(() => {
    flushNowRef.current = flushNow;
  }, [flushNow]);

  useEffect(() => {
    const onOnline = () => triggerFlush();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        triggerFlush();
      } else {
        flushNowRef.current?.();
      }
    };
    const onPageHide = () => flushNowRef.current?.();
    window.addEventListener('online', onOnline);
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [triggerFlush]);

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
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
        avatar: user.user_metadata?.avatar || '👤'
      };
      clearPendingSync(user.id);
      await supabase.from('game_progress').upsert(dbPayload);
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
    const lastVisitStr = toLocalDateString(state.lastVisit);
    if (!lastVisitStr) return false;
    return lastVisitStr === getLocalDateString(new Date());
  })();

  // Changes identity on local day rollover so every consumer re-renders with a
  // fresh hasPlayedToday (unlit fire icons) even when state itself is unchanged.
  const [currentDay, setCurrentDay] = useState(() => getLocalDateString(new Date()));

  // Local-midnight day rollover: fires without a reload so a stale streak resets
  // to 0 (when yesterday was missed) while played dates remain actual history.
  useEffect(() => {
    const lastCheckedDayRef = { current: getLocalDateString(new Date()) };

    const tick = () => {
      const todayStr = getLocalDateString(new Date());
      if (todayStr === lastCheckedDayRef.current) return;
      lastCheckedDayRef.current = todayStr;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);

      setState(prev => applyDayRollover(prev, todayStr, yesterdayStr));
      setCurrentDay(todayStr);
    };

    const intervalId = setInterval(tick, 30000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <GameContext.Provider value={{
      ...state,
      playedDates: state.playedDates || [],
      currentDay,
      hasPlayedToday,
      recordActivity,
      unlockAchievement,
      addXP,
      addXp: addXP,
      winChessGame,
      recordChessGame,
      recordIlluminateTime,
      resetProgress,
      flushNow
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
