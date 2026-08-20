import React from 'react';
import { Trophy, Zap, Flame, RotateCcw, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

export interface GameReviewDockProps {
  title?: string;
  subtitle?: string;
  scoreText: string;
  xpEarned: number;
  streak?: number;
  isNewHighScore?: boolean;
  onPlayAgain?: () => void;
  onNext?: () => void;
  onExit: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Standardized Game Review Dock for run completions and quiz results.
 * Presents metrics, XP earned, and clear navigation actions without violating sub-page header rules.
 */
export function GameReviewDock({
  title = 'Challenge Complete!',
  subtitle,
  scoreText,
  xpEarned,
  streak,
  isNewHighScore = false,
  onPlayAgain,
  onNext,
  onExit,
  primaryActionLabel = 'Play Again',
  secondaryActionLabel = 'Back to Hub',
  className = '',
  style = {},
}: GameReviewDockProps) {
  return (
    <div
      className={`game-review-dock ${className}`.trim()}
      style={{
        background: '#05130e',
        border: '2px solid #102d1f',
        borderRadius: 24,
        padding: '24px 20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(52, 211, 153, 0.15)',
        color: '#e2f5ec',
        textAlign: 'center',
        maxWidth: 440,
        margin: '0 auto',
        ...style,
      }}
    >
      {/* Title & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
        <Trophy size={24} color="#fbbf24" />
        <h3
          style={{
            fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
            fontSize: '1.35rem',
            fontWeight: 800,
            margin: 0,
            color: '#ffffff',
          }}
        >
          {title}
        </h3>
      </div>

      {subtitle && (
        <p style={{ fontSize: '0.85rem', color: '#6ee7b7', margin: '4px 0 16px', fontWeight: 500 }}>
          {subtitle}
        </p>
      )}

      {isNewHighScore && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(135deg, #854d0e 0%, #ca8a04 100%)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: 12,
            margin: '8px 0 16px',
            border: '1px solid #fde047',
          }}
        >
          <Sparkles size={14} /> NEW RECORD!
        </div>
      )}

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: streak !== undefined ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
          gap: 10,
          margin: '16px 0 20px',
        }}
      >
        <div
          style={{
            background: '#091c13',
            border: '1.5px solid #133927',
            borderRadius: 16,
            padding: '12px 8px',
          }}
        >
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6ee7b7', textTransform: 'uppercase' }}>Score</div>
          <div
            style={{
              fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
              fontSize: '1.15rem',
              fontWeight: 900,
              color: '#ffffff',
              marginTop: 2,
            }}
          >
            {scoreText}
          </div>
        </div>

        <div
          style={{
            background: '#091c13',
            border: '1.5px solid #133927',
            borderRadius: 16,
            padding: '12px 8px',
          }}
        >
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Zap size={12} color="#fbbf24" /> XP Earned
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
              fontSize: '1.15rem',
              fontWeight: 900,
              color: '#fbbf24',
              marginTop: 2,
            }}
          >
            +{xpEarned}
          </div>
        </div>

        {streak !== undefined && (
          <div
            style={{
              background: '#091c13',
              border: '1.5px solid #133927',
              borderRadius: 16,
              padding: '12px 8px',
            }}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Flame size={12} color="#ef4444" /> Streak
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
                fontSize: '1.15rem',
                fontWeight: 900,
                color: '#fca5a5',
                marginTop: 2,
              }}
            >
              {streak}d
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {onNext && (
          <button
            onClick={onNext}
            style={{
              width: '100%',
              background: 'var(--color-primary, #16653e)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 16,
              padding: '14px',
              fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 0 #0e4329',
              cursor: 'pointer',
            }}
          >
            Continue <ArrowRight size={18} />
          </button>
        )}

        {onPlayAgain && (
          <button
            onClick={onPlayAgain}
            style={{
              width: '100%',
              background: onNext ? '#0d281c' : 'var(--color-primary, #16653e)',
              color: '#ffffff',
              border: onNext ? '1.5px solid #1b4b35' : 'none',
              borderRadius: 16,
              padding: '14px',
              fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: onNext ? 'none' : '0 4px 0 #0e4329',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={18} /> {primaryActionLabel}
          </button>
        )}

        <button
          onClick={onExit}
          style={{
            width: '100%',
            background: 'transparent',
            color: '#a7f3d0',
            border: '1.5px solid #133927',
            borderRadius: 16,
            padding: '12px',
            fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> {secondaryActionLabel}
        </button>
      </div>
    </div>
  );
}

export default GameReviewDock;
