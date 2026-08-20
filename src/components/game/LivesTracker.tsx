import React from 'react';
import { Heart } from 'lucide-react';

export interface LivesTrackerProps {
  lives: number;
  maxLives?: number;
  size?: number;
  activeColor?: string;
  lostColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Universal Lives Tracker Component.
 * Displays stroke-based Heart icons for survival modes and challenges.
 */
export function LivesTracker({
  lives,
  maxLives = 3,
  size = 20,
  activeColor = '#ef4444',
  lostColor = '#374151',
  className = '',
  style = {},
}: LivesTrackerProps) {
  const currentLives = Math.max(0, Math.min(lives, maxLives));

  return (
    <div
      className={`game-lives-tracker ${className}`.trim()}
      role="status"
      aria-label={`${currentLives} of ${maxLives} lives remaining`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 20,
        background: '#091c13',
        border: '1.5px solid #133927',
        ...style,
      }}
    >
      {Array.from({ length: maxLives }, (_, i) => {
        const isAlive = i < currentLives;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              transform: isAlive ? 'scale(1)' : 'scale(0.85)',
              opacity: isAlive ? 1 : 0.45,
            }}
          >
            <Heart
              size={size}
              color={isAlive ? activeColor : lostColor}
              fill={isAlive ? activeColor : 'none'}
              strokeWidth={2.2}
            />
          </div>
        );
      })}
    </div>
  );
}

export default LivesTracker;
