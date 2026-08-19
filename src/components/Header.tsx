import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, getLevelProgress } from '../contexts/GameContext.jsx';
import { Gem, Flame, Star } from 'lucide-react';
import '../index.css';

export function Header() {
  const { xp, level, streak, hasPlayedToday } = useGame();
  const { xpInLevel, levelXPReq, pct } = getLevelProgress(xp || 0);
  const navigate = useNavigate();

  const rankTitle = level >= 10 ? 'Master' : level >= 5 ? 'Scholar' : 'Learner';

  return (
    <div className="app-header">
      {/* Compact Header Row */}
      <div className="app-header-row">
        {/* Logo Area */}
        <div className="app-header-logo-group" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="app-header-gem-badge">
            <Gem size={18} color="#ffffff" strokeWidth={2.5} />
          </div>
          <h1 className="app-header-title">
            Learning<span className="app-header-title-accent">Jemz</span>
          </h1>
        </div>

        {/* Level & Streak Capsule Pill */}
        <div className="app-header-pill">
          <div className="app-header-pill-item" onClick={() => navigate('/profile')} role="button" aria-label="Day Streak" style={{ cursor: 'pointer' }}>
            <Flame
              size={15}
              color={hasPlayedToday ? '#ff4d4d' : '#888888'}
              fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'}
            />
            <div className="app-header-pill-text">
              <span className={`app-header-streak-num ${hasPlayedToday ? 'active' : ''}`}>
                {streak ?? 0}
              </span>
              <span className="app-header-pill-sub">Day Streak</span>
            </div>
          </div>

          <div className="app-header-pill-divider" />

          <div
            onClick={() => navigate('/profile')}
            className="app-header-pill-item"
            aria-label="Go to Profile"
            role="button"
            style={{ cursor: 'pointer' }}
          >
            <Star size={15} color="#f59e0b" fill="#fbbf24" />
            <div className="app-header-pill-text">
              <span className="app-header-level-num">Lv.{level}</span>
              <span className="app-header-pill-sub">{rankTitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="app-header-xp-container">
        <div className="app-header-xp-labels">
          <span>{xpInLevel} / {levelXPReq} XP</span>
          <span>Next: Lv.{level + 1}</span>
        </div>
        <div className="app-header-xp-track">
          <div
            className="app-header-xp-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
export default Header;
