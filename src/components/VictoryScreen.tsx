// src/components/VictoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Sparkles, Gem, Star } from 'lucide-react';
import StreakScreen, { hasShownStreakToday } from './StreakScreen';
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
  disableDailyStreakModal?: boolean;
}

export default function VictoryScreen({
  isOpen,
  title = "Victory!",
  subtitle,
  xpGained = 0,
  streak = 0,
  hasPlayedToday = true,
  igniting = false,
  streakIncreased = false,
  onContinue,
  onPlayAgain,
  continueText = "Continue",
  children,
  disableDailyStreakModal = false,
}: VictoryScreenProps) {
  const [showingStreakModal, setShowingStreakModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger daily streak solo screen only once a day when streak is active/increased or first visit of day
      const shouldTrigger = !disableDailyStreakModal && streak > 0 && !hasShownStreakToday();
      if (shouldTrigger && (streakIncreased || igniting || !hasPlayedToday)) {
        setShowingStreakModal(true);
      } else {
        setShowingStreakModal(false);
      }
    } else {
      setShowingStreakModal(false);
    }
  }, [isOpen, streak, disableDailyStreakModal, streakIncreased, igniting, hasPlayedToday]);

  if (!isOpen) return null;

  // Render Duolingo-style streak screen first if triggered today
  if (showingStreakModal) {
    return (
      <StreakScreen
        isOpen={true}
        streak={streak || 1}
        onContinue={() => setShowingStreakModal(false)}
      />
    );
  }

  return (
    <div className="victory-overlay" role="dialog" aria-modal="true" aria-label={title}>
      {/* Decorative Victory Confetti Particles */}
      <div className="victory-confetti">
        <span className="confetti c1">✨</span>
        <span className="confetti c2">⭐</span>
        <span className="confetti c3">🎉</span>
        <span className="confetti c4">✨</span>
        <span className="confetti c5">💎</span>
      </div>

      <div className="victory-modal-clean">
        {/* Top LearningJemz Logo Icon Container with Glow */}
        <div className="victory-icon-container">
          <div className="victory-aura-glow" />
          <div className="victory-logo-bg">
            <Gem size={34} color="#ffffff" strokeWidth={2.5} />
          </div>
          <Sparkles className="sparkles-badge" size={24} color="#ffd600" />
          <Star className="star-badge-left" size={18} color="#00e5ff" fill="#00e5ff" />
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
                size={26}
                color={hasPlayedToday ? '#ff3d00' : '#888888'}
                fill={hasPlayedToday ? '#ff6d00' : '#bbbbbb'}
                className={hasPlayedToday ? 'flame-bounce' : ''}
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
              <Trophy size={26} color="#f57f17" fill="#ffb300" className="trophy-bounce" />
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
