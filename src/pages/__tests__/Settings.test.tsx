import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../Settings';

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
    
    // Initially should be in light mode depending on matchMedia, let's mock it if needed
    // Assuming light mode initially for test environment
    const button = screen.getByRole('button');
    
    // Check initial state (assuming matchMedia returns false for dark mode)
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(button).toHaveTextContent(/switch to dark mode/i);

    // Click to toggle
    await user.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(button).toHaveTextContent(/switch to light mode/i);
    expect(localStorage.getItem('darkMode')).toBe('true');

    // Click again to toggle back
    await user.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(button).toHaveTextContent(/switch to dark mode/i);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  it('loads saved dark mode preference', () => {
    localStorage.setItem('darkMode', 'true');
    render(<Settings />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(/switch to light mode/i);
  });
});
