// src/components/companion/sprites/BotSpriteLayers.tsx
import React from 'react';

interface BotSpriteProps {
  isBlinking: boolean;
  lookDirection: 'center' | 'left' | 'right' | 'up';
  ambientColor?: string;
}

export function BotSpriteLayers({
  isBlinking,
  lookDirection,
  ambientColor = '#38bdf8',
}: BotSpriteProps) {
  const visorShiftX = lookDirection === 'left' ? -3 : lookDirection === 'right' ? 3 : 0;
  const visorShiftY = lookDirection === 'up' ? -2 : 0;

  return (
    <svg
      viewBox="0 0 100 120"
      className="companion-rig-svg"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <defs>
        <filter id="bot-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={ambientColor} floodOpacity="0.8" />
        </filter>
        <linearGradient id="staff-core-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      {/* ── 1. Pedestal Magnetic Foot Thrusters ── */}
      <g className="bone-bot-thrusters" fill="#1e293b">
        {/* Left Foot Pad */}
        <rect x="34" y="104" width="12" height="4" rx="1" fill="#0f172a" />
        <rect x="36" y="102" width="8" height="3" fill="#334155" />
        <rect x="37" y="106" width="6" height="2" fill="#38bdf8" filter="url(#bot-glow)" />
        {/* Right Foot Pad */}
        <rect x="54" y="104" width="12" height="4" rx="1" fill="#0f172a" />
        <rect x="56" y="102" width="8" height="3" fill="#334155" />
        <rect x="57" y="106" width="6" height="2" fill="#38bdf8" filter="url(#bot-glow)" />
      </g>

      {/* ── 2. Back Energy Heat Sinks ── */}
      <g className="bone-wing-left">
        <path d="M22,50 L32,46 L34,74 L20,78 Z" fill="#0f172a" />
        <rect x="22" y="54" width="4" height="2" fill="#38bdf8" filter="url(#bot-glow)" />
        <rect x="22" y="60" width="4" height="2" fill="#38bdf8" filter="url(#bot-glow)" />
        <rect x="22" y="66" width="4" height="2" fill="#38bdf8" filter="url(#bot-glow)" />
      </g>

      {/* ── 3. Central Chassis & Torso (Spine Root) ── */}
      <g className="bone-torso">
        {/* Obsidian Armored Chassis */}
        <path d="M30,46 L70,46 L76,96 L24,96 Z" fill="#0f172a" />
        {/* Gold Filigree Armor Plates */}
        <rect x="28" y="48" width="44" height="4" fill="#d97706" />
        <rect x="30" y="50" width="40" height="2" fill="#fbbf24" />

        {/* Inner Reactor Chest Housing */}
        <rect x="36" y="56" width="28" height="28" rx="2" fill="#1e293b" />
        <rect x="38" y="58" width="24" height="24" fill="#020617" />

        {/* Glowing Chrono-Reactor Core */}
        <circle cx="50" cy="70" r="8" fill="#0284c7" />
        <circle cx="50" cy="70" r="6" fill="#38bdf8" filter="url(#bot-glow)" />
        <circle cx="50" cy="70" r="3" fill="#e0f2fe" />
        {/* Circuit Lines */}
        <line x1="38" y1="70" x2="42" y2="70" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="58" y1="70" x2="62" y2="70" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="50" y1="58" x2="50" y2="62" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="50" y1="78" x2="50" y2="82" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Chassis Waist Belt */}
        <rect x="26" y="88" width="48" height="6" fill="#1e293b" />
        <rect x="44" y="87" width="12" height="8" fill="#d97706" />
        <rect x="46" y="89" width="8" height="4" fill="#38bdf8" filter="url(#bot-glow)" />

        {/* ── 4. Mechanical Right Arm holding Arcane Chrono-Staff ── */}
        <g className="bone-prop-staff">
          {/* Upper Arm & Forearm */}
          <rect x="68" y="50" width="8" height="18" rx="2" fill="#334155" />
          <circle cx="72" cy="68" r="4" fill="#d97706" />
          <rect x="70" y="68" width="6" height="16" fill="#1e293b" />

          {/* Mechanical Claw Hand */}
          <rect x="68" y="82" width="10" height="6" rx="1" fill="#475569" />

          {/* Chrono-Staff Shaft */}
          <rect x="72" y="24" width="4" height="80" rx="1" fill="#78350f" />
          <rect x="73" y="24" width="2" height="80" fill="#d97706" />

          {/* Staff Headpiece Wings */}
          <path d="M64,28 L74,18 L84,28 L78,32 L74,24 L70,32 Z" fill="#d97706" />
          <path d="M66,28 L74,20 L82,28 Z" fill="#fbbf24" />

          {/* ── 5. Floating Levitating Gyro Crystal Orb ── */}
          <g className="bone-staff-orb" transform="translate(74, 14)">
            <polygon
              points="0,-8 6,0 0,8 -6,0"
              fill="url(#staff-core-grad)"
              filter="url(#bot-glow)"
            />
            <polygon points="0,-4 3,0 0,4 -3,0" fill="#ffffff" opacity="0.9" />
          </g>
        </g>

        {/* ── 6. Articulated Head Chassis Bone ── */}
        <g className="bone-head">
          {/* Antenna / Communication Array */}
          <line x1="50" y1="20" x2="50" y2="10" stroke="#d97706" strokeWidth="2" />
          <circle cx="50" cy="8" r="3" fill="#38bdf8" filter="url(#bot-glow)" />
          {/* Side Sensor Fins */}
          <polygon points="26,26 20,20 26,34" fill="#d97706" />
          <polygon points="74,26 80,20 74,34" fill="#d97706" />

          {/* Main Head Obsidian Chassis */}
          <rect x="26" y="20" width="48" height="28" rx="4" fill="#0f172a" />
          <rect x="28" y="22" width="44" height="24" rx="3" fill="#1e293b" />

          {/* ── 7. Visor & Optical Scanning System ── */}
          <rect x="32" y="28" width="36" height="12" rx="2" fill="#020617" />

          <g className={`bone-eyes ${isBlinking ? 'is-blinking' : ''}`}>
            {/* Open / Active Visor Scanning State */}
            <g className="eye-open-part" transform={`translate(${visorShiftX}, ${visorShiftY})`}>
              {/* Sapphire Visor Full Bar */}
              <rect x="34" y="30" width="32" height="8" rx="1" fill="#0284c7" />
              <rect x="35" y="31" width="30" height="6" fill="#38bdf8" filter="url(#bot-glow)" />
              {/* Central Glowing Laser Scanner Pulse */}
              <rect x="46" y="31" width="8" height="6" fill="#ffffff" opacity="0.95" className="bone-bot-scanline" />
            </g>

            {/* Closed / Sleep / Power-save Visor Pulse */}
            <g className="eye-closed-part">
              <rect x="36" y="33" width="28" height="2" fill="#0284c7" opacity="0.4" />
            </g>
          </g>

          {/* Speaker / Vocoder Grid */}
          <rect x="42" y="43" width="16" height="2" fill="#0f172a" />
          <line x1="44" y1="43" x2="44" y2="45" stroke="#38bdf8" strokeWidth="1" />
          <line x1="48" y1="43" x2="48" y2="45" stroke="#38bdf8" strokeWidth="1" />
          <line x1="52" y1="43" x2="52" y2="45" stroke="#38bdf8" strokeWidth="1" />
          <line x1="56" y1="43" x2="56" y2="45" stroke="#38bdf8" strokeWidth="1" />
        </g>
      </g>
    </svg>
  );
}

export default BotSpriteLayers;
