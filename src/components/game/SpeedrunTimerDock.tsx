import React from 'react';
import { Clock } from 'lucide-react';

export interface SpeedrunTimerDockProps {
  elapsedSeconds: number;
  isRunning?: boolean;
  penaltySeconds?: number | null;
  targetSeconds?: number;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds * 10) % 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
}

/**
 * Reusable Speedrun Timer Dock Component.
 * Displays clean formatted time, countdown/elapsed progress, and animated blunder penalty flashes.
 */
export function SpeedrunTimerDock({
  elapsedSeconds,
  isRunning = true,
  penaltySeconds = null,
  targetSeconds,
  label = 'TIME',
  className = '',
  style = {},
}: SpeedrunTimerDockProps) {
  const isPaceGood = targetSeconds ? elapsedSeconds <= targetSeconds : true;

  return (
    <div
      className={`game-speedrun-timer-dock ${className}`.trim()}
      role="timer"
      aria-label={`${label}: ${elapsedSeconds.toFixed(1)} seconds`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 20,
        background: '#091c13',
        border: '1.5px solid #133927',
        color: '#e2f5ec',
        position: 'relative',
        ...style,
      }}
    >
      <Clock
        size={18}
        color={isPaceGood ? '#34d399' : '#fbbf24'}
        style={{
          animation: isRunning ? 'spin 12s linear infinite' : 'none',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span
          style={{
            fontSize: '0.62rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: '#6ee7b7',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
            fontSize: '1rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.03em',
            lineHeight: 1.2,
          }}
        >
          {formatTime(elapsedSeconds)}
        </span>
      </div>

      {penaltySeconds !== null && penaltySeconds > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -10,
            right: -6,
            background: '#ef4444',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: 900,
            padding: '2px 6px',
            borderRadius: 10,
            border: '1.5px solid #ffffff',
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
            animation: 'bounce 0.3s ease-out',
          }}
        >
          +{penaltySeconds}s
        </span>
      )}
    </div>
  );
}

export default SpeedrunTimerDock;
