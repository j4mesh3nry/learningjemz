import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home';
import * as GameContext from '../../contexts/GameContext';
import * as AuthContext from '../../contexts/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default game mock
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      level: 1,
      xp: 0,
      streak: 0,
      hasPlayedToday: false,
      achievements: [],
      stats: {},
    } as any);

    vi.spyOn(GameContext, 'getLevelProgress').mockReturnValue({
      level: 1,
      currentLevelXP: 0,
      nextLevelXP: 38,
      xpInLevel: 0,
      levelXPReq: 38,
      pct: 0,
    } as any);

    // Default auth mock — logged-in user
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 'test-user',
        email: 'test1@example.com',
        user_metadata: { name: 'test1' },
      },
      loading: false,
    } as any);
  });

  it('renders home page with headers and module cards', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Learning')).toBeInTheDocument();
    expect(screen.getByText('Jemz')).toBeInTheDocument();
    expect(screen.getByText('Chess')).toBeInTheDocument();
    expect(screen.getByText('Space')).toBeInTheDocument();
  });

  it('renders personalized greeting with user name', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // The greeting should contain the user's name
    expect(screen.getByText(/test1!/)).toBeInTheDocument();
  });

  it('renders XP progress bar with level info', () => {
    vi.spyOn(GameContext, 'getLevelProgress').mockReturnValue({
      level: 5,
      currentLevelXP: 200,
      nextLevelXP: 350,
      xpInLevel: 120,
      levelXPReq: 150,
      pct: 80,
    } as any);

    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      level: 5,
      xp: 320,
      streak: 10,
      hasPlayedToday: true,
      achievements: [{ id: 'first_win' }],
      stats: {},
    } as any);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Header XP labels
    expect(screen.getByText('120 / 150 XP')).toBeInTheDocument();
    const nextLevelTexts = screen.getAllByText('Next: Lv.6');
    expect(nextLevelTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to module on card click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const chessCard = screen.getByRole('button', { name: /chess/i });
    await user.click(chessCard);
    expect(mockNavigate).toHaveBeenCalledWith('/chess');

    const spaceCard = screen.getByRole('button', { name: /space/i });
    await user.click(spaceCard);
    expect(mockNavigate).toHaveBeenCalledWith('/space');
  });

  it('navigates to profile on badge stat click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const badgesBtn = screen.getByRole('button', { name: /badges/i });
    await user.click(badgesBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('renders stats grid with streak, xp, rank and badges labels', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      level: 3,
      xp: 500,
      streak: 7,
      hasPlayedToday: true,
      achievements: [{ id: 'first_win' }, { id: 'streak_7' }],
      stats: {},
    } as any);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Stat labels
    expect(screen.getAllByText('Day Streak').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Total XP')).toBeInTheDocument();
    expect(screen.getByText('Global Rank')).toBeInTheDocument();
    expect(screen.getByText('Badges')).toBeInTheDocument();

    // Badge count = 2
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders locked modules', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Geography')).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();
  });

  it('navigates to leaderboard on rank tile click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const rankTile = screen.getByRole('button', { name: /global rank/i });
    await user.click(rankTile);
    expect(mockNavigate).toHaveBeenCalledWith('/leaderboards');
  });
});
