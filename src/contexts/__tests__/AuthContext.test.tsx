import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

const { supabaseMock } = vi.hoisted(() => {
  return {
    supabaseMock: {
      auth: {
        getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signOut: vi.fn(() => Promise.resolve({ error: null }))
      }
    }
  };
});

vi.mock('../../utils/supabase', () => ({ supabase: supabaseMock }));

function LogoutButton() {
  const { logout } = useAuth();
  return <button onClick={() => logout()}>sign out</button>;
}

describe('AuthContext logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('preserves the pending-sync queue and last-synced marker while clearing app state keys', async () => {
    localStorage.setItem('learningjemz_pending_sync_u1', JSON.stringify({ savedAt: 1, state: { xp: 100 } }));
    localStorage.setItem('learningjemz_last_synced_u1', '1');
    localStorage.setItem('learningjemz-game-state_u1', JSON.stringify({ xp: 100 }));
    localStorage.setItem('learningjemz_avatar', '🦊');

    render(
      <AuthProvider>
        <LogoutButton />
      </AuthProvider>
    );

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /sign out/i }));

    await waitFor(() => expect(supabaseMock.auth.signOut).toHaveBeenCalledTimes(1));

    // The only copies of unsynced progress survive so the next login restores them
    expect(localStorage.getItem('learningjemz_pending_sync_u1')).not.toBeNull();
    expect(localStorage.getItem('learningjemz_last_synced_u1')).not.toBeNull();

    // Per-user/guest display state is still cleared to avoid account pollution
    expect(localStorage.getItem('learningjemz-game-state_u1')).toBeNull();
    expect(localStorage.getItem('learningjemz_avatar')).toBeNull();
  });
});