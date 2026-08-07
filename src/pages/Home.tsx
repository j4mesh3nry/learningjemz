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
    bg: 'linear-gradient(135deg, #0e4d2e 0%, #1c7c54 100%)',
    shadow: '0 6px 0 #072415',
    pattern: 'chess',
  },
  {
    to: '/space',
    icon: '🪐',
    title: 'Space',
    subtitle: 'Planets, Moons & Stars',
    bg: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 100%)',
    shadow: '0 6px 0 #050515',
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
  const dots = Array.from({ length: 20 }, () => ({
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
        fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
        marginBottom: 16, marginTop: 8, color: '#0e3d26', fontWeight: 800,
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <span>🎯</span> What do you want to play and learn?
      </h2>

      {/* Module Cards */}
      <div style={{ display: 'grid', gap: 16 }}>
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
              padding: '20px 18px', position: 'relative', overflow: 'hidden',
              boxShadow: m.shadow,
              border: '1px solid rgba(255,255,255,0.15)',
              transition: 'transform 0.1s ease, boxShadow 0.1s ease',
              cursor: 'pointer'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = '0 2px 0 #072415'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = m.shadow; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = m.shadow; }}
          >
            {m.pattern === 'space' && <StarDots />}
            <div style={{
              fontSize: '2.2rem', width: 56, height: 56,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.18)', borderRadius: 16,
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)',
              flexShrink: 0,
            }}>
              {m.icon}
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
                margin: 0, fontWeight: 800, letterSpacing: '-0.2px'
              }}>{m.title}</h3>
              <p style={{
                margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.88, fontWeight: 500
              }}>{m.subtitle}</p>
            </div>
            <div style={{
              marginLeft: 'auto', fontSize: '1.2rem', opacity: 0.8,
              position: 'relative', zIndex: 1, fontWeight: 'bold'
            }}>→</div>
          </Card>
        ))}
      </div>

      {/* Locked Modules */}
      <h2 style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
        marginTop: 32, marginBottom: 16, color: '#0e3d26', fontWeight: 800,
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <span>🚀</span> Coming Soon
      </h2>

      <div style={{ display: 'grid', gap: 14 }}>
        {lockedModules.map((m) => (
          <div key={m.title} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: '#ffffff', borderRadius: 20,
            border: '2px solid #cce3d7',
            boxShadow: '0 4px 0 #b7d6c5',
            padding: '16px 18px', position: 'relative', overflow: 'hidden',
            cursor: 'not-allowed'
          }}>
            <div style={{
              fontSize: '2rem', width: 52, height: 52,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#e8f3ed', borderRadius: 14,
              flexShrink: 0,
              opacity: 0.85
            }}>
              {m.icon}
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.15rem',
                margin: 0, fontWeight: 700,
                color: '#0e3d26'
              }}>{m.title}</h3>
              <p style={{
                margin: '2px 0 0', fontSize: '0.82rem', color: '#496c5b', fontWeight: 500
              }}>{m.subtitle}</p>
            </div>
            <div style={{
              marginLeft: 'auto',
              background: '#dcf0e5',
              color: '#165e3d',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '6px 10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              border: '1px solid #bde2cf'
            }}>
              <Lock size={13} /> Locked
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
