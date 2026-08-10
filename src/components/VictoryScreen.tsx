// src/components/VictoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Sparkles, Gem } from 'lucide-react';
import StreakScreen, { hasShownStreakToday } from './StreakScreen';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import './victory.css';

const DEFAULT_PALETTE = {
  gem: '#ffffff',
  sparkles: '#9aa3c4',
  flameActive: '#ff6d5a',
  flameInactive: '#a3a8c2',
  flameInactiveFill: '#777b94',
  trophy: '#c9a24b',
  trophyFill: '#e0bd6e',
};

const ICON_PALETTES: Record<string, typeof DEFAULT_PALETTE> = {
  default: { gem: '#ffffff', sparkles: '#ffe066', flameActive: '#ff4500', flameInactive: '#9196ab', flameInactiveFill: '#a3a8bd', trophy: '#b8860b', trophyFill: '#ffb300' },
  space:   { gem: '#e8ecf8', sparkles: '#aa5f5a', flameActive: '#e8805a', flameInactive: '#8f94b0', flameInactiveFill: '#a6aac4', trophy: '#a5923f', trophyFill: '#d3bd7a' },
  chess:   { gem: '#e8f5e9', sparkles: '#5fb88a', flameActive: '#ff4500', flameInactive: '#5fb88a', flameInactiveFill: '#7cb894', trophy: '#a5923f', trophyFill: '#d3bd7a' },
  geo:     { gem: '#ffffff', sparkles: '#ffe066', flameActive: '#ff4500', flameInactive: '#9196ab', flameInactiveFill: '#a3a8bd', trophy: '#b8860b', trophyFill: '#ffb300' },
  reading: { gem: '#ffffff', sparkles: '#ffe066', flameActive: '#ff4500', flameInactive: '#9196ab', flameInactiveFill: '#a3a8bd', trophy: '#b8860b', trophyFill: '#ffb300' },
  dark:    { gem: '#ffffff', sparkles: '#ffe066', flameActive: '#ff4500', flameInactive: '#9196ab', flameInactiveFill: '#a3a8bd', trophy: '#b8860b', trophyFill: '#ffb300' },
};

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
  continueText = "Back to Menu",
  children,
  disableDailyStreakModal = false,
}: VictoryScreenProps) {
  const { user } = useAuth();
  const gameContext = useGame();
  const userId = user?.id;

  const palette = ICON_PALETTES[theme] || DEFAULT_PALETTE;

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
  const [isMinimized, setIsMinimized] = useState(false);

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
      setIsMinimized(false);
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

  if (isMinimized) {
    return (
      <div className={`victory-minimized-dock ${themeClass}`}>
        <button className="victory-btn-restore" onClick={() => setIsMinimized(false)}>
          <span>Show Results</span>
        </button>
        {onPlayAgain && (
          <button className="victory-btn-secondary-mini" onClick={onPlayAgain}>
            Play Again
          </button>
        )}
        <button className="victory-btn-primary-mini" onClick={onContinue}>
          {continueText}
        </button>
      </div>
    );
  }

  return (
    <div className={`victory-overlay ${themeClass}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`victory-modal-clean ${themeClass}`}>
        {/* Top LearningJemz Logo Icon Container */}
        <div className="victory-icon-container">
          <div className="victory-logo-bg">
            <Gem size={34} color={palette.gem} strokeWidth={2.5} />
          </div>
          <Sparkles className="sparkles-badge" size={22} color={palette.sparkles} />
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
                size={26}
                color={activeHasPlayedToday ? palette.flameActive : palette.flameInactive}
                fill={activeHasPlayedToday ? '#ff6a00' : palette.flameInactiveFill}
                strokeWidth={1.8}
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
              <Trophy size={24} color={palette.trophy} fill={palette.trophyFill} />
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
          <button className="victory-btn-view" onClick={() => setIsMinimized(true)}>
            <span>Show Results</span>
          </button>
        </div>
      </div>
    </div>
  );
}
