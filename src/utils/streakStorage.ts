// src/utils/streakStorage.ts
import { getLocalDateString } from './dateUtils';

export function getStreakStorageKey(userId?: string | null): string {
  return userId ? `learningjemz_streak_shown_${userId}` : 'learningjemz_streak_shown_guest';
}

export function getPlayedDatesStorageKey(userId?: string | null): string {
  return userId ? `learningjemz_played_dates_${userId}` : 'learningjemz_played_dates_guest';
}

export function hasShownStreakToday(userId?: string | null): boolean {
  try {
    const today = getLocalDateString(new Date());
    const key = getStreakStorageKey(userId);
    return localStorage.getItem(key) === today;
  } catch {
    return false;
  }
}

export function markStreakShownToday(userId?: string | null): void {
  try {
    const today = getLocalDateString(new Date());
    const key = getStreakStorageKey(userId);
    localStorage.setItem(key, today);
  } catch {}
}

export function resetStreakShownForUser(userId?: string | null): void {
  try {
    localStorage.removeItem(getStreakStorageKey(userId));
    localStorage.removeItem(getPlayedDatesStorageKey(userId));
  } catch {}
}

export function getPlayedDates(userId?: string | null): string[] {
  try {
    const key = getPlayedDatesStorageKey(userId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordPlayedDate(userId?: string | null, dateStr?: string): string[] {
  try {
    const targetDate = dateStr || getLocalDateString();
    const existing = getPlayedDates(userId);
    if (!existing.includes(targetDate)) {
      const updated = [...existing, targetDate];
      const key = getPlayedDatesStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    }
    return existing;
  } catch {
    return [];
  }
}
