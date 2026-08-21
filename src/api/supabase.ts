// src/api/supabase.ts
// Centralized Supabase helper functions for avatar, name, and progress updates.
import { supabase } from '../utils/supabase';

export interface SupabaseApiResult {
  success: boolean;
  error?: any;
}

export async function updateAvatar(userId: string, avatar: string): Promise<SupabaseApiResult> {
  try {
    // Update auth profile
    await supabase.auth.updateUser({ data: { avatar } });
    // Update game_progress table
    await supabase.from('game_progress').update({ avatar }).eq('id', userId);
    return { success: true };
  } catch (error) {
    console.error('Failed to update avatar', error);
    return { success: false, error };
  }
}

export async function updateName(userId: string, name: string): Promise<SupabaseApiResult> {
  try {
    await supabase.auth.updateUser({ data: { name } });
    await supabase.from('game_progress').update({ name }).eq('id', userId);
    return { success: true };
  } catch (error) {
    console.error('Failed to update name', error);
    return { success: false, error };
  }
}

export async function updateProgress(userId: string, updates: Record<string, any>): Promise<SupabaseApiResult> {
  try {
    await supabase.from('game_progress').update(updates).eq('id', userId);
    return { success: true };
  } catch (error) {
    console.error('Failed to update progress', error);
    return { success: false, error };
  }
}
