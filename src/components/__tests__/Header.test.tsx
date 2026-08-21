import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../Header';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../contexts/GameContext.jsx', () => ({
  useGame: () => ({
    xp: 450,
    level: 12,
    streak: 7,
    hasPlayedToday: true,
  }),
  getLevelProgress: (xp: number) => ({
    xpInLevel: 50,
    levelXPReq: 100,
    pct: 50,
  }),
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders LearningJemz logo title and rank pill data', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText(/Learning/i)).toBeInTheDocument();
    expect(screen.getByText('Jemz')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Day Streak')).toBeInTheDocument();
    expect(screen.getByText('Lv.12')).toBeInTheDocument();
    expect(screen.getByText('Scholar')).toBeInTheDocument();
  });

  it('navigates to / when clicking the logo', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const homeButton = screen.getByRole('button', { name: /home/i });
    await user.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to /profile when clicking streak or rank pill item', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const streakItem = screen.getByRole('button', { name: /day streak/i });
    await user.click(streakItem);
    expect(mockNavigate).toHaveBeenCalledWith('/profile');

    const rankItem = screen.getByRole('button', { name: /go to profile/i });
    await user.click(rankItem);
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});
