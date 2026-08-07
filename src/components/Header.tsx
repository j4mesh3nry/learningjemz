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
      position: 'sticky', top: 0, zIndex: 100,
      background: '#d4e8d5',
      paddingTop: 12, paddingBottom: 10,
      margin: '-24px -16px 14px -16px',
      paddingLeft: 16, paddingRight: 16,
      borderBottom: '2px solid #b0cbaf',
    }}>
      {/* Compact Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        {/* Logo Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: '#16653e',
            borderRadius: '9px',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 0 #0e4329'
          }}>
            <Gem size={18} color="#ffffff" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.35rem',
            fontWeight: 800,
            letterSpacing: '-0.3px',
            color: '#0f3825',
            margin: 0,
          }}>
            Learning<span style={{ color: '#16653e' }}>Jemz</span>
          </h1>
        </div>

        {/* Level & Streak Compact Pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#ffffff',
          padding: '4px 10px', borderRadius: 20,
          border: '2px solid #b0cbaf',
          boxShadow: '0 2px 0 #b0cbaf',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Flame 
              size={13} 
              color={hasPlayedToday ? '#e53935' : '#888888'} 
              fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} 
            />
            <span style={{ fontWeight: 800, fontSize: '0.78rem', color: hasPlayedToday ? '#e53935' : '#4e7361' }}>
              {streak ?? 0}
            </span>
          </div>

          <div style={{ width: 1, height: 12, background: '#b0cbaf' }} />

          <div 
            onClick={() => navigate('/profile')} 
            style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
            aria-label="Go to Profile" 
            role="button"
          >
            <Star size={13} color="#f57f17" fill="#ffb300" />
            <span style={{ fontWeight: 800, fontSize: '0.78rem', color: '#d97706' }}>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div>
        <div style={{
          height: 6, borderRadius: 3, background: '#b8d9ba', overflow: 'hidden',
          border: '1px solid #a3caa5'
        }}>
          <div style={{
            height: '100%', borderRadius: 3, width: `${pct}%`,
            background: '#16653e',
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#0f3825', marginTop: 3, fontWeight: 700 }}>
          <span>{xpInLevel}/100 XP</span>
          <span>Next: Lv.{level + 1}</span>
        </div>
      </div>
    </div>
  );
}
