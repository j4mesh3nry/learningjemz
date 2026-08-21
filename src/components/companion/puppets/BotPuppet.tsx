// src/components/companion/puppets/BotPuppet.tsx
import React from 'react';

export interface BotPuppetProps {
  lookX: number;
  lookY: number;
  isBlinking: boolean;
  isWaving: boolean;
  isHappy: boolean;
  ambientColor?: string;
}

export function BotPuppet({
  lookX = 0,
  lookY = 0,
  isBlinking = false,
  isWaving = false,
  isHappy = false,
  ambientColor = '#38bdf8',
}: BotPuppetProps) {
  const pupilX = lookX * 5;
  const pupilY = lookY * 3.5;

  const headRotate = lookX * 7;
  const headTranslateX = lookX * 3;
  const headTranslateY = lookY * 2;

  return (
    <div
      className={`puppet-character bot-puppet ${isWaving ? 'is-waving' : ''} ${isHappy ? 'is-happy' : ''}`}
      style={{
        '--puppet-ambient': ambientColor,
      } as React.CSSProperties}
    >
      <svg
        viewBox="0 0 160 180"
        className="puppet-svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="bot-reactor-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={ambientColor} floodOpacity="0.85" />
          </filter>
          <filter id="bot-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
          </filter>
          <linearGradient id="bot-metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="50%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="bot-visor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* ── 1. Floating Holographic Runic Screen (Left Side) ── */}
        <g className="puppet-holo-screen" transform="translate(14, 60)" filter="url(#bot-reactor-glow)">
          {/* Translucent UI Glass Plate */}
          <rect x="0" y="0" width="46" height="34" rx="4" fill="rgba(14, 165, 233, 0.18)" stroke="#38bdf8" strokeWidth="1.2" />
          {/* Holographic Glyphs */}
          <circle cx="23" cy="14" r="7" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="6" y1="26" x2="22" y2="26" stroke="#38bdf8" strokeWidth="1.2" />
          <line x1="6" y1="30" x2="38" y2="30" stroke="#38bdf8" strokeWidth="1" opacity="0.7" />
          <line x1="28" y1="26" x2="40" y2="26" stroke="#38bdf8" strokeWidth="1.2" />
          {/* Connection Laser Beam to Bot */}
          <line x1="46" y1="17" x2="60" y2="28" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.6" />
        </g>

        {/* ── 2. Mechanical Legs & Base (Direct on Cliff Terrain) ── */}
        <g className="puppet-legs" filter="url(#bot-soft-shadow)">
          {/* Left Foot */}
          <path d="M52,154 C46,154 44,166 48,172 C52,176 66,176 68,170 C70,164 62,154 52,154 Z" fill="#78350f" />
          <circle cx="58" cy="164" r="3" fill="#38bdf8" filter="url(#bot-reactor-glow)" />
          {/* Right Foot */}
          <path d="M96,154 C90,154 88,166 92,172 C96,176 110,176 112,170 C114,164 106,154 96,154 Z" fill="#78350f" />
          <circle cx="102" cy="164" r="3" fill="#38bdf8" filter="url(#bot-reactor-glow)" />
        </g>

        {/* ── 3. Chassis Torso & Glowing Core (Breathing Skeleton) ── */}
        <g className="puppet-torso">
          {/* Main Bronze Chassis Trunk */}
          <path
            d="M50,86 C42,106 42,142 52,160 C68,164 92,164 108,160 C118,142 118,106 110,86 Z"
            fill="url(#bot-metal-grad)"
            filter="url(#bot-soft-shadow)"
          />

          {/* Runic Filigree Circuit Insets */}
          <path d="M58,94 L66,104 L66,132 M102,94 L94,104 L94,132" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" filter="url(#bot-reactor-glow)" />

          {/* Arcane Reactor Core */}
          <circle cx="80" cy="120" r="13" fill="#0f172a" stroke="#b45309" strokeWidth="2.5" />
          <circle cx="80" cy="120" r="8.5" fill="#38bdf8" filter="url(#bot-reactor-glow)" />
          <circle cx="80" cy="120" r="4" fill="#ffffff" />

          {/* Left Mechanical Arm (Resting) */}
          <g className="puppet-arm-left">
            <rect x="42" y="96" width="10" height="34" rx="5" fill="#78350f" transform="rotate(12 47 113)" />
            <circle cx="44" cy="132" r="4.5" fill="#b45309" />
          </g>

          {/* Right Mechanical Arm (Articulated Waving Arm) */}
          <g className={`puppet-arm-right ${isWaving ? 'is-waving-arm' : ''}`}>
            {/* Shoulder Joint Pivot */}
            <circle cx="112" cy="98" r="6" fill="#b45309" />
            {/* Forearm & Hand */}
            <rect x="108" y="98" width="10" height="36" rx="5" fill="#78350f" />
            <circle cx="113" cy="136" r="5" fill="#b45309" />
            {/* Hand Fingers */}
            <line x1="110" y1="140" x2="110" y2="148" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <line x1="113" y1="141" x2="113" y2="150" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <line x1="116" y1="140" x2="116" y2="148" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>

        {/* ── 4. Articulated Head & Visor (Cursor Tracking + LED Matrix) ── */}
        <g
          className="puppet-head-group"
          style={{
            transformOrigin: '80px 55px',
            transform: `translate(${headTranslateX}px, ${headTranslateY}px) rotate(${headRotate}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Sprout Antenna with Physics Bob */}
          <g className="puppet-bot-antenna">
            <line x1="80" y1="18" x2="80" y2="8" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
            {/* Left Leaf */}
            <path d="M80,8 C70,2 66,10 74,14 C78,16 80,12 80,8 Z" fill="#22c55e" />
            {/* Right Leaf */}
            <path d="M80,8 C90,2 94,10 86,14 C82,16 80,12 80,8 Z" fill="#4ade80" />
            <circle cx="80" cy="6" r="2.5" fill="#fef08a" filter="url(#bot-reactor-glow)" />
          </g>

          {/* Dome Helmet Chassis */}
          <ellipse cx="80" cy="48" rx="36" ry="32" fill="url(#bot-metal-grad)" filter="url(#bot-soft-shadow)" />

          {/* Side Head Bolt Dials */}
          <rect x="40" y="40" width="6" height="16" rx="2" fill="#b45309" />
          <rect x="114" y="40" width="6" height="16" rx="2" fill="#b45309" />

          {/* Visor Bezel Frame */}
          <ellipse cx="80" cy="50" rx="28" ry="22" fill="#0f172a" stroke="#b45309" strokeWidth="2" />
          {/* Visor Screen Glass */}
          <ellipse cx="80" cy="50" rx="26" ry="20" fill="url(#bot-visor-grad)" />

          {/* Visor Scanline Glass Glint */}
          <ellipse cx="74" cy="42" rx="16" ry="6" fill="rgba(255, 255, 255, 0.18)" />

          {/* ── 5. Dynamic LED Eye Expressions (Matrix Display) ── */}
          {isBlinking ? (
            /* Blinking Horizontal Scanlines */
            <g filter="url(#bot-reactor-glow)">
              <line x1="64" y1="50" x2="74" y2="50" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <line x1="86" y1="50" x2="96" y2="50" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            </g>
          ) : isHappy ? (
            /* Happy Smiling Eye Arcs ^_^ */
            <g filter="url(#bot-reactor-glow)">
              <path d="M63,52 Q69,44 75,52" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M85,52 Q91,44 97,52" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              {/* Cute LED Smile */}
              <path d="M74,60 Q80,64 86,60" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            /* Default Cursor-Tracking Rounded LED Eyes */
            <g filter="url(#bot-reactor-glow)">
              {/* Left LED Eye */}
              <ellipse cx={69 + pupilX} cy={50 + pupilY} rx="5" ry="6" fill="#38bdf8" />
              <ellipse cx={68 + pupilX} cy={48 + pupilY} rx="2" ry="2.5" fill="#ffffff" />

              {/* Right LED Eye */}
              <ellipse cx={91 + pupilX} cy={50 + pupilY} rx="5" ry="6" fill="#38bdf8" />
              <ellipse cx={90 + pupilX} cy={48 + pupilY} rx="2" ry="2.5" fill="#ffffff" />

              {/* Little Digital Smile */}
              <path d="M76,58 Q80,62 84,58" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

export default BotPuppet;
