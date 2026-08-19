import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, getLevelProgress } from '../contexts/GameContext.jsx';
import { Gem, Flame, Star } from 'lucide-react';
import '../index.css';

export function Header() {
  const { xp, level, streak, hasPlayedToday } = useGame();
  const { xpInLevel, levelXPReq, pct } = getLevelProgress(xp || 0);
  const navigate = useNavigate();

  const rankTitle = level >= 30 ? 'Master' : level >= 10 ? 'Scholar' : level >= 5 ? 'Explorer' : 'Learner';

  return (
    <div className="app-header">
      {/* Compact Top Header Row */}
      <div className="app-header-row">
        {/* Logo Area */}
        <div
          className="app-header-logo-group"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
          role="button"
          aria-label="Home"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/'); }}
        >
          <div className="app-header-gem-badge">
            <Gem size={18} color="#ffffff" strokeWidth={2.5} />
          </div>
          <h1 className="app-header-title">
            Learning<span className="app-header-title-accent">Jemz</span>
          </h1>
        </div>

        {/* Level & Streak Capsule Pill */}
        <div className="app-header-pill">
          <div
            className="app-header-pill-item"
            onClick={() => navigate('/profile')}
            role="button"
            aria-label="Day Streak"
            style={{ cursor: 'pointer' }}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
          >
            <Flame
              size={16}
              color={hasPlayedToday ? '#ff5a5a' : '#888888'}
              fill={hasPlayedToday ? '#ff5a5a' : '#bbbbbb'}
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
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
          >
            <Star size={16} color="#f59e0b" fill="#fbbf24" />
            <div className="app-header-pill-text">
              <span className="app-header-level-num">Lv.{level}</span>
              <span className="app-header-pill-sub">{rankTitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress Bar Row */}
      <div className="app-header-xp-container">
        <div className="app-header-xp-labels">
          <span className="app-header-xp-current">{xpInLevel} / {levelXPReq} XP</span>
          <span className="app-header-xp-next">Next: Lv.{level + 1}</span>
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
