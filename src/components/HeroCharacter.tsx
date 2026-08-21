// src/components/HeroCharacter.tsx
import React, { useState, useEffect, useRef } from 'react';
import { getCompanion } from '../data/companions';

interface HeroCharacterProps {
  avatar?: string | null;
  characterType?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

/**
 * 32-Bit Pixel Art Hero Companion Rig.
 * Renders Archimedes the Sage Owl perched on a mossy rune pillar on the cliff ledge with:
 * - Subtle pixel breathing idle movement
 * - Occasional curious head/feather micro-tilt
 * - Synchronized stone contact shadow
 * - Interactive tap spring bounce & pixel sparkle motes
 */
export function HeroCharacter({
  avatar,
  characterType = 'owl',
  className = '',
  style = {},
}: HeroCharacterProps) {
  const companion = getCompanion(avatar || characterType);
  const [isTilting, setIsTilting] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);
  const sparkleIdCounter = useRef(0);

  // ── 1. Subtle Micro-Tilt Engine (Natural Idle Movement) ──
  useEffect(() => {
    let tiltInterval: ReturnType<typeof setTimeout>;
    let returnTimeout: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const scheduleNextTilt = () => {
      const nextDelay = 7000 + Math.random() * 5000;
      tiltInterval = setTimeout(() => {
        if (!isMounted) return;
        setIsTilting(true);

        returnTimeout = setTimeout(() => {
          if (!isMounted) return;
          setIsTilting(false);
          scheduleNextTilt();
        }, 2200);
      }, nextDelay);
    };

    scheduleNextTilt();

    return () => {
      isMounted = false;
      clearTimeout(tiltInterval);
      clearTimeout(returnTimeout);
    };
  }, [companion.id]);

  // ── 2. Interactive Tap Reactions ──
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 550);

    // Spawn playful magical pixel spark motes
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const newSparkles: SparkleParticle[] = Array.from({ length: 5 }, () => ({
      id: ++sparkleIdCounter.current,
      x: clickX + (Math.random() - 0.5) * 36,
      y: clickY + (Math.random() - 0.5) * 28,
      size: 4,
      color: Math.random() > 0.4 ? companion.ambientColor : '#fbbf24',
    }));

    setSparkles((prev) => [...prev, ...newSparkles]);

    // Clean up sparkles after animation
    setTimeout(() => {
      setSparkles((prev) => prev.filter((p) => !newSparkles.some((ns) => ns.id === p.id)));
    }, 700);
  };

  return (
    <div
      className={`hero-companion-wrapper ${isBouncing ? 'tap-bounce' : ''} ${isTilting ? 'micro-tilt' : ''} ${className}`.trim()}
      style={{
        ...style,
        transform: `scale(${companion.scale}) translate(${companion.anchorOffset.x}px, ${companion.anchorOffset.y}px)`,
      }}
      onClick={handleTap}
      role="img"
      aria-label={`${companion.name}, ${companion.title}`}
      title={`${companion.name} (Tap to interact)`}
    >
      {/* Stone Cliff Contact Shadow under the Pillar */}
      <div className="hero-companion-shadow" />

      {/* 32-Bit Pixel Character Figure */}
      <div className="hero-companion-figure">
        <div className="hero-companion-body">
          <img
            src={companion.bodySrc}
            alt={companion.name}
            className="hero-companion-img hero-pixel-sprite"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/characters/owl-pixel.png';
            }}
          />
        </div>

        {/* Interactive Tap Pixel Sparkles */}
        {sparkles.map((sp) => (
          <span
            key={sp.id}
            className="companion-tap-sparkle pixel-sparkle"
            style={{
              left: sp.x,
              top: sp.y,
              width: sp.size,
              height: sp.size,
              backgroundColor: sp.color,
              boxShadow: `0 0 6px ${sp.color}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroCharacter;
