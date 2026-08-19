# LearningJemz — System & Architecture Documentation

## 1. Executive Overview
- **Game Name**: `LearningJemz`
- **Vision & Platform Mission**: An expanding, all-in-one gamified learning universe built to ignite curiosity across a wide spectrum of subjects. LearningJemz transforms complex, diverse educational topics into highly engaging, tactile, and rewarding mini-game experiences.
- **Detailed Platform Description**:
  LearningJemz is a modern multi-subject learning ecosystem designed to turn daily practice into an addictive adventure. Rather than focusing on a single subject, the platform is engineered to continuously introduce new educational frontiers. 
  - **Active Learning Realms**:
    - 🚀 **Space Exploration & Astronomy**: Discover planetary science, scale of the solar system, 3D planet visualizer with natural satellites, and Illuminate the System size-ordering spelling challenge.
    - ♟️ **Chess Tactics & AI Strategy**: Master AI strategy and test skills against adaptive Stockfish AI bot levels.
  - **Future Horizon**: Architected to seamlessly integrate upcoming modules such as **Geography & Maps**, **Reading & Literature**, **Math & Logic Puzzles**, **Science Experiments**, **History Timelines**, **Coding Fundamentals**, and **Languages**.
- **Target Audience**: Students, children, and lifelong learners seeking an intuitive, fun, and visually stunning hub to explore diverse topics at their own pace.

---

## 2. Platform & Hosting Integrations
- **GitHub**: Repository `j4mesh3nry/learningjemz`
  - Active Production Branch: `main`
  - Primary Dev Branch: `dev`
  - Prepared Feature Branch: `feature/next-session`
- **Vercel Deployment**: Live URL: `https://learningjemz.vercel.app`
  - Headers: `Cache-Control: no-cache, no-store, must-revalidate` for `index.html` and `sw.js`.
- **Supabase Backend**: Realtime Database & User Auth
  - Environment Variables required in `.env.local` / Vercel:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`

---

## 3. Design System & Visual Aesthetics
- **Atmospheric Mobile-Game Design System**:
  - **Global Dark Canvas**: Deep, dark game environment (`--game-bg-canvas: #030d09`).
  - **Surface & Cards**: High-contrast dark containers (`--game-surface-card: #05130e`) with theme-tinted subtle border outlines (`--game-border-default: #102d1f`).
  - **Module Themes & Glows**:
    - *Chess*: Warm bronze/amber border (`#855930`) with mahogany tones (`#160c06`) and knight artwork.
    - *Space*: Deep cosmic sapphire border (`#295285`) with nebula tones (`#050b1a`) and ringed planet artwork.
    - *Emerald Glow*: Primary brand accent (`#34d399` / `#4ade80`) for active states and XP progress.
    - *Gold Glow*: XP and achievement highlights (`#fbbf24`).
    - *Red Glow*: Day streak counters (`#ff5a5a`).
    - *Cyan Glow*: Global rank and leaderboards (`#38bdf8`).
- **2-Layer Hero Architecture**:
  - Background scenery remains a continuous landscape (`home-hero-landscape.jpg`), while the companion character is an overlay via `<HeroCharacter avatar={user.avatar} />` on the stone cliff ledge so user avatars can be dynamically swapped without re-rendering the scenery.
- **Reusable Component Library (`src/components/game/`)**:
  - `SectionDivider`: Two-tone headline with sprout leaf flourishes and diamond line accents (`Continue your` [white] `journey` [emerald]).
  - `GameModuleCard`: 142px tall illustrated card with 3D artwork cutout, mini badge pill, and circular 3D arrow button.
  - `StatTile`: 4-matrix progress card with glowing value colors.
  - `SegmentedSwitcher`: Dark pill tab switcher (`Play | Learn`, `XP | Streak`) with glowing emerald active indicator.
- **Typography**:
  - **Headings & Numbers**: `Outfit` (Bold, rounded geometric sans-serif, `800 - 900`).
  - **Body & Micro-labels**: `Inter` (Clean, legible sans-serif).
- **Navigation & Mobile Experience**:
  - **Bottom Navigation**: Dark floating bar with **Home**, **Rank**, **Store**, **Me** tabs, featuring an illuminated emerald pill active indicator.
  - **Invisible Scrollbars**: Page and container scrollbars are hidden globally (`scrollbar-width: none`).
  - **Module Headers**: The top header capsule widget (`Flame` & `Star`) appears ONLY on the root page of each module; sub-page headers render only the back button and title banner.

---

## 4. Core Gamification Mechanics

### Streak System & Calendar
- **Logic**: Tracks consecutive daily activity completion in real-time.
- **Local Date Handling**: Standardized `YYYY-MM-DD` formatting based on local timezone to eliminate UTC midnight date shifts. `YYYY-MM-DD` strings are always parsed as *local* calendar dates (`fromLocalDateString`), never through `new Date('YYYY-MM-DD')` (which parses as UTC midnight and shifts a day for negative-offset timezones).
- **Played History Persistence (`playedDates`)**: Persists array of active played dates (`YYYY-MM-DD`) in global `GameContext` state, browser `localStorage`, and Supabase `game_progress` cloud database (inside the `bot_stats` JSONB column as `bot_stats.playedDates`). **`playedDates` contains only genuinely played days — calendars never backfill/fabricate dates from today or from a stale streak count.**
- **Local Midnight Rollover (no reload needed)**: A `GameContext` heartbeat (30s interval + `visibilitychange` when the tab becomes visible) detects the local day change at 12:00am. If the previous day was missed, a stale streak immediately resets to `0` (and any fabricated future dates are pruned); if yesterday was played the streak survives. `hasPlayedToday` recomputes on the forced re-render, so fire icons across headers, Profile ("Me"), module headers, and the Victory screen instantly switch to the unlit grey state without requiring a page reload. Corrected state syncs to Supabase automatically.
- **Duolingo Streak Calendar**: Rendered in Profile and Streak Screen drawer modal. Days where the learner *actually* played display lit fire badges (`Flame`); past days with no activity remain open/unlit. The current day is lit only after the learner completes their first activity of that day.
- **Streak Transition Animations**: Counter transitions smoothly from `previousStreak` to `currentStreak` (e.g., `3 -> 4`) with an absolutely positioned, floating `+1` badge effect that floats upwards (`plusOneFloatUp` animation) next to the number, avoiding layout shifts, followed by an igniting scale-pop animation on the main counter number.
- **Theme & Aesthetics**: Styled universally to match the platform's main game theme. Uses a soft, light sage background canvas (`#d4e8d5`), crisp white tracker cards (`#ffffff`) with sage borders (`#b0cbaf`), deep forest green labels, and tactile 3D buttons.
- **Indicator**: Active Flame (`#ff6d00` badge/fill, `#ff9800` border), Inactive Flame (`#b0cbaf` dot).
- **Reset Trigger**: Absence of recorded activity on the previous calendar day (enforced at the next local midnight).
- **Cloud Sync (lossless, offline-safe, cross-device)**: Every state change snapshots into a per-account "pending sync" queue in `localStorage` *before* the Supabase `game_progress` upsert is attempted. The queue is cleared only after the server write succeeds; failed writes (offline play, flaky mobile networks, expired sessions) are retried automatically on state change, on reconnection (`online`), and when the tab becomes visible again. **`played_dates` lives inside the `bot_stats` JSONB column** (there is no separate `played_dates` column in `game_progress` — the payload never sends one, so upserts can't fail against the real schema). On app start the pending queue and the server row are resolved **last-writer-wins by timestamp**: if the pending snapshot `savedAt` is NEWER than the row's `updated_at`, local progress wins and is re-flushed (offline XP/streak gains are never dropped); if the server row is as new or newer (progress synced from another device), the server wins and the stale queue is discarded so it can never overwrite newer cloud data. Fabricated *default* snapshots (empty 0-state produced by a stuck init or an offline first load on a fresh device) are never flushed or merged over real server data, and a pristine offline fallback blocks syncing entirely until a fetch succeeds — so empty states can't zero out a real account. The pending queue and its last-synced marker **survive sign-out** (they are per-account keyed), and the Profile sign-out button pushes an immediate `flushNow` before logging out, so play right before signing out — even on a flaky connection — is never lost and restores on the next login. Backgrounding or closing the app fires an immediate flush (`pagehide` / hidden state) because mobile browsers throttle debounce timers. An account whose server row is missing (`PGRST116`) but which holds real queued progress restores from the queue instead of being reset to a fresh 0-state. The leaderboard pushes any pending progress (immediate `flushNow`) before fetching, refreshes again when the app returns to the foreground, and shows the signed-in learner's row with live app values, so the board can't lag or contradict the app. Auth token refreshes no longer reset in-memory progress (initialization is keyed on the account ID, and re-runs if a mid-flight init was aborted).

### Leaderboards & Rankings
- **XP Board**: Ranks learners by total XP (descending), tie-broken by XP (already the key) — only accounts with `xp > 0` qualify.
- **Streak Board**: Ranks learners by their **real stored streak value**. Missing a day removes NOBODY — players remain ranked until their streak is actually `0` (enforced by the local-midnight rollover on the player's next visit) or until stronger streaks push them out of the Top 20. Stale players show an honest `Inactive · last played X days ago` caption instead of being hidden.
- **Real-Time Updates**: Subscribes to `postgres_changes` on `game_progress` so the board refreshes live as players earn XP/streaks; a manual refresh button is available in the header.

### XP & Level Progression
- **Level Formula**: Progressive curve `Level = N` where total XP required to reach Level N is `Math.round(38 * (N - 1)^1.6)` (e.g. Level 2 = 38 XP, Level 5 = 326 XP, Level 10 = 1,277 XP).
- **XP Progress Bar**: Displays progress within current level `(xpInLevel / levelXPReq) * 100`.
- **Level Badge**: Gold Star pill (`#f57f17`).
- **Balanced XP Economy**:
  - **🚀 Space — Illuminate the System**:
    - **Easy** (Top 8): +6 XP Base (+2 Zero-Hint Bonus, +1 Speed Bonus < 45s, Max 9 XP)
    - **Medium** (Top 15): +13 XP Base (+3 Zero-Hint Bonus, +3 Speed Bonus < 120s, Max 19 XP)
    - **Hard** (All 35): +22 XP Base (+5 Zero-Hint Bonus, +4 Speed Bonus < 240s, Max 31 XP)
    - **Loss**: 0 XP (completion required)
  - **♟️ Chess vs Stockfish AI Bot**:
    - **Easy (Beginner Bob ~400 Elo)**: +15 XP Win | +8 XP Draw | +5 XP Effort Loss (>= 10 moves)
    - **Medium (Intermediate Ivy ~1200 Elo)**: +30 XP Win | +16 XP Draw | +10 XP Effort Loss (>= 10 moves)
    - **Hard (Grandmaster Gary ~2500 Elo)**: +45 XP Win | +22 XP Draw | +15 XP Effort Loss (>= 10 moves)
  - **♟️ Chess Tactics Puzzles**:
    - **Base Puzzle Solved**: +6 XP (Easy), +10 XP (Medium), +15 XP (Hard)
    - **Survival Streak Milestones**: +10 XP Bonus (5 Streak), +20 XP Bonus (10 Streak), +30 XP Bonus (20 Streak)


### Victory Screen & Module Theme System
- **Module Theme Modes**: Supports `theme="space"` (deep muted indigo solid card `#171a38`, muted steel border `#3d4461`, muted slate action buttons), `theme="chess"` (dark warm solid card `#1c1917`, 3D amber border `#d97706`), `theme="geo"` (emerald card `#f0fdf4`, green border `#16653e`), and `theme="default"` (playful white/emerald card). The Space victory and Illuminate game-over screens share a unified minimal palette (no vibrant/glowy colors): streak shown in muted rose `#d8a8a8`, XP in muted gold `#d9c58f`, with a clean 54px icon tile and compact stat-slot boxes.
- **Design Enforcement**: Strictly NO glassmorphism (`backdrop-filter`), NO translucent blurry cards, and NO neon glow effects. All modals use solid 3D cards with tactile offset borders and solid pushable buttons.
- **Iconography Standard**: Strictly NO emojis in UI or data. All graphics render high-quality Lucide React icons (`Gem`, `Sparkles`, `Flame`, `Trophy`, `Zap`).

---

## 5. Module Specifications

### ♟️ Chess Module (`/chess`)
- **Components**: `ChessHome.tsx`, `ChessPlay.jsx`, `ChessPuzzlePage.jsx`, `chess.css`.
- **Game Modes**:
  - **Play vs Stockfish AI Bot (`ChessPlay.jsx`)**: Challenge Beginner Bob (~400 Elo), Intermediate Ivy (~1200 Elo), and Grandmaster Gary (~2500 Elo).
    - **Tactile 3D Confirmation Modals**: Features dedicated tactile dialogs for Leaving, Restarting, and Resigning.
    - **Fair Exit Rules**: Backing out or restarting *before* the player makes their first move (whether White on turn 0 or Black on turn 1 after the Bot's first move) does not prompt an exit modal or record a loss.
  - **Chess Tactics Puzzles (`ChessPuzzlePage.jsx`)**:
    - **Sudden Death Survival**: Solve escalating difficulty tactical puzzles with a single life.
    - **Time Attack Blitz**: 3-minute timed mode with +5s rewards for correct moves and -10s penalties for blunders.
    - **Tactile Solution Review & Safe Exit**: Features an interactive board review mode upon completion showing correct solution moves and highlighted mistake squares, a safe back-navigation confirmation modal during active play to prevent loss, and a **Victory Minimized Dock** that floats below the screen during review allowing direct hub exit.
    - **Header Rule Standard**: Sub-page navigation header renders only the back button and title, omitting the streak & level widget reserved for module home screens. To keep Streak & Level metrics accessible while complying with this header rule, they are displayed inside the **Victory Minimized Dock** at the bottom of the review layout.
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
    - **Simulation Speed Controller & Freeze Mode**: Interactive tactile 3D vertical slider bar on the left allowing full speed control from `0.0x` (Frozen / Paused in time for close-up examination) up to `2.0x` speed, featuring preset buttons (`Freeze ⏸`, `0.25x`, `0.5x`, `1.0x`, `2.0x`). Stopping the simulation (`simSpeed = 0`) automatically disables the camera auto-rotation on `OrbitControls` to prevent screen movement.
    - **Camera View Retention**: Closing the Info Panel (via `X` button) preserves the user's current zoomed-in, focused camera perspective instead of resetting or lerping back to the default overview position.
    - **Enhanced Clickability & Hitboxes**: Expanded invisible raycast hit spheres (`args={[Math.max(size * 1.5, 0.45), 16, 16]}`) and interactive `pointerEvents: 'auto'` HTML 2D text labels for effortless selection of small planets, dwarf planets, and moons.
    - **Natural Satellites & Moon Explorer**: Features natural satellites orbiting Earth (Luna), Mars (Phobos, Deimos), Jupiter (Io, Europa, Ganymede, Callisto), Saturn (Enceladus, Tethys, Dione, Rhea, Titan, Iapetus), Uranus (Ariel, Umbriel, Titania, Oberon), Neptune (Triton), Pluto (Charon), and Orcus (Vanth).
    - **Detailed Moon Textures**: Moons and binary companions render with dedicated high-resolution surface textures (e.g. Luna, Io, Europa, Ganymede, Callisto, Titan, Ariel, Oberon, Titania, Triton, Charon) wrapped around smooth 32-segment sphere geometry, falling back to a cratered moon texture with custom color tinting for others.
    - **Surface-Relative Orbit Scaling**: Satellite orbital distances are scaled relative to their parent planet's surface radius rather than their center using `R_planet + (configuredDistance - R_planet) * 0.6 + 0.15`. This prevents inner moons (like Io) from being buried inside the planet mesh while ensuring Saturn and Jupiter moon systems never collide.
    - **High-Fidelity Layered Starfield**: The deep space backdrop is rendered using two independent layers of Drei `<Stars>` (16,000 tiny background stars and 4,000 medium colored stars) to create a subtle, non-distracting 3D parallax effect on camera rotation.
    - **Tactile Info Panel Action Buttons**: Features redesigned Close and Collapse buttons in the top-right corner, enlarged to 36px with 20px icons and tactile 3D offset box-shadows (active press translates 2px down).
    - **Direct Close shortcut in Collapsed State**: Added an adjacent circular Close (X) button directly next to the collapsed state's "SHOW INFO" expand tab, allowing one-click exit from the focused view.
    - **Binary Dwarf Systems**: Both Pluto & Charon and Orcus & Vanth orbit their respective shared barycenters in open space outside their primary bodies.
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
    - **Global Error Boundary**: The entire app is wrapped in an `ErrorBoundary` component. If a network chunk loading error occurs or the app experiences a runtime crash, it intercepts the blank screen and presents a custom soft light sage error recovery screen with a tactile 3D **"Refresh App"** button that automatically clears the active browser/PWA caches and hard reloads the application.
    - **PWA Service Worker & Cache Strategy**:
      - Registers a custom Service Worker (`public/sw.js`) with an automatic update checking sequence running in the background every 30 minutes.
      - **Network-First Navigation Strategy**: Directs navigation/index requests to fetch from the network first to guarantee new code deployment hashes load instantly, falling back to cached files only when offline.
      - **Stale-While-Revalidate Asset Cache**: Background-updates CSS, JS, and image assets seamlessly while serving cached versions immediately for ultra-fast startup.
      - **Automatic Cache Flushing**: Detects new deployments in the background, automatically activates the new service worker via `skipWaiting()`, and performs a clean background window reload to avoid stale JS chunk exceptions.
      - **Theme-Aligned Launch Experience**: Configured the native PWA launch background (`background_color` in `manifest.json` and `theme-color` in `index.html`) to match the soft light sage canvas color (`#d4e8d5`) with a translucent status bar (`black-translucent`), preventing the default blank white transition screen on iOS and Android.
  - **Cosmic Mystery Card Challenge (`CosmicMystery.tsx`)**:
    - **Dual Game Modes**:
      - **10-Card Sprint**: 10-round speedrun trivia format with real-time timer, +3s wrong answer penalty, and local storage Best Time record (`cosmic_mystery_sprint_best_time`). Flawless 10/10 runs unlock a gold `Crown` badge. XP: +1 XP per correct answer, +5 XP perfect run bonus, +5 XP speed demon bonus (<30s).
      - **Endless Survival**: 3 Lives mode where players answer continuous cards to score as high as possible before losing all 3 lives, displaying total cards answered and accuracy percentage alongside High Score (`cosmic_mystery_survival_high_score`). XP: +1 XP per correct answer + tier bonuses (+5 XP at 10 pts, +10 XP at 20 pts).
    - **Recent Runs History Timeline**: Displays a row of flat history pills at the bottom of each start card tracking the last 3 runs.
    - **Combo Streak & High Record Tracking**: Displays a live `Flame` combo badge during gameplay (e.g. `🔥 5 Streak!`) and displays session max streak on the Victory Screen, saving all-time max combo records.
    - **Supabase Cloud Sync**: All card game records (high scores, crowns, recent run histories, and max streak values) sync to the Supabase `game_progress` table (`bot_stats.cosmicMystery` JSONB column) via `GameContext`, restoring seamlessly across all devices upon login.
    - **Tricky Multiple-Choice**: 4 options per card with distractors prioritized from the same `astronomicalType` or `type`.
    - **Sanitized Clues**: Automatically masks occurrences of object names in clues.
    - **Header Rule Standard**: Sub-page navigation header renders only back button + title banner, omitting the streak & level widget reserved for module hub pages. Reuses `VictoryScreen` overlay with `theme="space"` in a clean 2x2 grid stats layout.
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
