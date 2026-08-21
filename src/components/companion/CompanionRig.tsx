// src/components/companion/CompanionRig.tsx
import React from 'react';
import { getCompanion, type CompanionConfig } from '../../data/companions';
import { useCompanionBehavior } from './useCompanionBehavior';
import { OwlSpriteLayers } from './sprites/OwlSpriteLayers';
import { BotSpriteLayers } from './sprites/BotSpriteLayers';
import { FoxSpriteLayers } from './sprites/FoxSpriteLayers';
import './companion-rig.css';

export interface CompanionRigProps {
  avatar?: string | null;
  characterType?: string;
  className?: string;
  style?: React.CSSProperties;
  enableDrowse?: boolean;
  scale?: number;
  onTap?: () => void;
}

export function CompanionRig({
  avatar,
  characterType = 'owl',
  className = '',
  style = {},
  enableDrowse = true,
  scale = 1.0,
  onTap,
}: CompanionRigProps) {
  const companion: CompanionConfig = getCompanion(avatar || characterType);

  const {
    behavior,
    isBlinking,
    lookDirection,
    isFlourishing,
    isTapped,
    isDrowsing,
    sparkles,
    triggerTap,
  } = useCompanionBehavior({
    companionId: companion.id,
    ambientColor: companion.ambientColor,
    enableDrowse,
  });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    triggerTap(clickX, clickY);
    onTap?.();
  };

  // State class mapping
  const stateClass =
    isTapped
      ? 'state-tap-happy'
      : isDrowsing
      ? 'state-drowse'
      : isFlourishing
      ? 'state-flourish'
      : lookDirection === 'left'
      ? 'state-look-left'
      : lookDirection === 'right'
      ? 'state-look-right'
      : lookDirection === 'up'
      ? 'state-look-up'
      : 'state-idle';

  return (
    <div
      className={`companion-rig-root ${stateClass} ${className}`.trim()}
      style={{
        ...style,
        transform: `scale(${scale * companion.scale}) translate(${companion.anchorOffset.x}px, ${companion.anchorOffset.y}px)`,
        '--ambient-color': companion.ambientColor,
      } as React.CSSProperties}
      onClick={handleClick}
      role="img"
      aria-label={`${companion.name} the ${companion.species} (${behavior})`}
      title={`${companion.name} (${companion.species}) - Tap to interact`}
    >
      <div className="bone-rig-wrapper">
        {/* Render Anatomically Layered Articulated Sprite Rig */}
        {companion.id === 'bot' || companion.id === 'robot' ? (
          <BotSpriteLayers
            isBlinking={isBlinking}
            lookDirection={lookDirection}
            ambientColor={companion.ambientColor}
          />
        ) : companion.id === 'fox' ? (
          <FoxSpriteLayers
            isBlinking={isBlinking}
            lookDirection={lookDirection}
            ambientColor={companion.ambientColor}
          />
        ) : (
          <OwlSpriteLayers
            isBlinking={isBlinking}
            lookDirection={lookDirection}
            ambientColor={companion.ambientColor}
          />
        )}

        {/* ── Interactive Tap Ember Particles ── */}
        {sparkles.map((sp) => (
          <span
            key={sp.id}
            className="companion-sparkle-particle"
            style={{
              left: sp.x,
              top: sp.y,
              width: sp.size,
              height: sp.size,
              backgroundColor: sp.color,
              boxShadow: `0 0 6px ${sp.color}`,
              '--sp-vx': (sp.x - 50) * 1.2,
              '--sp-vy': -24 - Math.random() * 16,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

export default CompanionRig;
