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
      background: 'linear-gradient(180deg, #051b10 0%, #092618 100%)',
      paddingTop: 12, paddingBottom: 10,
      margin: '-24px -16px 14px -16px',
      paddingLeft: 16, paddingRight: 16,
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
    }}>
      {/* Compact Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        {/* Logo Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1c7c54, #38d989)',
            borderRadius: '9px',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(56, 217, 137, 0.3)'
          }}>
            <Gem size={18} color="#ffffff" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.35rem',
            fontWeight: 800,
            letterSpacing: '-0.3px',
            color: '#ffffff',
            margin: 0,
          }}>
            Learning<span style={{ color: '#38d989' }}>Jemz</span>
          </h1>
        </div>

        {/* Level & Streak Compact Pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255, 255, 255, 0.07)',
          backdropFilter: 'blur(8px)',
          padding: '4px 10px', borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Flame 
              size={13} 
              color={hasPlayedToday ? '#ff5252' : 'rgba(255,255,255,0.4)'} 
              fill={hasPlayedToday ? '#ff5252' : 'rgba(255,255,255,0.2)'} 
            />
            <span style={{ fontWeight: 800, fontSize: '0.78rem', color: hasPlayedToday ? '#ff6b6b' : 'rgba(255,255,255,0.6)' }}>
              {streak ?? 0}
            </span>
          </div>

          <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.15)' }} />

          <div 
            onClick={() => navigate('/profile')} 
            style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
            aria-label="Go to Profile" 
            role="button"
          >
            <Star size={13} color="#ffc107" fill="#ffc107" />
            <span style={{ fontWeight: 800, fontSize: '0.78rem', color: '#ffca28' }}>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* Ultra-Slim XP Progress Bar */}
      <div>
        <div style={{
          height: 4, borderRadius: 2, background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 2, width: `${pct}%`,
            background: 'linear-gradient(90deg, #1c7c54, #38d989)',
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: 3, fontWeight: 500 }}>
          <span>{xpInLevel}/100 XP</span>
          <span>Next: Lv.{level + 1}</span>
        </div>
      </div>
    </div>
  );
}
