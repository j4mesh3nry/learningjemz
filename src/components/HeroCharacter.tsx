// src/components/HeroCharacter.tsx
import React from 'react';
import { getCompanion } from '../data/companions';
import { CompanionRig } from './companion/CompanionRig';

interface HeroCharacterProps {
  avatar?: string | null;
  characterType?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 2-Layer Fixed Stone Pillar + Swappable Articulated Living Companion Rig.
 * - Layer 1 (Base): 1 Fixed, completely stationary stone rune pillar on the cliff with dynamic rune glow.
 * - Layer 2 (Platform): Pillar top contact shadow.
 * - Layer 3 (Mounted Creature): Articulated 32-bit pixel spirit guide with skeletal/tween animations,
 *   eye blinking, curiosity glances, special flourishes, and tap interactions.
 */
export function HeroCharacter({
  avatar,
  characterType = 'owl',
  className = '',
  style = {},
}: HeroCharacterProps) {
  const companion = getCompanion(avatar || characterType);

  return (
    <div
      className={`hero-pedestal-container ${className}`.trim()}
      style={{
        ...style,
        '--companion-ambient': companion.ambientColor,
      } as React.CSSProperties}
    >
      {/* ── Fixed Stationary Layer: Cliff Contact Base Shadow ── */}
      <div className="hero-pedestal-ground-shadow" />

      {/* ── Fixed Stationary Layer: The Ancient Stone Rune Pillar ── */}
      <div className="hero-stone-pedestal">
        <img
          src="/images/characters/stone-pedestal-pixel.png"
          alt="Ancient Stone Rune Pillar"
          className="hero-pedestal-img hero-pixel-sprite"
        />
        {/* Dynamic Rune Ambient Glow Pulse */}
        <div
          className="hero-pedestal-rune-glow"
          style={{
            boxShadow: `0 0 16px ${companion.ambientColor}44, inset 0 0 12px ${companion.ambientColor}33`,
          }}
        />
      </div>

      {/* ── Fixed Stationary Layer: Top Platform Surface Contact Shadow ── */}
      <div className="hero-pedestal-top-shadow" />

      {/* ── Living Articulated Creature Rig: Mounted on the Pillar Platform ── */}
      <div className="hero-companion-creature">
        <CompanionRig
          avatar={avatar}
          characterType={characterType}
          enableDrowse={true}
        />
      </div>
    </div>
  );
}

export default HeroCharacter;

