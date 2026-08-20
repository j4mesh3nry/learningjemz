# 💎 LearningJemz

> **A personal, gamified learning platform for anyone who wants to learn a lot.** 
> Explore diverse learning modules, earn XP, build streaks, and climb the leaderboard!

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://learningjemz.vercel.app)
[![CI](https://github.com/j4mesh3nry/learningjemz/actions/workflows/ci.yml/badge.svg)](https://github.com/j4mesh3nry/learningjemz/actions/workflows/ci.yml)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue?style=flat-square)](https://web.dev/progressive-web-apps/)
[![Tests](https://img.shields.io/badge/Tests-Vitest-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Status: Proprietary](https://img.shields.io/badge/Status-Proprietary-red?style=flat-square)]()

**🔗 [Play LearningJemz](https://learningjemz.vercel.app)** | 📱 Install as app on iOS/Android

---

## 🎯 About LearningJemz

LearningJemz is a modern gamified learning platform designed to make daily practice addictive, immersive, and rewarding. Built with a rich atmospheric mobile-game aesthetic, the platform combines diverse learning genres into a single, cohesive game world powered by a unified progression engine.

### Core Highlights
- **📱 Atmospheric Mobile-Game Aesthetic** — Deep dark canvas, thematic illustrated cards, ambient glowing borders, and tactile UI feedback.
- **🦉 2-Layer Dynamic Hero Companion** — A scenic landscape backdrop with a modular overlay slot that displays dynamic companion avatars based on the player's profile.
- **🎮 Unified Progression Engine** — Earn XP, level up, and maintain daily streaks across *all* learning modules.
- **🏆 Global Leaderboards & Stats** — Real-time competitive rankings (XP and Streak podiums) and progress matrices.
- **☁️ Realtime Cloud Sync** — Powered by Supabase, your progress, streak history, and achievements are seamlessly saved and synced across all devices.

---

## 🧩 Current Learning Modules

### 🪐 **Space Exploration**
Explore astronomy and the scale of the cosmos through interactive 3D visualizers and game modes.
- **3D Solar System Visualizer** — Proportional Three.js visualizer with accurate AU planetary distances, natural satellites, and interactive celestial fact badges.
- **Illuminate the System** — Interactive size-ordering spelling challenge with a progressive, input-aware clue and hint system.
- **Cosmic Mystery** — Sanitized multiple-choice trivia challenge featuring a 10-Card Speedrun Sprint and Endless Survival mode.

### ♟️ **Chess Tactics & AI**
Master chess strategy and exercise critical thinking.
- **Play vs AI Bots** — Test skills against Stockfish AI bots across Beginner, Intermediate, and Grandmaster difficulties.
- **Chess Tactics Puzzles** — Rapid tactical puzzles with streak-based bonus milestones.

---

## 🎨 Design System & Architecture

LearningJemz is engineered around a reusable **Mobile-Game Component Library**:
- **Design Tokens (`--game-*`)**: Centralized color tokens for deep canvas (`#030d09`), card surfaces (`#05130e`), and luminous accents (Emerald, Gold, Streak Red, Cyan).
- **Reusable UI Atoms (`src/components/game/`)**:
  - `SectionDivider` — Two-tone headlines with leaf flourishes and diamond accents.
  - `GameModuleCard` — Standard 142px tall illustrated mission cards with 3D artwork and circular action buttons.
  - `StatTile` — 4-matrix progress tiles with individual glowing value accents.
  - `SegmentedSwitcher` — Dark pill switcher for `Play | Learn` and `XP | Streak` tabs.
  - `HeroCharacter` — Modular companion slot for dynamic user avatars.

---

## 🛣️ Roadmap & Upcoming Modules

LearningJemz is designed to expand with new educational frontiers:

### 📚 Upcoming Modules
- 🔒 **Expanding Learning Frontiers** — Additional subjects, mini-games, and learning challenges are continuously planned to expand the LearningJemz universe. Placeholder preview cards (Module 3, Module 4, Module 5) are staged on the dashboard for future release.

### 🛠️ Future Features
- **Rewards Store:** Economy where learners can redeem Jemz for exclusive avatar companions and badges.
- **AI Learning Companions:** Intelligent assistants providing guided practice and hints.
- **App Store Releases:** Native packaging for iOS App Store and Google Play Store.

---

## 🚀 The Tech Stack

- **Frontend:** React, Vite, React Router, Lucide React
- **3D Graphics:** Three.js, React Three Fiber (R3F)
- **Styling:** Vanilla CSS with scoped game design tokens
- **Backend & Database:** Supabase (PostgreSQL, Authentication, Realtime Sync)
- **Testing:** Vitest + React Testing Library (15 test files / 96 tests)
- **Deployment:** Vercel (PWA enabled)

---

## 🔐 Licensing & Copyright

LearningJemz is a **proprietary personal project** created and owned entirely by James Henry Emorricha. All rights reserved.

---

## 👨‍💻 Author

**James Henry Emorricha**
