// src/components/icons/HeartCrackIcon.tsx
// Custom flat stroke-based SVG icon (Lucide grammar: 24x24, stroke, no fill)
import React from 'react';

interface HeartCrackIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export default function HeartCrackIcon({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className,
}: HeartCrackIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.49 4.04 3 5.5l7 7Z" />
      <path d="M11.5 5.2 10 8.6l3.2 1.8-2.4 2.7" />
      <path d="M13.2 10.4 15 11.2" />
    </svg>
  );
}