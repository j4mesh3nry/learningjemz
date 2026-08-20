# LearningJemz — Mobile-Game Design System & Visual Architecture

> **Source of Truth for Visual Design, UI Components, Tokens, and Aesthetics.**  
> This document defines the visual philosophy, master color palettes, typography scales, component grammar, and layout rules for LearningJemz.

---

## 1. Design Philosophy

LearningJemz is engineered to feel like a **premium, atmospheric mobile game**, not a generic administrative dashboard or collection of flat cards.

### Core Visual Pillars:
1. **Atmospheric Immersion**: Deep dark game canvas (`#030d09`) with rich illustrated backgrounds, soft gradient transitions, and subtle ambient glows that give each subject area its own distinct world.
2. **2-Layer Hero Architecture**: 
   - *Layer 1 (Background)*: Continuous panoramic landscape art (e.g. `home-hero-landscape.jpg` sunrise mountain lake with a mossy cliff ledge).
   - *Layer 2 (Character Overlay)*: Modular companion slot (`<HeroCharacter avatar={user.avatar} />`) positioned directly on the cliff ledge. Swapping avatars requires zero background changes.
3. **Tactile Mobile Ergonomics**: Generous tap targets (minimum 44px), subtle physical press feedback (`translateY(1px)` on active press, `translateY(-2px)` on hover), and natural one-thumb mobile accessibility.
4. **Clean Stroke-Based Icon Grammar**: All UI icons use **Lucide React** stroke icons (24x24 viewBox, `stroke="currentColor"`, strokeWidth 2.2–2.5, round caps/joins). No emoji icons in UI.

---

## 2. Master Color Tokens & Palettes

All colors are centralized in `src/index.css` under the `--game-*` token namespace.

### Global Canvas & Card Surfaces
| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `--game-bg-canvas` | `#030d09` / `#020b08` | Deep dark game canvas background |
| `--game-surface-card` | `#05130e` | Default card & progress tile container surface |
| `--game-surface-card-header` | `#081711` | Top header pill and compact container surface |
| `--game-border-default` | `#102d1f` | Default subtle border for dark cards and dividers |
| `--game-border-highlight` | `#1a452f` | Active/hover container border accent |
| `--game-divider-line` | `#132d1f` | Subtle horizontal section divider rule |

### Semantic Brand Accents & Glows
| Accent | Hex Code | Token | Usage |
| :--- | :--- | :--- | :--- |
| **Emerald (Brand)** | `#34d399` / `#4ade80` | `--game-accent-emerald` | Primary brand accent, active nav pill, XP progress track, text highlights |
| **Gold (XP / Star)** | `#fbbf24` / `#f59e0b` | `--game-accent-gold` | Total XP numbers, star level icons, trophies, milestone badges |
| **Red (Streak / Flame)** | `#ff5a5a` | `--game-accent-red` | Day streak numbers, flame icons, active combo streak badges |
| **Cyan (Rank / Globe)** | `#38bdf8` | `--game-accent-cyan` | Global leaderboard rank (`Top 2%`), globe icons, cosmic highlights |
| **Purple (Rewards)** | `#c084fc` | `--game-accent-purple` | Rewards store chips, gift icons, cosmetic unlockables |

### Module-Specific Theme Palettes
Each learning module has an authentic, thematic identity:
- **Chess (`theme="chess"`)**:
  - Border: `rgba(197, 137, 74, 0.45)` / `#855930` (Warm bronze/amber)
  - Surface: `#160c06` (Deep mahogany wood)
  - Action Button: `#26150b` (Dark amber with `#855930` border)
  - Artwork: Carved white marble knight piece on dark mahogany board (`chess-card-bg.jpg`)
- **Space (`theme="space"`)**:
  - Border: `rgba(41, 82, 133, 0.55)` / `#295285` (Cosmic sapphire)
  - Surface: `#050b1a` (Obsidian space navy)
  - Action Button: `#0c1a2d` (Cosmic indigo with `#295285` border)
  - Artwork: Luminous sapphire ringed planet in starry nebula (`space-card-bg.jpg`)

---

## 3. Typography Scale & Hierarchy

LearningJemz pairs **Outfit** (headings, titles, numbers) with **Inter** (body text, micro-labels).

```
Outfit  ── Display, Titles, Number Counters (Weights 800 - 900)
Inter   ── Subtitles, Descriptions, Micro-labels (Weights 500 - 700)
```

| Role | Font | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Headline** | Outfit | `1.85rem` | `900` (Black) | `1.15` | `-0.5px` |
| **Header Brand Title** | Outfit | `1.38rem` | `800` (Bold) | `1.2` | `-0.3px` |
| **Module / Card Title**| Outfit | `1.32rem` | `800` (Bold) | `1.2` | `normal` |
| **Section Label** | Outfit | `0.94rem` | `800` (Bold) | `1.0` | `0.2px` |
| **Stat Numbers** | Outfit | `1.35rem` | `900` (Black) | `1.0` | `normal` |
| **Card Subtitle** | Inter | `0.82rem` | `500` (Medium)| `1.3` | `normal` |
| **Pill Micro-labels** | Inter | `0.56rem - 0.65rem` | `700` (Bold)| `1.0` | `0.5px` (Uppercase) |

---

## 4. Reusable Component Library (`src/components/game/`)

All screens assemble standardized UI components from `src/components/game/`:

### 1. `SectionDivider`
Two-tone section header with sprout leaf flourishes and diamond line accents.
```tsx
import { SectionDivider } from '../components/game';

<SectionDivider title="Continue your" highlightWord="journey" diamonds={1} />
<SectionDivider highlightWord="Your progress" diamonds={2} />
```

### 2. `GameModuleCard`
Standard 142px tall illustrated mission / module card with 3D artwork cutout, mini badge pill, and circular action button.
```tsx
import { GameModuleCard } from '../components/game';
import { Swords } from 'lucide-react';

<GameModuleCard
  theme="chess"
  title="Chess"
  subtitle="Challenge AI bots and improve your strategy."
  badgeIcon={<Swords size={18} strokeWidth={2.4} />}
  onClick={() => navigate('/chess')}
  ariaLabel="Chess module"
/>
```

### 3. `StatTile`
Progress matrix stat tile with individual glowing semantic colors.
```tsx
import { StatTile } from '../components/game';
import { Flame } from 'lucide-react';

<StatTile
  variant="streak"
  icon={<Flame size={24} color="#ff5a5a" fill="#ff5a5a" />}
  value={115}
  label="Day Streak"
  onClick={() => navigate('/profile')}
/>
```

### 4. `SegmentedSwitcher`
Dark pill tab toggle (`Play | Learn`, `XP | Streak`) with a glowing active pill indicator.
```tsx
import { SegmentedSwitcher } from '../components/game';

<SegmentedSwitcher
  tabs={[
    { id: 'play', label: 'Play' },
    { id: 'learn', label: 'Learn' },
  ]}
  activeTab={currentTab}
  onChange={(id) => setCurrentTab(id)}
/>
```

### 5. `HeroCharacter`
Modular character companion slot that places dynamic user avatars on the scenic cliff ledge.
```tsx
import { HeroCharacter } from '../components/game';

<HeroCharacter avatar={user?.user_metadata?.avatar} characterType="owl" />
```

---

## 5. Navigation & Header Rules

1. **Root Module Headers Only**:
   - The top header capsule showing Streak & Level/XP (`Flame` & `Star`) appears **ONLY on root/home screens** (e.g. `/`, `/chess`, `/space`).
   - Sub-pages, puzzle screens, and games must **NOT** render this widget in their header; sub-pages only render the Back button and Title banner.
2. **Bottom Navigation Bar**:
   - Fixed dark container (`#040f0b`, border `#11281c`) with 4 standard tabs: **Home**, **Rank**, **Store**, **Me**.
   - Active state is styled with an enclosed, glowing emerald rounded pill (`#0b2518`, border `#1c5236`, shadow `0 0 14px rgba(52, 211, 153, 0.2)`).

---

## 6. Layout & Responsive Constraints

- **Mobile First Viewport**: Max-width container is clamped to `480px` on mobile/tablet (centered with `margin: 0 auto`) to maintain the tactile density and feel of a native mobile game.
- **Full-Bleed Hero**: Hero scenes extend edge-to-edge horizontally with zero side card margins and end with a soft gradient fade (`.home-hero-fade-bottom`) into the page canvas.
- **Invisible Scrollbars**: Page and container scrollbars are hidden globally via `scrollbar-width: none` and `-webkit-scrollbar { display: none }` while preserving full touch/wheel scroll functionality.

---

## 7. Motion & Micro-Interactions

| Interaction | Visual Feedback | Transition |
| :--- | :--- | :--- |
| **Card Tap / Click** | `transform: translateY(1px)` | `0.15s ease` |
| **Card Hover (Desktop)** | `transform: translateY(-2px)`, shadow increases | `0.15s ease` |
| **XP Progress Bar** | Smooth width fill expansion | `0.4s ease` |
| **Segmented Tab Switch** | Pill outline and background fade | `0.18s ease` |
| **Streak Pop (+1)** | Scale pulse and glowing float-up badge | `0.8s pop` |
