import { describe, it, expect, beforeEach } from 'vitest';
import {
  savePendingSync,
  getPendingSync,
  clearPendingSync,
  markSynced,
  getLastSynced,
  hasUnsyncedChanges,
  getPendingSyncKey,
  getLastSyncedKey,
  isPristineDefaultState
} from '../pendingSync';

describe('pendingSync queue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads a pending snapshot per user', () => {
    const state = { xp: 350, streak: 2, lastVisit: '2026-08-10' };
    savePendingSync('user-a', state);

    const pending = getPendingSync('user-a');
    expect(pending).not.toBeNull();
    expect(pending!.state).toEqual(state);
    expect(typeof pending!.savedAt).toBe('number');

    expect(getPendingSync('user-b')).toBeNull();
    expect(localStorage.getItem(getPendingSyncKey('user-b'))).toBeNull();
  });

  it('overwrites an older pending snapshot with the newest', () => {
    savePendingSync('user-a', { xp: 340 });
    const first = getPendingSync('user-a')!;
    savePendingSync('user-a', { xp: 350 });

    const pending = getPendingSync('user-a')!;
    expect(pending.state.xp).toBe(350);
    expect(pending.savedAt).toBeGreaterThanOrEqual(first.savedAt);
  });

  it('clears the pending snapshot', () => {
    savePendingSync('user-a', { xp: 350 });
    clearPendingSync('user-a');
    expect(getPendingSync('user-a')).toBeNull();
    expect(localStorage.getItem(getPendingSyncKey('user-a'))).toBeNull();
  });

  it('ignores corrupted JSON and returns null', () => {
    localStorage.setItem(getPendingSyncKey('user-a'), '{not json');
    expect(getPendingSync('user-a')).toBeNull();

    localStorage.setItem(getPendingSyncKey('user-a'), JSON.stringify({ savedAt: 1 }));
    expect(getPendingSync('user-a')).toBeNull();
  });

  it('tracks the last successful sync timestamp', () => {
    expect(getLastSynced('user-a')).toBeNull();
    markSynced('user-a', 12345);
    expect(getLastSynced('user-a')).toBe(12345);
    expect(localStorage.getItem(getLastSyncedKey('user-a'))).toBe('12345');
  });

  it('reports unsynced changes only when pending is newer than the last sync', () => {
    expect(hasUnsyncedChanges('user-a')).toBe(false);

    markSynced('user-a', 1000);
    savePendingSync('user-a', { xp: 350 });
    expect(hasUnsyncedChanges('user-a')).toBe(true);

    // Saved before the last successful sync → already on the server
    savePendingSync('user-a', { xp: 350 });
    const pending = getPendingSync('user-a')!;
    localStorage.setItem(getLastSyncedKey('user-a'), String(pending.savedAt + 1));
    expect(hasUnsyncedChanges('user-a')).toBe(false);
  });

  it('distinguishes pristine (fabricated default) snapshots from real progress', () => {
    expect(isPristineDefaultState(null)).toBe(true);
    expect(isPristineDefaultState({})).toBe(true);
    expect(isPristineDefaultState({ xp: 0, streak: 0, maxStreak: 0, lastVisit: null, playedDates: [] })).toBe(true);

    expect(isPristineDefaultState({ xp: 10 })).toBe(false);
    expect(isPristineDefaultState({ streak: 2 })).toBe(false);
    expect(isPristineDefaultState({ maxStreak: 5 })).toBe(false);
    expect(isPristineDefaultState({ playedDates: ['2026-08-10'] })).toBe(false);
    expect(isPristineDefaultState({ lastVisit: '2026-08-10' })).toBe(false);
    expect(isPristineDefaultState({ chessWins: 1 })).toBe(false);
    expect(isPristineDefaultState({ quizHighScore: 50 })).toBe(false);
  });
});