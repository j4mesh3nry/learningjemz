import { describe, it, expect } from 'vitest';
import { withLiveUserValues } from '../Leaderboard';

describe('withLiveUserValues', () => {
  it('overlays the signed-in user row with live app values', () => {
    const list = [
      { id: 'a', xp: 100, streak: 1, level: 2, name: 'A' },
      { id: 'me', xp: 340, streak: 1, level: 4, name: 'Me' }
    ];

    const out = withLiveUserValues(list, { id: 'me' }, 350, 3, 4);

    expect(out[1].xp).toBe(350);
    expect(out[1].streak).toBe(3);
    expect(out[1].level).toBe(4);
    expect(out[1].id).toBe('me');
    // Other players are untouched (same references)
    expect(out[0]).toEqual(list[0]);
    expect(out[0]).toBe(list[0]);
  });

  it('returns the list untouched when there is no signed-in user', () => {
    const list = [{ id: 'a', xp: 100 }];
    expect(withLiveUserValues(list, null, 350, 3, 4)).toBe(list);
  });

  it('does not overwrite values when live values are falsy', () => {
    const list = [{ id: 'me', xp: 340, streak: 1, level: 4 }];
    const out = withLiveUserValues(list, { id: 'me' }, 0, 0, 1);
    expect(out[0].xp).toBe(0);
    expect(out[0].streak).toBe(0);
  });
});