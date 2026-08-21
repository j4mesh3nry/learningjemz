// src/components/AvatarIcon.tsx
import React from 'react';
import {
  User,
  Bot,
  Sparkles,
  Crown,
  Shield,
  Zap,
  Star,
  Flame,
  Rocket,
  Globe,
  Gem,
  Smile,
  Compass,
  Trophy,
  Target,
  Heart,
  Gamepad2,
  Bird,
  Cat,
  Dog,
  Ghost,
  type LucideIcon,
} from 'lucide-react';

export interface AvatarOption {
  id: string;
  label: string;
  icon: LucideIcon;
  color?: string;
  bg?: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'owl', label: 'Archimedes (Sage Owl)', icon: Bird, color: '#34d399', bg: '#041d13' },
  { id: 'bot', label: 'Nexus (Chrono-Bot)', icon: Bot, color: '#38bdf8', bg: '#041829' },
  { id: 'fox', label: 'Aura (Stellar Fox)', icon: Cat, color: '#f59e0b', bg: '#261404' },
];

const PIXEL_AVATARS: Record<string, { src: string; alt: string; border: string }> = {
  owl: { src: '/images/characters/owl-avatar-pixel.png', alt: 'Archimedes the Sage Owl', border: '#34d399' },
  '🦉': { src: '/images/characters/owl-avatar-pixel.png', alt: 'Archimedes the Sage Owl', border: '#34d399' },
  bot: { src: '/images/characters/bot-avatar-pixel.png', alt: 'Nexus the Chrono-Bot', border: '#38bdf8' },
  robot: { src: '/images/characters/bot-avatar-pixel.png', alt: 'Nexus the Chrono-Bot', border: '#38bdf8' },
  '🤖': { src: '/images/characters/bot-avatar-pixel.png', alt: 'Nexus the Chrono-Bot', border: '#38bdf8' },
  fox: { src: '/images/characters/fox-avatar-pixel.png', alt: 'Aura the Stellar Fox', border: '#f59e0b' },
  '🦊': { src: '/images/characters/fox-avatar-pixel.png', alt: 'Aura the Stellar Fox', border: '#f59e0b' },
};

const AVATAR_ICON_MAP: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  user: { icon: User, color: '#16653e', bg: '#e1f0e2' },
  bot: { icon: Bot, color: '#2563eb', bg: '#dbeafe' },
  robot: { icon: Bot, color: '#2563eb', bg: '#dbeafe' },
  sparkles: { icon: Sparkles, color: '#9333ea', bg: '#f3e8ff' },
  crown: { icon: Crown, color: '#d97706', bg: '#fef3c7' },
  shield: { icon: Shield, color: '#059669', bg: '#d1fae5' },
  zap: { icon: Zap, color: '#ca8a04', bg: '#fef9c3' },
  star: { icon: Star, color: '#eab308', bg: '#fef08a' },
  flame: { icon: Flame, color: '#dc2626', bg: '#fee2e2' },
  rocket: { icon: Rocket, color: '#0284c7', bg: '#e0f2fe' },
  globe: { icon: Globe, color: '#0d9488', bg: '#ccfbf1' },
  gem: { icon: Gem, color: '#16a34a', bg: '#dcfce7' },
  smile: { icon: Smile, color: '#ea580c', bg: '#ffedd5' },
  compass: { icon: Compass, color: '#4f46e5', bg: '#e0e7ff' },
  trophy: { icon: Trophy, color: '#b45309', bg: '#fef3c7' },
  target: { icon: Target, color: '#be123c', bg: '#ffe4e6' },
  heart: { icon: Heart, color: '#e11d48', bg: '#ffe4e6' },
  gamepad: { icon: Gamepad2, color: '#7c3aed', bg: '#ede9fe' },
  owl: { icon: Bird, color: '#15803d', bg: '#dcfce7' },
  cat: { icon: Cat, color: '#ea580c', bg: '#ffedd5' },
  fox: { icon: Cat, color: '#ea580c', bg: '#ffedd5' },
  dog: { icon: Dog, color: '#b45309', bg: '#fef3c7' },
  ghost: { icon: Ghost, color: '#6366f1', bg: '#e0e7ff' },

  // Graceful fallback mappings for legacy emoji avatar strings in Supabase
  '👤': { icon: User, color: '#16653e', bg: '#e1f0e2' },
  '🤖': { icon: Bot, color: '#2563eb', bg: '#dbeafe' },
  '🦉': { icon: Bird, color: '#15803d', bg: '#dcfce7' },
  '🦊': { icon: Cat, color: '#ea580c', bg: '#ffedd5' },
  '🐱': { icon: Cat, color: '#ea580c', bg: '#ffedd5' },
  '🐶': { icon: Dog, color: '#b45309', bg: '#fef3c7' },
  '🐯': { icon: Cat, color: '#d97706', bg: '#fef3c7' },
  '🦁': { icon: Cat, color: '#d97706', bg: '#fef3c7' },
  '🐼': { icon: Dog, color: '#059669', bg: '#d1fae5' },
  '🐸': { icon: Smile, color: '#16a34a', bg: '#dcfce7' },
  '🦄': { icon: Sparkles, color: '#9333ea', bg: '#f3e8ff' },
  '👽': { icon: Ghost, color: '#6366f1', bg: '#e0e7ff' },
  '🦸‍♂️': { icon: Shield, color: '#dc2626', bg: '#fee2e2' },
  '👩‍🚀': { icon: Rocket, color: '#0284c7', bg: '#e0f2fe' },
  '👑': { icon: Crown, color: '#d97706', bg: '#fef3c7' },
  '🐉': { icon: Sparkles, color: '#9333ea', bg: '#f3e8ff' },
};

interface AvatarIconProps {
  avatar?: string | null;
  size?: number;
  iconSize?: number;
  color?: string;
  bg?: string;
  className?: string;
  style?: React.CSSProperties;
  bordered?: boolean;
}

export function AvatarIcon({
  avatar,
  size = 40,
  iconSize,
  color,
  bg,
  className = '',
  style = {},
  bordered = false,
}: AvatarIconProps) {
  const key = (avatar || 'user').toLowerCase().trim();

  // If avatar is one of our 32-bit pixel mythic companions, render the rich medallion
  const pixelMedallion = PIXEL_AVATARS[key] || (key === 'user' ? PIXEL_AVATARS.owl : undefined);
  if (pixelMedallion) {
    return (
      <div
        data-testid={`avatar-icon-${key}`}
        aria-label={`Avatar: ${key}`}
        className={`avatar-icon-container avatar-icon-pixel ${className}`.trim()}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          background: '#041d13',
          border: bordered ? `2px solid ${pixelMedallion.border}` : 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
          ...style,
        }}
      >
        <img
          src={pixelMedallion.src}
          alt={pixelMedallion.alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            imageRendering: 'pixelated',
          }}
        />
      </div>
    );
  }

  const config = AVATAR_ICON_MAP[key] || AVATAR_ICON_MAP[avatar || ''] || AVATAR_ICON_MAP.user;
  const IconComponent = config.icon;
  const resolvedColor = color || config.color;
  const resolvedBg = bg || config.bg;
  const calculatedIconSize = iconSize || Math.round(size * 0.55);

  return (
    <div
      data-testid={`avatar-icon-${key}`}
      aria-label={`Avatar: ${key}`}
      className={`avatar-icon-container ${className}`.trim()}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        background: resolvedBg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: bordered ? `2px solid ${resolvedColor}` : 'none',
        flexShrink: 0,
        ...style,
      }}
    >
      <IconComponent size={calculatedIconSize} color={resolvedColor} strokeWidth={2.2} />
    </div>
  );
}

export default AvatarIcon;
