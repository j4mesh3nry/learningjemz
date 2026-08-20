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
  { id: 'user', label: 'Learner', icon: User, color: '#16653e', bg: '#e1f0e2' },
  { id: 'bot', label: 'Robot', icon: Bot, color: '#2563eb', bg: '#dbeafe' },
  { id: 'sparkles', label: 'Magic', icon: Sparkles, color: '#9333ea', bg: '#f3e8ff' },
  { id: 'crown', label: 'Royalty', icon: Crown, color: '#d97706', bg: '#fef3c7' },
  { id: 'shield', label: 'Guardian', icon: Shield, color: '#059669', bg: '#d1fae5' },
  { id: 'zap', label: 'Lightning', icon: Zap, color: '#ca8a04', bg: '#fef9c3' },
  { id: 'star', label: 'Starlight', icon: Star, color: '#eab308', bg: '#fef08a' },
  { id: 'flame', label: 'Fire', icon: Flame, color: '#dc2626', bg: '#fee2e2' },
  { id: 'rocket', label: 'Explorer', icon: Rocket, color: '#0284c7', bg: '#e0f2fe' },
  { id: 'globe', label: 'Cosmos', icon: Globe, color: '#0d9488', bg: '#ccfbf1' },
  { id: 'gem', label: 'Jem', icon: Gem, color: '#16a34a', bg: '#dcfce7' },
  { id: 'smile', label: 'Happy', icon: Smile, color: '#ea580c', bg: '#ffedd5' },
  { id: 'compass', label: 'Navigator', icon: Compass, color: '#4f46e5', bg: '#e0e7ff' },
  { id: 'trophy', label: 'Champion', icon: Trophy, color: '#b45309', bg: '#fef3c7' },
  { id: 'target', label: 'Sharpshooter', icon: Target, color: '#be123c', bg: '#ffe4e6' },
  { id: 'heart', label: 'Heart', icon: Heart, color: '#e11d48', bg: '#ffe4e6' },
  { id: 'gamepad', label: 'Gamer', icon: Gamepad2, color: '#7c3aed', bg: '#ede9fe' },
  { id: 'owl', label: 'Owl Companion', icon: Bird, color: '#15803d', bg: '#dcfce7' },
];

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
