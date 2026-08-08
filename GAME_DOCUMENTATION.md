# LearningJemz — System & Architecture Documentation

## 1. Executive Overview
- **Game Name**: `LearningJemz`
- **Description**: A gamified interactive learning platform featuring Chess, Geography, Reading, and Space exploration modules. Built with React, Vite, and CSS 3D Tactile design systems.
- **Target Audience**: Students and lifelong learners seeking high-engagement educational mini-games.

---

## 2. Design System & Visual Aesthetics
- **Theme Palette**:
  - **Canvas Background**: Medium-Light Sage Green (`#d4e8d5`).
  - **Primary Headers & Text**: Forest Green (`#0f3825` & `#16653e`).
  - **Card Surface**: Crisp White (`#ffffff`) with Muted Sage Borders (`#b0cbaf`).
  - **Tactile 3D Shadows**: `box-shadow: 0 4px 0 #b0cbaf` (elements) and `0 3px 0 #0e4329` (buttons). Active press translates `2px` downward.
- **Typography**:
  - **Headings**: `Outfit` (Bold, rounded geometric sans-serif, `800 - 900`).
  - **Body**: `Inter` (Clean, legible sans-serif).
- **Layout & Container Boundaries**:
  - **Max Width**: `640px` centered container across desktop and tablet views.
  - **Bottom Navigation**: Floating 3D pill navigation bar (`border-radius: 24px`) on screen widths `>= 640px`.
  - **Cards**: Responsive 2-column active card grid (`repeat(auto-fit, minmax(260px, 1fr))`).

---

## 3. Core Gamification Mechanics

### Streak System
- **Logic**: Tracks consecutive daily activity completion.
- **Indicator**: Active Flame (`#e53935` / `#ff4d4d`), Inactive Flame (`#888888`).
- **Reset Trigger**: Absence of recorded activity within a 24-hour rolling window.

### XP & Level Progression
- **Level Formula**: `Level = floor(Total XP / 100) + 1`
- **XP Progress Bar**: Displays `(Total XP % 100) / 100` progress to next level.
- **Level Badge**: Gold Star pill (`#f57f17`).

### Title Badges
- **Badge Hierarchy**: Dynamic title pills awarded based on level thresholds and module completions (e.g., Novice Explorer, Grandmaster Learner).

---

## 4. Module Specifications

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

## 5. Technical Infrastructure & CI/CD
- **Routing**: `React Router v7` with `ErrorBoundary` wrappers. Deep linking enabled without unwanted home redirects.
- **Service Worker / PWA**: Direct cache invalidation script in `index.html` and `vercel.json` headers (`Cache-Control: no-cache, no-store, must-revalidate`).
- **Git Branching Strategy**:
  - `main`: Live Production (Vercel deployment target).
  - `dev`: Primary Integration & Development base.
  - `feature/*`: Module-scoped feature branches (`feature/chess-module`, `feature/space-module`, `feature/geo-module`, `feature/reading-module`, `feature/gamification-core`, `feature/ui-design-system`).
