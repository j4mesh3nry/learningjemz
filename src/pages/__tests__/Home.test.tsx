import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders home page with headers and module cards', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      level: 1,
      xp: 0,
      streak: 0,
      hasPlayedToday: false,
      stats: {},
    } as any);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Learning')).toBeInTheDocument();
    expect(screen.getByText('Jemz')).toBeInTheDocument();
    expect(screen.getByText('What do you want to play and learn?')).toBeInTheDocument();
    expect(screen.getByText('Chess')).toBeInTheDocument();
    expect(screen.getByText('Space')).toBeInTheDocument();
  });

  it('navigates to module on card click', async () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      level: 1,
      xp: 0,
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

    const spaceCard = screen.getByRole('button', { name: /space/i });
    await user.click(spaceCard);
    expect(mockNavigate).toHaveBeenCalledWith('/space');
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
