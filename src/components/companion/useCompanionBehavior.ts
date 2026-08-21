// src/components/companion/useCompanionBehavior.ts
import { useState, useEffect, useRef, useCallback } from 'react';

export type CompanionBehaviorState =
  | 'idle'
  | 'blink'
  | 'lookAround'
  | 'flourish'
  | 'happyTap'
  | 'drowse';

export interface TapSparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export interface UseCompanionBehaviorOptions {
  companionId: string;
  ambientColor?: string;
  enableDrowse?: boolean;
}

export function useCompanionBehavior({
  companionId,
  ambientColor = '#34d399',
  enableDrowse = true,
}: UseCompanionBehaviorOptions) {
  const [behavior, setBehavior] = useState<CompanionBehaviorState>('idle');
  const [isBlinking, setIsBlinking] = useState(false);
  const [lookDirection, setLookDirection] = useState<'center' | 'left' | 'right' | 'up'>('center');
  const [isFlourishing, setIsFlourishing] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [isDrowsing, setIsDrowsing] = useState(false);
  const [sparkles, setSparkles] = useState<TapSparkle[]>([]);

  const sparkleCounter = useRef(0);
  const lastInteractionTime = useRef(Date.now());
  const activeTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const addTimer = useCallback((timer: ReturnType<typeof setTimeout>) => {
    activeTimers.current.push(timer);
    return timer;
  }, []);

  const clearAllTimers = useCallback(() => {
    activeTimers.current.forEach(clearTimeout);
    activeTimers.current = [];
  }, []);

  const resetDrowseTimer = useCallback(() => {
    lastInteractionTime.current = Date.now();
    if (isDrowsing) {
      setIsDrowsing(false);
      setBehavior('idle');
    }
  }, [isDrowsing]);

  // ── 1. Periodic Eye Blink / Visor Scan Engine (Every 3.2s – 5.5s) ──
  useEffect(() => {
    let isMounted = true;

    const scheduleNextBlink = () => {
      const delay = 3200 + Math.random() * 2400;
      const t = setTimeout(() => {
        if (!isMounted) return;
        setIsBlinking(true);

        const blinkDuration = 160;
        const resetT = setTimeout(() => {
          if (!isMounted) return;
          setIsBlinking(false);
          scheduleNextBlink();
        }, blinkDuration);
        addTimer(resetT);
      }, delay);
      addTimer(t);
    };

    scheduleNextBlink();

    return () => {
      isMounted = false;
    };
  }, [companionId, addTimer]);

  // ── 2. Idle Behavior Loop & Look-Around / Curiosity Scheduler ──
  useEffect(() => {
    let isMounted = true;

    const scheduleLookAround = () => {
      const delay = 7000 + Math.random() * 6000;
      const t = setTimeout(() => {
        if (!isMounted) return;
        if (isTapped || isFlourishing) {
          scheduleLookAround();
          return;
        }

        const dirs: Array<'left' | 'right' | 'up'> = ['left', 'right', 'up'];
        const chosen = dirs[Math.floor(Math.random() * dirs.length)];
        setLookDirection(chosen);
        setBehavior('lookAround');

        const lookT = setTimeout(() => {
          if (!isMounted) return;
          setLookDirection('center');
          setBehavior('idle');
          scheduleLookAround();
        }, 2400);
        addTimer(lookT);
      }, delay);
      addTimer(t);
    };

    scheduleLookAround();

    return () => {
      isMounted = false;
    };
  }, [companionId, isTapped, isFlourishing, addTimer]);

  // ── 3. Special Idle Flourish / Fidget Scheduler (Every 16s – 28s) ──
  useEffect(() => {
    let isMounted = true;

    const scheduleFlourish = () => {
      const delay = 16000 + Math.random() * 12000;
      const t = setTimeout(() => {
        if (!isMounted) return;
        if (isTapped) {
          scheduleFlourish();
          return;
        }

        setIsFlourishing(true);
        setBehavior('flourish');

        const endT = setTimeout(() => {
          if (!isMounted) return;
          setIsFlourishing(false);
          setBehavior('idle');
          scheduleFlourish();
        }, 2200);
        addTimer(endT);
      }, delay);
      addTimer(t);
    };

    scheduleFlourish();

    return () => {
      isMounted = false;
    };
  }, [companionId, isTapped, addTimer]);

  // ── 4. AFK Drowse / Slumber Monitor (After 40s of Inactivity) ──
  useEffect(() => {
    if (!enableDrowse) return;
    let isMounted = true;

    const checkInterval = setInterval(() => {
      if (!isMounted) return;
      const elapsed = Date.now() - lastInteractionTime.current;
      if (elapsed > 40000 && !isDrowsing && !isTapped) {
        setIsDrowsing(true);
        setBehavior('drowse');
      }
    }, 5000);

    const handleUserActivity = () => {
      resetDrowseTimer();
    };

    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });

    return () => {
      isMounted = false;
      clearInterval(checkInterval);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [enableDrowse, isDrowsing, isTapped, resetDrowseTimer]);

  // ── 5. Interactive Tap Reaction ──
  const triggerTap = useCallback(
    (clickX?: number, clickY?: number) => {
      resetDrowseTimer();
      setIsTapped(true);
      setBehavior('happyTap');

      // Generate burst of glowing pixel ember particles around click or center
      const spawnX = clickX ?? 60;
      const spawnY = clickY ?? 50;
      const newSparkles: TapSparkle[] = Array.from({ length: 6 }, () => ({
        id: ++sparkleCounter.current,
        x: spawnX + (Math.random() - 0.5) * 44,
        y: spawnY + (Math.random() - 0.5) * 32,
        size: Math.random() > 0.5 ? 4 : 3,
        color: Math.random() > 0.4 ? ambientColor : '#fbbf24',
      }));

      setSparkles((prev) => [...prev, ...newSparkles]);

      const bounceT = setTimeout(() => {
        setIsTapped(false);
        setBehavior('idle');
      }, 650);
      addTimer(bounceT);

      const sparkleT = setTimeout(() => {
        setSparkles((prev) => prev.filter((p) => !newSparkles.some((ns) => ns.id === p.id)));
      }, 750);
      addTimer(sparkleT);
    },
    [ambientColor, resetDrowseTimer, addTimer]
  );

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    behavior,
    isBlinking,
    lookDirection,
    isFlourishing,
    isTapped,
    isDrowsing,
    sparkles,
    triggerTap,
    resetDrowseTimer,
  };
}
