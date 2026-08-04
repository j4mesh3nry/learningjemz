// src/api/supabase.js
// Centralized Supabase helper functions for avatar, name, and progress updates.
import { supabase } from '../utils/supabase.js';

export async function updateAvatar(userId, avatar) {
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

export async function updateName(userId, name) {
  try {
    await supabase.auth.updateUser({ data: { name } });
    await supabase.from('game_progress').update({ name }).eq('id', userId);
    return { success: true };
  } catch (error) {
    console.error('Failed to update name', error);
    return { success: false, error };
  }
}

export async function updateProgress(userId, updates) {
  // updates is an object with fields to merge into game_progress row.
  try {
    await supabase.from('game_progress').update(updates).eq('id', userId);
    return { success: true };
  } catch (error) {
    console.error('Failed to update progress', error);
    return { success: false, error };
  }
}
