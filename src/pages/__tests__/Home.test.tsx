import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home';
import * as GameContext from '../../contexts/GameContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Home', () => {
  it('renders correctly', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      xp: 150,
      level: 2,
      streak: 5,
      hasPlayedToday: true,
      stats: {},
    } as any);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Learning')).toBeInTheDocument();
    expect(screen.getByText('Jemz')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // streak
    expect(screen.getByText('Lv.2')).toBeInTheDocument(); // level
    expect(screen.getByText('50/100 XP to Level 3')).toBeInTheDocument(); // xp bar
    expect(screen.getByText('What do you want to play and learn?')).toBeInTheDocument();
    expect(screen.getByText('Chess')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Space')).toBeInTheDocument();
    expect(screen.getByText('Geography')).toBeInTheDocument(); // Locked module
  });

  it('navigates to modules on click', async () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      xp: 0,
      level: 1,
      streak: 0,
      hasPlayedToday: false,
      stats: {},
    } as any);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const chessCard = screen.getByRole('button', { name: /chess/i });
    await user.click(chessCard);
    expect(mockNavigate).toHaveBeenCalledWith('/chess');

    const readingCard = screen.getByRole('button', { name: /reading/i });
    await user.click(readingCard);
    expect(mockNavigate).toHaveBeenCalledWith('/reading');
  });

  it('navigates to profile on click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const profileBtn = screen.getByRole('button', { name: /go to profile/i });
    await user.click(profileBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});
