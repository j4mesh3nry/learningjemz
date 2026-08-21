import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { GameProvider, useGame } from '../GameContext';

const { supabaseMock, mockData, mockUseAuth } = vi.hoisted(() => {
  const mockUseAuth = vi.fn(() => ({ user: null } as any));
  const mockData: any = { row: null, singleImpl: null, lastUpsert: null };
  const chainable = {
    select: vi.fn(() => chainable),
    order: vi.fn(() => chainable),
    limit: vi.fn(() => ({ data: [], error: null })),
    eq: vi.fn(() => chainable),
    single: vi.fn(() =>
      mockData.singleImpl
        ? mockData.singleImpl()
        : { data: mockData.row, error: mockData.row ? null : { code: 'PGRST116' } }
    ),
    insert: vi.fn(() => ({ error: null })),
    upsert: vi.fn((payload: any) => {
      mockData.lastUpsert = payload;
      return Promise.resolve({ error: null });
    })
  };
  return {
    supabaseMock: {
      from: vi.fn(() => chainable),
      channel: vi.fn(() => ({
        on: vi.fn(() => ({ subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })) }))
      })),
      removeChannel: vi.fn()
    },
    mockData,
    mockUseAuth
  };
});

vi.mock('../../utils/supabase', () => ({ supabase: supabaseMock }));
vi.mock('../AuthContext', () => ({ useAuth: mockUseAuth }));

const recordActivityRef: { current: (() => void) | null } = { current: null };
function Harness() {
  const game = useGame();
  recordActivityRef.current = game.recordActivity;
  return <div>streak:{game.streak}</div>;
}

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function localDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sampleRow(id: string, streak: number) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const ys = localDateStr(yesterday);
  return {
    id,
    xp: 500,
    level: 6,
    streak,
    max_streak: 10,
    last_visit: ys,
    played_dates: [ys],
    name: 'Me',
    avatar: 'user'
  };
}

function samplePendingState(overrides: Record<string, any> = {}) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const ys = localDateStr(yesterday);
  return {
    xp: 250,
    level: 3,
    streak: 3,
    previousStreak: 2,
    maxStreak: 5,
    lastVisit: ys,
    playedDates: [ys],
    botStats: {},
    illuminateStats: {},
    achievements: [],
    ...overrides
  };
}

describe('GameProvider smoke test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReset();
    mockUseAuth.mockReturnValue({ user: null });
    mockData.row = null;
    mockData.singleImpl = null;
    mockData.lastUpsert = null;
    recordActivityRef.current = null;
    localStorage.clear();
  });

  it('renders children without crashing (guest path incl. sync hooks)', () => {
    render(
      <GameProvider>
        <div>provider-alive</div>
      </GameProvider>
    );
    expect(screen.getByText('provider-alive')).toBeInTheDocument();
  });

  it('loads a user row, persists a pending snapshot, and flushes it to Supabase', async () => {
    mockData.row = sampleRow('user-1', 4);
    mockUseAuth.mockReturnValue({ user: { id: 'user-1', email: 'me@x.com', user_metadata: { name: 'Me' } } });

    render(
      <GameProvider>
        <Harness />
      </GameProvider>
    );

    // The load is async — the streak must appear only after the fetch applies
    await waitFor(() => expect(screen.getByText('streak:4')).toBeInTheDocument());

    // The loaded state is flushed to Supabase and marked as synced (the pending
    // snapshot is transient and cleared on success)
    await vi.waitFor(() => {
      expect(localStorage.getItem('learningjemz_last_synced_user-1')).not.toBeNull();
    });
    expect(mockData.lastUpsert?.streak).toBe(4);
  });

  it('re-initializes when auth identity changes mid-fetch and never flushes a zero snapshot', async () => {
    const row = sampleRow('u1', 7);
    const d1 = deferred<any>();
    const d2 = deferred<any>();
    const singles = [() => d1.promise, () => d2.promise];
    mockData.singleImpl = () => singles.shift()!();

    // Auth emits two different user object identities with the same id (the
    // getSession + onAuthStateChange double-fire) while the fetch is in flight.
    // Everything rendered AFTER the rerender must receive the same object
    // reference (identityB) so no further init re-runs are triggered.
    const identityA = { user: { id: 'u1', email: 'a@x.com' } };
    const identityB = { user: { id: 'u1', email: 'b@x.com' } };
    mockUseAuth.mockReturnValueOnce(identityA);
    const { rerender } = render(
      <GameProvider>
        <Harness />
      </GameProvider>
    );
    mockUseAuth.mockReturnValueOnce(identityB);
    rerender(
      <GameProvider>
        <Harness />
      </GameProvider>
    );
    mockUseAuth.mockReturnValue(identityB);

    act(() => {
      d1.resolve({ data: row, error: null });
      d2.resolve({ data: row, error: null });
    });

    // The aborted first init must be re-run — the real streak must appear and a
    // default-state (streak 0) snapshot must never be flushed.
    await waitFor(() => expect(screen.getByText('streak:7')).toBeInTheDocument());

    act(() => recordActivityRef.current?.());
    await vi.waitFor(() => expect(mockData.lastUpsert).toBeTruthy());
    expect(mockData.lastUpsert.streak).toBeGreaterThanOrEqual(7);
  });

  it('does not queue or flush anything while initialization is in flight', async () => {
    const row = sampleRow('u2', 3);
    const d1 = deferred<any>();
    mockData.singleImpl = () => d1.promise;
    mockUseAuth.mockReturnValue({ user: { id: 'u2' } });

    render(
      <GameProvider>
        <Harness />
      </GameProvider>
    );

    // Activity during the slow fetch must not create a pending snapshot or flush
    act(() => recordActivityRef.current?.());
    expect(localStorage.getItem('learningjemz_pending_sync_u2')).toBeNull();
    expect(mockData.lastUpsert).toBeNull();

    d1.resolve({ data: row, error: null });
    await waitFor(() => expect(screen.getByText('streak:3')).toBeInTheDocument());
  });

  it('never flushes a pristine default snapshot over a real row (offline fallback)', async () => {
    mockData.row = null;
    mockData.singleImpl = () => ({ data: null, error: { code: 'FETCH_FAILED' } });
    mockUseAuth.mockReturnValue({ user: { id: 'u3' } });

    render(
      <GameProvider>
        <Harness />
      </GameProvider>
    );

    // Fresh device, offline: init falls back to a pristine local state
    await waitFor(() => expect(screen.getByText('streak:0')).toBeInTheDocument());

    // The fallback must not queue anything, and even if a stray timer fired, a
    // pristine snapshot must never reach the server
    expect(localStorage.getItem('learningjemz_pending_sync_u3')).toBeNull();
    await new Promise((r) => setTimeout(r, 600));
    expect(mockData.lastUpsert).toBeNull();
  });

  it('blocks syncing after an offline fallback until the next successful fetch', async () => {
    const row = sampleRow('u5', 8);
    let fail = true;
    mockData.singleImpl = () =>
      fail ? { data: null, error: { code: 'FETCH_FAILED' } } : { data: row, error: null };
    mockUseAuth.mockReturnValue({ user: { id: 'u5' } });

    const firstLoad = render(
      <GameProvider>
        <Harness />
      </GameProvider>
    );
    await waitFor(() => expect(screen.getByText('streak:0')).toBeInTheDocument());

    // Playing from the pristine offline base must never reach the server
    act(() => recordActivityRef.current?.());
    await new Promise((r) => setTimeout(r, 600));
    expect(mockData.lastUpsert).toBeNull();
    expect(localStorage.getItem('learningjemz_pending_sync_u5')).toBeNull();

    // Next app load with network: the real row wins again and sync resumes
    firstLoad.unmount();
    fail = false;
    render(
      <GameProvider>
        <Harness />
      </GameProvider>
    );
    await waitFor(() => expect(screen.getByText('streak:8')).toBeInTheDocument());
    await vi.waitFor(() => expect(mockData.lastUpsert).toBeTruthy());
    expect(mockData.lastUpsert.streak).toBe(8);
  });

  it('discards a fabricated default snapshot in favour of the real row', async () => {
    const row = sampleRow('u4', 8);
    mockData.row = row;
    mockUseAuth.mockReturnValue({ user: { id: 'u4' } });

    // Stale fabricated default snapshot left over from a buggy session
    localStorage.setItem(
      'learningjemz_pending_sync_u4',
      JSON.stringify({
        savedAt: Date.now() + 1,
        state: { xp: 0, streak: 0, level: 1, maxStreak: 0, lastVisit: null, playedDates: [], botStats: {}, illuminateStats: {}, achievements: [] }
      })
    );

    render(
      <GameProvider>
        <Harness />
      </GameProvider>
    );

    await waitFor(() => expect(screen.getByText('streak:8')).toBeInTheDocument());

    // The pristine snapshot was discarded and only real data was re-queued
    await vi.waitFor(() => {
      const pending = JSON.parse(localStorage.getItem('learningjemz_pending_sync_u4') || '{}');
      expect(pending?.state?.streak).toBe(8);
    });

    await vi.waitFor(() => expect(mockData.lastUpsert).toBeTruthy());
    expect(mockData.lastUpsert.streak).toBe(8);
  });

  it('a stale local queue never overrides a newer server row (cross-device)', async () => {
    const now = Date.now();
    const row = {
      ...sampleRow('u10', 6),
      updated_at: new Date(now - 10 * 60 * 1000).toISOString()
    };
    mockData.row = row;
    mockUseAuth.mockReturnValue({ user: { id: 'u10' } });

    // Stale pending snapshot left on THIS device by an old failed session. The
    // server row was updated afterwards (e.g. the same account played on the
    // phone), so the snapshot must NOT override the newer cloud data.
    localStorage.setItem(
      'learningjemz_pending_sync_u10',
      JSON.stringify({
        savedAt: now - 60 * 60 * 1000,
        state: samplePendingState({ xp: 900, streak: 9, maxStreak: 15 })
      })
    );

    render(
      <GameProvider>
        <Harness />
      </GameProvider>
    );

    // The server row wins — the stale streak:9 must never appear
    await waitFor(() => expect(screen.getByText('streak:6')).toBeInTheDocument());

    // The stale snapshot was dropped: only the server's values are re-queued
    // and flushed, so the newer row is never overwritten with old data.
    await vi.waitFor(() => expect(mockData.lastUpsert).toBeTruthy());
    expect(mockData.lastUpsert.streak).toBe(6);
    expect(mockData.lastUpsert.xp).toBe(500);
    expect(localStorage.getItem('learningjemz_pending_sync_u10')).toBeNull();
  });

  it('a local snapshot newer than the server row wins and is flushed', async () => {
    const now = Date.now();
    mockData.row = {
      ...sampleRow('u11', 4),
      xp: 100,
      updated_at: new Date(now - 2 * 60 * 60 * 1000).toISOString()
    };
    mockUseAuth.mockReturnValue({ user: { id: 'u11' } });

    // Real unsynced offline progress saved AFTER the server's last write
    localStorage.setItem(
      'learningjemz_pending_sync_u11',
      JSON.stringify({
        savedAt: now,
        state: samplePendingState({ xp: 250, streak: 5 })
      })
    );

    render(
      <GameProvider>
        <Harness />
      </GameProvider>
    );

    // Local (newer) snapshot wins and is pushed up so other devices see it too
    await waitFor(() => expect(screen.getByText('streak:5')).toBeInTheDocument());
    await vi.waitFor(() => expect(mockData.lastUpsert).toBeTruthy());
    expect(mockData.lastUpsert.xp).toBe(250);
    expect(mockData.lastUpsert.streak).toBe(5);
  });

  it('never sends the non-existent played_dates column to Supabase', async () => {
    const row = sampleRow('u12', 3);
    mockData.row = row;
    mockUseAuth.mockReturnValue({ user: { id: 'u12' } });

    render(
      <GameProvider>
        <Harness />
      </GameProvider>
    );
    await waitFor(() => expect(screen.getByText('streak:3')).toBeInTheDocument());

    await vi.waitFor(() => expect(mockData.lastUpsert).toBeTruthy());
    expect(mockData.lastUpsert).not.toHaveProperty('played_dates');
    // Played dates are carried inside bot_stats (the only column that exists)
    expect(mockData.lastUpsert.bot_stats.playedDates).toBeDefined();
  });

  it('flushNow pushes the pending snapshot immediately without the debounce', async () => {
    const row = sampleRow('u6', 2);
    mockData.row = row;
    mockUseAuth.mockReturnValue({ user: { id: 'u6' } });

    let captured: any;
    function FlushHarness() {
      const game = useGame();
      captured = game.flushNow;
      return <div>streak:{game.streak}</div>;
    }

    render(
      <GameProvider>
        <FlushHarness />
      </GameProvider>
    );
    await waitFor(() => expect(screen.getByText('streak:2')).toBeInTheDocument());

    await captured();
    await vi.waitFor(() => expect(mockData.lastUpsert).toBeTruthy());
    expect(mockData.lastUpsert.streak).toBe(2);
  });

  it('flushes immediately on pagehide so a backgrounded/closed session is not lost', async () => {
    mockData.row = sampleRow('u8', 2);
    mockUseAuth.mockReturnValue({ user: { id: 'u8' } });

    render(
      <GameProvider>
        <Harness />
      </GameProvider>
    );
    await waitFor(() => expect(screen.getByText('streak:2')).toBeInTheDocument());
    await vi.waitFor(() => expect(mockData.lastUpsert).toBeTruthy());

    // Fresh activity creates a new pending snapshot with a debounced flush…
    act(() => recordActivityRef.current?.());
    mockData.lastUpsert = null;

    // …pagehide cancels the debounce and pushes the newest state to the cloud
    // immediately (mobile browsers stop JS timers once the page is hidden)
    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });
    await vi.waitFor(() => expect(mockData.lastUpsert).toBeTruthy());
    expect(mockData.lastUpsert.streak).toBeGreaterThanOrEqual(3);
  });

  it('restores a real pending snapshot when the server row is missing (PGRST116)', async () => {
    mockData.row = null;
    mockData.singleImpl = () => ({ data: null, error: { code: 'PGRST116' } });
    mockUseAuth.mockReturnValue({ user: { id: 'u9' } });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const ys = localDateStr(yesterday);

    // Device holds REAL unsynced progress while the server row is gone
    localStorage.setItem(
      'learningjemz_pending_sync_u9',
      JSON.stringify({
        savedAt: Date.now(),
        state: {
          xp: 250,
          level: 3,
          streak: 3,
          previousStreak: 2,
          maxStreak: 5,
          lastVisit: ys,
          playedDates: [ys],
          botStats: {},
          illuminateStats: {},
          achievements: []
        }
      })
    );

    render(
      <GameProvider>
        <Harness />
      </GameProvider>
    );

    // The pending snapshot wins — no zero-state reset, and it is flushed so the
    // row other learners see carries the real progress
    await waitFor(() => expect(screen.getByText('streak:3')).toBeInTheDocument());
    await vi.waitFor(() => expect(mockData.lastUpsert).toBeTruthy());
    expect(mockData.lastUpsert.xp).toBe(250);
    expect(mockData.lastUpsert.streak).toBe(3);
  });
});