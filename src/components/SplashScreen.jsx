import { useEffect, useState } from 'react';
import { Gem, BookOpen, Globe2, Crown, Rocket, Music, ScrollText, Calculator, Microscope, Lightbulb, Compass, Palette, Star, Atom, Trophy, Gamepad2, Award, PenTool, Feather, Dna } from 'lucide-react';
import './splash.css';

const floatingIcons = [
  // Top Zone
  { Icon: Globe2, top: '8%', left: '12%', size: 42, rotation: 15, delay: 0.2 },
  { Icon: Star, top: '5%', left: '48%', size: 28, rotation: -10, delay: 1.1 },
  { Icon: Feather, top: '12%', left: '82%', size: 36, rotation: 25, delay: 0.5 },
  { Icon: BookOpen, top: '22%', left: '25%', size: 32, rotation: -20, delay: 0.8 },
  { Icon: Atom, top: '25%', left: '75%', size: 40, rotation: 10, delay: 1.4 },
  { Icon: Lightbulb, top: '28%', left: '5%', size: 30, rotation: 35, delay: 0.3 },

  // Mid Zone (Keep center clear for Logo)
  { Icon: Crown, top: '45%', left: '10%', size: 38, rotation: -15, delay: 0.9 },
  { Icon: Rocket, top: '40%', left: '88%', size: 44, rotation: 20, delay: 0.1 },
  { Icon: Gamepad2, top: '55%', left: '18%', size: 34, rotation: 12, delay: 1.6 },
  { Icon: Compass, top: '60%', left: '85%', size: 40, rotation: -25, delay: 0.7 },
  { Icon: BookOpen, top: '50%', left: '70%', size: 28, rotation: -5, delay: 1.2 },
  { Icon: Star, top: '40%', left: '28%', size: 24, rotation: 40, delay: 0.4 },
  { Icon: Award, top: '65%', left: '5%', size: 36, rotation: -30, delay: 1.8 },
  { Icon: Music, top: '55%', left: '75%', size: 32, rotation: 15, delay: 0.6 },

  // Bottom Zone
  { Icon: ScrollText, top: '75%', left: '20%', size: 42, rotation: -10, delay: 1.3 },
  { Icon: Microscope, top: '72%', left: '80%', size: 46, rotation: 22, delay: 0.5 },
  { Icon: Calculator, top: '88%', left: '15%', size: 40, rotation: 18, delay: 0.2 },
  { Icon: Palette, top: '85%', left: '70%', size: 44, rotation: -15, delay: 1.5 },
  { Icon: Trophy, top: '82%', left: '45%', size: 38, rotation: 5, delay: 0.8 },
  { Icon: PenTool, top: '95%', left: '30%', size: 30, rotation: -25, delay: 1.1 },
  { Icon: Dna, top: '92%', left: '88%', size: 36, rotation: 30, delay: 1.7 },
  { Icon: Music, top: '96%', left: '60%', size: 28, rotation: -12, delay: 0.4 },
  { Icon: Globe2, top: '70%', left: '55%', size: 32, rotation: -40, delay: 1.9 },
  { Icon: Rocket, top: '85%', left: '95%', size: 34, rotation: 15, delay: 0.7 },
  { Icon: Lightbulb, top: '90%', left: '5%', size: 26, rotation: 20, delay: 1.4 },
  { Icon: Star, top: '78%', left: '35%', size: 22, rotation: -15, delay: 0.6 }
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
