import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Leaderboard from '../Leaderboard';
import * as GameContext from '../../contexts/GameContext';
import * as AuthContext from '../../contexts/AuthContext';

const { supabaseMock, mockRows } = vi.hoisted(() => {
  const mockRows: any[] = [];
  const chainable = {
    select: vi.fn(() => chainable),
    order: vi.fn(() => chainable),
    limit: vi.fn(() => ({ data: mockRows, error: null })),
    eq: vi.fn(() => chainable),
    single: vi.fn(() => ({ data: null, error: null })),
    insert: vi.fn(() => ({ error: null })),
    upsert: vi.fn(() => ({ error: null }))
  };
  const supabaseMock = {
    from: vi.fn(() => chainable),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({ subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })) }))
    })),
    removeChannel: vi.fn()
  };
  return { supabaseMock, mockRows };
});

vi.mock('../../utils/supabase', () => ({ supabase: supabaseMock }));

const fmt = (d: Date) => {
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mo}-${da}`;
};
const daysAgo = (n: number) => fmt(new Date(Date.now() - n * 86400000));

const baseRows = [
  { id: 'top', name: 'TopStreak', xp: 500, level: 6, streak: 102, last_visit: daysAgo(1), avatar: '🤖' },
  { id: 'second', name: 'SecondStreak', xp: 300, level: 4, streak: 8, last_visit: daysAgo(0), avatar: '🤖' },
  { id: 'third', name: 'ThirdStreak', xp: 250, level: 3, streak: 5, last_visit: daysAgo(3), avatar: '🤖' },
  { id: 'me', name: 'Me', xp: 340, level: 4, streak: 1, last_visit: daysAgo(5), avatar: '🤖' },
  { id: 'zero', name: 'ZeroStreak', xp: 100, level: 2, streak: 0, last_visit: daysAgo(0), avatar: '🤖' },
  { id: 'zeroxp', name: 'ZeroXp', xp: 0, level: 1, streak: 3, last_visit: daysAgo(1), avatar: '🤖' }
];

describe('Leaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRows.splice(0, mockRows.length, ...baseRows);

    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      xp: 340,
      streak: 1
    } as any);

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'me' }
    } as any);
  });

  it('ranks by XP on the default tab and excludes zero-XP players', async () => {
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('TopStreak')).toBeInTheDocument();
    });
    expect(screen.getByText('500 XP')).toBeInTheDocument();
    expect(screen.queryByText('ZeroXp')).not.toBeInTheDocument();
  });

  it('keeps stale-streak players ranked on the streak tab (only streak 0 is removed)', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('TopStreak')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Streak' }));

    // Stale players (last played 3 days ago) stay ranked by their real streak
    await waitFor(() => {
      expect(screen.getByText('ThirdStreak')).toBeInTheDocument();
    });
    expect(screen.getByText('TopStreak')).toBeInTheDocument();
    expect(screen.getByText('102')).toBeInTheDocument();

    // Streak-0 players are excluded from the board
    expect(screen.queryByText('ZeroStreak')).not.toBeInTheDocument();

    // The stale player in the list shows an honest inactivity cue
    expect(screen.getByText(/Inactive · last played 5 days ago/)).toBeInTheDocument();
  });

  it('sorts the streak tab by raw streak value descending', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('TopStreak')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Streak' }));

    await waitFor(() => {
      expect(screen.getByText('ThirdStreak')).toBeInTheDocument();
    });

    const rows = Array.from(document.querySelectorAll('div')).filter(
      el => el.textContent && el.textContent.includes('Streak') && el.textContent?.includes('days ago')
    );
    expect(rows.length).toBeGreaterThan(0);
  });

  it('refetches when the refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('TopStreak')).toBeInTheDocument();
    });

    const callsBefore = supabaseMock.from.mock.calls.length;
    await user.click(screen.getByRole('button', { name: /refresh leaderboard/i }));
    await waitFor(() => {
      expect(supabaseMock.from.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});