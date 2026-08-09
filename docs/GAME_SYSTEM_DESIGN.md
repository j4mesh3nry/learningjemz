# LearningJemz - Complete Game System Design & Architecture

This document is the absolute source of truth for the LearningJemz application. It details every single aspect of the game's architecture, logic, design language, gamification systems, and individual module mechanics. As the application scales, this document must be updated to reflect the current state of the codebase.

---

## 1. Vision & Core Architecture
LearningJemz is designed to be a highly gamified, educational progressive web app. The core philosophy is to use psychological feedback loops (streaks, leveling, achievements, micro-animations) heavily inspired by Duolingo to incentivize learning across various disciplines (Chess, Geography, Space, Reading).

### Tech Stack
- **Frontend Framework**: React 18, built with Vite for lightning-fast HMR and bundling.
- **Routing**: `react-router-dom` v6. We use a global `<Layout>` component in `App.jsx` that conditionally renders the `<BottomNav>` only on root paths (Home, Rank, Store, Profile). Sub-modules use nested routing (`/chess/*`, `/geo/*`).
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
- **Data Syncing**: Uses a `useEffect` hook to debounce saves to Supabase whenever the local state changes, ensuring cloud persistence without spamming the database.

---

## 3. The Gamification Engine

### A. Experience Points (XP) & Leveling
Level progression is designed to be intentionally slow and demanding. We avoid rapid level-ups so that high-level badges hold genuine prestige.
- **The Formula**: `Level = Math.floor(TotalXP / 100) + 1`. Every 100 XP grants a new level.
- **The Economy (XP Rewards)**:
  - **Chess Checkmate against Bot**: `+15 XP`
  - **Chess Puzzle Solved**: `+5 XP`
  - **Geography Province Identified**: `+2 XP`
  - **Space Flashcard Mastered**: `+2 XP`
  - **Reading**: `+1 XP` per minute of active reading.

### B. The Streak "Ignition" System
Streaks are the core retention mechanic, heavily leveraging psychological triggers.
1. **Activity-Based**: Streaks are *not* awarded for just opening the app. They are only awarded via the `recordActivity()` function when a user completes a task (e.g., checkmating a bot).
2. **`hasPlayedToday` State**: The `GameContext` checks `state.lastVisit === new Date().toDateString()` and exports a global boolean `hasPlayedToday`.
3. **The Global "Unlit" Psychological Trigger**: 
   - When a user logs in, if `hasPlayedToday` is false, the 🔥 streak badges across the Home page, Profile, and all Module headers are rendered with the `.unlit-icon` class (`filter: grayscale(100%) opacity(40%)`) and `.unlit-text` class (grey text).
   - This creates a visual "void" that the user feels compelled to fill by completing a task.
4. **The "Ignition" Animation**:
   - When a user wins their first game of the day, the victory overlay pops up showing their old streak number and the greyed-out fire icon.
   - After a dramatic 0.8s delay, the `.igniting` CSS class is applied.
   - The fire icon physically pulses (`scale(1.5)`), drops its grayscale filter, bursts into full vibrant color, and the number dynamically ticks up by 1.
   - Upon returning to the main menu, the streak is now permanently "lit" globally for the rest of the day.

### C. Achievements
- Managed in `utils/achievements.js`.
- Contains an array of objects with `id`, `name`, `icon`, `desc`, and a dynamic `condition` function (e.g., `(s) => s.level >= 5`).
- The `GameContext` runs a `useEffect` that constantly evaluates the current state against all locked achievements. If a condition returns `true`, it is unlocked and pushed to the Supabase `achievements` table.

---

## 4. UI/UX Design Language & Theming

The application explicitly avoids Dark Mode to maintain a bright, energetic, and engaging environment.

### Typography
- **Headings & Large Numbers**: `Outfit` (sans-serif) - chosen for its modern, geometric, and highly legible structure.
- **Body & UI Elements**: `Inter` (sans-serif) - chosen for maximum readability at small sizes.

### Global Color Palette (CSS Variables)
- **Primary Brand**: Emerald Green (`--color-primary: #1c7c54`). Used for primary buttons, the main logo, and active states.
- **XP / Rewards**: Amber/Gold (`--color-xp: #ffb400`).
- **Streak**: Vibrant Red/Orange (`--color-streak: #ff4d4d` / `#e53935`).
- **Backgrounds**: White (`#ffffff`) for cards, Off-White (`#f5f5f5`) for main backgrounds.

### Module-Specific Color Identities
Each learning module has its own distinct background color to create a sense of place:
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
- **AI Opponents**: Powered by a custom `chessEngine.js` utilizing a Minimax algorithm with Alpha-Beta pruning and standard piece-square tables to evaluate positions.
  - **Beginner Bob (Easy)**: Depth 2, randomizes moves slightly for lower difficulty.
  - **Intermediate Ivy (Medium)**: Depth 3, standard tactical play.
  - **Grandmaster Gary (Hard)**: Depth 4, aggressive and highly calculating.
- **Board Rendering**: A custom CSS Grid implementation (`grid-template-columns: repeat(8, 1fr)`) that renders the 64 squares.
- **Assets**: Uses the standard Lichess `cburnett` SVG piece set (downloaded locally via script) for a professional, universally recognizable look.
- **Mechanics**:
  - **3D Board Flip**: Clicking "Flip" applies `transform: rotate(180deg)` to the entire board container. To prevent the pieces from being upside down, a counter-rotation (`transform: rotate(-180deg)`) is simultaneously applied to every piece. Player profile banners are swapped instantly using CSS Flexbox `order`.
  - **Victory Cards**: When checkmate occurs, a cinematic overlay drops down displaying two beautiful, rounded white stat cards with drop shadows—one showing the Streak gained, and one showing the XP gained.

### B. Geography Module (`/geo`)
Focused currently on Philippine geography.
- **Core Loop**: Users are presented with a blank map or a highlighted region and must identify the correct province from multiple choices.
- **Progression**: Correct answers grant +2 XP and track towards the `provincesCorrect` stat.

### C. Space Module (`/space`)
A memory and trivia module.
- **Flashcards**: Uses a basic implementation of Spaced Repetition. Mastering a flashcard grants +2 XP.
- **Quizzes**: Tests knowledge retained from flashcards. High scores are tracked in the global state (`quizHighScore`).
- **Illuminate the System**: Size-ordering spelling puzzle across up to 35 solar objects. The Reveal Letter hint is progressive and input-aware — it reveals the correct prefix up to the first letter typed incorrectly (e.g. `JUPETIR` → `JUPI`), advancing with each hint while skipping positions already typed correctly. Wrong submissions retain the learner's typed text so they can consult the hint. After the first object (Sun) is guessed, a brief non-blocking gold cue ("Tap any lit objects for facts") teaches that revealed objects are tappable for mini facts.

### D. Reading Module (`/reading`)
A focus and comprehension module.
- **Mechanic**: Users select texts to read. A timer tracks their active reading time.
- **Progression**: Rewards are time-based (+1 XP per minute) to encourage sustained focus rather than rushing through texts.

---

## 6. Future Expansion Guidelines
When adding new features or modules, adhere strictly to these rules:
1. **Never use standard browser alerts (`alert()`)**. Always build custom, sleek React modals (like the Restart Confirmation modal).
2. **Never bypass `GameContext`**. All XP gains and streak triggers MUST route through `GameContext.jsx` functions to ensure they are properly synced to Supabase and trigger achievements.
3. **Maintain the "Unlit" convention**. Any new modules that display the streak badge in their header must implement the `hasPlayedToday` check and apply the `.unlit-icon` and `.unlit-text` classes.
4. **Use Lucide Icons**. For consistency, all UI icons should be pulled from the `lucide-react` library unless they are specific emojis used for gamification (🔥, 🏆, 💎).
