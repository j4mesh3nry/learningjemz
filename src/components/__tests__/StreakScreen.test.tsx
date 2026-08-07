import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StreakScreen, { hasShownStreakToday, markStreakShownToday } from '../StreakScreen';

describe('StreakScreen', () => {
  const defaultProps = {
    isOpen: true,
    streak: 5,
    onContinue: vi.fn(),
    forceShow: true,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<StreakScreen {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the streak screen with correct streak number when open', () => {
    render(<StreakScreen {...defaultProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('DAYS STREAK!')).toBeInTheDocument();
  });

  it('renders "DAY STREAK!" when streak is 1', () => {
    render(<StreakScreen {...defaultProps} streak={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('DAY STREAK!')).toBeInTheDocument();
  });

  it('calls onContinue and marks streak shown today when CONTINUE button is clicked', async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(<StreakScreen {...defaultProps} forceShow={false} onContinue={onContinue} />);

    expect(hasShownStreakToday()).toBe(false);
    
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    await user.click(continueBtn);

    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(hasShownStreakToday()).toBe(true);
  });

  it('opens and closes the streak calendar drawer when calendar button is clicked', async () => {
    const user = userEvent.setup();
    render(<StreakScreen {...defaultProps} />);
    
    const calBtn = screen.getByRole('button', { name: /view streak calendar/i });
    await user.click(calBtn);

    expect(screen.getByText('Days Active')).toBeInTheDocument();
    expect(screen.getByText('Current Streak')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close calendar/i });
    await user.click(closeBtn);

    expect(screen.queryByText('Days Active')).not.toBeInTheDocument();
  });

  it('skips rendering and calls onContinue immediately if already shown today (when forceShow is false)', () => {
    markStreakShownToday();
    const onContinue = vi.fn();

    const { container } = render(
      <StreakScreen isOpen={true} streak={5} onContinue={onContinue} forceShow={false} />
    );

    expect(container.firstChild).toBeNull();
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
