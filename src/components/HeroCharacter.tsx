import React, { useState } from 'react';

type HeroCharacterProps = {
  avatar?: string | null;
  characterType?: string;
  className?: string;
  style?: React.CSSProperties;
};

// Map avatar keys to transparent companion assets
const AVATAR_MAP: Record<string, string> = {
  '🦉': '/images/characters/owl.png',
  'owl': '/images/characters/owl.png',
  'user': '/images/characters/owl.png',
  'bot': '/images/characters/owl.png',
  'robot': '/images/characters/owl.png',
};

/**
 * 2-Layer Hero Companion Slot component.
 * Positions the user's active companion on the cliff ledge of the landscape hero,
 * with subtle idle floating/breathing animation and interactive tap reactions.
 */
export function HeroCharacter({
  avatar,
  characterType = 'owl',
  className = '',
  style = {},
}: HeroCharacterProps) {
  const [isBouncing, setIsBouncing] = useState(false);
  const currentAvatar = (avatar || characterType).toLowerCase().trim();
  const imageSrc = AVATAR_MAP[currentAvatar] || '/images/characters/owl.jpg';

  const handleTap = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 500);
  };

  return (
    <div
      className={`hero-companion-wrapper ${isBouncing ? 'bounce' : ''} ${className}`.trim()}
      style={style}
      onClick={handleTap}
      role="img"
      aria-label={`Hero companion: ${currentAvatar}`}
      title="Companion (Tap to interact)"
    >
      {/* Stone cliff contact shadow */}
      <div className="hero-companion-shadow" />

      {/* Companion figure container */}
      <div className="hero-companion-figure">
        <img
          src={imageSrc}
          alt={currentAvatar}
          className="hero-companion-img"
          onError={(e) => {
            // Graceful fallback to default owl if image is missing
            (e.target as HTMLImageElement).src = '/images/characters/owl.png';
          }}
        />
      </div>
    </div>
  );
}

export default HeroCharacter;

