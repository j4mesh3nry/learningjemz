/* src/contexts/GameContext.jsx */
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { ACHIEVEMENTS } from '../utils/achievements';
import { resetStreakShownForUser } from '../utils/streakStorage';
import { getLocalDateString, backfillPlayedDates, toLocalDateString, pruneFuturePlayedDates, applyDayRollover } from '../utils/dateUtils';
import { savePendingSync, getPendingSync, hasUnsyncedChanges, clearPendingSync, markSynced, isPristineDefaultState } from '../utils/pendingSync';

const GameContext = createContext();

// Hard cap for a single upsert attempt. A request that hangs (flaky mobile
// network) must never stall the flush queue, or every later snapshot would wait
// behind it forever and the server row would lag the app.
const UPSERT_TIMEOUT_MS = 10000;

export function xpToReachLevel(n) {
  if (n <= 1) return 0;
  return Math.round(38 * Math.pow(n - 1, 1.6));
}

export function getLevelProgress(totalXP) {
  let level = 1;
  while (xpToReachLevel(level + 1) <= totalXP) {
    level++;
  }
  const currentLevelXP = xpToReachLevel(level);
  const nextLevelXP = xpToReachLevel(level + 1);
  const xpInLevel = totalXP - currentLevelXP;
  const levelXPReq = nextLevelXP - currentLevelXP;
  const pct = Math.min(100, Math.max(0, (xpInLevel / levelXPReq) * 100));
  return { level, currentLevelXP, nextLevelXP, xpInLevel, levelXPReq, pct };
}


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
  flashcardsMastered: 0,
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

    const todayStr = getLocalDateString(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const rolledState = applyDayRollover(parsed, todayStr, yesterdayStr);

    rolledState.playedDates = pruneFuturePlayedDates(
      backfillPlayedDates(rolledState.streak, rolledState.lastVisit, rolledState.playedDates),
      toLocalDateString(rolledState.lastVisit)
    );
    return rolledState;
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
          chess_wins: s.chessWins,
          puzzles_solved: s.puzzlesSolved,
          flashcards_mastered: s.flashcardsMastered,
          quiz_high_score: s.quizHighScore,
          bot_stats: { ...(s.botStats || {}), illuminate: s.illuminateStats || {}, playedDates: s.playedDates || [] },
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
          avatar: user.user_metadata?.avatar || 'user'
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
          flashcardsMastered: data.flashcards_mastered || 0,
          quizHighScore: data.quiz_high_score || 0,
          botStats: data.bot_stats || defaultState.botStats,
          illuminateStats: data.illuminate_stats || data.bot_stats?.illuminate || defaultState.illuminateStats,
          achievements: achievementsData.map(a => ({ id: a.achievement_id, unlockedAt: a.unlocked_at }))
        };

        const todayStr = getLocalDateString(new Date());
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);
        const rolledRemoteState = applyDayRollover(remoteState, todayStr, yesterdayStr);

        // Local progress written offline (or after a failed sync) can be newer
        // than the server row — restore it so XP/streak gains are never lost.
        // The server row carries its own write timestamp (updated_at): it is the
        // source of truth whenever it is AT LEAST as new as the local snapshot
        // (e.g. progress made on another device since this queue was written).
        // Only a provably NEWER local snapshot wins. A queue holding a pristine
        // default (no progress at all) is a fabrication from a stuck init /
        // offline fallback — discard it instead of overriding the fetched row.
        const pending = getPendingSync(userId);
        if (pending && hasUnsyncedChanges(userId)) {
          if (isPristineDefaultState(pending.state) && !isPristineDefaultState(rolledRemoteState)) {
            clearPendingSync(userId);
          } else {
            const serverUpdatedAt = data.updated_at ? new Date(data.updated_at).getTime() : 0;
            if (pending.savedAt > serverUpdatedAt) {
              const merged = { ...rolledRemoteState, ...pending.state };
              setState(merged);
              localStorage.setItem(getStorageKey(userId), JSON.stringify(merged));
              isInitialized.current = true;
              initFinishedRef.current = true;
              triggerFlush();
              return;
            }
            // The server row is as new or newer (a stale queue left over from a
            // failed sync on this device, or synced progress from another device)
            // — keep the server data and drop the stale snapshot. Re-queueing it
            // later could overwrite the newer row, so it must never re-assert.
            clearPendingSync(userId);
          }
        }

        setState(rolledRemoteState);
        localStorage.setItem(getStorageKey(userId), JSON.stringify(rolledRemoteState));
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
          chess_wins: cleanState.chessWins,
          puzzles_solved: cleanState.puzzlesSolved,
          flashcards_mastered: cleanState.flashcardsMastered,
          quiz_high_score: cleanState.quizHighScore,
          bot_stats: { ...cleanState.botStats, illuminate: cleanState.illuminateStats, playedDates: cleanState.playedDates },
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
          avatar: user.user_metadata?.avatar || 'user'
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
        chess_wins: 0,
        puzzles_solved: 0,
        flashcards_mastered: 0,
        quiz_high_score: 0,
        bot_stats: { ...defaultState.botStats, illuminate: defaultState.illuminateStats, playedDates: [] },
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
        avatar: user.user_metadata?.avatar || 'user'
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
      const { level: newLevel } = getLevelProgress(newXP);
      return {
        ...prev,
        xp: newXP,
        level: newLevel
      };
    });
  }, []);

  const winChessGame = useCallback((difficulty) => {
    const diffLower = (difficulty || '').toLowerCase();
    // Easy=15, Medium=30, Hard=45
    const xpGained = diffLower.includes('hard') ? 45
      : diffLower.includes('medium') ? 30
      : 15; // Easy
    addXP(xpGained);
    return xpGained;
  }, [addXP]);

  const drawChessGame = useCallback((difficulty) => {
    const diffLower = (difficulty || '').toLowerCase();
    // Easy=8, Medium=16, Hard=22
    const xpGained = diffLower.includes('hard') ? 22
      : diffLower.includes('medium') ? 16
      : 8; // Easy
    addXP(xpGained);
    return xpGained;
  }, [addXP]);

  const lossChessGame = useCallback((difficulty, moveCount = 0) => {
    if (moveCount < 10) return 0;
    const diffLower = (difficulty || '').toLowerCase();
    // Easy=5, Medium=10, Hard=15 (effort reward for 10+ move games)
    const xpGained = diffLower.includes('hard') ? 15
      : diffLower.includes('medium') ? 10
      : 5; // Easy
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

  const recordPuzzleSolved = useCallback((modeOrDiff = 'SURVIVAL', difficulty = 'Easy', currentSessionScoreOrStreak = 1) => {
    let mode = 'SURVIVAL';
    let diff = 'Easy';
    let count = 1;

    if (typeof modeOrDiff === 'string' && (modeOrDiff.toUpperCase() === 'SURVIVAL' || modeOrDiff.toUpperCase() === 'BLITZ')) {
      mode = modeOrDiff.toUpperCase();
      diff = difficulty || 'Easy';
      count = typeof currentSessionScoreOrStreak === 'number' ? currentSessionScoreOrStreak : 1;
    } else {
      // Legacy signature fallback: recordPuzzleSolved(difficulty, cleanSolve, sessionStreak)
      diff = modeOrDiff || 'Easy';
      count = typeof currentSessionScoreOrStreak === 'number' ? currentSessionScoreOrStreak : 1;
    }

    const diffLower = (diff || '').toLowerCase();
    const baseXP = diffLower.includes('hard') ? 15 : diffLower.includes('medium') ? 10 : 6;
    
    // Milestone bonus in Survival mode: +10 XP at streak 5, +20 XP at streak 10, +30 XP at streak 20
    let milestoneBonus = 0;
    if (mode === 'SURVIVAL') {
      if (count === 5) milestoneBonus = 10;
      else if (count === 10) milestoneBonus = 20;
      else if (count === 20) milestoneBonus = 30;
    }

    const totalXPGained = baseXP + milestoneBonus;

    addXP(totalXPGained);
    recordActivity();

    setState(prev => {
      const currentStats = prev.botStats?.puzzleStats || {
        solved: 0,
        survivalHighScore: 0,
        blitzHighScore: 0,
        highStreak: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        easyHighStreak: 0,
        mediumHighStreak: 0,
        hardHighStreak: 0
      };

      const prevSurvivalBest = currentStats.survivalHighScore || currentStats.highStreak || 0;
      const prevBlitzBest = currentStats.blitzHighScore || 0;

      const newSurvivalBest = mode === 'SURVIVAL' ? Math.max(prevSurvivalBest, count) : prevSurvivalBest;
      const newBlitzBest = mode === 'BLITZ' ? Math.max(prevBlitzBest, count) : prevBlitzBest;

      const isHard = diffLower.includes('hard');
      const isMedium = diffLower.includes('medium');
      const diffKey = isHard ? 'hardSolved' : isMedium ? 'mediumSolved' : 'easySolved';

      return {
        ...prev,
        puzzlesSolved: (prev.puzzlesSolved || 0) + 1,
        botStats: {
          ...(prev.botStats || {}),
          puzzleStats: {
            ...currentStats,
            solved: (currentStats.solved || 0) + 1,
            survivalHighScore: newSurvivalBest,
            blitzHighScore: newBlitzBest,
            highStreak: newSurvivalBest,
            [diffKey]: (currentStats[diffKey] || 0) + 1
          }
        }
      };
    });

    return totalXPGained;
  }, [addXP, recordActivity]);

  const recordPuzzleRunEnd = useCallback((mode = 'SURVIVAL', finalScoreOrStreak = 0) => {
    const isSurvival = mode.toUpperCase() === 'SURVIVAL';
    setState(prev => {
      const currentStats = prev.botStats?.puzzleStats || {
        solved: 0,
        survivalHighScore: 0,
        blitzHighScore: 0,
        highStreak: 0
      };

      const prevSurvivalBest = currentStats.survivalHighScore || currentStats.highStreak || 0;
      const prevBlitzBest = currentStats.blitzHighScore || 0;

      const newSurvivalBest = isSurvival ? Math.max(prevSurvivalBest, finalScoreOrStreak) : prevSurvivalBest;
      const newBlitzBest = !isSurvival ? Math.max(prevBlitzBest, finalScoreOrStreak) : prevBlitzBest;

      return {
        ...prev,
        botStats: {
          ...(prev.botStats || {}),
          puzzleStats: {
            ...currentStats,
            survivalHighScore: newSurvivalBest,
            blitzHighScore: newBlitzBest,
            highStreak: newSurvivalBest
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

  const recordCosmicMysteryRun = useCallback((mode, data) => {
    setState(prev => {
      const currentCosmic = prev.botStats?.cosmicMystery || {
        sprintBestTime: null,
        sprintBestCorrect: null,
        sprintHistory: [],
        survivalHighScore: null,
        survivalHistory: [],
        globalMaxCombo: 0
      };

      let updated = { ...currentCosmic };

      if (mode === 'SPRINT') {
        const { time, correct } = data;
        if (updated.sprintBestTime === null || time < updated.sprintBestTime) {
          updated.sprintBestTime = time;
          updated.sprintBestCorrect = correct;
        } else if (updated.sprintBestCorrect === null) {
          updated.sprintBestCorrect = correct;
        }
        const runInfo = { time, correct, timestamp: Date.now() };
        updated.sprintHistory = [runInfo, ...(updated.sprintHistory || [])].slice(0, 3);
      } else if (mode === 'SURVIVAL') {
        const { score } = data;
        if (updated.survivalHighScore === null || score > updated.survivalHighScore) {
          updated.survivalHighScore = score;
        }
        const runInfo = { score, timestamp: Date.now() };
        updated.survivalHistory = [runInfo, ...(updated.survivalHistory || [])].slice(0, 3);
      }

      if (data.maxCombo && data.maxCombo > (updated.globalMaxCombo || 0)) {
        updated.globalMaxCombo = data.maxCombo;
      }

      return {
        ...prev,
        botStats: {
          ...(prev.botStats || {}),
          cosmicMystery: updated
        }
      };
    });
  }, []);

  const getModuleStats = useCallback((moduleId) => {
    return state.botStats?.[moduleId] || {};
  }, [state.botStats]);

  const recordModuleActivity = useCallback(({
    moduleId,
    xpGained = 0,
    statsUpdate = {},
    streakEligible = true
  } = {}) => {
    if (xpGained > 0) {
      addXP(xpGained);
    }
    if (streakEligible) {
      recordActivity();
    }
    if (moduleId && statsUpdate && typeof statsUpdate === 'object' && Object.keys(statsUpdate).length > 0) {
      setState(prev => ({
        ...prev,
        botStats: {
          ...(prev.botStats || {}),
          [moduleId]: {
            ...(prev.botStats?.[moduleId] || {}),
            ...statsUpdate
          }
        }
      }));
    }
  }, [addXP, recordActivity]);

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
      drawChessGame,
      lossChessGame,
      recordChessGame,
      recordPuzzleSolved,
      recordPuzzleRunEnd,
      recordIlluminateTime,
      recordCosmicMysteryRun,
      getModuleStats,
      recordModuleActivity,
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

export function useModuleProgress(moduleId) {
  const game = useGame();
  const moduleStats = game.getModuleStats ? game.getModuleStats(moduleId) : (game.botStats?.[moduleId] || {});

  const recordProgress = useCallback(({ xpGained = 0, statsUpdate = {}, streakEligible = true } = {}) => {
    if (game.recordModuleActivity) {
      return game.recordModuleActivity({
        moduleId,
        xpGained,
        statsUpdate,
        streakEligible
      });
    }
    if (xpGained > 0 && game.addXP) game.addXP(xpGained);
    if (streakEligible && game.recordActivity) game.recordActivity();
  }, [game, moduleId]);

  return {
    ...game,
    moduleStats,
    recordProgress
  };
}
