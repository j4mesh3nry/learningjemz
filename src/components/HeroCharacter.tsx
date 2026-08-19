import React from 'react';

type HeroCharacterProps = {
  avatar?: string | null;
  characterType?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

// Map avatar emojis/names to image assets
const AVATAR_MAP: Record<string, string> = {
  '🦉': '/images/characters/owl.jpg',
  'owl': '/images/characters/owl.jpg',
};

/**
 * 2-Layer Hero Character Slot component.
 * Allows placing user-selected avatar companions onto the scenic cliff ledge.
 */
export function HeroCharacter({
  avatar,
  characterType = 'owl',
  size = 130,
  className = '',
  style = {},
}: HeroCharacterProps) {
  const currentAvatar = avatar || characterType;
  const isDefaultOwl = !avatar || avatar === 'owl' || avatar === '🦉';

  // If using default owl, it is already seamlessly painted into the default landscape scene
  if (isDefaultOwl) {
    return null;
  }

  // If the user selected another companion avatar, render the companion on the cliff ledge
  const imageSrc = AVATAR_MAP[currentAvatar] || '/images/characters/owl.jpg';

  return (
    <div
      className={`hero-character-overlay ${className}`.trim()}
      style={{
        position: 'absolute',
        right: '6%',
        bottom: '12%',
        width: size,
        height: size,
        zIndex: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        ...style,
      }}
      aria-label={`Hero avatar companion: ${currentAvatar}`}
    >
      <img
        src={imageSrc}
        alt={currentAvatar}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '20px',
          border: '2px solid rgba(52, 211, 153, 0.4)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.75)',
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8))',
        }}
        onError={(e) => {
          // Graceful fallback if image is missing
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    </div>
  );
}

export default HeroCharacter;
