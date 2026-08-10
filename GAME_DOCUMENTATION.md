# LearningJemz — System & Architecture Documentation

## 1. Executive Overview
- **Game Name**: `LearningJemz`
- **Vision & Platform Mission**: An expanding, all-in-one gamified learning universe built to ignite curiosity across a wide spectrum of subjects. LearningJemz transforms complex, diverse educational topics into highly engaging, tactile, and rewarding mini-game experiences.
- **Detailed Platform Description**:
  LearningJemz is a modern multi-subject learning ecosystem designed to turn daily practice into an addictive adventure. Rather than focusing on a single subject, the platform is engineered to continuously introduce new educational frontiers. 
  - **Active Learning Realms**:
    - ♟️ **Chess Tactics & AI Strategy**: Master opening patterns, solve tactical puzzles, and test skills against adaptive Stockfish AI bot levels.
    - 🚀 **Space Exploration & Astronomy**: Discover planetary science, scale of the solar system, interactive 3D planet visualizers, and astronomical trivia.
    - 🗺️ **Geography & Cultural Maps**: Explore interactive regional SVG maps (Philippine provinces & World regions), landmark trivia, and spatial quizzes.
    - 📚 **Reading & Literature Hub**: Digital bookshelf connected to OpenLibrary APIs, story comprehension challenges, and reading milestone tracking.
  - **Future Horizon**: Architected to seamlessly integrate upcoming modules such as **Math & Logic Puzzles**, **Science Experiments**, **History Timelines**, **Coding Fundamentals**, **Financial Literacy**, and **Languages**.
- **Target Audience**: Students, children, and lifelong learners seeking an intuitive, fun, and visually stunning hub to explore diverse topics at their own pace.

---

## 2. Platform & Hosting Integrations
- **GitHub**: Repository `j4mesh3nry/learningjemz`
  - Active Production Branch: `main`
  - Primary Dev Branch: `dev`
- **Vercel Deployment**: Live URL: `https://learningjemz.vercel.app`
  - Headers: `Cache-Control: no-cache, no-store, must-revalidate` for `index.html` and `sw.js`.
- **Supabase Backend**: Realtime Database & User Auth
  - Environment Variables required in `.env.local` / Vercel:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`

---

## 3. Design System & Visual Aesthetics
- **Theme Palette & Tactile 3D Flat Principles**:
  - **Canvas Background**: Medium-Light Sage Green (`#d4e8d5`).
  - **Primary Headers & Text**: Forest Green (`#0f3825` & `#16653e`).
  - **Card Surface**: Crisp White (`#ffffff`) with Muted Sage Borders (`#b0cbaf`).
  - **Tactile 3D Shadows**: `box-shadow: 0 4px 0 #b0cbaf` (elements) and `0 3px 0 #0e4329` (buttons). Active press translates `2px` downward.
  - **Anti-Glassmorphism & Anti-Glow Rule**: Strictly avoid glassmorphism (`backdrop-filter`), translucent fuzzy overlays, and neon glow effects (`box-shadow: 0 0 ... glow`, radial-gradient auras). All modals, cards, and UI surfaces use clean, solid background colors with solid contrast 3D borders and tactile offset shadows.
  - **Light-Only Color Scheme Enforcement**: The app is deliberately light-only. `index.html` ships `<meta name="color-scheme" content="light">` and `src/index.css` `:root` sets `color-scheme: light only` plus `forced-color-adjust: none`. A `@media (forced-colors: active)` block re-asserts `forced-color-adjust: none` on every element/pseudo-element and re-declares the canvas colors on `html`/`body`, so phone browsers (Chrome auto dark mode, Samsung Internet force dark, OS dark-theme engines) and forced-colors engines (Windows High Contrast, Android high contrast text) never re-tint or invert the palette, while the design itself stays identical.
- **Typography**:
  - **Headings**: `Outfit` (Bold, rounded geometric sans-serif, `800 - 900`).
  - **Body**: `Inter` (Clean, legible sans-serif).
- **Layout & Multi-Device Responsive System**:
  - **Mobile (< 640px)**: 100% fluid container (`padding: 16px`), 1-column card grids, and fixed bottom floating navigation pill bar.
  - **Tablet (640px - 1024px)**: Expanded max-width container (`860px`), 2 to 3 column active & coming-soon module card grids, 2-column profile dashboard, and centered floating navigation dock (`max-width: 580px`).
  - **Desktop / PC (> 1024px)**: Wide max-width canvas (`1200px`), 4-column module grid, side-by-side dashboard panels, and spacious navigation dock (`max-width: 680px`).

---

## 4. Core Gamification Mechanics

### Streak System & Calendar
- **Logic**: Tracks consecutive daily activity completion in real-time.
- **Local Date Handling**: Standardized `YYYY-MM-DD` formatting based on local timezone to eliminate UTC midnight date shifts. `YYYY-MM-DD` strings are always parsed as *local* calendar dates (`fromLocalDateString`), never through `new Date('YYYY-MM-DD')` (which parses as UTC midnight and shifts a day for negative-offset timezones).
- **Played History Persistence (`playedDates`)**: Persists array of active played dates (`YYYY-MM-DD`) in global `GameContext` state, browser `localStorage`, and Supabase `game_progress` cloud database (inside the `bot_stats` JSONB column as `bot_stats.playedDates`). **`playedDates` contains only genuinely played days — calendars never backfill/fabricate dates from today or from a stale streak count.**
- **Local Midnight Rollover (no reload needed)**: A `GameContext` heartbeat (30s interval + `visibilitychange` when the tab becomes visible) detects the local day change at 12:00am. If the previous day was missed, a stale streak immediately resets to `0` (and any fabricated future dates are pruned); if yesterday was played the streak survives. `hasPlayedToday` recomputes on the forced re-render, so fire icons across headers, Profile ("Me"), module headers, and the Victory screen instantly switch to the unlit grey state without requiring a page reload. Corrected state syncs to Supabase automatically.
- **Duolingo Streak Calendar**: Rendered in Profile and Streak Screen drawer modal. Days where the learner *actually* played display lit fire badges (`Flame`); past days with no activity remain open/unlit. The current day is lit only after the learner completes their first activity of that day.
- **Streak Transition Animations**: Counter transitions smoothly from `previousStreak` to `currentStreak` (e.g., `3 -> 4`) with animated `+1` badge effects upon completing daily learning activities.
- **Indicator**: Active Flame (`#ff3d00` / `#ff6d00`), Inactive Flame (`#888888`).
- **Reset Trigger**: Absence of recorded activity on the previous calendar day (enforced at the next local midnight).
- **Cloud Sync (lossless, offline-safe, cross-device)**: Every state change snapshots into a per-account "pending sync" queue in `localStorage` *before* the Supabase `game_progress` upsert is attempted. The queue is cleared only after the server write succeeds; failed writes (offline play, flaky mobile networks, expired sessions) are retried automatically on state change, on reconnection (`online`), and when the tab becomes visible again. **`played_dates` lives inside the `bot_stats` JSONB column** (there is no separate `played_dates` column in `game_progress` — the payload never sends one, so upserts can't fail against the real schema). On app start the pending queue and the server row are resolved **last-writer-wins by timestamp**: if the pending snapshot `savedAt` is NEWER than the row's `updated_at`, local progress wins and is re-flushed (offline XP/streak gains are never dropped); if the server row is as new or newer (progress synced from another device), the server wins and the stale queue is discarded so it can never overwrite newer cloud data. Fabricated *default* snapshots (empty 0-state produced by a stuck init or an offline first load on a fresh device) are never flushed or merged over real server data, and a pristine offline fallback blocks syncing entirely until a fetch succeeds — so empty states can't zero out a real account. The pending queue and its last-synced marker **survive sign-out** (they are per-account keyed), and the Profile sign-out button pushes an immediate `flushNow` before logging out, so play right before signing out — even on a flaky connection — is never lost and restores on the next login. Backgrounding or closing the app fires an immediate flush (`pagehide` / hidden state) because mobile browsers throttle debounce timers. An account whose server row is missing (`PGRST116`) but which holds real queued progress restores from the queue instead of being reset to a fresh 0-state. The leaderboard pushes any pending progress (immediate `flushNow`) before fetching, refreshes again when the app returns to the foreground, and shows the signed-in learner's row with live app values, so the board can't lag or contradict the app. Auth token refreshes no longer reset in-memory progress (initialization is keyed on the account ID, and re-runs if a mid-flight init was aborted).

### Leaderboards & Rankings
- **XP Board**: Ranks learners by total XP (descending), tie-broken by XP (already the key) — only accounts with `xp > 0` qualify.
- **Streak Board**: Ranks learners by their **real stored streak value**. Missing a day removes NOBODY — players remain ranked until their streak is actually `0` (enforced by the local-midnight rollover on the player's next visit) or until stronger streaks push them out of the Top 20. Stale players show an honest `Inactive · last played X days ago` caption instead of being hidden.
- **Real-Time Updates**: Subscribes to `postgres_changes` on `game_progress` so the board refreshes live as players earn XP/streaks; a manual refresh button is available in the header.

### XP & Level Progression
- **Level Formula**: `Level = floor(Total XP / 100) + 1`
- **XP Progress Bar**: Displays `(Total XP % 100) / 100` progress to next level.
- **Level Badge**: Gold Star pill (`#f57f17`).

### Victory Screen & Module Theme System
- **Module Theme Modes**: Supports `theme="space"` (deep muted indigo solid card `#171a38`, muted steel border `#3d4461`, muted slate action buttons), `theme="chess"` (dark warm solid card `#1c1917`, 3D amber border `#d97706`), `theme="geo"` (emerald card `#f0fdf4`, green border `#16653e`), and `theme="default"` (playful white/emerald card). The Space victory and Illuminate game-over screens share a unified minimal palette (no vibrant/glowy colors): streak shown in muted rose `#d8a8a8`, XP in muted gold `#d9c58f`, with a clean 54px icon tile and compact stat-slot boxes.
- **Design Enforcement**: Strictly NO glassmorphism (`backdrop-filter`), NO translucent blurry cards, and NO neon glow effects. All modals use solid 3D cards with tactile offset borders and solid pushable buttons.
- **Iconography Standard**: Strictly NO emojis in UI or data. All graphics render high-quality Lucide React icons (`Gem`, `Sparkles`, `Flame`, `Trophy`, `Zap`).

---

## 5. Module Specifications

### ♟️ Chess Module (`/chess`)
- **Components**: `ChessHome.tsx`, `ChessPlay.jsx`, `chess.css`.
- **Game Modes**: Play vs Stockfish AI Bot, Tactics Puzzles, Speed Blitz.
- **Board Grid**: 8x8 standard flex layout.
  - **Rank Labels (1–8 / 8–1)**: Strictly anchored on the **left edge** (`colIndex === 0`).
  - **File Labels (a–h / h–a)**: Strictly anchored on the **bottom edge** (`rowIndex === 7`).
  - **Controls**: Action bar (`Flip`, `Restart`, `Resign`) positioned directly above the **Game Notation** scroll log box.
- **AI Engine**: Web Worker `Stockfish 10` with automatic local JavaScript fallback on worker restrictions.

### 🚀 Space Module (`/space`)
- **Components**: `SpaceHome.tsx`, `IlluminateSystem.jsx`, `SolarSystem3D.jsx`, `space-objects.js`, `space.css`.
- **Game Modes**:
  - **3D Solar System Visualizer (`SolarSystem3D.jsx`)**:
    - Full 3D canvas with realistic scale ratios, orbital movement, rings, and stars.
    - **Natural Satellites & Moon Explorer**: Features 20 natural satellites orbiting their respective host bodies (Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto). Selecting any satellite displays unique educational badges and non-redundant fun facts.
    - **Host Planet Camera Lock**: Camera focus locks strictly on the host planet to ensure smooth, stable 3D rotation without motion sickness.
    - **Swipeable Satellite Selector**: Full horizontal touch swipe (`touchAction: 'pan-x'`) and mouse drag-scroll navigation positioned below the top header with zero button overlap.
    - **Dedicated Space 3D Loader (`SolarLoadingOverlay`)**: Renders `<JemzLoader darkTheme={true} />` displaying live 3D texture & orbit downloading progress (`Downloading 2K planet textures & orbits... N%`).
  - **Orbits**: 1 AU = 10 units — true Sun-relative AU ratios (Mercury 3.87, Earth 10, Jupiter 52.03, Saturn 95.37, Uranus 191.91, Neptune 300.7, Pluto 394.8). The asteroid belt sits at its real 2.1–3.3 AU ring (21–33 units), with Ceres (dwarf planet, 2.77 AU) orbiting inside it.
  - **Sizes**: Earth diameter = 1.0 unit — true diameter ratios (Jupiter 10.97×, Saturn 9.14×, Uranus 3.98×, Neptune 3.86×, Venus 0.95×, Mars 0.53×, Mercury 0.38×, Pluto 0.186×, Ceres 0.074×). Charon is correctly smaller than Pluto.
  - **Pluto-Charon Binary System**: Both bodies orbit the shared barycenter (mass ratio 0.118 — the barycenter sits outside Pluto's surface); Charon distance & size are true-proportional. Moons (Earth's Moon, Europa, Titan) orbit all bodies with true sizes but a capped 14-unit display distance.
  - **Sun**: Capped at ~1/30 true scale so planets stay visible; its info badge honestly notes it is truly 109× Earth's width.
  - **Info Panel**: Translucent blur card (backdrop of orbiting planets shows through) while all 3D name labels fade out when open (drei `Html` labels capped at `zIndexRange [5,0]`). Every body (Sun + all 10 planets/dwarf planets) has an educational badge with a Lucide icon (e.g. "Fastest Planet", "Ringed Giant", "Binary Dwarf Planet System") plus stat grid and fun fact.
  - **Tab & Navigation State Persistence**: Module hubs (`/space`, `/reading`, `/geo`) remember the active tab (`Play` vs `Learn`) across sub-page navigation via `sessionStorage` and URL query parameters (`?tab=...`).
  - **App Loading & Background Asset Preloading**:
    - **Startup & Refresh Sequence**: App launch renders the clean white logo `SplashScreen` followed by the light green `<JemzLoader darkTheme={false} />` (`Loading LearningJemz... Preparing your experience... 0% -> 100%`).
    - **Background Preloader (`preloadSpaceObjectImages`)**: Silently pre-caches all 35 high-res space object images into browser memory during app startup, eliminating image pops and flickering during gameplay.
  - **Illuminate the System Challenge**: Size-ordering spelling puzzle covering up to 35 solar objects (Sun → Salacia).
    - **Difficulty Tiers & XP Rewards**:
      - **Easy**: Top 8 largest objects (Sun → Mars), 3 Lives, **+10 XP reward**.
      - **Medium**: Top 15 largest objects (Sun → Europa), 4 Lives, **+20 XP reward**.
      - **Hard**: All 35 objects (Sun → Salacia), 5 Lives, **+30 XP reward** (+10 XP bonus for perfect zero-hint completion).
    - **Dynamic Interactive Speech Bubble Hint Engine**:
      - Positioned directly below the top `Hint (N)` button with an upward pointer tile (`#161936` cosmic dark card, `#2d3264` border).
      - **Reveal Letter Clue (Progressive & Input-Aware)**: Detects the first letter the learner typed incorrectly and reveals the correct prefix through that position (e.g. typed `JUPETIR` reveals `JUPI`, then `JUPITE`, then `JUPITER`). If everything typed so far matches, it reveals the next letter beyond the current input (e.g. `JUP` → `JUPI`). Costs 1 hint per reveal, caps at the full name, and never force-fills the input field. On a wrong submission the learner's typed text is kept in the box so they can consult the hint to check spelling.
      - **Mnemonic Sentence Line**: Displays a strict 1-to-1 progressive mnemonic sentence mapped exactly across all 35 celestial objects (e.g. index 15 Triton displays up to word 15 "Tumble", strictly masking words 16-34 for Pluto, Eris, Titania, etc.).
      - **Per-Object Clue Locking & Anti-Abuse**: Clues unlocked on an object can be re-viewed for free; learners can spend additional hints from their 3-hint pool to unlock both letter and mnemonic clues on a single object.
    - **Interactive Mini Fact Cards (Revealed Objects)**: Tapping any illuminated object circle opens an interactive reference card showing its texture preview, astronomical classification, physical diameter (km), orbital position / host body, and 1-sentence fun fact.
    - **Discovery Cue ("Tap for Facts")**: When the first object (Sun) is correctly identified, a brief non-blocking cue appears — a subtle gold chip reading "Tap any lit objects for facts" with a soft glow pulse around the revealed Sun — teaching that revealed objects are tappable for details. Auto-dismisses after ~4s or on first tap.
    - **Iconography Standard**: Strictly NO using emojis in UI or data. All icons are cleanly rendered via Lucide React components (`Sun`, `Globe`, `Moon`, `Sparkles`, `Ruler`, `Compass`, `Lightbulb`).
    - **Custom Touch Keyboard System**: Compact 4-row virtual keyboard (`48px` key height, space theme styling) with tight 4px key gaps for faster touch typing, tailored for touch interaction without soft-keyboard overlap.
    - **Personal Best Records**: Tracks and persists top completion times per difficulty tier in Supabase (`illuminate_stats`) and local storage.

### 🗺️ Geography Module (`/geo`)
- **Components**: `GeoHome.tsx`, `MapExplorer.jsx`, `ProvinceQuiz.jsx`, `geo.css`.
- **Game Modes**: Interactive SVG Philippine Map & World Map exploration, province trivia, regional quizzes.

### 📚 Reading Module (`/reading`)
- **Components**: `ReadingHome.tsx`, `bookService.js`, `reading.css`.
- **Game Modes**: OpenLibrary API book bookshelf, reader view, comprehension quizzes.

---

## 6. Backend & Supabase Database Schema

### Table 1: `game_progress`
- `id` (UUID, Primary Key, references `auth.users.id`)
- `name` (Text) — Display Name
- `avatar` (Text) — Profile Avatar Identifier
- `xp` (Integer) — Total accumulated Experience Points
- `level` (Integer) — Player Level
- `streak` (Integer) — Active daily streak count
- `last_active_date` (Text / Date) — ISO timestamp of last recorded activity
- `bot_stats` (JSONB) — Win/Loss/Draw record vs Stockfish Bot levels
- `illuminate_stats` (JSONB) — Best completion times and scores in Space Illuminate
- `puzzles_solved` (Integer) — Total count of solved chess/subject puzzles

### Table 2: `achievements`
- `id` (UUID, Primary Key)
- `user_id` (UUID, references `auth.users.id`)
- `achievement_id` (Text) — Badge / achievement identifier
- `unlocked_at` (Timestamp) — Date unlocked
