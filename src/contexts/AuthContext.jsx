import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          avatar: '👤'
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    // Clear app state keys on logout to prevent state pollution across user
    // accounts — BUT keep the per-user pending-sync queue and its last-synced
    // marker. Those are keyed by user id (never shared between accounts) and are
    // the only copy of progress whose cloud flush failed or was still debounced
    // (flaky mobile network, quick sign-out). Wiping them here is what made XP
    // and streaks revert to old values after logging back in.
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('learningjemz') && !key.startsWith('learningjemz_pending_sync_') && !key.startsWith('learningjemz_last_synced_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      await supabase.from('achievements').delete().eq('user_id', user.id);
      await supabase.from('game_progress').delete().eq('id', user.id);
    } catch {}

    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('learningjemz')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, deleteAccount, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
