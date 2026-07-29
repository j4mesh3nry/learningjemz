import { useEffect, useState } from 'react';
import './splash.css';
import logo from '../assets/logo.png'; // Make sure the logo is here

export default function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fading out slightly before the full duration ends
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 1700);

    // Call onFinish to unmount the splash screen
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-container ${fade ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <img src={logo} alt="Learning Jemz Logo" className="splash-logo" />
        <h1 className="splash-title">
          💎 LearningJemz
        </h1>
      </div>
    </div>
  );
}
