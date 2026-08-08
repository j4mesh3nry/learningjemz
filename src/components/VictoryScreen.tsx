// src/components/VictoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Sparkles, Gem } from 'lucide-react';
import StreakScreen, { hasShownStreakToday } from './StreakScreen';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import './victory.css';

export interface VictoryScreenProps {
  isOpen: boolean;
  title?: string;
  subtitle?: React.ReactNode;
  xpGained?: number;
  streak?: number;
  previousStreak?: number;
  hasPlayedToday?: boolean;
  theme?: 'default' | 'space' | 'chess' | 'geo' | 'reading' | 'dark';
  onContinue: () => void;
  onPlayAgain?: () => void;
  continueText?: string;
  children?: React.ReactNode;
  disableDailyStreakModal?: boolean;
}

export default function VictoryScreen({
  isOpen,
  title = "Victory!",
  subtitle,
  xpGained = 0,
  streak: propStreak,
  previousStreak: propPreviousStreak,
  hasPlayedToday: propHasPlayedToday,
  theme = 'default',
  onContinue,
  onPlayAgain,
  continueText = "Continue",
  children,
  disableDailyStreakModal = false,
}: VictoryScreenProps) {
  const { user } = useAuth();
  const gameContext = useGame();
  const userId = user?.id;

  const activeStreak = propStreak !== undefined && propStreak > 0 
    ? propStreak 
    : (gameContext?.streak || 1);

  const activePreviousStreak = propPreviousStreak !== undefined 
    ? propPreviousStreak 
    : (gameContext?.previousStreak !== undefined 
      ? gameContext.previousStreak 
      : Math.max(0, activeStreak - 1));

  const activeHasPlayedToday = propHasPlayedToday !== undefined 
    ? propHasPlayedToday 
    : (gameContext?.hasPlayedToday ?? true);

  const [showingStreakModal, setShowingStreakModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger daily streak solo screen only once a day per account
      const shouldTrigger = !disableDailyStreakModal && activeStreak > 0 && !hasShownStreakToday(userId);
      if (shouldTrigger) {
        setShowingStreakModal(true);
      } else {
        setShowingStreakModal(false);
      }
    } else {
      setShowingStreakModal(false);
    }
  }, [isOpen, activeStreak, disableDailyStreakModal, userId]);

  if (!isOpen) return null;

  // First game of the day: render Duolingo orange solo screen first
  if (showingStreakModal) {
    return (
      <StreakScreen
        isOpen={true}
        streak={activeStreak}
        previousStreak={activePreviousStreak}
        userId={userId}
        onContinue={() => setShowingStreakModal(false)}
      />
    );
  }

  const themeClass = `theme-${theme}`;

  return (
    <div className={`victory-overlay ${themeClass}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`victory-modal-clean ${themeClass}`}>
        {/* Top LearningJemz Logo Icon Container */}
        <div className="victory-icon-container">
          <div className="victory-logo-bg">
            <Gem size={34} color="#ffffff" strokeWidth={2.5} />
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
          <div className={`reward-box streak-box ${activeHasPlayedToday ? 'active-streak' : 'unlit-streak'}`}>
            <div className="reward-icon-wrap flame-bounce">
              <Flame
                size={24}
                color={activeHasPlayedToday ? '#ff4d4d' : '#888888'}
                fill={activeHasPlayedToday ? '#ff4d4d' : '#bbbbbb'}
              />
            </div>
            <div className="reward-text-wrap">
              <span className="reward-val">{activeStreak}</span>
              <span className="reward-lbl">Day Streak</span>
            </div>
          </div>

          {/* XP Box */}
          <div className="reward-box xp-box">
            <div className="reward-icon-wrap xp-icon-wrap trophy-bounce">
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
