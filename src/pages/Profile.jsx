/* src/pages/Profile.jsx */
import { useGame } from '../contexts/GameContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ACHIEVEMENTS } from '../utils/achievements.js';
import { Settings, LogOut, Flame, Trophy, Map as MapIcon, BookOpen, Rocket, Check, Lock } from 'lucide-react';
import '../index.css';

export default function Profile() {
  const stats = useGame();
  const { xp, level, streak } = stats;
  const { user, logout } = useAuth();
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay(); // 0=Sun, 1=Mon

  const [avatar, setAvatar] = useState(() => localStorage.getItem('learningjemz_avatar') || '👤');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  const PFP_OPTIONS = ['👤', '🦊', '🦉', '🐯', '🐼', '🐸', '🐶', '🦄', '🤖', '👽', '🦸‍♂️', '👩‍🚀', '🐱', '🦁'];

  const handleSelectAvatar = (a) => {
    setAvatar(a);
    localStorage.setItem('learningjemz_avatar', a);
    setIsEditingAvatar(false);
  };

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      
      {/* Sticky Header */}
      <div style={{ 
        position: 'sticky', top: 0, zIndex: 100, background: '#ffffff',
        paddingTop: 24, paddingBottom: 16, margin: '-24px -16px 24px -16px', paddingLeft: 16, paddingRight: 16,
        borderBottom: '1px solid #eaeaea',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.4rem' }}>Profile</h2>
        <Settings size={24} color="var(--color-muted)" style={{ cursor: 'pointer' }} />
      </div>

      {/* ID Card / Avatar */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))',
        borderRadius: 24, padding: 32, color: 'white', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(28,124,84,0.25)', marginBottom: 24
      }}>
        <div 
          onClick={() => setIsEditingAvatar(true)}
          style={{
            width: 90, height: 90, borderRadius: '50%', margin: '0 auto',
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', cursor: 'pointer',
            position: 'relative'
          }}
        >
          {avatar}
          <div style={{
            position: 'absolute', bottom: -2, right: -2, background: '#ffb400', 
            borderRadius: '50%', width: 28, height: 28, display: 'flex', 
            alignItems: 'center', justifyContent: 'center', border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            <span style={{ fontSize: '12px' }}>✏️</span>
          </div>
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', marginTop: 20, marginBottom: 4, fontSize: '1.8rem' }}>
          {user?.name || 'Learner'}
        </h2>
        <p style={{ opacity: 0.9, fontSize: '0.9rem', marginBottom: 20 }}>{user?.email}</p>
        
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.2)', padding: '8px 16px',
          borderRadius: 20, backdropFilter: 'blur(10px)', fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <span>Level {level}</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span>{level >= 10 ? '👑 Master' : level >= 5 ? '🎓 Scholar' : '🌱 Beginner'}</span>
        </div>
      </div>

      {/* Stats Row (Streak & XP) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{
          padding: 20, borderRadius: 20, border: '2px solid #ffebee',
          background: '#fffafafa', display: 'flex', flexDirection: 'column', alignItems: 'center',
          boxShadow: '0 8px 16px rgba(255,77,77,0.06)'
        }}>
          <Flame size={36} color="#ff4d4d" style={{ fill: '#ff4d4d' }} />
          <strong style={{ fontSize: '1.4rem', marginTop: 12, fontFamily: 'var(--font-heading)' }}>{streak}</strong>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 500 }}>Day Streak</span>
        </div>
        
        <div style={{
          padding: 20, borderRadius: 20, border: '2px solid #fff8e1',
          background: '#fffdf5', display: 'flex', flexDirection: 'column', alignItems: 'center',
          boxShadow: '0 8px 16px rgba(255,180,0,0.06)'
        }}>
          <Trophy size={36} color="#ffb400" style={{ fill: '#ffb400' }} />
          <strong style={{ fontSize: '1.4rem', marginTop: 12, fontFamily: 'var(--font-heading)' }}>{xp}</strong>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 500 }}>Total XP</span>
        </div>
      </div>

      {/* Streak Calendar */}
      <div style={{
        padding: 24, borderRadius: 20, background: '#ffffff',
        border: '1px solid #eaeaea', boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        marginBottom: 32
      }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Flame size={20} color="#ff4d4d" style={{ fill: '#ff4d4d' }} />
          Streak Calendar
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {days.map((d, i) => {
            const dayIndex = (i + 1) % 7; // Mon=1 ... Sun=0
            const isActive = i < streak % 7 || (streak >= 7);
            const isToday = dayIndex === today;
            return (
              <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: isActive ? '#ff4d4d' : '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isActive ? '0 4px 12px rgba(255,77,77,0.3)' : 'none',
                  border: isToday && !isActive ? '2px dashed #ff4d4d' : 'none',
                  color: isActive ? '#fff' : '#999'
                }}>
                  {isActive ? <Check size={18} strokeWidth={3} /> : ''}
                </div>
                <span style={{ fontSize: '0.75rem', color: isToday ? '#222' : 'var(--color-muted)', fontWeight: isToday ? 700 : 500 }}>
                  {d}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Stats */}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: 16, paddingLeft: 8 }}>Learning Stats</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        
        {/* Chess */}
        <div style={{ background: 'linear-gradient(135deg, #1b5e20, #0d3b13)', borderRadius: 20, padding: 16, color: '#fff', boxShadow: '0 8px 20px rgba(27,94,32,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, opacity: 0.9 }}>
            <span style={{ fontSize: '1.5rem' }}>♟️</span>
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Chess</strong>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Wins: <strong style={{color:'#fff'}}>{stats.chessWins}</strong></div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Puzzles: <strong style={{color:'#fff'}}>{stats.puzzlesSolved}</strong></div>
        </div>

        {/* Geo */}
        <div style={{ background: 'linear-gradient(135deg, #0277bd, #01436b)', borderRadius: 20, padding: 16, color: '#fff', boxShadow: '0 8px 20px rgba(2,119,189,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, opacity: 0.9 }}>
            <MapIcon size={24} color="#fff" />
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Geo</strong>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Provinces:</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{stats.provincesCorrect}/82</div>
        </div>

        {/* Reading */}
        <div style={{ background: 'linear-gradient(135deg, #e65100, #a13800)', borderRadius: 20, padding: 16, color: '#fff', boxShadow: '0 8px 20px rgba(230,81,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, opacity: 0.9 }}>
            <BookOpen size={24} color="#fff" />
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Reading</strong>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Books: <strong style={{color:'#fff'}}>{stats.booksReading}</strong></div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Mins: <strong style={{color:'#fff'}}>{stats.readingMinutes}</strong></div>
        </div>

        {/* Space */}
        <div style={{ background: 'linear-gradient(135deg, #212121, #000000)', borderRadius: 20, padding: 16, color: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, opacity: 0.9 }}>
            <Rocket size={24} color="#fff" />
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Space</strong>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Mastered: <strong style={{color:'#fff'}}>{stats.flashcardsMastered}</strong></div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Best: <strong style={{color:'#fff'}}>{stats.quizHighScore}%</strong></div>
        </div>

      </div>

      {/* Achievements */}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: 16, paddingLeft: 8 }}>Achievements</h3>
      <div style={{ 
        padding: 24, borderRadius: 20, background: '#ffffff',
        border: '1px solid #eaeaea', boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        marginBottom: 32,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 
      }}>
        {ACHIEVEMENTS.map(a => {
          const unlockedData = stats.achievements?.find(ach => ach.id === a.id);
          const unlocked = !!unlockedData;
          return (
            <div key={a.id} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              opacity: unlocked ? 1 : 0.4,
              filter: unlocked ? 'none' : 'grayscale(100%)'
            }}>
              <div style={{ 
                width: 60, height: 60, borderRadius: '50%', 
                background: unlocked ? '#fff8e1' : '#f5f5f5',
                border: unlocked ? '2px solid #ffb400' : '2px dashed #ddd',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', marginBottom: 8,
                position: 'relative',
                boxShadow: unlocked ? '0 4px 12px rgba(255,180,0,0.3)' : 'none'
              }}>
                {unlocked ? a.icon : <Lock size={20} color="#999" />}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#333', lineHeight: 1.2 }}>{a.name}</div>
              {unlocked && (
                <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: 4 }}>
                  {new Date(unlockedData.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Logout */}
      <div style={{ paddingBottom: 24 }}>
        <button 
          onClick={logout} 
          style={{ 
            width: '100%', padding: 18, borderRadius: 16,
            background: '#fff', border: '2px solid #ff4d4d', color: '#ff4d4d',
            fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 12px rgba(255,77,77,0.1)'
          }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      {/* Avatar Selection Modal */}
      {isEditingAvatar && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }} onClick={() => setIsEditingAvatar(false)}>
          <div style={{
            background: '#fff', padding: 24, borderRadius: 24,
            width: '90%', maxWidth: 360, boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', marginBottom: 20 }}>Choose Avatar</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {PFP_OPTIONS.map(a => (
                <div key={a} onClick={() => handleSelectAvatar(a)} style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: avatar === a ? '#e8f5e9' : '#f5f5f5',
                  border: avatar === a ? '3px solid #4caf50' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', cursor: 'pointer', transition: 'transform 0.1s ease',
                  transform: avatar === a ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: avatar === a ? '0 4px 12px rgba(76,175,80,0.3)' : 'none'
                }}>
                  {a}
                </div>
              ))}
            </div>
            <button 
              onClick={() => setIsEditingAvatar(false)}
              style={{
                width: '100%', marginTop: 24, padding: 14, borderRadius: 12,
                background: '#f5f5f5', color: '#333', fontWeight: 600, border: 'none'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
