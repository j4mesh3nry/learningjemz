import React from 'react';

type HeroCharacterProps = {
  avatar?: string | null;
  characterType?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Flexible Hero Character component.
 * Currently renders the default Owl scholar placeholder on the scenic ledge.
 * Structured to easily swap in custom avatar/character illustrations per user in future updates.
 */
export function HeroCharacter({
  avatar,
  characterType = 'owl',
  size = 140,
  className = '',
  style = {},
}: HeroCharacterProps) {
  // When custom user avatar characters are provided in the future, we can map them here:
  // e.g., if (avatar === 'robot') return <RobotCharacter size={size} />;
  // For now, the owl is the default placeholder companion.
  return (
    <div
      className={`hero-character-slot ${className}`.trim()}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      aria-label={avatar ? `Hero avatar: ${avatar}` : 'Hero character companion'}
    >
      {/* Default placeholder character graphic slot */}
      <img
        src="/images/home-hero.jpg"
        alt="Hero companion character"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'right 20% center',
          borderRadius: 16,
          display: 'none', // Background image is rendered in .home-hero-scene
        }}
      />
    </div>
  );
}

export default HeroCharacter;
