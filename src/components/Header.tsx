import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext.jsx';
import { Gem, Flame, Star } from 'lucide-react';
import '../index.css';

export function Header() {
  const { xp, level, streak, hasPlayedToday } = useGame();
  const xpInLevel = xp - (level - 1) * 100;
  const pct = Math.min(xpInLevel, 100);
  const navigate = useNavigate();

  return (
    <div style={{ 
      position: 'sticky', top: 0, zIndex: 100, background: '#ffffff',
      paddingTop: 28, paddingBottom: 20, margin: '-24px -16px 20px -16px', paddingLeft: 16, paddingRight: 16,
      borderBottom: '1px solid #eaeaea',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}>
      {/* Top row: Title and Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: hasPlayedToday ? '#fff5f5' : '#f0f0f0',
            padding: '1px 7px', borderRadius: 10,
            border: hasPlayedToday ? '1px solid #ffcdd2' : '1px solid #d5d5d5',
          }}>
            <Flame 
              size={12} 
              color={hasPlayedToday ? '#ff4d4d' : '#888888'} 
              fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} 
            />
            <span style={{ fontWeight: 800, fontSize: '0.7rem', color: hasPlayedToday ? '#e53935' : '#444444' }}>
              {streak ?? 0}
            </span>
          </div>
          <div 
            onClick={() => navigate('/profile')} 
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              background: '#fff8e1', padding: '1px 7px', borderRadius: 10,
              border: '1px solid #ffe082', cursor: 'pointer',
            }} 
            aria-label="Go to Profile" 
            role="button"
          >
            <Star size={12} color="#f57f17" fill="#ffb300" />
            <span style={{ fontWeight: 800, fontSize: '0.7rem', color: '#f57f17' }}>Lv.{level}</span>
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
  );
}
