import React from 'react';
import Gemstone from './Gemstone';
import './victory.css';

export default function VictoryScreen({ 
  isOpen, 
  title = "Victory!", 
  xpGained, 
  streak, 
  igniting, 
  streakIncreased,
  onContinue,
  children
}) {
  if (!isOpen) return null;

  // If streakIncreased is true, it starts pale and becomes ignited when `igniting` becomes true.
  // If streakIncreased is false, it is ALWAYS ignited.
  const isPale = streakIncreased && !igniting;

  return (
    <div className="victory-overlay">
      <div className="victory-modal">
        <h2 className="victory-title">{title}</h2>
        
        <div className="gem-forge-container">
          <div className="gem-glow"></div>
          <Gemstone className="gem-icon" />
        </div>

        <div className="victory-stats">
          {/* Day Streak Card - Animates in second */}
          <div className={`victory-stat-card ${igniting ? 'igniting' : ''}`} style={{ animationDelay: '0.2s', position: 'relative' }}>
            <div className={`stat-icon ${isPale ? 'unlit-icon' : ''}`}>
              🔥
            </div>
            <div className={`stat-value ${isPale ? 'unlit-text' : ''}`}>
              {streak}
            </div>
            <div className="stat-label">Day Streak</div>
            
            {igniting && streakIncreased && (
              <div className="streak-plus-one">+1</div>
            )}
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
