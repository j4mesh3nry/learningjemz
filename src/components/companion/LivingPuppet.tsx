// src/components/companion/LivingPuppet.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCompanion, type CompanionConfig } from '../../data/companions';
import { useCompanionTracking } from './useCompanionTracking';
import { OwlPuppet } from './puppets/OwlPuppet';
import { FoxPuppet } from './puppets/FoxPuppet';
import { BotPuppet } from './puppets/BotPuppet';
import './living-puppet.css';

export interface LivingPuppetProps {
  avatar?: string | null;
  className?: string;
  style?: React.CSSProperties;
  scale?: number;
  onTap?: () => void;
  disableInteraction?: boolean;
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
}

export function LivingPuppet({
  avatar,
  className = '',
  style = {},
  scale = 1.0,
  onTap,
  disableInteraction = false,
}: LivingPuppetProps) {
  const companion: CompanionConfig = getCompanion(avatar);

  // 1. Mobile-First Autonomous Living Gaze Engine
  const { lookX, lookY, triggerDirectFocus } = useCompanionTracking(!disableInteraction);

  // 3. Gesture States
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(true); // Wave hello on mount
  const [isHappy, setIsHappy] = useState(false);
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);

  const sparkleCounter = useRef(0);
  const activeTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const addTimer = useCallback((t: ReturnType<typeof setTimeout>) => {
    activeTimers.current.push(t);
    return t;
  }, []);

  const clearAllTimers = useCallback(() => {
    activeTimers.current.forEach(clearTimeout);
    activeTimers.current = [];
  }, []);

  // End initial waving entrance after 2.4s
  useEffect(() => {
    const entranceTimer = setTimeout(() => {
      setIsWaving(false);
    }, 2400);
    return () => clearTimeout(entranceTimer);
  }, []);

  // Periodic Eye Blinking (Every 3.2s – 5.4s)
  useEffect(() => {
    let isMounted = true;

    const scheduleBlink = () => {
      const delay = 3200 + Math.random() * 2200;
      const t = setTimeout(() => {
        if (!isMounted) return;
        setIsBlinking(true);

        const resetT = setTimeout(() => {
          if (!isMounted) return;
          setIsBlinking(false);
          scheduleBlink();
        }, 140);
        addTimer(resetT);
      }, delay);
      addTimer(t);
    };

    scheduleBlink();

    return () => {
      isMounted = false;
    };
  }, [companion.id, addTimer]);

  // Periodic Idle Waving Gesture (Every 14s – 22s)
  useEffect(() => {
    let isMounted = true;

    const scheduleWave = () => {
      const delay = 14000 + Math.random() * 8000;
      const t = setTimeout(() => {
        if (!isMounted) return;
        setIsWaving(true);

        const endT = setTimeout(() => {
          if (!isMounted) return;
          setIsWaving(false);
          scheduleWave();
        }, 2200);
        addTimer(endT);
      }, delay);
      addTimer(t);
    };

    scheduleWave();

    return () => {
      isMounted = false;
    };
  }, [companion.id, addTimer]);

  // Mobile Tap / Touch Interaction Handler
  const handleTap = (e?: React.MouseEvent<HTMLDivElement>) => {
    if (disableInteraction) return;
    if (e) e.stopPropagation();

    setIsHappy(true);
    setIsWaving(true);
    triggerDirectFocus();

    // Spawn burst of glowing stardust particles around character
    const newSparkles: SparkleParticle[] = Array.from({ length: 7 }, () => ({
      id: ++sparkleCounter.current,
      x: 75 + (Math.random() - 0.5) * 44,
      y: 85 + (Math.random() - 0.5) * 36,
      size: 4 + Math.random() * 4,
      color: Math.random() > 0.3 ? companion.ambientColor : '#fbbf24',
      vx: (Math.random() - 0.5) * 64,
      vy: -26 - Math.random() * 24,
    }));

    setSparkles((prev) => [...prev, ...newSparkles]);

    const happyTimer = setTimeout(() => {
      setIsHappy(false);
      setIsWaving(false);
    }, 2200);
    addTimer(happyTimer);

    const sparkleTimer = setTimeout(() => {
      setSparkles((prev) => prev.filter((p) => !newSparkles.some((ns) => ns.id === p.id)));
    }, 750);
    addTimer(sparkleTimer);

    onTap?.();
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return (
    <div
      className={`living-puppet-root ${isHappy ? 'is-tapped' : ''} ${className}`.trim()}
      style={{
        ...style,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        '--puppet-ambient': companion.ambientColor,
      } as React.CSSProperties}
      onClick={handleTap}
      role="img"
      aria-label={`${companion.name} the ${companion.species}`}
      title={`${companion.name} (${companion.species}) — Tap to interact`}
    >
      <div className="living-puppet-stage">
        {/* ── Direct Cliff Grounding Shadows & Ambient Glow ── */}
        <div className="puppet-cliff-contact-shadow" />
        <div className="puppet-ambient-rim-glow" />

        {/* ── Render Articulated Vector Puppet Character ── */}
        {companion.id === 'fox' ? (
          <FoxPuppet
            lookX={lookX}
            lookY={lookY}
            isBlinking={isBlinking}
            isWaving={isWaving}
            isHappy={isHappy}
            ambientColor={companion.ambientColor}
          />
        ) : companion.id === 'bot' ? (
          <BotPuppet
            lookX={lookX}
            lookY={lookY}
            isBlinking={isBlinking}
            isWaving={isWaving}
            isHappy={isHappy}
            ambientColor={companion.ambientColor}
          />
        ) : (
          <OwlPuppet
            lookX={lookX}
            lookY={lookY}
            isBlinking={isBlinking}
            isWaving={isWaving}
            isHappy={isHappy}
            ambientColor={companion.ambientColor}
          />
        )}

        {/* ── Interactive Tap Sparkle Embers ── */}
        {sparkles.map((sp) => (
          <span
            key={sp.id}
            className="puppet-sparkle-particle"
            style={{
              left: sp.x,
              top: sp.y,
              width: sp.size,
              height: sp.size,
              backgroundColor: sp.color,
              boxShadow: `0 0 8px ${sp.color}`,
              '--sp-vx': sp.vx,
              '--sp-vy': sp.vy,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

export default LivingPuppet;
