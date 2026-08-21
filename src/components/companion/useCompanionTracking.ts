// src/components/companion/useCompanionTracking.ts
import { useState, useEffect, useRef } from 'react';

export interface CompanionTrackingState {
  lookX: number; // Normalized -1 (left) to +1 (right)
  lookY: number; // Normalized -1 (up) to +1 (down)
  triggerDirectFocus: () => void;
}

/**
 * Mobile-First Autonomous Living Gaze Engine.
 * Rather than listening to mouse/touch drag events, the companion autonomously
 * shifts its gaze with lifelike curiosity (observing the player, glancing around the landscape),
 * saving CPU/battery on mobile devices while feeling like a truly alive virtual pet.
 */
export function useCompanionTracking(enabled = true): CompanionTrackingState {
  const [lookPos, setLookPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const targetPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  // 1. Smooth Spring/LERP Gaze Damping Loop
  useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.08;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.08;

      setLookPos({
        x: Math.round(currentPos.current.x * 1000) / 1000,
        y: Math.round(currentPos.current.y * 1000) / 1000,
      });

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled]);

  // 2. Autonomous Curiosity Scheduler (Shifts gaze every 3.5s – 7s)
  useEffect(() => {
    if (!enabled) return;
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextGlance = () => {
      const delay = 3500 + Math.random() * 3500;
      timeoutId = setTimeout(() => {
        if (!isMounted) return;

        // Weighted gaze positions:
        // 50% Center (engaging with player), 25% Left (scenic forest), 20% Right (lake/stars), 5% Up (sky)
        const rand = Math.random();
        if (rand < 0.5) {
          targetPos.current = { x: (Math.random() - 0.5) * 0.15, y: (Math.random() - 0.5) * 0.1 };
        } else if (rand < 0.75) {
          targetPos.current = { x: -0.4 - Math.random() * 0.35, y: (Math.random() - 0.5) * 0.2 };
        } else if (rand < 0.95) {
          targetPos.current = { x: 0.4 + Math.random() * 0.35, y: (Math.random() - 0.5) * 0.2 };
        } else {
          targetPos.current = { x: (Math.random() - 0.5) * 0.2, y: -0.45 };
        }

        scheduleNextGlance();
      }, delay);
    };

    scheduleNextGlance();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [enabled]);

  const triggerDirectFocus = () => {
    // Snap gaze straight at player with a micro nod
    targetPos.current = { x: 0, y: -0.05 };
  };

  return {
    lookX: lookPos.x,
    lookY: lookPos.y,
    triggerDirectFocus,
  };
}
