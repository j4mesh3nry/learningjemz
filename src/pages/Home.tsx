// src/pages/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext.jsx';
import { Card } from '../components/Card';
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

const lockedModules = [
  { icon: '🌍', title: 'Geography', subtitle: 'Philippine Provinces' },
  { icon: '🎵', title: 'Learning Songs', subtitle: 'Sing & Learn' },
  { icon: '📜', title: 'Poems', subtitle: 'Rhymes & Verses' },
  { icon: '🧮', title: 'Math', subtitle: 'Numbers & Logic' },
];

function StarDots() {
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

import { Gem } from 'lucide-react';

export default function Home() {
  const { xp, level, streak, hasPlayedToday } = useGame();
  const xpInLevel = xp - (level - 1) * 100;
  const pct = Math.min(xpInLevel, 100);
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh', background: '#ffffff',
      padding: '24px 16px 80px', maxWidth: 420, margin: '0 auto',
    }}>
      {/* Sticky Header Container */}
      <div style={{ 
        position: 'sticky', top: 0, zIndex: 100, background: '#ffffff',
        paddingTop: 24, paddingBottom: 16, margin: '-24px -16px 16px -16px', paddingLeft: 16, paddingRight: 16,
        borderBottom: '1px solid #eaeaea',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        {/* Top row: Title and Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          {/* Logo Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1c7c54, #4caf50)',
              borderRadius: '10px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(76, 175, 80, 0.25)'
            }}>
              <Gem size={22} color="#ffffff" strokeWidth={2.5} />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.6rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: '#1a202c',
              margin: 0,
            }}>
              Learning<span style={{ color: '#1c7c54' }}>Jemz</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: '#fff5f5', padding: '4px 10px', borderRadius: 20,
              border: '1px solid #ffcdd2',
            }}>
              <span className={!hasPlayedToday ? "unlit-icon" : ""} style={{ fontSize: '0.85rem' }}>🔥</span>
              <span className={!hasPlayedToday ? "unlit-text" : ""} style={{ fontWeight: 800, fontSize: '0.85rem', color: '#e53935' }}>{streak}</span>
            </div>
            <div onClick={() => navigate('/profile')} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: '#fff8e1', padding: '4px 10px', borderRadius: 20,
              border: '1px solid #ffe082', cursor: 'pointer',
            }} aria-label="Go to Profile" role="button">
              <span style={{ fontSize: '0.85rem' }}>⭐</span>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#f57f17' }}>Lv.{level}</span>
            </div>
          </div>
        </div>
        {/* XP Mini bar */}
        <div>
          <div style={{
            height: 6, borderRadius: 3, background: '#e8f5e9', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 3, width: `${pct}%`,
              background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: 4 }}>
            {xpInLevel}/100 XP to Level {level + 1}
          </div>
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
          <Card key={m.to} className="geo-card-item" onClick={() => navigate(m.to)} ariaLabel={m.title} style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16,
            textDecoration: 'none', color: '#fff',
            background: m.bg, borderRadius: 16,
            padding: '20px 18px', position: 'relative', overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)'; }}
          >
            {m.pattern === 'space' && <StarDots />}
            <div style={{
              fontSize: '2.2rem', width: 56, height: 56,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.15)', borderRadius: 14,
              flexShrink: 0,
            }}>
              {m.icon}
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.2rem',
                margin: 0, fontWeight: 700,
              }}>{m.title}</h3>
              <p style={{
                margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.85,
              }}>{m.subtitle}</p>
            </div>
            <div style={{
              marginLeft: 'auto', fontSize: '1.2rem', opacity: 0.6,
              position: 'relative', zIndex: 1,
            }}>→</div>
          </Card>
        ))}
      </div>

      {/* Locked Modules */}
      <h2 style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.3rem',
        marginTop: 32, marginBottom: 20, color: '#333',
      }}>
        Coming Soon
      </h2>

      <div style={{ display: 'grid', gap: 14 }}>
        {lockedModules.map((m) => (
          <div key={m.title} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            color: '#6c757d',
            background: '#f8f9fa', borderRadius: 16,
            border: '1px solid #e9ecef',
            padding: '20px 18px', position: 'relative', overflow: 'hidden',
            cursor: 'not-allowed'
          }}>
            <div style={{
              fontSize: '2.2rem', width: 56, height: 56,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#e9ecef', borderRadius: 14,
              flexShrink: 0,
              opacity: 0.7
            }}>
              {m.icon}
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.2rem',
                margin: 0, fontWeight: 700,
                color: '#495057'
              }}>{m.title}</h3>
              <p style={{
                margin: '4px 0 0', fontSize: '0.85rem', opacity: 1,
              }}>{m.subtitle}</p>
            </div>
            <div style={{
              marginLeft: 'auto',
              background: '#e9ecef',
              color: '#6c757d',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🔒 Locked
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
