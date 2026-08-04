// src/components/VictoryScreen.tsx
import React from 'react';
import Gemstone from './Gemstone';
import './victory.css';

interface VictoryScreenProps {
  isOpen: boolean;
  title?: string;
  xpGained: number;
  streak: number;
  igniting: boolean;
  streakIncreased: boolean;
  onContinue: () => void;
  children?: React.ReactNode;
}

export default function VictoryScreen({
  isOpen,
  title = "Victory!",
  xpGained,
  streak,
  igniting,
  streakIncreased,
  onContinue,
  children,
}: VictoryScreenProps) {
  if (!isOpen) return null;

  const isPale = streakIncreased && !igniting;

  return (
    <div className="victory-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="victory-modal">
        <h2 className="victory-title" tabIndex={-1}>{title}</h2>
        <div className="gem-forge-container">
          <div className="gem-glow" />
          <Gemstone className="gem-icon" />
        </div>
        <div className="victory-stats">
          {/* Day Streak Card */}
          <div
            className={`victory-stat-card ${igniting ? 'igniting' : ''}`}
            style={{ animationDelay: '0.2s', position: 'relative' }}
          >
            <div className={`stat-icon ${isPale ? 'unlit-icon' : ''}`}>🔥</div>
            <div className={`stat-value ${isPale ? 'unlit-text' : ''}`}>{streak}</div>
            <div className="stat-label">Day Streak</div>
            {igniting && streakIncreased && (
              <div className="streak-plus-one">+1</div>
            )}
          </div>
          {/* XP Card */}
          <div className="victory-stat-card" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon">🏆</div>
            <div className="stat-value">+{xpGained}</div>
            <div className="stat-label">Total XP</div>
          </div>
        </div>
        {children && (
          <div style={{ width: '100%', marginBottom: 24, textAlign: 'center', color: '#ccc', fontSize: '0.9rem' }}>
            {children}
          </div>
        )}
        <button className="victory-continue-btn" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
