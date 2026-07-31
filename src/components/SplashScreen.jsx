import { useEffect, useState } from 'react';
import { Gem, BookOpen, Globe2, Crown, Rocket, Music, ScrollText, Calculator, Microscope, Lightbulb, Compass, Palette } from 'lucide-react';
import './splash.css';

const floatingIcons = [
  { Icon: BookOpen, top: '12%', left: '15%', size: 40, rotation: -15, delay: 0 },
  { Icon: Globe2, top: '15%', left: '75%', size: 48, rotation: 20, delay: 0.5 },
  { Icon: Crown, top: '35%', left: '8%', size: 36, rotation: -10, delay: 1 },
  { Icon: Rocket, top: '38%', left: '82%', size: 44, rotation: 15, delay: 0.2 },
  { Icon: Music, top: '65%', left: '18%', size: 38, rotation: 25, delay: 0.8 },
  { Icon: ScrollText, top: '62%', left: '78%', size: 42, rotation: -20, delay: 1.2 },
  { Icon: Calculator, top: '85%', left: '12%', size: 40, rotation: -10, delay: 0.4 },
  { Icon: Microscope, top: '82%', left: '72%', size: 46, rotation: 10, delay: 1.5 },
  { Icon: Lightbulb, top: '6%', left: '45%', size: 34, rotation: 5, delay: 0.7 },
  { Icon: Compass, top: '50%', left: '88%', size: 40, rotation: -25, delay: 1.1 },
  { Icon: Palette, top: '88%', left: '45%', size: 44, rotation: 15, delay: 0.3 },
  { Icon: BookOpen, top: '50%', left: '5%', size: 32, rotation: 15, delay: 1.3 },
];

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
      {/* Background pattern */}
      <div className="splash-pattern-bg">
        {floatingIcons.map((item, index) => {
          const { Icon, top, left, size, rotation, delay } = item;
          return (
            <div key={index} className="splash-floating-icon" style={{
              top, left, 
              animationDelay: `${delay}s`,
            }}>
              <div style={{ transform: `rotate(${rotation}deg)` }}>
                <Icon size={size} strokeWidth={1.5} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="splash-logo-wrapper">
        <div className="splash-icon-box">
          <Gem size={32} color="#ffffff" strokeWidth={2.5} />
        </div>
        <h1 className="splash-title">
          Learning<span style={{ color: '#1c7c54' }}>Jemz</span>
        </h1>
      </div>
    </div>
  );
}
