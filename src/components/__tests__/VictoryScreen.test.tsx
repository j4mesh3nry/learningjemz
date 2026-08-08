import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VictoryScreen from '../VictoryScreen';

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-123' } }),
}));

describe('VictoryScreen', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Victory!',
    xpGained: 25,
    streak: 3,
    hasPlayedToday: true,
    disableDailyStreakModal: true,
    onContinue: vi.fn(),
    onPlayAgain: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<VictoryScreen {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders victory screen with title, xp, and streak when isOpen is true', () => {
    render(<VictoryScreen {...defaultProps} />);
    expect(screen.getByText('Victory!')).toBeInTheDocument();
    expect(screen.getByText('+25')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders custom subtitle when provided', () => {
    render(<VictoryScreen {...defaultProps} subtitle="Great puzzle solved!" />);
    expect(screen.getByText('Great puzzle solved!')).toBeInTheDocument();
  });

  it('calls onContinue when continue button is clicked', async () => {
    const user = userEvent.setup();
    render(<VictoryScreen {...defaultProps} />);
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    await user.click(continueBtn);
    expect(defaultProps.onContinue).toHaveBeenCalledTimes(1);
  });

  it('calls onPlayAgain when play again button is clicked', async () => {
    const user = userEvent.setup();
    render(<VictoryScreen {...defaultProps} />);
    const playAgainBtn = screen.getByRole('button', { name: /play again/i });
    await user.click(playAgainBtn);
    expect(defaultProps.onPlayAgain).toHaveBeenCalledTimes(1);
  });

  it('renders children when provided', () => {
    render(
      <VictoryScreen {...defaultProps}>
        <div data-testid="custom-child">Extra Info</div>
      </VictoryScreen>
    );
    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
  });

  it('applies theme-space class when theme="space"', () => {
    const { container } = render(<VictoryScreen {...defaultProps} theme="space" />);
    expect(container.querySelector('.theme-space')).toBeInTheDocument();
  });
});
