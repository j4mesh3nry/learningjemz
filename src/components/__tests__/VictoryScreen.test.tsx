import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VictoryScreen from '../VictoryScreen.tsx';

// Mock Gemstone since it may have SVG dependencies
vi.mock('../Gemstone', () => ({
  default: ({ className }: { className?: string }) => <div data-testid="gemstone" className={className} />,
}));

describe('VictoryScreen', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Victory!',
    xpGained: 25,
    streak: 3,
    igniting: false,
    streakIncreased: false,
    onContinue: vi.fn(),
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<VictoryScreen {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the victory modal when isOpen is true', () => {
    render(<VictoryScreen {...defaultProps} />);
    expect(screen.getByText('Victory!')).toBeInTheDocument();
  });

  it('displays custom title', () => {
    render(<VictoryScreen {...defaultProps} title="Well Done!" />);
    expect(screen.getByText('Well Done!')).toBeInTheDocument();
  });

  it('displays XP gained', () => {
    render(<VictoryScreen {...defaultProps} xpGained={50} />);
    expect(screen.getByText('+50')).toBeInTheDocument();
  });

  it('displays streak count', () => {
    render(<VictoryScreen {...defaultProps} streak={7} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('shows +1 badge when igniting and streakIncreased', () => {
    render(<VictoryScreen {...defaultProps} igniting={true} streakIncreased={true} />);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('does not show +1 badge when not igniting', () => {
    render(<VictoryScreen {...defaultProps} igniting={false} streakIncreased={true} />);
    expect(screen.queryByText('+1')).toBeNull();
  });

  it('calls onContinue when Continue button is clicked', async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(<VictoryScreen {...defaultProps} onContinue={onContinue} />);
    await user.click(screen.getByText('Continue'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('renders children when provided', () => {
    render(
      <VictoryScreen {...defaultProps}>
        <span>Bonus message</span>
      </VictoryScreen>
    );
    expect(screen.getByText('Bonus message')).toBeInTheDocument();
  });

  it('has dialog role for accessibility', () => {
    const { container } = render(<VictoryScreen {...defaultProps} />);
    const overlay = container.querySelector('.victory-overlay');
    expect(overlay).toHaveAttribute('role', 'dialog');
    expect(overlay).toHaveAttribute('aria-modal', 'true');
  });
});
