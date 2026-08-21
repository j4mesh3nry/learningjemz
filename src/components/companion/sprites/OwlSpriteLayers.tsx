// src/components/companion/sprites/OwlSpriteLayers.tsx
import React from 'react';

interface OwlSpriteProps {
  isBlinking: boolean;
  lookDirection: 'center' | 'left' | 'right' | 'up';
  ambientColor?: string;
}

export function OwlSpriteLayers({
  isBlinking,
  lookDirection,
  ambientColor = '#34d399',
}: OwlSpriteProps) {
  // Eye pupil offset based on lookDirection
  const pupilOffsetX = lookDirection === 'left' ? -2 : lookDirection === 'right' ? 2 : 0;
  const pupilOffsetY = lookDirection === 'up' ? -2 : 0;

  return (
    <svg
      viewBox="0 0 100 120"
      className="companion-rig-svg"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <defs>
        <filter id="owl-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={ambientColor} floodOpacity="0.6" />
        </filter>
      </defs>

      {/* ── 1. Contact Talons / Ground Claws on Pedestal ── */}
      <g className="bone-talons" fill="#d97706">
        {/* Left Talon */}
        <rect x="36" y="104" width="8" height="4" rx="1" />
        <rect x="34" y="106" width="4" height="3" fill="#b45309" />
        <rect x="40" y="106" width="4" height="3" fill="#b45309" />
        {/* Right Talon */}
        <rect x="56" y="104" width="8" height="4" rx="1" />
        <rect x="54" y="106" width="4" height="3" fill="#b45309" />
        <rect x="60" y="106" width="4" height="3" fill="#b45309" />
      </g>

      {/* ── 2. Back Wing Bone ── */}
      <g className="bone-wing-left">
        {/* Deep Emerald Back Wing Feathers */}
        <path
          d="M24,54 L34,50 L38,78 L28,84 L18,74 Z"
          fill="#064e3b"
        />
        <path
          d="M20,60 L30,56 L34,76 L24,80 Z"
          fill="#047857"
        />
        <path
          d="M16,68 L24,64 L28,78 L18,80 Z"
          fill="#059669"
        />
      </g>

      {/* ── 3. Central Torso Bone (Spine Root) ── */}
      <g className="bone-torso">
        {/* Scholar Robe & Body Trunk */}
        <path
          d="M32,46 L68,46 L76,96 L24,96 Z"
          fill="#065f46"
        />
        {/* Robe Inner Tunic / Cream Chest Feathers */}
        <path
          d="M40,50 L60,50 L64,88 L36,88 Z"
          fill="#fef3c7"
        />
        {/* Chest Feather Runes */}
        <rect x="44" y="58" width="12" height="3" fill="#d97706" />
        <rect x="42" y="66" width="16" height="3" fill="#d97706" />
        <rect x="46" y="74" width="8" height="3" fill="#d97706" />

        {/* Gold Filigree Belt & Gem */}
        <rect x="30" y="86" width="40" height="4" fill="#b45309" />
        <rect x="46" y="84" width="8" height="8" fill="#fbbf24" filter="url(#owl-glow)" />
        <rect x="48" y="86" width="4" height="4" fill="#10b981" />

        {/* ── 4. Front Wing / Arm Bone (Holding Book) ── */}
        <g className="bone-wing-right">
          {/* Main Front Wing */}
          <path
            d="M66,48 L80,56 L84,82 L66,80 L62,60 Z"
            fill="#059669"
          />
          <path
            d="M68,54 L78,60 L80,78 L68,76 Z"
            fill="#10b981"
          />
          <path
            d="M72,62 L82,68 L82,78 L72,76 Z"
            fill="#34d399"
          />

          {/* ── 5. Ancient Runic Tome (Held Prop) ── */}
          <g className="bone-prop-book" transform="translate(54, 62)">
            {/* Book Leather Cover */}
            <rect x="0" y="0" width="28" height="22" rx="2" fill="#78350f" />
            <rect x="1" y="1" width="26" height="20" fill="#92400e" />
            {/* Gold Corner Clasps */}
            <rect x="0" y="0" width="4" height="4" fill="#fbbf24" />
            <rect x="24" y="0" width="4" height="4" fill="#fbbf24" />
            <rect x="0" y="18" width="4" height="4" fill="#fbbf24" />
            <rect x="24" y="18" width="4" height="4" fill="#fbbf24" />
            {/* Parchment Pages */}
            <rect x="4" y="3" width="20" height="16" fill="#fef9c3" />
            {/* Glowing Magic Script */}
            <rect x="6" y="6" width="7" height="2" fill="#059669" />
            <rect x="6" y="10" width="6" height="2" fill="#059669" />
            <rect x="6" y="14" width="7" height="2" fill="#059669" />
            <rect x="15" y="6" width="7" height="2" fill="#10b981" />
            <rect x="15" y="10" width="6" height="2" fill="#10b981" />
            <rect x="15" y="14" width="7" height="2" fill="#10b981" />
            {/* Central Emerald Glyph */}
            <rect x="12" y="9" width="4" height="4" fill="#34d399" filter="url(#owl-glow)" />
          </g>
        </g>

        {/* ── 6. Articulated Head & Cowl Bone ── */}
        <g className="bone-head">
          {/* Emerald Hooded Cowl */}
          <path
            d="M26,24 L74,24 L78,48 L22,48 Z"
            fill="#064e3b"
          />
          {/* Owl Ear Tufts */}
          <polygon points="24,24 20,8 32,20" fill="#047857" />
          <polygon points="22,22 18,10 28,18" fill="#065f46" />
          <polygon points="76,24 80,8 68,20" fill="#047857" />
          <polygon points="78,22 82,10 72,18" fill="#065f46" />

          {/* Cowl Face Opening */}
          <rect x="28" y="24" width="44" height="24" rx="4" fill="#065f46" />
          <rect x="30" y="26" width="40" height="20" rx="3" fill="#fef3c7" />

          {/* ── 7. Eyes & Spectacles Layer ── */}
          <g className={`bone-eyes ${isBlinking ? 'is-blinking' : ''}`}>
            {/* Open Eyes State */}
            <g className="eye-open-part">
              {/* Left Eye Sclera */}
              <circle cx="40" cy="35" r="7" fill="#fbbf24" />
              <circle cx="40" cy="35" r="5" fill="#d97706" />
              {/* Left Pupil (Look Tracking) */}
              <circle cx={40 + pupilOffsetX} cy={35 + pupilOffsetY} r="3" fill="#1e1b4b" />
              <circle cx={39 + pupilOffsetX} cy={34 + pupilOffsetY} r="1" fill="#ffffff" />

              {/* Right Eye Sclera */}
              <circle cx="60" cy="35" r="7" fill="#fbbf24" />
              <circle cx="60" cy="35" r="5" fill="#d97706" />
              {/* Right Pupil (Look Tracking) */}
              <circle cx={60 + pupilOffsetX} cy={35 + pupilOffsetY} r="3" fill="#1e1b4b" />
              <circle cx={59 + pupilOffsetX} cy={34 + pupilOffsetY} r="1" fill="#ffffff" />
            </g>

            {/* Closed / Blinking Eyes State */}
            <g className="eye-closed-part">
              <path d="M34,35 Q40,39 46,35" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M54,35 Q60,39 66,35" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>

            {/* Gold Wire Spectacles */}
            <circle cx="40" cy="35" r="8" fill="none" stroke="#fbbf24" strokeWidth="1.8" filter="url(#owl-glow)" />
            <circle cx="60" cy="35" r="8" fill="none" stroke="#fbbf24" strokeWidth="1.8" filter="url(#owl-glow)" />
            {/* Glasses Bridge */}
            <line x1="48" y1="35" x2="52" y2="35" stroke="#fbbf24" strokeWidth="1.8" />
            {/* Glasses Glass Glint */}
            <line x1="36" y1="31" x2="42" y2="31" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
            <line x1="56" y1="31" x2="62" y2="31" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
          </g>

          {/* Golden Curved Beak */}
          <polygon points="46,38 54,38 50,47" fill="#f59e0b" />
          <polygon points="48,39 52,39 50,45" fill="#fbbf24" />
        </g>
      </g>
    </svg>
  );
}

export default OwlSpriteLayers;
