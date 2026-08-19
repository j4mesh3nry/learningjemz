import React from 'react';

export interface StatTileProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  variant?: 'streak' | 'xp' | 'rank' | 'badges' | 'custom';
  valueColor?: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * Reusable Stat Tile component for Progress Matrices and Dashboard Stats.
 */
export function StatTile({
  icon,
  value,
  label,
  variant = 'custom',
  valueColor,
  onClick,
  ariaLabel,
  className = '',
}: StatTileProps) {
  const valueClass =
    variant === 'streak'
      ? 'home-stat-value-streak'
      : variant === 'xp'
      ? 'home-stat-value-xp'
      : variant === 'rank'
      ? 'home-stat-value-rank'
      : variant === 'badges'
      ? 'home-stat-value-badges'
      : '';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={`home-stat-tile ${className}`.trim()}
      onClick={onClick}
      role={onClick ? 'button' : 'group'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel || label}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      <div className="home-stat-icon-wrapper">
        {icon}
      </div>
      <div
        className={`home-stat-value ${valueClass}`.trim()}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </div>
      <div className="home-stat-label">{label}</div>
    </div>
  );
}

export default StatTile;
