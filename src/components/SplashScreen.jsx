import { useEffect, useState } from 'react';
import { Gem } from 'lucide-react';
import './splash.css';

export default function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFade(true), 1600);
    const doneTimer = setTimeout(() => onFinish(), 2200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-container ${fade ? 'splash-fade-out' : ''}`}>
      <div className="splash-logo-wrapper">
        <div className="splash-icon-box">
          <Gem size={42} color="#ffffff" strokeWidth={2.5} />
        </div>
        <h1 className="splash-title">
          Learning<span style={{ color: '#1c7c54' }}>Jemz</span>
        </h1>
      </div>
    </div>
  );
}
