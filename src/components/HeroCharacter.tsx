// src/components/HeroCharacter.tsx
import React from 'react';
import { LivingPuppet } from './companion/LivingPuppet';

interface HeroCharacterProps {
  avatar?: string | null;
  className?: string;
  style?: React.CSSProperties;
  scale?: number;
  onTap?: () => void;
}

/**
 * HeroCharacter Slot on the Scenic Home Cliff Ledge.
 * Mounts the player's active Articulated Living Companion (Archimedes, Aura, Nexus)
 * with autonomous living gaze, blinking eyelids, articulated waving arms/wings,
 * happy tap reactions, and true cliff grounding.
 */
export function HeroCharacter({
  avatar,
  className = '',
  style = {},
  scale = 1.0,
  onTap,
}: HeroCharacterProps) {
  return (
    <div
      className={`hero-companion-slot ${className}`.trim()}
      style={style}
    >
      <LivingPuppet
        avatar={avatar}
        scale={scale}
        onTap={onTap}
      />
    </div>
  );
}

export default HeroCharacter;
