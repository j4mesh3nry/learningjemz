import React from 'react';
import { Diamond } from 'lucide-react';
import './victory.css';

export default function VictoryScreen({ 
  isOpen, 
  title = "Victory!", 
  xpGained, 
  streak, 
  igniting, 
  hasPlayedToday,
  onContinue,
  children
}) {
  if (!isOpen) return null;

  return (
    <div className="victory-overlay">
      <div className="victory-modal">
        <h2 className="victory-title">{title}</h2>
        
        <div className="gem-forge-container">
          <div className="gem-glow"></div>
          <Diamond className="gem-icon" />
        </div>

        <div className="victory-stats">
          {/* Day Streak Card - Animates in second */}
          <div className={`victory-stat-card ${igniting ? 'igniting' : ''}`} style={{ animationDelay: '0.2s' }}>
            <div className={`stat-icon ${!hasPlayedToday && !igniting ? 'unlit-icon' : ''}`}>
              🔥
            </div>
            <div className={`stat-value ${!hasPlayedToday && !igniting ? 'unlit-text' : ''}`}>
              {streak}
            </div>
            <div className="stat-label">Day Streak</div>
          </div>

          {/* XP Card - Animates in first */}
          <div className="victory-stat-card" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon">🏆</div>
            <div className="stat-value">+{xpGained}</div>
            <div className="stat-label">Total XP</div>
          </div>
        </div>
        
        {children && <div style={{ width: '100%', marginBottom: 24, textAlign: 'center', color: '#ccc', fontSize: '0.9rem' }}>{children}</div>}

        <button className="victory-continue-btn" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
