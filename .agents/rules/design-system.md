# Design System & UI Consistency Rules — LearningJemz

## Core Mandate
All screens in the LearningJemz PWA (`/leaderboards` [Rank], `/store` [Store], `/profile` [Me], `/settings` [Settings], `/chess` [Chess Hub], `/space` [Space Hub], and sub-pages) MUST feel like a natural, seamless continuation of the **Home page** design system (`Home.tsx`). Never create disparate visual experiments, standalone themes, or discordant layouts.

## Visual Grammar & Design Tokens

### 1. Canvas & Surfaces
- **Canvas Background**: Deep dark green-black (`--game-bg-canvas: #030d09` / `body[data-module-theme="home"] { background: #030d09 }`).
- **Cards & Surfaces**: Clean dark card surface (`--game-surface-card: #05130e`).
- **Borders**: 1.5px solid dark emerald-green outline (`--game-border-default: #102d1f`).
- **Border Radius**: `16px` to `18px` for cards, `12px` to `14px` for buttons/chips, `9999px` for pills/tags/switchers.
- **Elevation / Depth**: Subtle, restrained shadow (`box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4)`).
- **Prohibited Effects**: DO NOT introduce heavy glassmorphism, excessive background blur/transparency, blurry neon glows, or cartoon sticker elements.

### 2. Accent Color Palette
- **Primary / Emerald**: `#34d399` (text/icons), `#10b981` (action buttons, progress fill).
- **Sapphire / Info**: `#38bdf8` (2nd place accents, space hints).
- **Amber / Gold**: `#fbbf24` / `#f59e0b` (1st place accents, XP trophies).
- **Orange / Bronze**: `#f97316` / `#fb923c` (3rd place accents).
- **Ruby / Flame**: `#ff5a5a` (streaks, fire metrics).
- **Muted Subtext**: `#8db5a0` (labels, subtitles, secondary metadata).

### 3. Iconography
- **No Emojis**: Emojis are strictly prohibited anywhere in the UI or data.
- **Flat Stroke Grammar**: All UI icons must be rendered via `lucide-react` with flat stroke grammar (`strokeWidth={2}` to `2.4`, `stroke="currentColor"`, `fill="none"`).
- **No Cartoon Fills**: Solid color fills (`fill="..."`) on Lucide icons are strictly forbidden to prevent cartoon/sticker-like appearance.

### 4. Typography
- **Headings / Titles / Numbers**: `Outfit` (`--font-heading: 'Outfit', sans-serif`, `font-weight: 800` or `900`).
- **Body / Micro-labels / Subtitles**: `Inter` (`--font-body: 'Inter', sans-serif`, `font-weight: 500` or `600`).
- **Scrollbars**: Hidden globally across all containers (`scrollbar-width: none`).

### 5. Reusable Primitives
- **Top Header**: `<Header />` capsule widget (Streak Flame + Level Star + XP track) on top-level pages.
- **Section Headers**: `<SectionDivider highlightWord="..." />` for visual hierarchy.
- **Switchers / Tabs**: `<SegmentedSwitcher tabs={[...]} activeTab={...} onChange={...} />` dark pill toggle.
- **Avatars**: `<AvatarIcon avatar={...} size={...} iconSize={...} />`.
- **Bottom Navigation**: Unified 4-tab bar (`Home`, `Rank`, `Store`, `Me`) with active tab emerald highlighting.
