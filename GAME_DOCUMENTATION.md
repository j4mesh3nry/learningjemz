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
- **Theme Palette**:
  - **Canvas Background**: Medium-Light Sage Green (`#d4e8d5`).
  - **Primary Headers & Text**: Forest Green (`#0f3825` & `#16653e`).
  - **Card Surface**: Crisp White (`#ffffff`) with Muted Sage Borders (`#b0cbaf`).
  - **Tactile 3D Shadows**: `box-shadow: 0 4px 0 #b0cbaf` (elements) and `0 3px 0 #0e4329` (buttons). Active press translates `2px` downward.
- **Typography**:
  - **Headings**: `Outfit` (Bold, rounded geometric sans-serif, `800 - 900`).
  - **Body**: `Inter` (Clean, legible sans-serif).
- **Layout & Multi-Device Responsive System**:
  - **Mobile (< 640px)**: 100% fluid container (`padding: 16px`), 1-column card grids, and fixed bottom floating navigation pill bar.
  - **Tablet (640px - 1024px)**: Expanded max-width container (`860px`), 2 to 3 column active & coming-soon module card grids, 2-column profile dashboard, and centered floating navigation dock (`max-width: 580px`).
  - **Desktop / PC (> 1024px)**: Wide max-width canvas (`1200px`), 4-column module grid, side-by-side dashboard panels, and spacious navigation dock (`max-width: 680px`).

---

## 4. Core Gamification Mechanics

### Streak System
- **Logic**: Tracks consecutive daily activity completion.
- **Indicator**: Active Flame (`#e53935` / `#ff4d4d`), Inactive Flame (`#888888`).
- **Reset Trigger**: Absence of recorded activity within a 24-hour rolling window.

### XP & Level Progression
- **Level Formula**: `Level = floor(Total XP / 100) + 1`
- **XP Progress Bar**: Displays `(Total XP % 100) / 100` progress to next level.
- **Level Badge**: Gold Star pill (`#f57f17`).

### Leaderboard & Ranking System
- **Qualification Rules**:
  - **Streak Tab**: Only learners with active daily streaks (`effectiveStreak > 0`) qualify to appear on the Streak Leaderboard. Zero-streak and inactive learners are filtered out.
  - **XP Tab**: Only learners with `XP > 0` qualify to compete.
- **Top 20 Hall of Fame**: Main leaderboard is strictly capped at the **Top 20** learners (Top 3 on Gold/Silver/Bronze podium + Ranks 4–20 in list).
- **Target Progression Engine**:
  - Pinned rank status bar dynamically calculates progress needed to break into the Top 20 or overtake the player directly ahead.
  - Displays actionable call-to-action shortcuts (*"Play Now →"*) for unranked/unqualified players.
  - Renders open spots invitation card when fewer than 20 learners qualify.

### Title Badges
- **Badge Hierarchy**: Dynamic title pills awarded based on level thresholds and module completions (e.g., Novice Explorer, Grandmaster Learner).

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
- **Components**: `SpaceHome.tsx`, `IlluminateSystem.jsx`, `space.css`.
- **Game Modes**: 3D Planet Explorer (Three.js), Solar System Illuminate size-ordering challenge.

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
