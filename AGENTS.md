# AGENTS.md — LearningJemz

React + Vite + Supabase gamified learning PWA (React Router SPA, vanilla CSS, Lucide icons). See `README.md` for product overview, `docs/GAME_SYSTEM_DESIGN.md` ("source of truth") and `GAME_DOCUMENTATION.md` for mechanics.

## Commands & verification (run in this order of reliability)

- `npm run dev` — Vite dev server. Requires `.env.local` (gitignored) with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for auth/cloud-sync to work.
- `npm run lint` — oxlint. Exit code is 0 but emits **~5,000 pre-existing warnings** (unused vars/imports, exhaustive-deps, fast-refresh). Do NOT chase them; only avoid adding new ones. Husky pre-commit hook runs this.
- `npm test` — Vitest (`vitest run`). 7 files / 39 tests; runs to completion and exits. If you see a hang again, run focused files, e.g. `npx vitest run src/pages/__tests__/Home.test.tsx`.
- `npm run build` — `tsc -b && vite build`. Passes. It's the only typecheck step, so use it after TS changes. No separate typecheck script.

## Git workflow & Windows gotchas

- Active branch is `dev` (also the default checkout). Work on `dev` or `feature/*`; commit and push to `origin/dev`.
- CI (`.github/workflows/ci.yml`) runs lint + test **only on pushes/PRs to `main`** (plus pushes on `enhance/*`). `dev` has no CI guard — validate locally before pushing.
- Windows / CRLF: `core.autocrlf=true` makes `git status` show ~70 files as modified even when only a few have real diffs. Check `git diff --ignore-cr-at-eol` first; never `git add -A` blindly.
- When merging features to `main`, update `GAME_DOCUMENTATION.md` (and `docs/GAME_SYSTEM_DESIGN.md`) to match.

## Hard design rules (from `.agents/AGENTS.md` — non-negotiable)

- **No emojis** in UI or data. All icons via Lucide React or custom SVG. Custom icons must follow the flat, stroke-based Lucide grammar (24x24 viewBox, `stroke="currentColor"`, no fill, round caps/joins). NO cartoon or cutesy/emoji-style icon artwork.
- **No glassmorphism** (`backdrop-filter`), no translucent or semi-transparent surfaces (`rgba`/`hsla`/opacity panels, buttons, cards, tiles, borders — solid hex fills only), and no neon glows (`box-shadow: 0 0 ...`, `text-shadow` glows, radial auras, gradient text via `background-clip`). Tactile 3D flat design only: solid colors, solid borders, offset solid shadows (e.g. `box-shadow: 0 4px 0 ...`).
- **Theme connection**: screens/modals must hook into the global tokens in `src/index.css` (`--bg-*`, `--color-*`, `--font-heading`) and the established module palettes (e.g. `theme-space` in `victory.css`) so nothing looks out of place.
- Outfit for headings, Inter for body. Vanilla CSS with tokens in `src/index.css`; no CSS framework.
- **No visible scrollbars**: page and container scrollbars must never be visible (scroll must still work). Enforced globally in `src/index.css`; don't re-enable scrollbars on any element.

## Architecture

- Routes are nested per module: `/chess/*` → `src/pages/chess/ChessHome.tsx`, likewise `/geo`, `/reading`, `/space`. Module home files are `.tsx`; most sub-pages and components are `.jsx`. Prefer TypeScript for new files (`tsconfig.app.json` has `allowJs`, `noImplicitAny: false`, `erasableSyntaxOnly: true`).
- Global state: `src/contexts/AuthContext.jsx` (Supabase auth) and `src/contexts/GameContext.jsx` (XP/level/streak/playedDates, synced between `localStorage` and Supabase `game_progress`). Context files intentionally export non-component helpers — the fast-refresh lint warnings there are expected; don't "fix" them.
- Supabase client: `src/utils/supabase.js`; helper layer: `src/api/supabase.js`. Tables: `game_progress`, `achievements`.
- Data: `src/data/space-objects.js` (35 solar-system objects in size order with a strict 1:1 mnemonic — keep ordering/mapping intact), `chess-puzzles.json`, `philippines-provinces.js`. `scripts/` and `download_pieces.cjs` are one-off data-fetch scripts (Lichess/OpenLibrary), not part of the app.
- Chess AI: `public/stockfish/stockfish.js` loaded as a Web Worker in `src/pages/chess/ChessPlay.jsx` with a local JS fallback. It's minified — ignore lint on it.

## Testing conventions

- Vitest + React Testing Library. Tests live in `__tests__/` dirs next to code, named `*.test.tsx`. Setup in `src/test/setup.ts` mocks `matchMedia`.
- Tests mock the contexts (`vi.mock`/`vi.spyOn` on `GameContext`/`AuthContext`) and don't need `.env.local`.
