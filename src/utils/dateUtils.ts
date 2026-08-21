/**
 * Formats a Date or date-like value into a local date string (YYYY-MM-DD)
 * using local year, month, and date (preventing UTC timezone shift bugs).
 */
export function getLocalDateString(inputDate: Date | string | number = new Date()): string {
  const d = inputDate instanceof Date ? inputDate : new Date(inputDate);
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    const yr = fallback.getFullYear();
    const mo = String(fallback.getMonth() + 1).padStart(2, '0');
    const da = String(fallback.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string as a LOCAL calendar date (never UTC), avoiding
 * the one-day shift caused by `new Date('YYYY-MM-DD')` (UTC midnight).
 * Accepts Date objects / ISO timestamps as fallback. Returns null if invalid.
 */
export function fromLocalDateString(input?: string | Date | null): Date | null {
  if (input == null || input === '') return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : new Date(input.getTime());
  }
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(input);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Normalizes any stored value (YYYY-MM-DD string, Date, or ISO timestamp)
 * into a local YYYY-MM-DD string without UTC shifts. Returns null if unparseable.
 */
export function toLocalDateString(input?: string | Date | null): string | null {
  const date = fromLocalDateString(input);
  return date ? getLocalDateString(date) : null;
}

/**
 * Drops played dates that fall strictly AFTER the last visit date.
 * Such dates are artifacts of fabricating a streak forward from "today".
 */
export function pruneFuturePlayedDates(playedDates: string[] = [], lastVisitStr?: string | null): string[] {
  if (!lastVisitStr) return playedDates;
  return (Array.isArray(playedDates) ? playedDates : []).filter(d => d <= lastVisitStr);
}

/**
 * Day-rollover logic for local midnight: if the previous day was NOT played,
 * a stale streak (count that survives missed days) resets to 0 immediately and
 * fabricated future played dates are pruned. If yesterday WAS played or today
 * was already recorded, state is returned unchanged (streak survives).
 */
export function applyDayRollover(
  state: any,
  todayStr: string,
  yesterdayStr: string
): any {
  if (!state) return state;
  const lastVisitStr = toLocalDateString(state.lastVisit);
  if (!lastVisitStr || lastVisitStr === todayStr || lastVisitStr === yesterdayStr) {
    return state;
  }
  if ((state.streak || 0) <= 0) return state;
  return {
    ...state,
    streak: 0,
    previousStreak: 0,
    playedDates: pruneFuturePlayedDates(state.playedDates, lastVisitStr)
  };
}

/**
 * Returns an array of YYYY-MM-DD date strings for the current week (Sun-Sat).
 */
export function getCurrentWeekDates(today: Date = new Date()): string[] {
  const todayIndex = today.getDay(); // 0 = Sun ... 6 = Sat
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (todayIndex - i));
    dates.push(getLocalDateString(d));
  }
  return dates;
}

/**
 * Automatically reconstructs/backfills played date strings (YYYY-MM-DD)
 * for a user's active streak based on their streak count and last visit date.
 */
export function backfillPlayedDates(
  streak: number = 0,
  lastVisit?: string | Date | null,
  existingPlayedDates: string[] = []
): string[] {
  const dateSet = new Set(Array.isArray(existingPlayedDates) ? existingPlayedDates : []);
  
  if (streak > 0) {
    let endDate = lastVisit ? fromLocalDateString(lastVisit) : new Date();
    if (!endDate) {
      endDate = new Date();
    }
    
    const count = Math.min(streak, 365);
    for (let i = 0; i < count; i++) {
      const d = new Date(endDate);
      d.setDate(d.getDate() - i);
      dateSet.add(getLocalDateString(d));
    }
  }

  return Array.from(dateSet).sort();
}
