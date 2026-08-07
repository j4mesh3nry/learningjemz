// src/pages/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { useGame } from '../contexts/GameContext';
import { Lock, Zap, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import '../index.css';

const modules = [
  {
    to: '/chess',
    icon: '♟️',
    title: 'Chess',
    subtitle: 'Play, Puzzles & Lessons',
    badge: '🔥 Popular',
    bg: 'linear-gradient(135deg, #0a3d24 0%, #16603b 100%)',
    shadow: '0 6px 0 #052113',
    pattern: 'chess',
  },
  {
    to: '/space',
    icon: '🪐',
    title: 'Space',
    subtitle: 'Planets, Moons & Stars',
    badge: '✨ 3D Cosmos',
    bg: 'linear-gradient(135deg, #0b0c1e 0%, #181944 100%)',
    shadow: '0 6px 0 #050512',
    pattern: 'space',
  },
];

const lockedModules = [
  { icon: '📖', title: 'Reading', subtitle: 'Books & Novels' },
  { icon: '🌍', title: 'Geography', subtitle: 'Philippine Provinces' },
  { icon: '🎵', title: 'Learning Songs', subtitle: 'Sing & Learn' },
  { icon: '📜', title: 'Poems', subtitle: 'Rhymes & Verses' },
  { icon: '🧮', title: 'Math', subtitle: 'Numbers & Logic' },
];

function StarDots() {
  const dots = Array.from({ length: 18 }, () => ({
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
  const navigate = useNavigate();
  const { puzzlesSolved, flashcardsMastered, streak, hasPlayedToday } = useGame();

  const getModuleStats = (to: string) => {
    if (to === '/chess') {
      return `${puzzlesSolved || 0} Puzzles Solved • 3 AI Bots`;
    }
    if (to === '/space') {
      return `${flashcardsMastered || 0} Flashcards • 8 Planets`;
    }
    return '';
  };

  return (
    <div style={{
      minHeight: '100vh', 
      background: 'var(--color-bg-page)',
      padding: '24px 16px 90px', 
      maxWidth: 420, 
      margin: '0 auto',
    }}>
      <Header />

      {/* Daily Mission Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #104e30 0%, #1c7c54 100%)',
        borderRadius: 20,
        padding: '14px 16px',
        marginBottom: 20,
        boxShadow: '0 6px 0 #092c1b',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            width: 44, height: 44, borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem'
          }}>
            ⚡
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#38d989' }}>
              Daily Mission
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: 2 }}>
              {hasPlayedToday ? 'Daily streak ignited! 🔥' : 'Play 1 game to ignite your streak!'}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/chess')}
          style={{
            background: '#ffffff',
            color: '#0e3d26',
            fontWeight: 800,
            fontSize: '0.8rem',
            padding: '8px 12px',
            borderRadius: 12,
            boxShadow: '0 3px 0 #c2dfd1',
            border: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {hasPlayedToday ? 'Keep Playing' : 'Ignite 🔥'}
        </button>
      </div>

      {/* Main Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.2rem',
          margin: 0, color: '#0e3d26', fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          What do you want to play and learn?
        </h2>
        <span style={{ fontSize: '0.78rem', color: '#496c5b', fontWeight: 700 }}>2 Available</span>
      </div>

      {/* Module Cards */}
      <div style={{ display: 'grid', gap: 16 }}>
        {modules.map((m) => (
          <Card 
            key={m.to} 
            className="geo-card-item" 
            onClick={() => navigate(m.to)} 
            ariaLabel={m.title} 
            style={{
              display: 'flex', flexDirection: 'column', gap: 12,
              textDecoration: 'none', color: '#fff',
              background: m.bg, borderRadius: 20,
              padding: '18px 18px', position: 'relative', overflow: 'hidden',
              boxShadow: m.shadow,
              border: '1px solid rgba(255,255,255,0.15)',
              transition: 'transform 0.1s ease, boxShadow 0.1s ease',
              cursor: 'pointer'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = '0 2px 0 #052113'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = m.shadow; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = m.shadow; }}
          >
            {m.pattern === 'space' && <StarDots />}

            {/* Top row with badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
              <div style={{
                fontSize: '2rem', width: 50, height: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)', borderRadius: 14,
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)',
                flexShrink: 0,
              }}>
                {m.icon}
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 20,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                {m.badge}
              </div>
            </div>

            {/* Middle row: Title & Subtitle */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.3rem',
                margin: 0, fontWeight: 800, letterSpacing: '-0.2px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                {m.title}
                <ChevronRight size={20} color="rgba(255,255,255,0.8)" />
              </h3>
              <p style={{
                margin: '3px 0 0', fontSize: '0.85rem', opacity: 0.88, fontWeight: 500
              }}>{m.subtitle}</p>
            </div>

            {/* Bottom row: Live stats pill */}
            <div style={{
              position: 'relative', zIndex: 1,
              background: 'rgba(0,0,0,0.25)',
              padding: '6px 12px', borderRadius: 10,
              fontSize: '0.74rem', color: 'rgba(255,255,255,0.9)',
              fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6,
              marginTop: 2
            }}>
              <span>📊</span> {getModuleStats(m.to)}
            </div>
          </Card>
        ))}
      </div>

      {/* Locked Modules Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 14 }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.2rem',
          margin: 0, color: '#0e3d26', fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <span>🚀</span> Coming Soon
        </h2>
        <span style={{ fontSize: '0.78rem', color: '#496c5b', fontWeight: 700 }}>5 Modules</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {lockedModules.map((m) => (
          <div key={m.title} style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            background: '#ffffff', borderRadius: 18,
            border: '2px solid #cce3d7',
            boxShadow: '0 4px 0 #b7d6c5',
            padding: '14px', position: 'relative', overflow: 'hidden',
            cursor: 'not-allowed'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                fontSize: '1.8rem', width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#e8f3ed', borderRadius: 12,
                flexShrink: 0,
                opacity: 0.85
              }}>
                {m.icon}
              </div>
              <div style={{
                background: '#dcf0e5',
                color: '#165e3d',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '4px 7px',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Lock size={11} /> Locked
              </div>
            </div>

            <div>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.05rem',
                margin: 0, fontWeight: 800,
                color: '#0e3d26'
              }}>{m.title}</h3>
              <p style={{
                margin: '2px 0 0', fontSize: '0.78rem', color: '#496c5b', fontWeight: 500
              }}>{m.subtitle}</p>
            </div>
          </div>
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
