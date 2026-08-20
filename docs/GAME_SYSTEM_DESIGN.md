# LearningJemz - Complete Game System Design & Architecture

This document is the absolute source of truth for the LearningJemz application. It details every single aspect of the game's architecture, logic, design language, gamification systems, and individual module mechanics. As the application scales, this document must be updated to reflect the current state of the codebase.

---

## 1. Vision & Core Architecture
LearningJemz is designed to be a highly gamified, educational progressive web app. The core philosophy is to use psychological feedback loops (streaks, leveling, achievements, micro-animations) heavily inspired by Duolingo to incentivize learning across various disciplines (Chess, Geography, Space, Reading).

### Tech Stack
- **Frontend Framework**: React 19, built with Vite for lightning-fast HMR and bundling.
- **Routing**: `react-router-dom` v7. We use a global `<Layout>` component in `App.jsx` that conditionally renders the `<BottomNav>` only on root paths (Home, Rank, Store, Profile). Active learning modules use nested routing (`/chess/*`, `/space/*`), while upcoming modules (Reading, Geography, Songs, Poems, Math) are displayed as locked preview cards on the Home screen.
- **Backend & Database**: Supabase. Used for PostgreSQL data storage, Row Level Security (RLS) policies, and user Authentication.
- **Styling**: Pure Vanilla CSS. We rely on CSS Grid, Flexbox, and global CSS variables (`index.css`) rather than utility frameworks to ensure we have pixel-perfect control over custom 3D animations and gamified aesthetics.

---

## 2. Global State Management (Contexts)

The app relies heavily on two global React Contexts that wrap the entire application tree:

### `AuthContext.jsx`
- Manages user authentication via Supabase.
- Exposes `user` (containing `user_metadata` like the player's name and avatar), `login`, `signup`, and `logout` functions.
- Protects routes via the `<ProtectedRoute>` wrapper.

### `GameContext.jsx` (The Heart of the Gamification Engine)
This context holds all the gamification state and syncs it between `localStorage` (for instant UI updates) and Supabase (for persistent cloud saves).
- **Core State Objects**: 
  - `xp` (Total Experience Points)
  - `level` (Current Level)
  - `streak` (Current active streak count)
  - `maxStreak` (Highest streak achieved)
  - `lastVisit` (Timestamp string to track daily logins)
  - Module-specific stats (`chessWins`, `puzzlesSolved`, `provincesCorrect`, `flashcardsMastered`, `quizHighScore`, `booksReading`).
- **Data Syncing (lossless queue, cross-device last-writer-wins, never fire-and-forget)**: A `useEffect` writes every state change to `localStorage` and snapshots it into a per-account "pending sync" queue (`utils/pendingSync.js`). A debounced flusher then upserts the newest snapshot to Supabase and clears the queue **only on success**. Failures (offline PWA play, mobile network flakes, expired sessions) keep the queue and retry on state change, the `online` event, and tab visibility. On startup the pending snapshot and the fetched `game_progress` row are reconciled **by timestamp** (`pending.savedAt` vs the row's `updated_at` column): newer wins and is flushed, older side is discarded — so offline gains on one device are never lost, and a stale queue from another device can never overwrite a newer cloud row. **`played_dates` is persisted inside the `bot_stats` JSONB column** (`bot_stats.playedDates`) — there is no top-level `played_dates` column in `game_progress`, and no payload sends one. Uploads race a 10s timeout so a hung request can never stall the queue.
  - **Anti-zeroing guards**: snapshots with zero progress (`isPristineDefaultState`) are treated as fabrications — the flusher skips them, and the startup restore discards them in favour of a real server row. A pristine offline fallback (fetch failed, no local data) sets a blocking mode until a fetch succeeds, so even gameplay from that empty base can never overwrite real progress. Initialization is keyed on the account ID (not the user object identity) and re-runs when a mid-flight init was aborted by an identity refresh, so state is never left stuck on a default 0-streak snapshot.
  - **Sign-out never destroys unsynced progress**: `AuthContext.logout` clears app-state keys but deliberately keeps the per-account pending queue and last-synced marker; the Profile sign-out button also awaits `flushNow()` before signing out. A play session followed by an immediate sign-out on a flaky network therefore restores on the next login instead of reverting to stale server values (the reported "data wasn't saved" bug). `pagehide` / visibility-hidden fire an immediate flush since mobile browsers throttle the debounce timer once the page is hidden or closed. When the server row is missing (`PGRST116`) but the device holds a real pending snapshot, startup restores and flushes the snapshot instead of inserting a fresh 0-state row.
  - **Leaderboard freshness**: the board calls an immediate `flushNow()` before fetching, refreshes again on `visibilitychange` to visible (mobile browsers drop websockets/background timers), and overlays its own row with live app values, so what the learner sees in-app always matches the rankings (realtime `postgres_changes` refetches when the upsert commits).

---

## 3. The Gamification Engine

### A. Experience Points (XP) & Leveling
Level progression is designed to be progressive and challenging. High-level badges hold genuine prestige.
- **The Progressive Formula**: Total XP required for level $N$ follows the power-curve formula:
  $$\text{Total XP Required for Level } N = \text{Math.round}(38 \times (N - 1)^{1.6})$$
  - Level 1: `0 XP`
  - Level 2: `38 XP`
  - Level 3: `97 XP`
  - Level 4: `166 XP`
  - Level 5: `326 XP`
  - Level 10: `1,277 XP`
  - Level 20: `4,188 XP`
- **The Economy (XP Rewards)**:
  - **Chess Checkmate against Bot**: Easy (`+15 XP`), Medium (`+30 XP`), Hard (`+45 XP`)
  - **Chess Tactics Puzzle**: Easy (`+6 XP`), Medium (`+10 XP`), Hard (`+15 XP`) + Survival milestone bonuses
  - **Space Cosmic Mystery**: Sprint / Survival trivia (`+1 XP` per correct, up to `+10 XP` bonuses)
  - **Space Illuminate the System**: Easy (`6-9 XP`), Medium (`13-19 XP`), Hard (`22-31 XP`)
  - **Reading**: `+1 XP` per minute of active reading.

### B. The Streak "Ignition" System
Streaks are the core retention mechanic, heavily leveraging psychological triggers.
1. **Activity-Based**: Streaks are *not* awarded for just opening the app. They are only awarded via the `recordActivity()` function when a user completes a task (e.g., checkmating a bot).
2. **`hasPlayedToday` State**: The `GameContext` compares the local `YYYY-MM-DD` date of `lastVisit` against today (strings parsed as local dates only — never through UTC `new Date()`), exporting a global boolean `hasPlayedToday`.
3. **`playedDates` = Actual Played Days Only**: Calendars (Profile and Streak Screen) render only genuinely played dates. No backfilling from "today" or from stale streak counts — a missed day is never shown as played.
4. **Local Midnight Rollover**: A `GameContext` heartbeat (30s `setInterval` + `visibilitychange` listener) fires on the local 12:00am day change. If the previous day was missed, the stale streak resets to `0` immediately (pruning any fabricated future dates); if yesterday was played, the streak count survives. The forced re-render makes `hasPlayedToday` false app-wide (headers, Profile, module headers, Victory screen all show unlit/pale fire icons) with no page reload, and the corrected state syncs to Supabase.
5. **The Global "Unlit" Psychological Trigger**: 
   - When a user logs in, if `hasPlayedToday` is false, the 🔥 streak badges across the Home page, Profile, and all Module headers are rendered with the `.unlit-icon` class (`filter: grayscale(100%) opacity(40%)`) and `.unlit-text` class (grey text).
   - This creates a visual "void" that the user feels compelled to fill by completing a task.
6. **The "Ignition" Animation**:
   - When a user wins their first game of the day, the victory overlay pops up showing their old streak number and the greyed-out fire icon.
   - After a dramatic 0.8s delay, the `.igniting` CSS class is applied.
   - The fire icon physically pulses (`scale(1.5)`), drops its grayscale filter, bursts into full vibrant color, and the number dynamically ticks up by 1.
   - Upon returning to the main menu, the streak is now permanently "lit" globally for the rest of the day.

### D. Leaderboards
- **XP Leaderboard**: ranks accounts with `xp > 0` by total XP descending (ties broken by XP). Live-updates via the `postgres_changes` realtime subscription on `game_progress`, plus a manual refresh button.
- **Streak Leaderboard**: ranks accounts with `streak > 0` by their **real stored streak value** descending (ties broken by XP). A player who simply hasn't played today **stays ranked** — nobody is hidden for a stale visit. A player drops off only when their streak is actually `0` (the local-midnight rollover enforces this on their next app visit) or when enough higher streaks push them past rank 20. Players whose last visit was more than a day ago are tagged `Inactive · last played X days ago` for honesty. The board intentionally never fabricates "effective" streaks server- or client-side.

### C. Achievements
- Managed in `utils/achievements.js`.
- Contains an array of objects with `id`, `name`, `icon`, `desc`, and a dynamic `condition` function (e.g., `(s) => s.level >= 5`).
- The `GameContext` runs a `useEffect` that constantly evaluates the current state against all locked achievements. If a condition returns `true`, it is unlocked and pushed to the Supabase `achievements` table.

---

## 4. UI/UX Design Language & Theming

The application explicitly avoids Dark Mode to maintain a bright, energetic, and engaging environment. This is enforced against device-level dark/forced-color overrides: `index.html` declares `<meta name="color-scheme" content="light">`, the `:root` block declares `color-scheme: light only` + `forced-color-adjust: none`, and a `@media (forced-colors: active)` block applies `forced-color-adjust: none` to all elements and re-asserts the canvas colors on `html`/`body` — so browsers (Chrome auto dark, Samsung force dark, Windows High Contrast, forced-colors high contrast) never re-tint the UI.

### Typography
- **Headings & Large Numbers**: `Outfit` (sans-serif) - chosen for its modern, geometric, and highly legible structure.
- **Body & UI Elements**: `Inter` (sans-serif) - chosen for maximum readability at small sizes.

### Global Color Palette (CSS Variables)
- **Primary Brand**: Emerald Green (`--color-primary: #1c7c54`). Used for primary buttons, the main logo, and active states.
- **XP / Rewards**: Amber/Gold (`--color-xp: #ffb400`).
- **Streak**: Vibrant Red/Orange (`--color-streak: #ff4d4d` / `#e53935`).
- **Backgrounds**: White (`#ffffff`) for cards, Off-White (`#f5f5f5`) for main backgrounds.

### Module-Specific Color Identities
Each learning module has its own distinct background color to create a sense of place. To ensure these backgrounds seamlessly cover the entire viewport and overscroll regions, the `data-module-theme` attribute is dynamically applied to both `document.body` and `document.documentElement` (`html`) (e.g., `data-module-theme="chess"`), syncing the global background variables universally.
- **Chess Module**: Dark Emerald (`--bg-chess: #0e4d2e`)
- **Geography Module**: Philippines Teal (`--bg-geo: #0066cc`)
- **Reading Module**: Warm Amber (`--bg-reading: #d16f2c`)
- **Space Module**: Deep Space Black (`--bg-space: #0a0a0a`)
- **Space Victory / Game Over Screens**: Muted minimal palette shared by the Illuminate System victory (`theme="space"`) and game-over cards: solid indigo card `#171a38`, muted steel border `#3d4461`, tactile offset shadow `#0b0d22`, slate stat/action surfaces `#1d2040`, streak value muted rose `#d8a8a8`, XP value muted gold `#d9c58f`. No vibrant or glowy accents on these screens.

### Key CSS Animations
Stored in module CSS files (like `chess.css`), we utilize keyframes to make the UI feel alive:
- `slideUp`: Used for notifications and modals to enter smoothly from the bottom.
- `cinematicIn`: Used for the Game Over overlay, scaling in from 0.95 to 1.0.
- `ignitePulse`: The 0.6s cubic-bezier pulse used when a streak is ignited.
- `fadeIn`: Standard opacity transitions.

---

## 5. Detailed Module Breakdown

### A. Chess Module (`/chess`)
The most robust module in the application.
- **Logic Engine**: Uses the open-source `chess.js` library for move validation, FEN/PGN parsing, and checkmate detection.
- **AI Opponents**: Powered by Stockfish 10 running as a Web Worker (with an automatic local JS fallback).
  - **Beginner Bob (Easy)**: ~400 Elo, randomizes moves for accessible introductory play.
  - **Intermediate Ivy (Medium)**: ~1200 Elo, solid tactical play.
  - **Grandmaster Gary (Hard)**: ~2500 Elo, aggressive and highly calculating.
- **Chess Tactics Puzzles**:
  - **Sudden Death Survival & Time Attack Blitz**: Dynamic tactical challenge modes with progressive difficulty scaling.
  - **Tactile Solution Review & Safe Exit**: Interactive board review mode upon completion displaying expected solution moves and mistake squares. Pressing the header back button during active play prompts a safe exit confirmation modal to protect the active run, and directly exits to the Chess Puzzles Hub rather than nesting screens.
  - **Victory Minimized Dock**: A floating dock rendered below the board screen during active review showing Streak & Level metrics, satisfying the sub-page navigation header rules (which restrict the top navigation header to back button + title banner only) while keeping user metrics accessible.
- **Board Rendering**: A custom CSS Grid implementation (`grid-template-columns: repeat(8, 1fr)`) that renders the 64 squares.
- **Assets**: Uses standard SVG piece sets for a clean, universally recognizable look.
- **Mechanics**:
  - **3D Board Flip**: Flips the board perspective smoothly while maintaining correct piece orientation.
  - **Tactile 3D Confirmation Modals**: Features dedicated tactile dialogs for Leaving, Restarting, and Resigning, with fair exit mechanics before first player moves.
  - **Victory Cards & Minimized Dock**: When a game or puzzle run concludes, a cinematic overlay displays streak and XP rewards, which can be minimized into the floating bottom dock to review the board.

### B. Geography Module (`/geo`)
Focused currently on Philippine geography.
- **Core Loop**: Users are presented with a blank map or a highlighted region and must identify the correct province from multiple choices.
- **Progression**: Correct answers grant +2 XP and track towards the `provincesCorrect` stat.

### C. Space Module (`/space`)
A memory and trivia module.
- **Flashcards**: Uses a basic implementation of Spaced Repetition. Mastering a flashcard grants +2 XP.
- **Quizzes**: Tests knowledge retained from flashcards. High scores are tracked in the global state (`quizHighScore`).
- **Illuminate the System**: Size-ordering spelling puzzle across up to 35 solar objects. The Reveal Letter hint is progressive and input-aware — it reveals the correct prefix up to the first letter typed incorrectly (e.g. `JUPETIR` → `JUPI`), advancing with each hint while skipping positions already typed correctly. Wrong submissions retain the learner's typed text so they can consult the hint. After the first object (Sun) is guessed, a brief non-blocking gold cue ("Tap any lit objects for facts") teaches that revealed objects are tappable for mini facts.
- **Cosmic Mystery (`/space/mystery`)**: A multiple-choice trivia card game featuring sanitized clues (fun facts/descriptions of celestial bodies with target names masked out) and 4 tricky options (prioritizing distractors of the same astronomical type). Offers two distinct modes:
  - **10-Card Sprint**: Speedrun across 10 rounds with realtime timer, +3s wrong answer penalty, and Best Time record (`cosmic_mystery_sprint_best_time`). Flawless 10/10 runs unlock a gold `Crown` badge. XP: +1 XP per correct +5 XP perfect bonus +5 XP speed demon bonus (<30s).
  - **Endless Survival**: 3 Lives mode where players answer endless cards to score as high as possible before losing all 3 lives, displaying total cards answered and accuracy percentage alongside High Score (`cosmic_mystery_survival_high_score`). XP: +1 XP per correct answer + tier bonuses (+5 XP at 10 pts, +10 XP at 20 pts).
  - **Recent Runs History & Combo Streaks**: Tracks last 3 runs per mode on start cards, live `Flame` combo streak badges during play, session max streak on VictoryScreen, and all-time max combo records.
  - **Supabase Account Cloud Sync**: All records, high scores, crowns, and histories automatically sync to Supabase (`bot_stats.cosmicMystery` JSONB column) via `GameContext` and restore across all devices upon login.
  - Reuses `VictoryScreen` overlay with `theme="space"` in a 2x2 grid stats box. Following architectural rules, sub-game navigation renders only the back button and title, omitting the streak & level header widget reserved exclusively for main module hubs.
- **SolarSystem3D (Solar Explorer)**: Interactive Three.js visualizer (`/space/solar-system`) using **true proportional scale** so learners can compare real distances and sizes:
  - Scale convention: **1 AU = 10 units** (orbits) and **Earth diameter = 1.0 unit** (sizes; the `size` fields are radii). Config lives in `PLANET_CONFIG` in `SolarSystem3D.jsx`; body data comes from `planets` (8 planets) + `dwarfPlanets` (Pluto, Ceres — exported from `space-data.js`) + `sunData`.
  - Distances are true AU ratios (Mercury 0.387 AU → 3.87, Pluto 39.48 AU → 394.8); the asteroid belt renders at its real 2.1–3.3 AU range and Ceres orbits inside it.
  - Sizes are true diameter ratios (Jupiter ≈ 11× Earth; Ceres ≈ 0.074×). Moons use true size ratios but their orbits are scaled relative to the host planet surface: `scaledDistance = R_planet + (configuredDistance - R_planet) * 0.6 + 0.15` to ensure inner moons (like Io) are never buried inside the planet mesh while preventing overlapping.
  - Pluto–Charon is a `BinarySystem` component: both orbit the group origin — the barycenter — with `massRatio 0.118` (Charon/Pluto masses), placing the barycenter outside Pluto's surface. Its orbit uses the same surface-relative scaling.
  - InfoPanel: translucent card (`rgba` + `backdrop-filter: blur`) with orbiting planets bleeding through; drei `Html` name labels are capped to `zIndexRange [5, 0]` (below the panel's z-index 50) and fade out entirely while a body is selected (`labelsHidden` prop). Every body (Sun + all 10 planets/dwarf planets) has an educational badge from the `PLANET_BADGES` map (Lucide icon + title + fact).
  - Action Buttons Redesign: Close and Collapse buttons in the top-right corner of the Info Panel are styled with premium 3D tactile offset borders and shadows, enlarged to 36px with 20px icons. Click actions translate the buttons 2px down. An adjacent circular Close (X) button is placed next to the collapsed state's "SHOW INFO" tab for a one-click focused exit.
  - Textures: planet textures in `public/textures/planets/`; Pluto/Ceres reuse `public/textures/objects/` JPEGs. Moons and binary companions render with dedicated high-resolution surface textures (e.g. Luna, Io, Europa, Ganymede, Callisto, Titan, Ariel, Oberon, Titania, Triton, Charon) wrapped around smooth 32-segment sphere geometry, falling back to a cratered moon texture with color-tinting for others.
  - Background Starfield: Renders a high-fidelity two-layer starfield (16,000 tiny background stars and 4,000 medium colored stars) to create a subtle, non-distracting 3D parallax effect on camera rotation. Auto-rotation on OrbitControls is disabled when the simulation is frozen (`simSpeed = 0`).

### D. Planned Upcoming Modules (e.g. Reading, Geography, Math)
Upcoming modules are designed to integrate seamlessly into the progression engine:
- **Reading**: Active reading timer awarding `+1 XP` per minute with comprehension quizzes.
- **Geography**: Interactive map challenges for provinces and regional capitals.
- **Status**: Displayed as locked preview cards on the Home screen awaiting gameplay implementation.

---

## 6. Future Expansion Guidelines
When adding new features or modules, adhere strictly to these rules:
1. **Never use standard browser alerts (`alert()`)**. Always build custom, sleek React modals (like the Restart Confirmation modal).
2. **Never bypass `GameContext`**. All XP gains and streak triggers MUST route through `GameContext.jsx` functions to ensure they are properly synced to Supabase and trigger achievements.
3. **Maintain the "Unlit" convention**. Any new modules that display the streak badge in their header must implement the `hasPlayedToday` check and apply the `.unlit-icon` and `.unlit-text` classes.
4. **Use Lucide Icons**. For consistency, all UI icons should be pulled from the `lucide-react` library. No emoji icons in UI.

---

## 7. Mobile-Game Design System & UI Architecture
- **Atmospheric Dark Game Canvas**: Deep dark aesthetic (`--game-bg-canvas: #030d09`, `--game-surface-card: #05130e`) with theme-tinted glowing borders.
- **2-Layer Hero Architecture**: Background scenery remains continuous (`home-hero-landscape.jpg`), while companion characters overlay dynamically via `<HeroCharacter avatar={user.avatar} />` on the cliff ledge.
- **Component Library (`src/components/game/`)**:
  - `SectionDivider`: Two-tone typography with sprout leaf flourishes and diamond accents.
  - `GameModuleCard`: Standard 142px illustrated mission card with 3D artwork cutout, mini badge pill, and circular 3D arrow button.
  - `StatTile`: 4-matrix progress card with glowing value colors.
  - `SegmentedSwitcher`: Dark pill tab switcher (`Play | Learn`, `XP | Streak`) with glowing emerald active pill.
- **Navigation**: Dark floating bottom navigation bar with **Home**, **Rank**, **Store**, **Me** tabs.
