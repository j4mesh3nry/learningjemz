import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Store from '../Store';

vi.mock('../../contexts/GameContext', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useGame: () => ({
      xp: 250,
      level: 5,
      streak: 3,
      hasPlayedToday: true,
    }),
    getLevelProgress: () => ({
      xpInLevel: 50,
      levelXPReq: 100,
      pct: 50,
    }),
  };
});

describe('Store Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Store header and Coming Soon overlay card', () => {
    render(
      <MemoryRouter>
        <Store />
      </MemoryRouter>
    );

    expect(screen.getByText('Store Opening Soon!')).toBeInTheDocument();
    expect(
      screen.getByText(/We're crafting exclusive companions, streak protections/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to exploring/i })).toBeInTheDocument();
  });

  it('renders background dimmed store item preview cards', () => {
    render(
      <MemoryRouter>
        <Store />
      </MemoryRouter>
    );

    expect(screen.getByText('Streak Freeze')).toBeInTheDocument();
    expect(screen.getByText('Double XP (30m)')).toBeInTheDocument();
    expect(screen.getByText('Royal King Avatar')).toBeInTheDocument();
    expect(screen.getByText('Dragon Avatar')).toBeInTheDocument();
  });

  it('handles back button click on the coming soon card', async () => {
    const user = userEvent.setup();
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Store />
      </MemoryRouter>
    );

    const backBtn = screen.getByRole('button', { name: /back to exploring/i });
    await user.click(backBtn);

    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });
});
