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
      background: 'linear-gradient(180deg, #072215 0%, #0a2e1d 100%)',
      paddingTop: 24, paddingBottom: 18,
      margin: '-24px -16px 20px -16px',
      paddingLeft: 20, paddingRight: 20,
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    }}>
      {/* Top row: Title and Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        {/* Logo Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1c7c54, #38d989)',
            borderRadius: '12px',
            padding: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(56, 217, 137, 0.3)'
          }}>
            <Gem size={22} color="#ffffff" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.65rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: '#ffffff',
            margin: 0,
          }}>
            Learning<span style={{ color: '#38d989' }}>Jemz</span>
          </h1>
        </div>

        {/* Level & Streak Pill Badge */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 4,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          padding: '6px 12px', borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: 80, boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <Flame 
              size={14} 
              color={hasPlayedToday ? '#ff5252' : 'rgba(255,255,255,0.4)'} 
              fill={hasPlayedToday ? '#ff5252' : 'rgba(255,255,255,0.2)'} 
            />
            <span style={{ fontWeight: 800, fontSize: '0.8rem', color: hasPlayedToday ? '#ff6b6b' : 'rgba(255,255,255,0.6)' }}>
              {streak ?? 0}
            </span>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '1px 0' }} />
          <div 
            onClick={() => navigate('/profile')} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, cursor: 'pointer' }}
            aria-label="Go to Profile" 
            role="button"
          >
            <Star size={14} color="#ffc107" fill="#ffc107" />
            <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#ffca28' }}>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* XP Mini Bar */}
      <div>
        <div style={{
          height: 7, borderRadius: 4, background: 'rgba(255, 255, 255, 0.12)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 4, width: `${pct}%`,
            background: 'linear-gradient(90deg, #1c7c54, #38d989)',
            boxShadow: '0 0 8px rgba(56, 217, 137, 0.4)',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: 6, fontWeight: 500 }}>
          {xpInLevel}/100 XP to Level {level + 1}
        </div>
      </div>
    </div>
  );
}
