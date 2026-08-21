import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../Profile';
import * as GameContext from '../../contexts/GameContext';
import * as AuthContext from '../../contexts/AuthContext';
import * as SupabaseApi from '../../api/supabase';

// Mock Lucide icons that may cause issues
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    Pencil: () => <div data-testid="pencil-icon" />,
    Settings: () => <div data-testid="settings-icon" />,
    LogOut: () => <div data-testid="logout-icon" />,
    Trophy: () => <div data-testid="trophy-icon" />,
  };
});

describe('Profile', () => {
  const mockLogout = vi.fn();
  const mockFlushNow = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      xp: 250,
      level: 3,
      streak: 7,
      hasPlayedToday: true,
      stats: {},
      flushNow: mockFlushNow,
    } as any);

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: '123', email: 'test@example.com', user_metadata: { name: 'Test User', avatar: 'bot' } },
      logout: mockLogout,
    } as any);

    vi.spyOn(SupabaseApi, 'updateAvatar').mockResolvedValue({ success: true } as any);
    vi.spyOn(SupabaseApi, 'updateName').mockResolvedValue({ success: true } as any);
  });

  it('renders profile correctly', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-icon-bot')).toBeInTheDocument(); // avatar
    expect(screen.getByText('Level 3')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getAllByText('7')[0]).toBeInTheDocument(); // streak
    expect(screen.getByText('250')).toBeInTheDocument(); // xp
    expect(screen.getByText('Streak Calendar')).toBeInTheDocument();
  });

  it('flushes pending progress before calling logout', async () => {
    mockFlushNow.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    const logoutBtn = screen.getByRole('button', { name: /sign out/i });
    await user.click(logoutBtn);
    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    expect(mockFlushNow).toHaveBeenCalledTimes(1);
    // The flush is awaited BEFORE signOut so the server row is current when leaving
    expect(mockLogout.mock.invocationCallOrder[0]).toBeGreaterThan(
      mockFlushNow.mock.invocationCallOrder[0]
    );
  });

  it('can open and close avatar modal', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Click on avatar to open modal
    const avatarContainer = screen.getByTestId('avatar-icon-bot');
    await user.click(avatarContainer);
    
    expect(screen.getByText('Choose Companion')).toBeInTheDocument();
    
    // Select new avatar
    await user.click(screen.getByTitle('Archimedes (Sage Owl)'));
    expect(SupabaseApi.updateAvatar).toHaveBeenCalledWith('123', 'owl');
    
    await waitFor(() => {
      expect(screen.queryByText('Choose Companion')).not.toBeInTheDocument();
    });
    
    // Check if toast appears
    expect(screen.getByText('Avatar updated')).toBeInTheDocument();
  });

  it('can edit name', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Open edit name modal
    const pencils = screen.getAllByTestId('pencil-icon');
    await user.click(pencils[1].parentElement!); // The second pencil is for the name
    
    expect(screen.getByText('Edit Name')).toBeInTheDocument();
    
    // Type new name
    const input = screen.getByPlaceholderText(/Enter your name/i);
    await user.clear(input);
    await user.type(input, 'New Hero');
    
    // Save
    const saveBtn = screen.getByRole('button', { name: /save/i });
    await user.click(saveBtn);
    
    expect(SupabaseApi.updateName).toHaveBeenCalledWith('123', 'New Hero');
  });
});
