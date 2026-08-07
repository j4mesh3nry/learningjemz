// src/components/VictoryScreen.tsx
import React from 'react';
import { Flame, Trophy, Sparkles } from 'lucide-react';
import Gemstone from './Gemstone';
import './victory.css';

export interface VictoryScreenProps {
  isOpen: boolean;
  title?: string;
  subtitle?: React.ReactNode;
  xpGained?: number;
  streak?: number;
  hasPlayedToday?: boolean;
  igniting?: boolean;
  streakIncreased?: boolean;
  onContinue: () => void;
  onPlayAgain?: () => void;
  continueText?: string;
  children?: React.ReactNode;
}

export default function VictoryScreen({
  isOpen,
  title = "Victory!",
  subtitle,
  xpGained = 0,
  streak = 0,
  hasPlayedToday = true,
  onContinue,
  onPlayAgain,
  continueText = "Continue",
  children,
}: VictoryScreenProps) {
  if (!isOpen) return null;

  return (
    <div className="victory-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="victory-modal-clean">
        {/* Top Gem / Icon Container */}
        <div className="victory-icon-container">
          <div className="victory-icon-bg">
            <Gemstone className="victory-gem-svg" />
          </div>
          <Sparkles className="sparkles-badge" size={22} color="#ffb300" />
        </div>

        {/* Title & Subtitle */}
        <h2 className="victory-clean-title">{title}</h2>
        {subtitle && <div className="victory-clean-subtitle">{subtitle}</div>}
        {children && <div className="victory-clean-children">{children}</div>}

        {/* Rewards Row (Streak & XP) */}
        <div className="victory-clean-rewards">
          {/* Day Streak Box */}
          <div className={`reward-box streak-box ${hasPlayedToday ? 'active-streak' : 'unlit-streak'}`}>
            <div className="reward-icon-wrap">
              <Flame
                size={24}
                color={hasPlayedToday ? '#ff4d4d' : '#888888'}
                fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'}
              />
            </div>
            <div className="reward-text-wrap">
              <span className="reward-val">{streak}</span>
              <span className="reward-lbl">Day Streak</span>
            </div>
          </div>

          {/* XP Box */}
          <div className="reward-box xp-box">
            <div className="reward-icon-wrap xp-icon-wrap">
              <Trophy size={24} color="#f57f17" fill="#ffb300" />
            </div>
            <div className="reward-text-wrap">
              <span className="reward-val">+{xpGained}</span>
              <span className="reward-lbl">Total XP</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="victory-clean-actions">
          <button className="victory-btn-primary" onClick={onContinue}>
            {continueText}
          </button>
          {onPlayAgain && (
            <button className="victory-btn-secondary" onClick={onPlayAgain}>
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
