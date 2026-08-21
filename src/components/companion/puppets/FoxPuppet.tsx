// src/components/companion/puppets/FoxPuppet.tsx
import React from 'react';

export interface FoxPuppetProps {
  lookX: number;
  lookY: number;
  isBlinking: boolean;
  isWaving: boolean;
  isHappy: boolean;
  ambientColor?: string;
}

export function FoxPuppet({
  lookX = 0,
  lookY = 0,
  isBlinking = false,
  isWaving = false,
  isHappy = false,
  ambientColor = '#f59e0b',
}: FoxPuppetProps) {
  const pupilX = lookX * 4;
  const pupilY = lookY * 3;

  const headRotate = lookX * 8;
  const headTranslateX = lookX * 3;
  const headTranslateY = lookY * 2;

  return (
    <div
      className={`puppet-character fox-puppet ${isWaving ? 'is-waving' : ''} ${isHappy ? 'is-happy' : ''}`}
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
          <filter id="fox-rune-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={ambientColor} floodOpacity="0.8" />
          </filter>
          <filter id="fox-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
          </filter>
          <linearGradient id="fox-fur-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="fox-scarf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>

        {/* ── 1. 3 Celestial Sinuous Tails (Back Layer with Undulating Wave) ── */}
        <g className="puppet-fox-tails" filter="url(#fox-rune-glow)">
          {/* Left Tail */}
          <g className="puppet-tail puppet-tail-1">
            <path
              d="M60,130 C30,110 8,80 16,40 C28,52 46,72 64,110 Z"
              fill="#d97706"
            />
            <path
              d="M52,124 C28,104 14,76 20,44 C28,54 40,72 56,108 Z"
              fill="#f59e0b"
            />
            {/* Glowing Celestial Tip */}
            <polygon points="16,40 24,50 20,62 10,52" fill="#fef08a" />
          </g>

          {/* Center Tail */}
          <g className="puppet-tail puppet-tail-2">
            <path
              d="M78,132 C60,94 56,48 84,20 C96,44 94,80 88,124 Z"
              fill="#b45309"
            />
            <path
              d="M76,126 C64,90 62,54 82,28 C90,48 88,80 82,118 Z"
              fill="#f59e0b"
            />
            <polygon points="84,20 78,32 90,32" fill="#fef08a" />
          </g>

          {/* Right Tail */}
          <g className="puppet-tail puppet-tail-3">
            <path
              d="M96,130 C124,110 148,80 140,40 C128,52 110,72 92,110 Z"
              fill="#d97706"
            />
            <path
              d="M104,124 C128,104 142,76 136,44 C128,54 116,72 100,108 Z"
              fill="#f59e0b"
            />
            <polygon points="140,40 132,50 136,62 146,52" fill="#fef08a" />
          </g>
        </g>

        {/* ── 2. Ground Contact Paws (Direct on Cliff Surface) ── */}
        <g className="puppet-paws" filter="url(#fox-soft-shadow)">
          {/* Left Paws */}
          <ellipse cx="62" cy="168" rx="8" ry="5" fill="#f59e0b" />
          <ellipse cx="62" cy="169" rx="5" ry="3" fill="#ffffff" />
          {/* Right Paws (Resting or Waving) */}
          <g className={`puppet-front-paw ${isWaving ? 'is-waving-paw' : ''}`}>
            <ellipse cx="98" cy="168" rx="8" ry="5" fill="#f59e0b" />
            <ellipse cx="98" cy="169" rx="5" ry="3" fill="#ffffff" />
          </g>
        </g>

        {/* ── 3. Torso & Scarf (Breathing Skeleton) ── */}
        <g className="puppet-torso">
          {/* Main Body Fur */}
          <path
            d="M52,80 C40,105 38,145 50,166 C68,170 92,170 110,166 C122,145 120,105 108,80 Z"
            fill="url(#fox-fur-grad)"
            filter="url(#fox-soft-shadow)"
          />

          {/* White Chest Ruff */}
          <path
            d="M62,82 C56,104 56,134 68,154 C76,158 84,158 92,154 C104,134 104,104 98,82 Z"
            fill="#fffbeb"
          />
          <polygon points="80,148 72,132 88,132" fill="#fef3c7" />

          {/* Celestial Blue Scarf */}
          <path
            d="M48,74 Q80,86 112,74 C116,84 108,96 80,98 C52,96 44,84 48,74 Z"
            fill="url(#fox-scarf-grad)"
            filter="url(#fox-soft-shadow)"
          />
          {/* Flowing Scarf Tail */}
          <path
            d="M104,86 C116,92 128,106 124,124 C116,116 106,102 100,94 Z"
            fill="#2563eb"
          />

          {/* Golden Sunburst Jewel Amulet */}
          <circle cx="80" cy="94" r="6" fill="#f59e0b" filter="url(#fox-rune-glow)" />
          <circle cx="80" cy="94" r="3.5" fill="#ef4444" />
          <circle cx="78.5" cy="92.5" r="1.2" fill="#ffffff" />
        </g>

        {/* ── 4. Articulated Head & Twitching Ears (Tracking Cursor) ── */}
        <g
          className="puppet-head-group"
          style={{
            transformOrigin: '80px 60px',
            transform: `translate(${headTranslateX}px, ${headTranslateY}px) rotate(${headRotate}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Left Twitching Ear */}
          <g className="puppet-ear puppet-ear-left">
            <polygon points="56,42 36,10 70,30" fill="#b45309" filter="url(#fox-soft-shadow)" />
            <polygon points="54,38 40,16 66,28" fill="#f59e0b" />
            <polygon points="52,34 44,20 62,26" fill="#fef3c7" />
          </g>

          {/* Right Twitching Ear */}
          <g className="puppet-ear puppet-ear-right">
            <polygon points="104,42 124,10 90,30" fill="#b45309" filter="url(#fox-soft-shadow)" />
            <polygon points="106,38 120,16 94,28" fill="#f59e0b" />
            <polygon points="108,34 116,20 98,26" fill="#fef3c7" />
          </g>

          {/* Main Fox Head Base */}
          <path
            d="M44,42 C38,20 122,20 116,42 C122,66 94,80 80,82 C66,80 38,66 44,42 Z"
            fill="url(#fox-fur-grad)"
            filter="url(#fox-soft-shadow)"
          />

          {/* White Cheek Tufts */}
          <polygon points="42,62 62,62 52,74" fill="#ffffff" />
          <polygon points="118,62 98,62 108,74" fill="#ffffff" />

          {/* Forehead Celestial Star Marking */}
          <polygon points="80,32 82,38 88,40 82,42 80,48 78,42 72,40 78,38" fill="#fbbf24" filter="url(#fox-rune-glow)" />

          {/* ── 5. Almond Fox Eyes (Cursor Tracking & Blinking) ── */}
          {/* Left Eye */}
          <g className="puppet-eye-left" transform="translate(62, 54)">
            <ellipse cx="0" cy="0" rx="9" ry="6" fill="#0f172a" />
            <ellipse cx="0" cy="0" rx="7" ry="4.5" fill="#f59e0b" />
            <circle cx={pupilX} cy={pupilY} r="3" fill="#7f1d1d" />
            <circle cx={pupilX - 1.2} cy={pupilY - 1.2} r="1.2" fill="#ffffff" />

            {/* Eyelid Shutter */}
            <path
              className="puppet-eyelid"
              d="M-10,-8 L10,-8 L10,8 L-10,8 Z"
              fill="#d97706"
              style={{
                transformOrigin: '0 0',
                transform: isBlinking ? 'scaleY(1)' : isHappy ? 'scaleY(0.7)' : 'scaleY(0)',
                transition: 'transform 0.08s ease',
              }}
            />
            {isBlinking && <path d="M-8,0 Q0,3 8,0" stroke="#78350f" strokeWidth="2" fill="none" />}
          </g>

          {/* Right Eye */}
          <g className="puppet-eye-right" transform="translate(98, 54)">
            <ellipse cx="0" cy="0" rx="9" ry="6" fill="#0f172a" />
            <ellipse cx="0" cy="0" rx="7" ry="4.5" fill="#f59e0b" />
            <circle cx={pupilX} cy={pupilY} r="3" fill="#7f1d1d" />
            <circle cx={pupilX - 1.2} cy={pupilY - 1.2} r="1.2" fill="#ffffff" />

            {/* Eyelid Shutter */}
            <path
              className="puppet-eyelid"
              d="M-10,-8 L10,-8 L10,8 L-10,8 Z"
              fill="#d97706"
              style={{
                transformOrigin: '0 0',
                transform: isBlinking ? 'scaleY(1)' : isHappy ? 'scaleY(0.7)' : 'scaleY(0)',
                transition: 'transform 0.08s ease',
              }}
            />
            {isBlinking && <path d="M-8,0 Q0,3 8,0" stroke="#78350f" strokeWidth="2" fill="none" />}
          </g>

          {/* Snout & Little Black Nose */}
          <polygon points="74,66 86,66 80,75" fill="#fffbeb" />
          <polygon points="76,66 84,66 80,71" fill="#0f172a" />
        </g>
      </svg>
    </div>
  );
}

export default FoxPuppet;
