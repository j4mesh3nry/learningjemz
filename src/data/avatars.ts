// src/data/avatars.ts
import { Bird, Bot, Cat, type LucideIcon } from 'lucide-react';

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
