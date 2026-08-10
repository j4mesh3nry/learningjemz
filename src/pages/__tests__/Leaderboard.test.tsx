import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Leaderboard, { withLiveUserValues } from '../Leaderboard';

const { supabaseMock, mockSelect, mockFlushNow } = vi.hoisted(() => {
  const mockSelect = vi.fn(() => chainable);
  const mockFlushNow = vi.fn(() => Promise.resolve());
  const chainable = {
    select: mockSelect,
    order: vi.fn(() => chainable),
    limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
    eq: vi.fn(() => chainable),
    single: vi.fn(() => ({ data: null, error: { code: 'PGRST116' } }))
  };
  return {
    supabaseMock: {
      from: vi.fn(() => chainable),
      channel: vi.fn(() => ({
        on: vi.fn(() => ({ subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })) }))
      })),
      removeChannel: vi.fn()
    },
    mockSelect,
    mockFlushNow
  };
});

vi.mock('../../utils/supabase', () => ({ supabase: supabaseMock }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'me', email: 'me@x.com' } }) }));
vi.mock('../../contexts/GameContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useGame: () => ({ xp: 350, streak: 3, level: 4, flushNow: mockFlushNow })
  };
});

describe('Leaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  });

  it('refetches the board when the app returns to the foreground (visibilitychange)', async () => {
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );
    await waitFor(() => expect(mockSelect).toHaveBeenCalled());
    const callsAfterMount = mockSelect.mock.calls.length;

    fireEvent(document, new Event('visibilitychange'));

    await waitFor(() => expect(mockSelect.mock.calls.length).toBeGreaterThan(callsAfterMount));
    expect(mockFlushNow.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});

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