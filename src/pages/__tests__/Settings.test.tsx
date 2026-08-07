import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../Settings';
import * as GameContext from '../../contexts/GameContext';

vi.mock('../../contexts/GameContext', () => ({
  useGame: () => ({
    resetProgress: vi.fn(),
  }),
}));

describe('Settings', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Settings header', () => {
    render(<Settings />);
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
  });

  it('toggles dark mode', async () => {
    const user = userEvent.setup();
    render(<Settings />);
    
    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await user.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  it('loads saved dark mode preference', () => {
    localStorage.setItem('darkMode', 'true');
    render(<Settings />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });
});
