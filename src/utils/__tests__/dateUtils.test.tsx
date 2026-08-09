import { describe, it, expect } from 'vitest';
import {
  fromLocalDateString,
  toLocalDateString,
  getLocalDateString,
  backfillPlayedDates,
  pruneFuturePlayedDates,
  applyDayRollover
} from '../dateUtils';

describe('fromLocalDateString / toLocalDateString (local-time safety)', () => {
  it('parses YYYY-MM-DD as a local calendar date without UTC shift', () => {
    const d = fromLocalDateString('2026-08-10')!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(10);
    expect(getLocalDateString(d)).toBe('2026-08-10');
    expect(toLocalDateString('2026-08-10')).toBe('2026-08-10');
  });

  it('normalizes ISO timestamps and Date objects into local date strings', () => {
    const localNoon = new Date(2026, 7, 10, 12, 0, 0);
    expect(toLocalDateString(localNoon.toISOString())).toBe('2026-08-10');
    expect(toLocalDateString(localNoon)).toBe('2026-08-10');
  });

  it('returns null for unparseable values', () => {
    expect(fromLocalDateString(null)).toBeNull();
    expect(fromLocalDateString('')).toBeNull();
    expect(fromLocalDateString('garbage')).toBeNull();
    expect(toLocalDateString(undefined)).toBeNull();
  });
});

describe('backfillPlayedDates', () => {
  it('backfills consecutive local days ending at the last visit string', () => {
    const dates = backfillPlayedDates(3, '2026-08-10', []);
    expect(dates).toEqual(['2026-08-08', '2026-08-09', '2026-08-10']);
  });

  it('keeps existing played dates and does not fabricate today', () => {
    const dates = backfillPlayedDates(3, '2026-08-09', ['2026-08-01']);
    expect(dates).toEqual(['2026-08-01', '2026-08-07', '2026-08-08', '2026-08-09']);
  });
});

describe('pruneFuturePlayedDates', () => {
  it('drops dates strictly after the last visit string', () => {
    const dates = ['2026-08-09', '2026-08-10', '2026-08-11'];
    expect(pruneFuturePlayedDates(dates, '2026-08-10')).toEqual(['2026-08-09', '2026-08-10']);
  });

  it('returns the input unchanged when no last visit is available', () => {
    const dates = ['2026-08-10'];
    expect(pruneFuturePlayedDates(dates, null)).toBe(dates);
  });
});

describe('applyDayRollover (local midnight reset)', () => {
  const baseState = {
    streak: 5,
    previousStreak: 4,
    maxStreak: 5,
    lastVisit: '2026-08-09',
    playedDates: ['2026-08-05', '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09', '2026-08-10']
  };

  it('keeps the streak when yesterday was played', () => {
    expect(applyDayRollover(baseState, '2026-08-10', '2026-08-09')).toBe(baseState);
  });

  it('keeps state when the last visit was today', () => {
    const playedToday = { ...baseState, lastVisit: '2026-08-10' };
    expect(applyDayRollover(playedToday, '2026-08-10', '2026-08-09')).toBe(playedToday);
  });

  it('keeps state when the streak is already 0', () => {
    const zeroStreak = { ...baseState, streak: 0, previousStreak: 0 };
    expect(applyDayRollover(zeroStreak, '2026-08-11', '2026-08-10')).toBe(zeroStreak);
  });

  it('resets a stale streak to 0 at midnight when a day was missed, keeping real history', () => {
    const result = applyDayRollover(baseState, '2026-08-11', '2026-08-10');
    expect(result.streak).toBe(0);
    expect(result.previousStreak).toBe(0);
    expect(result.maxStreak).toBe(5);
    expect(result.playedDates).toEqual([
      '2026-08-05',
      '2026-08-06',
      '2026-08-07',
      '2026-08-08',
      '2026-08-09'
    ]);
  });
});