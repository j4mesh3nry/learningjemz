import React from 'react';

type HeroCharacterProps = {
  avatar?: string | null;
  characterType?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Flexible Hero Character Slot component.
 * Allows rendering user avatar illustrations / companions on the hero ledge.
 * When no custom avatar is set, the default owl companion on the scenic background is displayed.
 */
export function HeroCharacter({
  avatar,
  characterType = 'owl',
  size = 140,
  className = '',
  style = {},
}: HeroCharacterProps) {
  // If user has a custom avatar selected, render the custom overlay character
  if (avatar && avatar !== 'owl') {
    return (
      <div
        className={`hero-character-overlay ${className}`.trim()}
        style={{
          position: 'absolute',
          right: '8%',
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
        aria-label={`User companion: ${avatar}`}
      >
        <img
          src={`/images/characters/${avatar}.png`}
          alt={avatar}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.6))',
          }}
          onError={(e) => {
            // Fallback gracefully if custom character image isn't loaded
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Default mode: Owl companion is seamlessly integrated with the landscape
  return (
    <div
      className={`hero-character-slot ${className}`.trim()}
      style={{
        position: 'absolute',
        right: '6%',
        bottom: '8%',
        width: size,
        height: size,
        pointerEvents: 'none',
        ...style,
      }}
      aria-label="Default companion: Owl scholar"
    />
  );
}

export default HeroCharacter;
