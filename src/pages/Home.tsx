// src/pages/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { Lock } from 'lucide-react';
import '../index.css';

const modules = [
  {
    to: '/chess',
    icon: '♟️',
    title: 'Chess',
    subtitle: 'Play, Puzzles & Lessons',
    bg: '#16653e',
    shadow: '0 5px 0 #0e4329',
    pattern: 'chess',
  },
  {
    to: '/space',
    icon: '🪐',
    title: 'Space',
    subtitle: 'Planets, Moons & Stars',
    bg: '#161936',
    shadow: '0 5px 0 #0b0d1e',
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

  return (
    <div style={{
      minHeight: '100vh', 
      background: 'var(--color-bg-page)',
      padding: '24px 16px 90px', 
      maxWidth: 420, 
      margin: '0 auto',
    }}>
      <Header />

      {/* Main Section Header */}
      <h2 style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.2rem',
        marginBottom: 14, color: '#0f3825', fontWeight: 800,
        display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        What do you want to play and learn?
      </h2>

      {/* Clean & Simple Module Cards */}
      <div style={{ display: 'grid', gap: 14 }}>
        {modules.map((m) => (
          <Card 
            key={m.to} 
            className="geo-card-item" 
            onClick={() => navigate(m.to)} 
            ariaLabel={m.title} 
            style={{
              display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16,
              textDecoration: 'none', color: '#fff',
              background: m.bg, borderRadius: 20,
              padding: '18px 18px', position: 'relative', overflow: 'hidden',
              boxShadow: m.shadow,
              border: '2px solid rgba(255,255,255,0.2)',
              transition: 'transform 0.1s ease, boxShadow 0.1s ease',
              cursor: 'pointer'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = '0 2px 0 #0e4329'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = m.shadow; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = m.shadow; }}
          >
            {m.pattern === 'space' && <StarDots />}

            {/* Module Icon Tile */}
            <div style={{
              fontSize: '2rem', width: 52, height: 52,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.18)', borderRadius: 16,
              flexShrink: 0, zIndex: 1
            }}>
              {m.icon}
            </div>

            {/* Title & Subtitle */}
            <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
                margin: 0, fontWeight: 800, letterSpacing: '-0.2px'
              }}>{m.title}</h3>
              <p style={{
                margin: '2px 0 0', fontSize: '0.85rem', opacity: 0.9, fontWeight: 500
              }}>{m.subtitle}</p>
            </div>

            {/* Clean Right Arrow */}
            <div style={{
              fontSize: '1.2rem', opacity: 0.85,
              position: 'relative', zIndex: 1, fontWeight: 'bold'
            }}>→</div>
          </Card>
        ))}
      </div>

      {/* Locked Modules Header */}
      <h2 style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.2rem',
        marginTop: 30, marginBottom: 14, color: '#0f3825', fontWeight: 800,
        display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        <span>🚀</span> Coming Soon
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {lockedModules.map((m, idx) => (
          <div key={idx} style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            background: '#ffffff', borderRadius: 18,
            border: '2px solid #b0cbaf',
            boxShadow: '0 4px 0 #b0cbaf',
            padding: '14px', position: 'relative', overflow: 'hidden',
            cursor: 'not-allowed'
          }}>
            {/* Crisp Unblurred Locked Badge Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              background: '#16653e',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: 12,
              border: '1.5px solid #0e4329',
              boxShadow: '0 3px 0 #0e4329',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap'
            }}>
              <Lock size={12} color="#ffffff" /> Secret Module
            </div>

            {/* Blurred Card Content */}
            <div style={{
              filter: 'blur(7px)',
              opacity: 0.35,
              pointerEvents: 'none',
              userSelect: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  fontSize: '1.8rem', width: 44, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#e1f0e2', borderRadius: 12,
                  flexShrink: 0
                }}>
                  {m.icon}
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <h3 style={{
                  fontFamily: 'var(--font-heading)', fontSize: '1.05rem',
                  margin: 0, fontWeight: 800,
                  color: '#0f3825'
                }}>{m.title}</h3>
                <p style={{
                  margin: '2px 0 0', fontSize: '0.78rem', color: '#4e7361', fontWeight: 500
                }}>{m.subtitle}</p>
              </div>
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
