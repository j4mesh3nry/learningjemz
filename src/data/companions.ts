// src/data/companions.ts

export interface CompanionConfig {
  id: string;
  name: string;
  species: string;
  title: string;
  traits: [string, string, string];
  ambientColor: string;
  description: string;
}

export const COMPANION_REGISTRY: Record<string, CompanionConfig> = {
  owl: {
    id: 'owl',
    name: 'Archimedes',
    species: 'Sage Owl',
    title: 'The Wise Scholar',
    traits: ['Wise', 'Calm', 'Curious'],
    ambientColor: '#34d399',
    description: 'A scholarly mystic guide carrying ancient glowing tomes and observing the realm with quiet wisdom.',
  },
  fox: {
    id: 'fox',
    name: 'Aura',
    species: 'Stellar Fox',
    title: 'The Celestial Guide',
    traits: ['Playful', 'Brave', 'Energetic'],
    ambientColor: '#f59e0b',
    description: 'A mystical spirit fox with stardust fur, three celestial glowing tails, and a sunburst amulet.',
  },
  bot: {
    id: 'bot',
    name: 'Nexus',
    species: 'Chrono-Bot',
    title: 'The Arcane Automaton',
    traits: ['Techy', 'Friendly', 'Helpful'],
    ambientColor: '#38bdf8',
    description: 'An ancient arcane robot with a glowing sapphire visor screen, leaf sprout antenna, and runic holographic display.',
  },
};

// Aliases mapping
const ALIAS_MAP: Record<string, string> = {
  user: 'owl',
  robot: 'bot',
  '🦉': 'owl',
  '🦊': 'fox',
  '🤖': 'bot',
  'cat': 'fox',
};

/**
 * Resolves a companion config by avatar ID or falls back to default Archimedes the Sage Owl.
 */
export function getCompanion(avatarKey?: string | null): CompanionConfig {
  if (!avatarKey) return COMPANION_REGISTRY.owl;
  const key = avatarKey.toLowerCase().trim();
  const resolvedKey = ALIAS_MAP[key] || key;
  return COMPANION_REGISTRY[resolvedKey] || COMPANION_REGISTRY.owl;
}

export const COMPANION_LIST: CompanionConfig[] = [
  COMPANION_REGISTRY.owl,
  COMPANION_REGISTRY.fox,
  COMPANION_REGISTRY.bot,
];
