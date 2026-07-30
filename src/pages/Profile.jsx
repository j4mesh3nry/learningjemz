/* src/pages/Profile.jsx */
import { useGame } from '../contexts/GameContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import '../index.css';

const achievements = [
  { id: 'first_win', name: 'First Win', icon: '🏆', desc: 'Win your first chess game', condition: (s) => s.chessWins >= 1 },
  { id: 'puzzle_10', name: 'Puzzle Solver', icon: '🧩', desc: 'Solve 10 chess puzzles', condition: (s) => s.puzzlesSolved >= 10 },
  { id: 'map_master', name: 'Map Master', icon: '🗺️', desc: 'Identify 40 provinces correctly', condition: (s) => s.provincesCorrect >= 40 },
  { id: 'bookworm', name: 'Bookworm', icon: '📚', desc: 'Read for 30 minutes total', condition: (s) => s.readingMinutes >= 30 },
  { id: 'star_gazer', name: 'Star Gazer', icon: '⭐', desc: 'Master 15 space flashcards', condition: (s) => s.flashcardsMastered >= 15 },
  { id: 'streak_7', name: 'On Fire', icon: '🔥', desc: 'Reach a 7-day streak', condition: (s) => s.maxStreak >= 7 },
  { id: 'level_5', name: 'Scholar', icon: '🎓', desc: 'Reach Level 5', condition: (s) => s.level >= 5 },
  { id: 'level_10', name: 'Master', icon: '👑', desc: 'Reach Level 10', condition: (s) => s.level >= 10 },
];

export default function Profile() {
  const stats = useGame();
  const { xp, level, streak } = stats;
  const { user, logout } = useAuth();
  const xpForNext = level * 100;
  const xpInLevel = xp - (level - 1) * 100;
  const pct = Math.min((xpInLevel / 100) * 100, 100);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay(); // 0=Sun

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      {/* Avatar & Level */}
      <div className="text-center" style={{ marginTop: '20px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto',
          background: 'linear-gradient(135deg, #4caf50, #1c7c54)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', color: '#fff', position: 'relative',
          boxShadow: '0 4px 20px rgba(76,175,80,0.4)'
        }}>
          👤
          <span style={{
            position: 'absolute', bottom: -6, right: -6,
            background: '#ffb400', color: '#222', borderRadius: 12,
            padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700,
            fontFamily: 'var(--font-heading)'
          }}>Lv.{level}</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', marginTop: 12 }}>{user?.name || 'Learner'}</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
          {user?.email} • {level >= 10 ? '👑 Master' : level >= 5 ? '🎓 Scholar' : '🌱 Beginner'}
        </p>
      </div>

      {/* XP Bar */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
          <span style={{ fontWeight: 600 }}>XP</span>
          <span style={{ color: 'var(--color-muted)' }}>{xp} / {xpForNext} to Level {level + 1}</span>
        </div>
        <div style={{
          height: 12, borderRadius: 6, background: '#e0e0e0', overflow: 'hidden'
        }}>
          <div style={{
            height: '100%', borderRadius: 6, width: `${pct}%`,
            background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Streak */}
      <div style={{
        marginTop: 20, padding: 16, borderRadius: 12,
        background: 'linear-gradient(135deg, #fff5f5, #fff)',
        border: '1px solid #ffe0e0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: '1.5rem' }}>🔥</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
            {streak} Day Streak
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {days.map((d, i) => {
            const dayIndex = (i + 1) % 7; // Mon=1 ... Sun=0
            const isActive = i < streak % 7 || (streak >= 7);
            const isToday = dayIndex === today;
            return (
              <div key={d} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: isActive ? '#4caf50' : '#e0e0e0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? '#fff' : '#999', fontSize: '0.7rem', fontWeight: 600,
                  border: isToday ? '2px solid #ffb400' : 'none'
                }}>
                  {isActive ? '✓' : ''}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)' }}>{d}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Stats */}
      <h3 style={{ fontFamily: 'var(--font-heading)', marginTop: 24, marginBottom: 12 }}>Module Stats</h3>
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ padding: 14, borderRadius: 10, background: '#f0faf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.2rem' }}>♟️</span>
            <strong style={{ marginLeft: 8 }}>Chess</strong>
          </div>
          <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>
            {stats.chessWins} wins · {stats.puzzlesSolved} puzzles
          </span>
        </div>
        <div style={{ padding: 14, borderRadius: 10, background: '#f0f5ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.2rem' }}>🌍</span>
            <strong style={{ marginLeft: 8 }}>Geography</strong>
          </div>
          <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>
            {stats.provincesCorrect} provinces
          </span>
        </div>
        <div style={{ padding: 14, borderRadius: 10, background: '#fff8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.2rem' }}>📖</span>
            <strong style={{ marginLeft: 8 }}>Reading</strong>
          </div>
          <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>
            {stats.booksReading} books · {stats.readingMinutes}m read
          </span>
        </div>
        <div style={{ padding: 14, borderRadius: 10, background: '#f5f0ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.2rem' }}>🪐</span>
            <strong style={{ marginLeft: 8 }}>Space</strong>
          </div>
          <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>
            {stats.flashcardsMastered} mastered · Best: {stats.quizHighScore}%
          </span>
        </div>
      </div>

      {/* Achievements */}
      <h3 style={{ fontFamily: 'var(--font-heading)', marginTop: 24, marginBottom: 12 }}>Achievements</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {achievements.map(a => {
          const unlocked = a.condition(stats);
          return (
            <div key={a.id} style={{
              textAlign: 'center', padding: 10, borderRadius: 10,
              background: unlocked ? '#fff' : '#f5f5f5',
              opacity: unlocked ? 1 : 0.4,
              border: unlocked ? '2px solid #4caf50' : '1px solid #e0e0e0',
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '1.5rem' }}>{a.icon}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, marginTop: 4 }}>{a.name}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={logout} className="btn-primary" style={{ background: '#e53935', width: '100%' }}>
          Log Out
        </button>
      </div>
    </div>
  );
}
