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
 * 2-Layer Fixed Stone Pillar + Swappable Standing Companion Rig.
 * - Layer 1 (Base): 1 Fixed, completely stationary stone rune pillar on the cliff with dynamic rune glow.
 * - Layer 2 (Platform): Pillar top contact shadow.
 * - Layer 3 (Mounted Creature): Swappable 32-bit pixel spirit guide with isolated breathing, micro-tilt, and tap bounce.
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

  // ── 1. Subtle Micro-Tilt Engine (Natural Idle Movement on Character Layer Only) ──
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

  // ── 2. Interactive Tap Reactions (Applies to Creature & Spawns Sparkles) ──
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 550);

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

    setTimeout(() => {
      setSparkles((prev) => prev.filter((p) => !newSparkles.some((ns) => ns.id === p.id)));
    }, 700);
  };

  return (
    <div
      className={`hero-pedestal-container ${className}`.trim()}
      style={{
        ...style,
        '--companion-ambient': companion.ambientColor,
      } as React.CSSProperties}
      onClick={handleTap}
      role="img"
      aria-label={`${companion.name}, ${companion.title}`}
      title={`${companion.name} (Tap to interact)`}
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

      {/* ── Living Creature Layer: Mounted on the Pillar Platform ── */}
      <div
        className={`hero-companion-creature ${isBouncing ? 'tap-bounce' : ''} ${isTilting ? 'micro-tilt' : ''}`}
        style={{
          transform: `scale(${companion.scale}) translate(${companion.anchorOffset.x}px, ${companion.anchorOffset.y}px)`,
        }}
      >
        <div className="hero-creature-body">
          <img
            src={companion.bodySrc}
            alt={companion.name}
            className="hero-companion-img hero-pixel-sprite"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/characters/owl-pixel.png';
            }}
          />
        </div>

        {/* Tap Sparkle Particles */}
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
