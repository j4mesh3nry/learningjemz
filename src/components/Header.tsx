import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Gem, Flame, Star } from 'lucide-react';
import '../index.css';

export function Header() {
  const { xp, level, streak, hasPlayedToday } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();

  const xpInLevel = xp - (level - 1) * 100;
  const pct = Math.min(xpInLevel, 100);

  const displayName = user?.user_metadata?.name || 'Learner';
  const avatarEmoji = user?.user_metadata?.avatar || '👤';

  return (
    <div style={{ 
      position: 'sticky', top: 0, zIndex: 100, background: '#ffffff',
      paddingTop: 24, paddingBottom: 18, margin: '-24px -16px 20px -16px', paddingLeft: 16, paddingRight: 16,
      borderBottom: '1px solid #eaeaea',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}>
      {/* Top row: Title, User Pill, and Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        {/* Logo & User Identity Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              background: 'linear-gradient(135deg, #1c7c54, #4caf50)',
              borderRadius: '9px',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(76, 175, 80, 0.25)'
            }}>
              <Gem size={19} color="#ffffff" strokeWidth={2.5} />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: '#1a202c',
              margin: 0,
              whiteSpace: 'nowrap'
            }}>
              Learning<span style={{ color: '#1c7c54' }}>Jemz</span>
            </h1>
          </div>

          {/* User Profile Identity Pill */}
          <div 
            onClick={() => navigate('/profile')} 
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f8f9fa', padding: '3px 8px 3px 3px', borderRadius: 20,
              border: '1px solid #e9ecef', cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease',
              flexShrink: 1, minWidth: 0
            }}
            aria-label="Go to Profile"
            role="button"
            title="Go to Profile"
          >
            <div style={{
              fontSize: '1.1rem', width: 26, height: 26, borderRadius: '50%',
              background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1.5px 4px rgba(0,0,0,0.1)', border: '1.5px solid #4caf50',
              flexShrink: 0
            }}>
              {avatarEmoji}
            </div>
            <span style={{
              fontWeight: 700, fontSize: '0.78rem', color: '#333',
              maxWidth: 75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {displayName}
            </span>
          </div>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 3,
          background: '#fafafa', padding: '5px 9px', borderRadius: 12,
          border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          minWidth: 76, boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <Flame 
              size={13} 
              color={hasPlayedToday ? '#ff4d4d' : '#888888'} 
              fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} 
            />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: hasPlayedToday ? '#e53935' : '#444444' }}>
              {streak ?? 0}
            </span>
          </div>
          <div style={{ height: 1, background: '#eee', margin: '1px 0' }} />
          <div 
            onClick={() => navigate('/profile')} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, cursor: 'pointer' }}
            aria-label="Go to Profile" 
            role="button"
          >
            <Star size={13} color="#f57f17" fill="#ffb300" />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#f57f17' }}>Lv.{level}</span>
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
