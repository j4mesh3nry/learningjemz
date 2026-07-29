import { useEffect, useRef, useState } from 'react';
import './splash.css';

/**
 * SplashScreen
 * ─────────────
 * Shows "💎 LearningJemz" centered at large size.
 * After 1.4 s it triggers an exit animation:
 *   • The text slides to the top-left header position
 *   • The rest of the screen fades out simultaneously
 * After 2.2 s total → onFinish() is called.
 */
export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('intro'); // 'intro' | 'fly' | 'done'
  const titleRef = useRef(null);

  useEffect(() => {
    // Phase 1: Show intro animation
    const flyTimer = setTimeout(() => setPhase('fly'), 1400);
    // Phase 2: After fly animation completes, reveal home
    const doneTimer = setTimeout(() => {
      setPhase('done');
      onFinish();
    }, 2300);

    return () => {
      clearTimeout(flyTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-container splash-phase-${phase}`}>
      {/* Background fades out during 'fly' phase */}
      <div className="splash-bg" />

      {/* The title element animates position during 'fly' phase */}
      <h1 ref={titleRef} className={`splash-title splash-title-${phase}`}>
        💎 LearningJemz
      </h1>
    </div>
  );
}
