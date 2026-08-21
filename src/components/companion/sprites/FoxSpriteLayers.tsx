// src/components/companion/sprites/FoxSpriteLayers.tsx
import React from 'react';

interface FoxSpriteProps {
  isBlinking: boolean;
  lookDirection: 'center' | 'left' | 'right' | 'up';
  ambientColor?: string;
}

export function FoxSpriteLayers({
  isBlinking,
  lookDirection,
  ambientColor = '#f59e0b',
}: FoxSpriteProps) {
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
        <filter id="fox-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={ambientColor} floodOpacity="0.7" />
        </filter>
      </defs>

      {/* ── 1. 3 Celestial Sinuous Tails (Back Layer with Phase Delay) ── */}
      {/* Left Tail */}
      <g className="bone-tail-left">
        <path
          d="M34,80 C18,70 6,50 12,30 C18,36 28,48 38,72 Z"
          fill="#d97706"
        />
        <path
          d="M30,76 C18,66 10,48 14,32 C18,38 24,48 34,70 Z"
          fill="#f59e0b"
        />
        {/* Glowing Celestial Tip */}
        <polygon points="12,30 16,36 14,44 8,38" fill="#fef08a" filter="url(#fox-glow)" />
      </g>

      {/* Center Tail */}
      <g className="bone-tail-center">
        <path
          d="M48,82 C34,60 30,34 50,18 C58,32 58,54 54,80 Z"
          fill="#b45309"
        />
        <path
          d="M47,78 C36,58 34,36 48,22 C54,34 54,54 51,76 Z"
          fill="#f59e0b"
        />
        {/* Glowing Tip */}
        <polygon points="50,18 46,26 54,26" fill="#fef08a" filter="url(#fox-glow)" />
      </g>

      {/* Right Tail */}
      <g className="bone-tail-right">
        <path
          d="M62,80 C78,70 90,50 84,30 C78,36 68,48 58,72 Z"
          fill="#d97706"
        />
        <path
          d="M66,76 C78,66 86,48 82,32 C78,38 72,48 62,70 Z"
          fill="#f59e0b"
        />
        {/* Glowing Tip */}
        <polygon points="84,30 80,36 82,44 88,38" fill="#fef08a" filter="url(#fox-glow)" />
      </g>

      {/* ── 2. Pedestal Perched Paws ── */}
      <g className="bone-paws">
        {/* Left Paws */}
        <rect x="36" y="104" width="8" height="4" rx="1" fill="#f59e0b" />
        <rect x="37" y="106" width="6" height="2" fill="#ffffff" />
        {/* Right Paws */}
        <rect x="56" y="104" width="8" height="4" rx="1" fill="#f59e0b" />
        <rect x="57" y="106" width="6" height="2" fill="#ffffff" />
      </g>

      {/* ── 3. Central Stardust Torso (Spine Root) ── */}
      <g className="bone-torso">
        {/* Main Body Fur */}
        <path
          d="M32,48 L68,48 L76,96 L24,96 Z"
          fill="#b45309"
        />
        <path
          d="M34,50 L66,50 L72,94 L28,94 Z"
          fill="#d97706"
        />

        {/* Fluffy White Celestial Chest Ruff */}
        <path
          d="M38,52 L62,52 L68,84 L32,84 Z"
          fill="#fffbeb"
        />
        <polygon points="50,88 44,78 56,78" fill="#fef3c7" />

        {/* Golden Spirit Filigree Pendant */}
        <circle cx="50" cy="74" r="5" fill="#f59e0b" filter="url(#fox-glow)" />
        <circle cx="50" cy="74" r="3" fill="#ef4444" />
        <circle cx="49" cy="73" r="1" fill="#ffffff" />

        {/* ── 4. Articulated Head Bone ── */}
        <g className="bone-head">
          {/* Left Ear with Independent Twitch Bone */}
          <g className="bone-ear-left">
            <polygon points="34,26 22,6 42,20" fill="#b45309" />
            <polygon points="33,24 24,10 39,20" fill="#d97706" />
            <polygon points="32,22 26,12 36,18" fill="#fef3c7" />
          </g>

          {/* Right Ear with Independent Twitch Bone */}
          <g className="bone-ear-right">
            <polygon points="66,26 78,6 58,20" fill="#b45309" />
            <polygon points="67,24 76,10 61,20" fill="#d97706" />
            <polygon points="68,22 74,12 64,18" fill="#fef3c7" />
          </g>

          {/* Main Fox Head Base */}
          <path
            d="M26,26 L74,26 L78,48 L50,56 L22,48 Z"
            fill="#d97706"
          />
          {/* White Cheek Fur */}
          <polygon points="24,44 38,44 32,54" fill="#ffffff" />
          <polygon points="76,44 62,44 68,54" fill="#ffffff" />

          {/* Forehead Celestial Star Mark */}
          <polygon points="50,28 52,32 56,33 52,35 50,39 48,35 44,33 48,32" fill="#fbbf24" filter="url(#fox-glow)" />

          {/* ── 5. Almond Fox Eyes Layer ── */}
          <g className={`bone-eyes ${isBlinking ? 'is-blinking' : ''}`}>
            {/* Open Eyes State */}
            <g className="eye-open-part">
              {/* Left Eye */}
              <ellipse cx="38" cy="38" rx="6" ry="4" fill="#1e1b4b" />
              <ellipse cx="38" cy="38" rx="4.5" ry="3" fill="#f59e0b" />
              <circle cx={38 + pupilOffsetX} cy={38 + pupilOffsetY} r="2" fill="#7f1d1d" />
              <circle cx={37 + pupilOffsetX} cy={37 + pupilOffsetY} r="1" fill="#ffffff" />

              {/* Right Eye */}
              <ellipse cx="62" cy="38" rx="6" ry="4" fill="#1e1b4b" />
              <ellipse cx="62" cy="38" rx="4.5" ry="3" fill="#f59e0b" />
              <circle cx={62 + pupilOffsetX} cy={38 + pupilOffsetY} r="2" fill="#7f1d1d" />
              <circle cx={61 + pupilOffsetX} cy={37 + pupilOffsetY} r="1" fill="#ffffff" />
            </g>

            {/* Closed / Blinking Eyes State */}
            <g className="eye-closed-part">
              <path d="M32,38 Q38,42 44,38" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M56,38 Q62,42 68,38" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          </g>

          {/* Snout & Little Black Nose */}
          <polygon points="46,46 54,46 50,52" fill="#fef3c7" />
          <polygon points="48,46 52,46 50,49" fill="#18181b" />
        </g>
      </g>
    </svg>
  );
}

export default FoxSpriteLayers;
