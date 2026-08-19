import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';

export interface GameModuleCardProps {
  title: string;
  subtitle: string;
  badgeIcon: React.ReactNode;
  bgImage?: string;
  theme?: 'chess' | 'space' | 'custom';
  borderColor?: string;
  backgroundColor?: string;
  badgeBg?: string;
  badgeBorder?: string;
  btnBg?: string;
  btnBorder?: string;
  locked?: boolean;
  lockedBadgeText?: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * Reusable Game Module / Mission Card.
 * Used on Home, Space Missions, Chess Modes, and Play with Bot screens.
 */
export function GameModuleCard({
  title,
  subtitle,
  badgeIcon,
  bgImage,
  theme = 'custom',
  borderColor,
  backgroundColor,
  badgeBg,
  badgeBorder,
  btnBg,
  btnBorder,
  locked = false,
  lockedBadgeText = 'Locked',
  onClick,
  ariaLabel,
  className = '',
}: GameModuleCardProps) {
  const isChess = theme === 'chess';
  const isSpace = theme === 'space';

  const cardClassName = [
    'home-module-card',
    isChess ? 'home-module-card-chess' : '',
    isSpace ? 'home-module-card-space' : '',
    locked ? 'home-module-card-locked' : '',
    className,
  ].filter(Boolean).join(' ');

  const customStyle: React.CSSProperties = {};
  if (bgImage) customStyle.backgroundImage = `url('${bgImage}')`;
  if (backgroundColor) customStyle.backgroundColor = backgroundColor;
  if (borderColor) customStyle.borderColor = borderColor;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (locked) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={cardClassName}
      style={customStyle}
      onClick={locked ? undefined : onClick}
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-label={ariaLabel || title}
      aria-disabled={locked}
      onKeyDown={handleKeyDown}
    >
      {/* Overlay gradient */}
      <div
        className={isChess ? 'home-module-card-overlay-chess' : isSpace ? 'home-module-card-overlay-space' : 'home-module-card-overlay-custom'}
      />

      {/* Locked badge if applicable */}
      {locked && (
        <div className="home-locked-badge">
          <Lock size={12} strokeWidth={2.5} color="#34d399" /> {lockedBadgeText}
        </div>
      )}

      {/* Card information content */}
      <div className="home-module-card-info" style={{ opacity: locked ? 0.35 : 1 }}>
        <div className="home-module-card-header">
          <div
            className={isChess ? 'home-module-mini-badge-chess' : isSpace ? 'home-module-mini-badge-space' : 'home-module-mini-badge-custom'}
            style={{
              backgroundColor: badgeBg,
              borderColor: badgeBorder,
            }}
          >
            {badgeIcon}
          </div>
          <h3 className="home-module-card-title">{title}</h3>
        </div>
        <p className="home-module-card-subtitle">{subtitle}</p>
      </div>

      {/* Action Button */}
      {!locked && (
        <div
          className={isChess ? 'home-module-action-btn-chess' : isSpace ? 'home-module-action-btn-space' : 'home-module-action-btn-custom'}
          style={{
            backgroundColor: btnBg,
            borderColor: btnBorder,
          }}
        >
          <ArrowRight size={18} strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}

export default GameModuleCard;
