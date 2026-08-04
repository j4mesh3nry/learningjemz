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
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      xp: 250,
      level: 3,
      streak: 7,
      hasPlayedToday: true,
      stats: {},
    } as any);

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: '123', email: 'test@example.com', user_metadata: { name: 'Test User', avatar: '🤖' } },
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
    expect(screen.getByText('🤖')).toBeInTheDocument(); // avatar
    expect(screen.getByText('Level 3')).toBeInTheDocument();
    expect(screen.getByText('🌱 Beginner')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument(); // streak
    expect(screen.getByText('250')).toBeInTheDocument(); // xp
  });

  it('calls logout when sign out is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    const logoutBtn = screen.getByRole('button', { name: /sign out/i });
    await user.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('can open and close avatar modal', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Click on avatar to open modal
    const avatarContainer = screen.getByText('🤖');
    await user.click(avatarContainer);
    
    expect(screen.getByText('Choose Avatar')).toBeInTheDocument();
    
    // Select new avatar
    await user.click(screen.getByText('🦊'));
    expect(SupabaseApi.updateAvatar).toHaveBeenCalledWith('123', '🦊');
    
    await waitFor(() => {
      expect(screen.queryByText('Choose Avatar')).not.toBeInTheDocument();
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
    const input = screen.getByPlaceholderText('Enter your name...');
    await user.clear(input);
    await user.type(input, 'New Hero');
    
    // Save
    await user.click(screen.getByRole('button', { name: 'Save' }));
    
    expect(SupabaseApi.updateName).toHaveBeenCalledWith('123', 'New Hero');
    
    await waitFor(() => {
      expect(screen.queryByText('Edit Name')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Name updated')).toBeInTheDocument();
    expect(screen.getByText('New Hero')).toBeInTheDocument();
  });
});
