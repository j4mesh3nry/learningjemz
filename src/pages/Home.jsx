/* src/pages/Home.jsx */
import { Link } from 'react-router-dom';
import { useGame } from '../contexts/GameContext.jsx';
import '../index.css';

const modules = [
  {
    to: '/chess',
    icon: '♟️',
    title: 'Chess',
    subtitle: 'Play, Puzzles & Lessons',
    bg: 'linear-gradient(135deg, #0e4d2e 0%, #1c7c54 100%)',
    pattern: 'chess',
  },
  {
    to: '/geo',
    icon: '🌍',
    title: 'Geography',
    subtitle: 'Philippine Provinces',
    bg: 'linear-gradient(135deg, #004e92 0%, #0077b6 100%)',
    pattern: 'geo',
  },
  {
    to: '/reading',
    icon: '📖',
    title: 'Reading',
    subtitle: 'Books & Novels',
    bg: 'linear-gradient(135deg, #b85c1e 0%, #e07c3e 100%)',
    pattern: 'reading',
  },
  {
    to: '/space',
    icon: '🪐',
    title: 'Space',
    subtitle: 'Planets, Moons & Stars',
    bg: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 100%)',
    pattern: 'space',
  },
];

function StarDots() {
  // small yellow/white dots for the space card
  const dots = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    color: Math.random() > 0.5 ? '#ffdd57' : '#ffffff',
    delay: Math.random() * 3,
  }));
  return (
    <>
      {dots.map((d, i) => (
        <span key={i} style={{
          position: 'absolute', left: `${d.x}%`, top: `${d.y}%`,
          width: d.size, height: d.size, borderRadius: '50%',
          background: d.color, opacity: 0.7,
          animation: `twinkle ${1.5 + d.delay}s ease-in-out infinite alternate`,
        }} />
      ))}
    </>
  );
}

export default function Home() {
  const { xp, level, streak } = useGame();
  const xpInLevel = xp - (level - 1) * 100;
  const pct = Math.min(xpInLevel, 100);

  return (
    <div style={{
      minHeight: '100vh', background: '#ffffff',
      padding: '24px 16px 80px', maxWidth: 420, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.8rem',
            background: 'linear-gradient(135deg, #1c7c54, #4caf50)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: 0,
          }}>
            💎 LearningJemz
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Streak badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#fff5f5', padding: '4px 10px', borderRadius: 20,
            border: '1px solid #ffcdd2',
          }}>
            <span style={{ fontSize: '1rem' }}>🔥</span>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e53935' }}>{streak}</span>
          </div>
          {/* Level badge */}
          <Link to="/profile" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#fff8e1', padding: '4px 10px', borderRadius: 20,
            border: '1px solid #ffe082', textDecoration: 'none',
          }}>
            <span style={{ fontSize: '0.85rem' }}>⭐</span>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f57f17' }}>Lv.{level}</span>
          </Link>
        </div>
      </div>

      {/* XP Mini bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          height: 6, borderRadius: 3, background: '#e8f5e9', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 3, width: `${pct}%`,
            background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: 2 }}>
          {xpInLevel}/100 XP to Level {level + 1}
        </div>
      </div>

      {/* Question */}
      <h2 style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.3rem',
        marginBottom: 20, color: '#333',
      }}>
        What do you want to play and learn?
      </h2>

      {/* Module Cards */}
      <div style={{ display: 'grid', gap: 14 }}>
        {modules.map((m) => (
          <Link key={m.to} to={m.to} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            textDecoration: 'none', color: '#fff',
            background: m.bg, borderRadius: 16,
            padding: '20px 18px', position: 'relative', overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)'; }}
          >
            {/* Pattern overlay for space card */}
            {m.pattern === 'space' && <StarDots />}

            {/* Icon */}
            <div style={{
              fontSize: '2.2rem', width: 56, height: 56,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.15)', borderRadius: 14,
              flexShrink: 0,
            }}>
              {m.icon}
            </div>

            {/* Text */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.2rem',
                margin: 0, fontWeight: 700,
              }}>{m.title}</h3>
              <p style={{
                margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.85,
              }}>{m.subtitle}</p>
            </div>

            {/* Arrow */}
            <div style={{
              marginLeft: 'auto', fontSize: '1.2rem', opacity: 0.6,
              position: 'relative', zIndex: 1,
            }}>→</div>
          </Link>
        ))}
      </div>

      {/* Twinkle animation */}
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.3; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
