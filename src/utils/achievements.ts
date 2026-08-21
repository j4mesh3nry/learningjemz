export interface AchievementConditionState {
  chessWins?: number;
  puzzlesSolved?: number;
  xp?: number;
  maxStreak?: number;
  flashcardsMastered?: number;
  level?: number;
  [key: string]: any;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  desc: string;
  condition: (s: AchievementConditionState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', name: 'First Win', icon: 'Trophy', desc: 'Win your first chess game', condition: (s) => (s.chessWins ?? 0) >= 1 },
  { id: 'puzzle_10', name: 'Puzzle Solver', icon: 'Gamepad2', desc: 'Solve 10 chess puzzles', condition: (s) => (s.puzzlesSolved ?? 0) >= 10 },
  { id: 'space_scholar', name: 'Cosmic Explorer', icon: 'Compass', desc: 'Reach 100 XP in learning challenges', condition: (s) => (s.xp ?? 0) >= 100 },
  { id: 'streak_3', name: 'Daily Dedication', icon: 'BookOpen', desc: 'Reach a 3-day learning streak', condition: (s) => (s.maxStreak ?? 0) >= 3 },
  { id: 'star_gazer', name: 'Star Gazer', icon: 'Sparkles', desc: 'Master 15 space flashcards', condition: (s) => (s.flashcardsMastered ?? 0) >= 15 },
  { id: 'streak_7', name: 'On Fire', icon: 'Flame', desc: 'Reach a 7-day streak', condition: (s) => (s.maxStreak ?? 0) >= 7 },
  { id: 'level_5', name: 'Scholar', icon: 'GraduationCap', desc: 'Reach Level 5', condition: (s) => (s.level ?? 0) >= 5 },
  { id: 'level_10', name: 'Master', icon: 'Crown', desc: 'Reach Level 10', condition: (s) => (s.level ?? 0) >= 10 },
];
