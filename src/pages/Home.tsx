// src/pages/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
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
    to: '/space',
    icon: '🪐',
    title: 'Space',
    subtitle: 'Planets, Moons & Stars',
    bg: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 100%)',
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
      minHeight: '100vh', background: '#ffffff',
      padding: '24px 16px 80px', maxWidth: 420, margin: '0 auto',
    }}>
      <Header />

      {/* Question */}
      <h2 style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.3rem',
        marginBottom: 20, color: '#333',
      }}>
        What do you want to play and learn?
      </h2>

      {/* Module Cards */}
      <div style={{ display: 'grid', gap: 16 }}>
        {modules.map((m) => (
          <Card key={m.to} className="geo-card-item" onClick={() => navigate(m.to)} ariaLabel={m.title} style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 18,
            textDecoration: 'none', color: '#fff',
            background: m.bg, borderRadius: 20,
            padding: '24px 20px', minHeight: 96, position: 'relative', overflow: 'hidden',
            boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)'; }}
          >
            {m.pattern === 'space' && <StarDots />}
            <div style={{
              fontSize: '2.5rem', width: 62, height: 62,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.15)', borderRadius: 16,
              flexShrink: 0,
            }}>
              {m.icon}
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.35rem',
                margin: 0, fontWeight: 800, letterSpacing: '-0.3px'
              }}>{m.title}</h3>
              <p style={{
                margin: '5px 0 0', fontSize: '0.88rem', opacity: 0.9, fontWeight: 500
              }}>{m.subtitle}</p>
            </div>
            <div style={{
              marginLeft: 'auto', fontSize: '1.4rem', opacity: 0.7,
              position: 'relative', zIndex: 1,
            }}>→</div>
          </Card>
        ))}
      </div>

      {/* Locked Modules */}
      <h2 style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.3rem',
        marginTop: 36, marginBottom: 20, color: '#333',
      }}>
        Coming Soon
      </h2>

      <div style={{ display: 'grid', gap: 16 }}>
        {lockedModules.map((m) => (
          <div key={m.title} style={{
            display: 'flex', alignItems: 'center', gap: 18,
            color: '#6c757d',
            background: '#f8f9fa', borderRadius: 20,
            border: '1px solid #e9ecef',
            padding: '22px 20px', position: 'relative', overflow: 'hidden',
            cursor: 'not-allowed'
          }}>
            <div style={{
              fontSize: '2.4rem', width: 60, height: 60,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#e9ecef', borderRadius: 16,
              flexShrink: 0,
            }}>
              {m.icon}
            </div>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
                margin: 0, fontWeight: 700, color: '#495057'
              }}>{m.title}</h3>
              <p style={{
                margin: '4px 0 0', fontSize: '0.88rem', color: '#868e96'
              }}>{m.subtitle}</p>
            </div>
            <div style={{
              marginLeft: 'auto', background: '#e9ecef',
              padding: '6px 12px', borderRadius: 12, fontSize: '0.75rem',
              fontWeight: 700, color: '#6c757d', display: 'flex', alignItems: 'center', gap: 4
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
