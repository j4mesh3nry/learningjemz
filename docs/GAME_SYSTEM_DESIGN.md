# LearningJemz - Game System Design & Architecture

This document serves as the central source of truth for the LearningJemz application, detailing the core architecture, design systems, gamification logic, and module specifics. As the app grows, this document should be updated to reflect major structural changes.

## 1. Core Architecture
- **Framework**: React (via Vite)
- **Routing**: React Router (`react-router-dom`)
- **Backend & Database**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Styling**: Vanilla CSS (CSS Grid, Flexbox, CSS Variables for theming)
- **State Management**: React Context API (`AuthContext`, `GameContext`)

## 2. Thematic Design & Aesthetics
The application uses a mobile-first, highly gamified aesthetic heavily inspired by Duolingo. It avoids dark mode to maintain a vibrant, engaging light theme globally.

### Typography
- **Headings**: `Outfit` (sans-serif) - Used for all titles, module headers, and large numbers.
- **Body**: `Inter` (sans-serif) - Used for UI elements, descriptions, and buttons.

### Global Color Palette
- **Primary Brand**: Emerald Green (`#1c7c54`)
- **XP / Rewards**: Amber/Gold (`#ffb400`, `#f57f17`)
- **Streak**: Vibrant Red/Orange (`#e53935`, `#ff4d4d`)

### Module Specific Backgrounds
Each module has a distinct primary background color to give it a unique identity:
- **Chess**: Dark Emerald (`#0e4d2e`)
- **Geography**: Philippines Teal (`#0066cc`)
- **Reading**: Warm Amber (`#d16f2c`)
- **Space**: Deep Space Black (`#0a0a0a`)

## 3. Gamification Systems (GameContext.jsx)

### Experience Points (XP) & Leveling
Level progression is heavily slowed down to make higher levels feel prestigious. The formula is:
`Level = floor(TotalXP / 100) + 1`

**Current XP Rewards:**
- **Chess Win (Checkmate)**: +15 XP
- **Chess Puzzle Solved**: +5 XP
- **Geography Province Correct**: +2 XP
- **Space Flashcard Mastered**: +2 XP
- **Reading**: +1 XP per minute read

### The Streak "Ignition" System
Streaks are strictly activity-based and heavily gamified using psychological triggers.
- **`hasPlayedToday` State**: Evaluates if `state.lastVisit === today`. 
- **Global Unlit State**: When a user logs in and hasn't completed an activity (`hasPlayedToday` is false), the 🔥 streak badges across the Home, Profile, and Module headers are rendered in grayscale (`filter: grayscale(100%) opacity(40%)`). This creates a visual "itch" to light the fire.
- **Ignition Animation**: When a user completes their first activity of the day (e.g., checkmating a bot), the `recordActivity()` function is called. The victory overlay displays the unlit streak, which physically pulses and bursts into vibrant color (`.igniting` CSS animation), visually ticking up their streak.

### Achievements
Achievements are automatically evaluated in `GameContext` via `useEffect`. If a user meets a condition in `achievements.js` (e.g., Reach Level 5), the achievement is instantly unlocked and saved to the Supabase `achievements` table.

## 4. Module Specifics

### Chess Module (`/chess`)
- **Engine**: `chess.js` is used for move generation and validation. A custom MiniMax algorithm with alpha-beta pruning (`chessEngine.js`) powers the Bot opponents (Beginner Bob, Intermediate Ivy, Grandmaster Gary).
- **Assets**: The board uses the standard, highly readable open-source Lichess `cburnett` SVG piece set.
- **Interactions**:
  - **3D Flip**: Clicking Flip applies a CSS `transform: rotate(180deg)` to the board, while pieces counter-rotate (`-180deg`) to stay upright. Profile banners use CSS Flexbox `order` to swap places seamlessly.
  - **Victory Overlay**: Instead of standard alerts, a custom cinematic overlay with animated Stat Cards (Streak and XP) appears upon checkmate.
