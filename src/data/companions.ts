// src/data/companions.ts

export interface CompanionConfig {
  id: string;
  name: string;
  species: string;
  title: string;
  bodySrc: string;
  avatarSrc: string;
  scale: number;
  anchorOffset: { x: number; y: number };
  ambientColor: string;
  description: string;
}

export const COMPANION_REGISTRY: Record<string, CompanionConfig> = {
  owl: {
    id: 'owl',
    name: 'Archimedes',
    species: 'Sage Owl',
    title: 'The Wise Scholar',
    bodySrc: '/images/characters/owl-pixel.png',
    avatarSrc: '/images/characters/owl-avatar-pixel.png',
    scale: 1.0,
    anchorOffset: { x: 0, y: 0 },
    ambientColor: '#34d399',
    description: 'A 32-bit scholarly companion perched on a mossy rune pillar, carrying ancient scrolls.',
  },
  user: {
    id: 'user',
    name: 'Archimedes',
    species: 'Sage Owl',
    title: 'The Wise Scholar',
    bodySrc: '/images/characters/owl-pixel.png',
    avatarSrc: '/images/characters/owl-avatar-pixel.png',
    scale: 1.0,
    anchorOffset: { x: 0, y: 0 },
    ambientColor: '#34d399',
    description: 'A 32-bit scholarly companion perched on a mossy rune pillar, carrying ancient scrolls.',
  },
  bot: {
    id: 'bot',
    name: 'Archimedes',
    species: 'Sage Owl',
    title: 'The Wise Scholar',
    bodySrc: '/images/characters/owl-pixel.png',
    avatarSrc: '/images/characters/owl-avatar-pixel.png',
    scale: 1.0,
    anchorOffset: { x: 0, y: 0 },
    ambientColor: '#38bdf8',
    description: 'A 32-bit scholarly companion perched on a mossy rune pillar, carrying ancient scrolls.',
  },
  robot: {
    id: 'robot',
    name: 'Archimedes',
    species: 'Sage Owl',
    title: 'The Wise Scholar',
    bodySrc: '/images/characters/owl-pixel.png',
    avatarSrc: '/images/characters/owl-avatar-pixel.png',
    scale: 1.0,
    anchorOffset: { x: 0, y: 0 },
    ambientColor: '#38bdf8',
    description: 'A 32-bit scholarly companion perched on a mossy rune pillar, carrying ancient scrolls.',
  },
};

/**
 * Resolves a companion config by avatar ID or falls back to default Archimedes the Sage Owl.
 */
export function getCompanion(avatarKey?: string | null): CompanionConfig {
  if (!avatarKey) return COMPANION_REGISTRY.owl;
  const key = avatarKey.toLowerCase().trim();
  return COMPANION_REGISTRY[key] || COMPANION_REGISTRY.owl;
}
