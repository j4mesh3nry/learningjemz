// src/utils/leaderboardUtils.ts
import { toLocalDateString } from './dateUtils';

export interface LeaderboardUser {
  id: string;
  name?: string;
  avatar?: string;
  xp?: number;
  level?: number;
  streak?: number;
  last_visit?: string;
  updated_at?: string;
  created_at?: string;
}

export function getStreakDaysInactive(item: any): number {
  const lastVisitStr = toLocalDateString(item?.last_visit);
  if (!lastVisitStr) return 0;
  const [y, m, d] = lastVisitStr.split('-').map(Number);
  const last = new Date(y, m - 1, d);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((todayMidnight.getTime() - last.getTime()) / 86400000));
}

export function getActiveStreak(item: any): number {
  const raw = Number(item?.streak) || 0;
  if (raw <= 0) return 0;
  if (getStreakDaysInactive(item) > 1) {
    return 0;
  }
  return raw;
}

export function formatXP(xp: number): string {
  if (xp >= 10000) return (xp / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return xp.toLocaleString();
}

/**
 * 11-Tier Prestige Progression System based on Player Level (Lv. 1 - 100+)
 */
export function getPrestigeInfo(lvl: number): { title: string; color: string } {
  if (lvl >= 100) return { title: 'Cosmic Ascendant', color: '#ffffff' };
  if (lvl >= 90) return { title: 'Immortal', color: '#c084fc' };
  if (lvl >= 75) return { title: 'Mythic', color: '#f43f5e' };
  if (lvl >= 60) return { title: 'Grandmaster', color: '#ec4899' };
  if (lvl >= 50) return { title: 'Master', color: '#f97316' };
  if (lvl >= 40) return { title: 'Adept', color: '#f59e0b' };
  if (lvl >= 30) return { title: 'Sage', color: '#a78bfa' };
  if (lvl >= 20) return { title: 'Scholar', color: '#818cf8' };
  if (lvl >= 10) return { title: 'Explorer', color: '#38bdf8' };
  if (lvl >= 5) return { title: 'Apprentice', color: '#34d399' };
  return { title: 'Novice', color: '#8db5a0' };
}

/**
 * 7-Tier Competitive League Division System
 */
export function getCompetitiveLeague(
  isQualified: boolean,
  rankIndex: number,
  xp: number
): { name: string; pillText: string; color: string; iconType: 'crown' | 'diamond' | 'shield' } {
  if (!isQualified || rankIndex === -1) {
    return { name: 'Unranked', pillText: 'Unranked', color: '#8db5a0', iconType: 'shield' };
  }
  if (rankIndex >= 0 && rankIndex < 3) {
    return { name: 'Champions League', pillText: 'CHAMPIONS', color: '#fbbf24', iconType: 'crown' };
  }
  if (rankIndex < 10 || xp >= 5000) {
    return { name: 'Mythic Diamond', pillText: 'MYTHIC DIAMOND', color: '#c084fc', iconType: 'diamond' };
  }
  if (rankIndex < 20 || xp >= 2000) {
    return { name: 'Emerald Master', pillText: 'EMERALD LEAGUE', color: '#34d399', iconType: 'shield' };
  }
  if (xp >= 1000) {
    return { name: 'Platinum League', pillText: 'PLATINUM LEAGUE', color: '#38bdf8', iconType: 'shield' };
  }
  if (xp >= 500) {
    return { name: 'Gold League', pillText: 'GOLD LEAGUE', color: '#f59e0b', iconType: 'shield' };
  }
  if (xp >= 100) {
    return { name: 'Silver League', pillText: 'SILVER LEAGUE', color: '#94a3b8', iconType: 'shield' };
  }
  return { name: 'Bronze League', pillText: 'BRONZE LEAGUE', color: '#d97706', iconType: 'shield' };
}

/**
 * Global Rank percentile calculation matching Home page
 */
export function getRankDisplay(xp: number): string {
  if (xp >= 5000) return 'Top 1%';
  if (xp >= 2000) return 'Top 2%';
  if (xp >= 1000) return 'Top 5%';
  if (xp >= 500) return 'Top 10%';
  if (xp >= 100) return 'Top 25%';
  return 'Top 50%';
}

export function withLiveUserValues(
  list: any[],
  user: any,
  xp: number,
  streak: number,
  level: number
): any[] {
  if (!user?.id) return list;
  return list.map((item) =>
    item.id === user?.id
      ? {
          ...item,
          xp: xp ?? item.xp,
          streak: streak ?? item.streak,
          level: level ?? item.level,
        }
      : item
  );
}
