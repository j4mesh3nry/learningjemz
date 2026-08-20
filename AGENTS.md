# AGENTS.md — LearningJemz

React + Vite + Supabase gamified learning PWA (React Router SPA, vanilla CSS, Lucide icons). See `README.md` for product overview, `docs/GAME_SYSTEM_DESIGN.md` ("source of truth") and `GAME_DOCUMENTATION.md` for mechanics.

## Commands & verification (run in this order of reliability)

- `npm run dev` — Vite dev server. Requires `.env.local` (gitignored) with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for auth/cloud-sync to work.
- `npm run lint` — oxlint. Exit code is 0 but emits pre-existing warnings (unused vars/imports, exhaustive-deps, fast-refresh). Do NOT chase them; only avoid adding new ones. Husky pre-commit hook runs this.
- `npm test` — Vitest (`vitest run`). 15 files / 96 tests; runs to completion and exits. If you see a hang again, run focused files, e.g. `npx vitest run src/pages/__tests__/Home.test.tsx`.
- `npm run build` — `tsc -b && vite build`. Passes. It's the only typecheck step, so use it after TS changes. No separate typecheck script.

- Active branch for development is `dev` (and feature branches created from `dev`). 
- **Workflow Flow**: `dev` → `feature/*` → develop + test on feature branch (user runs `npm run dev` to verify) → feature PR → merge to `dev` → promote to `main` (only when explicitly requested by user).
- **PRs/Merges**: Feature branches MUST be merged back into `dev` first (never directly to `main` unless explicitly requested). 
- **Testing**: The primary testing stage happens on the feature branch where the user tests. When merging to `dev`, the AI can do a quick check on `dev` by itself, but full retesting is not required from scratch since the feature branch was already verified.
- CI (`.github/workflows/ci.yml`) runs lint + test **only on pushes/PRs to `main`** (plus pushes on `enhance/*`). `dev` has no CI guard — validate locally before pushing.
- Windows / CRLF: `core.autocrlf=true` makes `git status` show ~70 files as modified even when only a few have real diffs. Check `git diff --ignore-cr-at-eol` first; never `git add -A` blindly.
- When merging features to `main`, update `GAME_DOCUMENTATION.md` (and `docs/GAME_SYSTEM_DESIGN.md`) to match.

## Hard Design Rules & Mobile-Game Design System

- **No emojis** in UI or data. All icons via Lucide React or custom SVG. Custom icons must follow the flat, stroke-based Lucide grammar (24x24 viewBox, `stroke="currentColor"`, no fill, round caps/joins). NO cartoon or emoji artwork as UI icons.
- **Atmospheric Mobile-Game Aesthetic**:
  - Deep dark game canvas (`--game-bg-canvas: #030d09`, `--game-surface-card: #05130e`).
  - Subtle ambient border glows and theme-tinted outlines (`--game-border-default: #102d1f`, Chess amber `#855930`, Space sapphire `#295285`).
  - **Unique Thematic Identity per Module**: Every learning module MUST have its own distinct, immersive theme vibe (custom surface tint, themed glowing border, action button colors, and custom 3D card artwork) to give players a unique environment when entering that realm, while anchoring to the dark canvas baseline.
  - Thematic 3D artwork assets for module cards and panoramic landscape hero scenes.
  - Reusable component library in `src/components/game/` (`SectionDivider`, `GameModuleCard`, `StatTile`, `SegmentedSwitcher`).
- **2-Layer Hero Architecture**: Background scenery remains a continuous landscape (`home-hero-landscape.jpg`), while the companion character is a separate overlay layer via `<HeroCharacter avatar={user.avatar} />` on the stone cliff ledge so user avatars can be dynamically swapped.
- **Theme connection**: Screens must hook into the global game tokens in `src/index.css` (`--game-*`, `--color-*`, `--font-heading`, `--font-body`).
- **Typography**: Outfit for headings/titles/numbers, Inter for body text and micro-labels. Vanilla CSS with tokens in `src/index.css`; no CSS framework.
- **No visible scrollbars**: Page and container scrollbars must never be visible (`scrollbar-width: none`, `-ms-overflow-style: none`, `::-webkit-scrollbar { display: none }`). Enforced globally in `src/index.css`; do not re-enable scrollbars on any element.
- **Module Headers**: The top header capsule widget showing Streak & Level/XP (`Flame` & `Star`) must ONLY appear on the root/home page of each module (e.g. `SpaceHome.tsx`). Sub-pages, games, and sub-screens must NOT render this widget in their top navigation header; sub-page headers must only render the back button and title banner.

## Architecture

- Routes are nested per active module: `/chess/*` → `src/pages/chess/ChessHome.tsx`, `/space/*` → `src/pages/space/SpaceHome.tsx`. Upcoming modules (Module 3, Module 4, Module 5) are displayed as locked preview cards on Home with no active routes yet. Module home files are `.tsx`; most sub-pages and components are `.jsx`. Prefer TypeScript for new files (`tsconfig.app.json` has `allowJs`, `noImplicitAny: false`, `erasableSyntaxOnly: true`).
- Global state: `src/contexts/AuthContext.jsx` (Supabase auth) and `src/contexts/GameContext.jsx` (XP/level/streak/playedDates, synced between `localStorage` and Supabase `game_progress`). Context files intentionally export non-component helpers — the fast-refresh lint warnings there are expected; don't "fix" them.
- Supabase client: `src/utils/supabase.js`; helper layer: `src/api/supabase.js`. Tables: `game_progress`, `achievements`.
- Data: `src/data/space-objects.js` (35 solar-system objects in size order with a strict 1:1 mnemonic — keep ordering/mapping intact) and `chess-puzzles.json`. `scripts/` and `download_pieces.cjs` are one-off data-fetch scripts (Lichess), not part of the app.
- Chess AI: `public/stockfish/stockfish.js` loaded as a Web Worker in `src/pages/chess/ChessPlay.jsx` with a local JS fallback. It's minified — ignore lint on it.

## Testing conventions

- Vitest + React Testing Library. Tests live in `__tests__/` dirs next to code, named `*.test.tsx`. Setup in `src/test/setup.ts` mocks `matchMedia`.
- Tests mock the contexts (`vi.mock`/`vi.spyOn` on `GameContext`/`AuthContext`) and don't need `.env.local`.

## Group Chat Update Rule

- **Rule**: Whenever the user requests to merge/promote a feature to `main`, the agent MUST automatically perform the following two actions before concluding:
  1. Update `GAME_DOCUMENTATION.md` and `docs/GAME_SYSTEM_DESIGN.md` with descriptions of the new system features.
  2. Generate and output a Group Chat Update following the template below in the final response.
  *This workflow must execute automatically without requiring a user reminder.*

## Group Chat Update Template

- **Format**: `🎉 <Feature> – <Brief description>.`  
- Keep it under 2 sentences.  
- Use emojis sparingly (👍, 🚀, 🐞) – they are allowed in the message even though UI cannot contain them.
- Example: `🚀 Added new Cosmic Mystery Sprint mode – players now earn up to 20 XP for perfect runs.`
