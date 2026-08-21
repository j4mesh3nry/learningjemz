// src/components/companion/puppets/OwlPuppet.tsx
import React from 'react';

export interface OwlPuppetProps {
  lookX: number;
  lookY: number;
  isBlinking: boolean;
  isWaving: boolean;
  isHappy: boolean;
  ambientColor?: string;
}

export function OwlPuppet({
  lookX = 0,
  lookY = 0,
  isBlinking = false,
  isWaving = false,
  isHappy = false,
  ambientColor = '#34d399',
}: OwlPuppetProps) {
  // Eye pupil offset based on gaze tracking
  const pupilX = lookX * 4.5;
  const pupilY = lookY * 3.5;

  // Head rotation and translation based on gaze tracking
  const headRotate = lookX * 9;
  const headTranslateX = lookX * 3.5;
  const headTranslateY = lookY * 2.5;

  return (
    <div
      className={`puppet-character owl-puppet ${isWaving ? 'is-waving' : ''} ${isHappy ? 'is-happy' : ''}`}
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
          <filter id="owl-rune-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={ambientColor} floodOpacity="0.75" />
          </filter>
          <filter id="owl-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
          </filter>
          <linearGradient id="owl-cloak-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="60%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <linearGradient id="owl-chest-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>

        {/* ── 1. Ground Contact Talons (Direct on Cliff Ridge) ── */}
        <g className="puppet-talons" filter="url(#owl-soft-shadow)">
          {/* Left Foot Claws */}
          <path d="M52,162 C48,162 44,168 46,174 C48,176 56,176 58,172 C60,166 56,162 52,162 Z" fill="#d97706" />
          <path d="M60,163 C58,165 58,171 62,174 C66,175 70,172 68,167 C66,163 62,163 60,163 Z" fill="#b45309" />
          {/* Right Foot Claws */}
          <path d="M96,162 C92,162 90,168 92,174 C94,176 102,176 104,172 C106,166 100,162 96,162 Z" fill="#d97706" />
          <path d="M104,163 C102,165 104,171 108,174 C112,175 116,172 114,167 C112,163 106,163 104,163 Z" fill="#b45309" />
        </g>

        {/* ── 2. Torso Skeleton (Breathing Root) ── */}
        <g className="puppet-torso">
          {/* Deep Emerald Cloak Back & Body Trunk */}
          <path
            d="M44,70 C34,95 28,140 38,164 C50,168 110,168 122,164 C132,140 126,95 116,70 Z"
            fill="url(#owl-cloak-grad)"
            filter="url(#owl-soft-shadow)"
          />

          {/* Chest Feathers & Robe Inset */}
          <path
            d="M60,72 C56,92 56,128 64,152 C72,156 88,156 96,152 C104,128 104,92 100,72 Z"
            fill="url(#owl-chest-grad)"
          />
          {/* Feather Rune Accents */}
          <path d="M72,86 L88,86 M68,98 L92,98 M74,110 L86,110 M76,122 L84,122" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" />

          {/* Gold Belt & Brooch */}
          <path d="M48,148 Q80,154 112,148" stroke="#b45309" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="80" cy="150" r="5.5" fill="#fbbf24" filter="url(#owl-rune-glow)" />
          <circle cx="80" cy="150" r="3" fill="#10b981" />

          {/* ── 3. Right Wing / Ancient Glowing Tome (Holding Book) ── */}
          <g className="puppet-book-wing" transform="translate(86, 92)">
            {/* Book Leather Cover */}
            <path d="M4,12 C14,8 34,4 46,14 L42,48 C30,38 12,42 2,46 Z" fill="#78350f" filter="url(#owl-soft-shadow)" />
            {/* Glowing Parchment Pages */}
            <path d="M8,14 C18,10 32,8 42,16 L38,44 C28,36 14,40 6,42 Z" fill="#fef9c3" />
            {/* Glowing Magical Script */}
            <path d="M14,20 Q24,18 34,22 M14,26 Q24,24 32,28 M14,32 Q22,30 30,34" stroke={ambientColor} strokeWidth="1.8" strokeLinecap="round" filter="url(#owl-rune-glow)" />
            {/* Front Talons gripping Book */}
            <circle cx="6" cy="28" r="3" fill="#d97706" />
            <circle cx="6" cy="34" r="3" fill="#d97706" />
            <circle cx="6" cy="40" r="3" fill="#d97706" />
          </g>

          {/* ── 4. Left Articulated Wing (Waving & Gesturing Arm) ── */}
          <g className={`puppet-wing-left ${isWaving ? 'is-waving-arm' : ''}`}>
            {/* Shoulder & Main Wing Feathers */}
            <path
              d="M48,74 C30,86 16,112 18,142 C24,152 42,148 48,138 C52,118 54,94 52,78 Z"
              fill="#047857"
              filter="url(#owl-soft-shadow)"
            />
            <path
              d="M44,82 C32,94 22,116 26,138 C30,144 42,140 46,132 Z"
              fill="#059669"
            />
            {/* Wing Tip Feather Accents */}
            <path
              d="M38,94 C30,104 26,120 30,134 C34,138 40,136 42,128 Z"
              fill="#34d399"
            />
          </g>
        </g>

        {/* ── 5. Articulated Head & Cowl (Cursor Tracking Rotation & Tilt) ── */}
        <g
          className="puppet-head-group"
          style={{
            transformOrigin: '80px 65px',
            transform: `translate(${headTranslateX}px, ${headTranslateY}px) rotate(${headRotate}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Emerald Scholar Hood */}
          <path
            d="M40,42 C38,18 60,6 80,6 C100,6 122,18 120,42 C120,68 108,76 80,78 C52,76 40,68 40,42 Z"
            fill="url(#owl-cloak-grad)"
            filter="url(#owl-soft-shadow)"
          />
          {/* Ear Horn Tufts */}
          <polygon points="46,30 32,8 58,22" fill="#047857" />
          <polygon points="114,30 128,8 102,22" fill="#047857" />

          {/* Hood Inner Face Cutout */}
          <ellipse cx="80" cy="45" rx="32" ry="24" fill="#fef3c7" />

          {/* Feather Facial Disc Markings */}
          <path d="M54,34 Q80,48 106,34" stroke="#d97706" strokeWidth="2.5" fill="none" opacity="0.6" />

          {/* ── 6. Interactive Eyes & Spectacles ── */}
          {/* Left Eye */}
          <g className="puppet-eye-left" transform="translate(62, 44)">
            {/* Sclera */}
            <circle cx="0" cy="0" r="10.5" fill="#f59e0b" filter="url(#owl-rune-glow)" />
            <circle cx="0" cy="0" r="8" fill="#d97706" />

            {/* Tracking Pupil */}
            <circle cx={pupilX} cy={pupilY} r="4.5" fill="#0f172a" />
            {/* Specular Catchlights */}
            <circle cx={pupilX - 1.8} cy={pupilY - 1.8} r="1.6" fill="#ffffff" />
            <circle cx={pupilX + 1.6} cy={pupilY + 1.4} r="0.8" fill="#ffffff" />

            {/* Real Blinking Eyelid Shutter */}
            <path
              className="puppet-eyelid"
              d="M-11,-11 L11,-11 L11,11 L-11,11 Z"
              fill="#065f46"
              style={{
                transformOrigin: '0 0',
                transform: isBlinking ? 'scaleY(1)' : isHappy ? 'scaleY(0.7)' : 'scaleY(0)',
                transition: 'transform 0.08s ease',
              }}
            />
            {/* Eyelid Crease Line */}
            {isBlinking && <path d="M-10,0 Q0,4 10,0" stroke="#b45309" strokeWidth="2" fill="none" />}
          </g>

          {/* Right Eye */}
          <g className="puppet-eye-right" transform="translate(98, 44)">
            {/* Sclera */}
            <circle cx="0" cy="0" r="10.5" fill="#f59e0b" filter="url(#owl-rune-glow)" />
            <circle cx="0" cy="0" r="8" fill="#d97706" />

            {/* Tracking Pupil */}
            <circle cx={pupilX} cy={pupilY} r="4.5" fill="#0f172a" />
            {/* Specular Catchlights */}
            <circle cx={pupilX - 1.8} cy={pupilY - 1.8} r="1.6" fill="#ffffff" />
            <circle cx={pupilX + 1.6} cy={pupilY + 1.4} r="0.8" fill="#ffffff" />

            {/* Real Blinking Eyelid Shutter */}
            <path
              className="puppet-eyelid"
              d="M-11,-11 L11,-11 L11,11 L-11,11 Z"
              fill="#065f46"
              style={{
                transformOrigin: '0 0',
                transform: isBlinking ? 'scaleY(1)' : isHappy ? 'scaleY(0.7)' : 'scaleY(0)',
                transition: 'transform 0.08s ease',
              }}
            />
            {/* Eyelid Crease Line */}
            {isBlinking && <path d="M-10,0 Q0,4 10,0" stroke="#b45309" strokeWidth="2" fill="none" />}
          </g>

          {/* Gold Wire Spectacles */}
          <circle cx="62" cy="44" r="12" fill="none" stroke="#fbbf24" strokeWidth="2" filter="url(#owl-rune-glow)" />
          <circle cx="98" cy="44" r="12" fill="none" stroke="#fbbf24" strokeWidth="2" filter="url(#owl-rune-glow)" />
          <line x1="74" y1="44" x2="86" y2="44" stroke="#fbbf24" strokeWidth="2" />
          {/* Glass Glints */}
          <line x1="56" y1="38" x2="66" y2="38" stroke="#ffffff" strokeWidth="1.4" opacity="0.85" />
          <line x1="92" y1="38" x2="102" y2="38" stroke="#ffffff" strokeWidth="1.4" opacity="0.85" />

          {/* Golden Curved Beak */}
          <polygon points="76,48 84,48 80,60" fill="#d97706" />
          <polygon points="78,49 82,49 80,57" fill="#fbbf24" />
        </g>
      </svg>
    </div>
  );
}

export default OwlPuppet;
