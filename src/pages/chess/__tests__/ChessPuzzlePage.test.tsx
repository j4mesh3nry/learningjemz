import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ChessPuzzlePage from '../ChessPuzzlePage';
import * as GameContext from '../../../contexts/GameContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-123' } }),
}));

describe('ChessPuzzlePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders puzzle selection hub with Survival and Blitz modes and career stats', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      puzzlesSolved: 25,
      botStats: {
        puzzleStats: { 
          solved: 25, 
          survivalHighScore: 14,
          blitzHighScore: 18,
          highStreak: 14
        }
      },
      streak: 3,
      hasPlayedToday: true,
      recordPuzzleSolved: vi.fn(),
      recordPuzzleRunEnd: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <ChessPuzzlePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Chess Puzzles')).toBeInTheDocument();
    expect(screen.getByText('Sudden Death Survival')).toBeInTheDocument();
    expect(screen.getByText('Time Attack Blitz')).toBeInTheDocument();
    expect(screen.getByText('SURVIVAL STREAK')).toBeInTheDocument();
    expect(screen.getByText('BLITZ HIGH SCORE')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument(); // survival best
    expect(screen.getByText('18')).toBeInTheDocument(); // blitz best
    expect(screen.getByText('25')).toBeInTheDocument(); // total solved
  });

  it('starts Sudden Death Survival mode when card is clicked', async () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      puzzlesSolved: 0,
      botStats: {},
      streak: 0,
      hasPlayedToday: false,
      recordPuzzleSolved: vi.fn(),
      recordPuzzleRunEnd: vi.fn(),
    } as any);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ChessPuzzlePage />
      </MemoryRouter>
    );

    const survivalCard = screen.getByText('Sudden Death Survival');
    await user.click(survivalCard);

    // Should now show chess board & controls in Survival mode
    expect(screen.getByText(/Survival/i)).toBeInTheDocument();
    expect(screen.getByText(/Easy/i)).toBeInTheDocument();
    expect(screen.getByText(/Flip/i)).toBeInTheDocument();
    expect(screen.getByText(/Hint/i)).toBeInTheDocument();
    expect(screen.getByText(/Reset/i)).toBeInTheDocument();

    // Clicking Hint should display the tactical hint box
    const hintBtn = screen.getByRole('button', { name: /Hint/i });
    await user.click(hintBtn);
    expect(screen.getByText(/Tactical Hint:|Hint:/i)).toBeInTheDocument();
  });

  it('starts Time Attack Blitz mode when card is clicked', async () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      puzzlesSolved: 0,
      botStats: {},
      streak: 0,
      hasPlayedToday: false,
      recordPuzzleSolved: vi.fn(),
      recordPuzzleRunEnd: vi.fn(),
    } as any);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ChessPuzzlePage />
      </MemoryRouter>
    );

    const blitzCard = screen.getByText('Time Attack Blitz');
    await user.click(blitzCard);

    // Should now show chess board & 3:00 timer in Blitz mode
    expect(screen.getByText(/Blitz/i)).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument();
    expect(screen.getByText(/Hint/i)).toBeInTheDocument();
  });
});

