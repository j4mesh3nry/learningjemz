import React from 'react';

type JemzMascotProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Scholarly owl mascot for LearningJemz.
 * Flat, stroke-based SVG following Lucide grammar (24×24 viewBox,
 * stroke="currentColor", strokeLinecap="round", strokeLinejoin="round").
 * Scaled via the `size` prop (default 64).
 */
export function JemzMascot({ size = 64, className, style }: JemzMascotProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Body – rounded owl torso */}
      <ellipse cx="12" cy="15" rx="6" ry="6.5" />

      {/* Head circle */}
      <circle cx="12" cy="7" r="5" />

      {/* Left ear tuft */}
      <path d="M8.5 3.5 L7 1 L9.5 3" />

      {/* Right ear tuft */}
      <path d="M15.5 3.5 L17 1 L14.5 3" />

      {/* Left eye */}
      <circle cx="10" cy="7" r="1.4" />
      <circle cx="10.3" cy="6.7" r="0.4" fill="currentColor" stroke="none" />

      {/* Right eye */}
      <circle cx="14" cy="7" r="1.4" />
      <circle cx="14.3" cy="6.7" r="0.4" fill="currentColor" stroke="none" />

      {/* Beak */}
      <path d="M11.2 8.8 L12 10 L12.8 8.8" />

      {/* Graduation cap – flat top */}
      <path d="M6.5 4.5 L12 2 L17.5 4.5 L12 6.5 Z" />
      {/* Cap tassel */}
      <path d="M17.5 4.5 L18 7" />

      {/* Gem crest on chest */}
      <path d="M10.5 14 L12 12.5 L13.5 14 L12 16.5 Z" />

      {/* Left wing hint */}
      <path d="M6 14 Q4 15 5.5 17.5" />

      {/* Right wing hint */}
      <path d="M18 14 Q20 15 18.5 17.5" />

      {/* Feet */}
      <path d="M9.5 21 L8.5 22.5" />
      <path d="M10.5 21 L10.5 22.5" />
      <path d="M13.5 21 L14.5 22.5" />
      <path d="M14.5 21 L13.5 22.5" />
    </svg>
  );
}
