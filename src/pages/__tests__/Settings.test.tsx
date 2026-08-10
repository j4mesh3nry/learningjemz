import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Settings from '../Settings';

vi.mock('../../contexts/GameContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useGame: () => ({
      resetProgress: vi.fn(),
    }),
  };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    deleteAccount: vi.fn(),
  }),
}));

describe('Settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Settings header and action buttons', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset account progress/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back to me page/i })).toBeInTheDocument();
  });

  it('opens reset progress modal on click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
    
    const resetButton = screen.getByRole('button', { name: /reset account progress/i });
    await user.click(resetButton);

    expect(screen.getByRole('heading', { name: /reset account progress\?/i })).toBeInTheDocument();
  });

  it('opens delete account modal on click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    await user.click(deleteButton);

    expect(screen.getByRole('heading', { name: /delete account\?/i })).toBeInTheDocument();
  });
});
