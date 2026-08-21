import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LivesTracker } from '../LivesTracker';

describe('LivesTracker Component', () => {
  it('renders correct number of total hearts matching maxLives', () => {
    const { container } = render(<LivesTracker lives={2} maxLives={3} />);
    const hearts = container.querySelectorAll('svg');
    expect(hearts.length).toBe(3);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      '2 of 3 lives remaining'
    );
  });

  it('handles 0 lives remaining correctly', () => {
    render(<LivesTracker lives={0} maxLives={5} />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      '0 of 5 lives remaining'
    );
  });

  it('clamps lives to maxLives when lives exceed maxLives', () => {
    render(<LivesTracker lives={10} maxLives={4} />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      '4 of 4 lives remaining'
    );
  });
});
