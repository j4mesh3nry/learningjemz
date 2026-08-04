import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello World</Card>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('applies the card class by default', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveClass('card');
  });

  it('appends custom className', () => {
    const { container } = render(<Card className="custom">Content</Card>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('card');
    expect(el.className).toContain('custom');
  });

  it('sets aria-label', () => {
    render(<Card ariaLabel="Test card">Content</Card>);
    expect(screen.getByLabelText('Test card')).toBeInTheDocument();
  });

  it('becomes a button role when onClick is provided', () => {
    render(<Card onClick={() => {}} ariaLabel="Click card">Clickable</Card>);
    expect(screen.getByRole('button', { name: /click card/i })).toBeInTheDocument();
  });

  it('is keyboard-activatable with Enter', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Card onClick={handleClick} ariaLabel="Press card">Pressable</Card>);
    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is keyboard-activatable with Space', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Card onClick={handleClick} ariaLabel="Space card">Spaceable</Card>);
    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not have button role when onClick is not provided', () => {
    render(<Card ariaLabel="Static card">Static</Card>);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('is focusable when interactive', () => {
    render(<Card onClick={() => {}} ariaLabel="Focusable">Focus</Card>);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabindex', '0');
  });
});
