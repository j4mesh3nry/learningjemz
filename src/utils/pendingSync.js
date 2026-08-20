/**
 * Pending-sync queue for game progress.
 *
 * Every local state change (XP earned, streak updated, quiz scores) is snapshotted
 * into localStorage BEFORE attempting a cloud upsert. The snapshot is cleared only
 * after the server write succeeds. On the next app start, if a pending snapshot
 * exists, the local (newer) state wins over the possibly-stale server row, then
 * the queue is flushed. This makes offline/mobile play and transient network or
 * session failures lossless instead of silently dropping XP/streak updates.
 */

const PENDING_SYNC_PREFIX = 'learningjemz_pending_sync_';
const LAST_SYNCED_PREFIX = 'learningjemz_last_synced_';

export function getPendingSyncKey(userId) {
  return `${PENDING_SYNC_PREFIX}${userId}`;
}

export function getLastSyncedKey(userId) {
  return `${LAST_SYNCED_PREFIX}${userId}`;
}

/**
 * Stores a full state snapshot as "pending upload". Overwrites any older pending
 * snapshot for the same user (newest wins).
 */
export function savePendingSync(userId, state) {
  if (!userId || !state) return;
  try {
    localStorage.setItem(
      getPendingSyncKey(userId),
      JSON.stringify({ savedAt: Date.now(), state })
    );
  } catch {}
}

/**
 * Returns the pending snapshot { savedAt, state } or null when nothing is queued.
 */
export function getPendingSync(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(getPendingSyncKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.state) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingSync(userId) {
  if (!userId) return;
  try {
    localStorage.removeItem(getPendingSyncKey(userId));
  } catch {}
}

/**
 * Records the timestamp of a successful cloud upsert.
 */
export function markSynced(userId, savedAt = Date.now()) {
  if (!userId) return;
  try {
    localStorage.setItem(getLastSyncedKey(userId), String(savedAt));
  } catch {}
}

export function getLastSynced(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(getLastSyncedKey(userId));
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

/**
 * True when a pending snapshot exists that was saved AFTER the last successful
 * sync (i.e., local progress the server does not have yet).
 */
export function hasUnsyncedChanges(userId) {
  const pending = getPendingSync(userId);
  if (!pending) return false;
  const lastSynced = getLastSynced(userId);
  return lastSynced === null || pending.savedAt > lastSynced;
}

/**
 * True when a snapshot contains NO user progress at all (fresh default state).
 * Fabricated default snapshots — a stuck init, or the offline first-load
 * fallback on a new device — hold nothing to upload, so flushes and the init
 * restore must never let them override real server data.
 */
export function isPristineDefaultState(s) {
  if (!s) return true;
  const played = Array.isArray(s.playedDates) ? s.playedDates : [];
  return (s.xp || 0) === 0
    && (s.streak || 0) === 0
    && (s.maxStreak || 0) === 0
    && !s.lastVisit
    && played.length === 0
    && (s.chessWins || 0) === 0
    && (s.puzzlesSolved || 0) === 0
    && (s.flashcardsMastered || 0) === 0
    && (s.quizHighScore || 0) === 0;
}