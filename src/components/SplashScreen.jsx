import { useEffect, useState } from 'react';
import { Gem, BookOpen, Globe2, Crown, Rocket, Music, ScrollText, Calculator, Microscope, Lightbulb, Compass, Palette, Star, Atom, Trophy, Gamepad2, Award, PenTool, Feather, Dna, Telescope, Brain } from 'lucide-react';
import './splash.css';

const floatingIcons = [
  // --- TOP LEFT ZONE ---
  { Icon: Globe2, top: '8%', left: '12%', size: 42, rotation: 15, delay: 0.2 },
  { Icon: BookOpen, top: '22%', left: '25%', size: 32, rotation: -20, delay: 0.8 },
  { Icon: Lightbulb, top: '32%', left: '8%', size: 30, rotation: 35, delay: 0.3 },
  { Icon: Palette, top: '18%', left: '2%', size: 28, rotation: -10, delay: 1.5 },

  // --- TOP CENTER ZONE ---
  { Icon: Star, top: '5%', left: '48%', size: 28, rotation: -10, delay: 1.1 },
  { Icon: Gamepad2, top: '20%', left: '50%', size: 36, rotation: 12, delay: 1.6 },
  { Icon: Music, top: '32%', left: '38%', size: 30, rotation: -15, delay: 0.7 },
  { Icon: ScrollText, top: '15%', left: '35%', size: 34, rotation: 25, delay: 1.2 },
  { Icon: Crown, top: '28%', left: '60%', size: 28, rotation: -5, delay: 0.4 },

  // --- TOP RIGHT ZONE ---
  { Icon: Feather, top: '10%', left: '82%', size: 36, rotation: 25, delay: 0.5 },
  { Icon: Atom, top: '25%', left: '75%', size: 40, rotation: 10, delay: 1.4 },
  { Icon: Award, top: '35%', left: '88%', size: 34, rotation: -30, delay: 1.8 },
  { Icon: BookOpen, top: '15%', left: '95%', size: 30, rotation: -5, delay: 1.2 },
  { Icon: Telescope, top: '8%', left: '65%', size: 32, rotation: 15, delay: 0.9 },

  // --- MIDDLE EXTREME EDGES (Avoiding Center Logo) ---
  { Icon: Crown, top: '48%', left: '4%', size: 38, rotation: -15, delay: 0.9 },
  { Icon: Compass, top: '52%', left: '94%', size: 40, rotation: -25, delay: 0.7 },
  { Icon: Rocket, top: '62%', left: '8%', size: 44, rotation: 20, delay: 0.1 },
  { Icon: Star, top: '62%', left: '90%', size: 24, rotation: 40, delay: 0.4 },
  
  // --- DIRECTLY BELOW LOGO (Filling the gap) ---
  { Icon: Brain, top: '60%', left: '42%', size: 28, rotation: -12, delay: 0.5 },
  { Icon: BookOpen, top: '64%', left: '55%', size: 24, rotation: 18, delay: 1.2 },
  { Icon: Feather, top: '58%', left: '68%', size: 22, rotation: -25, delay: 0.9 },

  // --- BOTTOM LEFT ZONE ---
  { Icon: Calculator, top: '88%', left: '15%', size: 40, rotation: 18, delay: 0.2 },
  { Icon: PenTool, top: '75%', left: '25%', size: 30, rotation: -25, delay: 1.1 },
  { Icon: Lightbulb, top: '95%', left: '5%', size: 26, rotation: 20, delay: 1.4 },
  { Icon: Trophy, top: '70%', left: '10%', size: 34, rotation: 5, delay: 0.8 },

  // --- BOTTOM CENTER ZONE ---
  { Icon: Globe2, top: '75%', left: '50%', size: 38, rotation: -40, delay: 1.9 },
  { Icon: Star, top: '88%', left: '35%', size: 22, rotation: -15, delay: 0.6 },
  { Icon: Music, top: '96%', left: '60%', size: 28, rotation: -12, delay: 0.4 },
  { Icon: Palette, top: '85%', left: '48%', size: 44, rotation: -15, delay: 1.5 },
  { Icon: Gamepad2, top: '72%', left: '38%', size: 30, rotation: 10, delay: 1.1 },

  // --- BOTTOM RIGHT ZONE ---
  { Icon: Microscope, top: '72%', left: '80%', size: 46, rotation: 22, delay: 0.5 },
  { Icon: ScrollText, top: '88%', left: '75%', size: 42, rotation: -10, delay: 1.3 },
  { Icon: Dna, top: '95%', left: '90%', size: 36, rotation: 30, delay: 1.7 },
  { Icon: Rocket, top: '78%', left: '95%', size: 34, rotation: 15, delay: 0.7 },
  { Icon: Atom, top: '85%', left: '65%', size: 28, rotation: -20, delay: 0.9 }
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
