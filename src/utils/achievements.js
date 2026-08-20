export const ACHIEVEMENTS = [
  { id: 'first_win', name: 'First Win', icon: 'Trophy', desc: 'Win your first chess game', condition: (s) => s.chessWins >= 1 },
  { id: 'puzzle_10', name: 'Puzzle Solver', icon: 'Gamepad2', desc: 'Solve 10 chess puzzles', condition: (s) => s.puzzlesSolved >= 10 },
  { id: 'map_master', name: 'Map Master', icon: 'Compass', desc: 'Identify 40 provinces correctly', condition: (s) => s.provincesCorrect >= 40 },
  { id: 'bookworm', name: 'Bookworm', icon: 'BookOpen', desc: 'Read for 30 minutes total', condition: (s) => s.readingMinutes >= 30 },
  { id: 'star_gazer', name: 'Star Gazer', icon: 'Sparkles', desc: 'Master 15 space flashcards', condition: (s) => s.flashcardsMastered >= 15 },
  { id: 'streak_7', name: 'On Fire', icon: 'Flame', desc: 'Reach a 7-day streak', condition: (s) => s.maxStreak >= 7 },
  { id: 'level_5', name: 'Scholar', icon: 'GraduationCap', desc: 'Reach Level 5', condition: (s) => s.level >= 5 },
  { id: 'level_10', name: 'Master', icon: 'Crown', desc: 'Reach Level 10', condition: (s) => s.level >= 10 },
];
