# CLAUDE.md — LearningJemz Project Profile & Planning Protocol

This file serves as the unified "Source of Truth" for development, design, and architecture conventions within this project. All work must align with the rules and workflow specified below.

---

## 🛠️ Build, Test & Lint Commands

Run commands from the project root using these exact scripts:

- **Vite Dev Server:** `npm run dev` (Requires `.env.local` containing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- **Typecheck & Production Build:** `npm run build`
- **Lint Check:** `npm run lint` (uses `oxlint` — do not attempt to fix pre-existing warnings, only avoid introducing new ones)
- **Unit & Component Tests:** `npm run test` (runs Vitest in run-to-completion mode)
- **Run Focused Tests:** `npx vitest run src/pages/__tests__/Home.test.tsx` (recommended if tests hang)

---

## 🪐 Project Profile

### 1. Technology Stack
- **Frontend Framework:** React (v19) with React Router (v7) for Single Page App (SPA) routing.
- **Languages:** JavaScript and TypeScript (configured with `allowJs: true` and `noImplicitAny: false`).
- **Styling:** Vanilla CSS using CSS variables/tokens in `src/index.css`. No TailwindCSS or bootstrap frameworks.
- **3D Graphics:** React Three Fiber (R3F) & Three.js for solar system rendering.
- **Database / Backend:** Supabase (PostgreSQL, auth, real-time sync).

### 2. State & Database Sync
- **Authentication:** Managed by [AuthContext.jsx](file:///c:/projectvc/learningjemz/src/contexts/AuthContext.jsx).
- **Game Progress:** Managed by [GameContext.jsx](file:///c:/projectvc/learningjemz/src/contexts/GameContext.jsx). XP, levels, streaks, played dates, and achievements sync between local storage and the Supabase tables `game_progress` and `achievements`.
- **Database Client:** Initialized in [supabase.js](file:///c:/projectvc/learningjemz/src/utils/supabase.js).

### 3. Architecture & Code Structure
- **Routing:** Handled in [App.jsx](file:///c:/projectvc/learningjemz/src/App.jsx). Pages are modularly nested (e.g., Chess route `/chess/*` maps to [ChessHome.tsx](file:///c:/projectvc/learningjemz/src/pages/chess/ChessHome.tsx)).
- **CSS Modules:** Pages keep their custom styles in sibling CSS files (e.g., `space.css`, `chess.css`).
- **Data Layers:** Static configuration and game data reside in `src/data/` (e.g., `space-objects.js`).

---

## 📐 Game Design System & Styling Rules (from AGENTS.md)
Always verify compliance with these rules during the planning phase:
- **No Emojis:** UI text, data, and buttons must not contain emojis. Use Lucide React stroke icons (24x24 viewBox, `stroke="currentColor"`, round caps/joins) or custom SVGs.
- **Atmospheric Mobile-Game Aesthetic:** Deep dark game canvas (`#030d09`), card surfaces (`#05130e`), subtle ambient border glows (`#102d1f`, Chess `#855930`, Space `#295285`), and rich thematic artwork.
- **Unique Thematic Identity per Module:** Each learning module must have its own distinct, authentic theme vibe (unique surface color tint, glowing border, action button styling, and 3D card artwork) so entering a module feels like entering an immersive world.
- **2-Layer Hero Architecture:** Background scenery stays a continuous landscape (`home-hero-landscape.jpg`), while the companion character is an overlay via `<HeroCharacter avatar={user.avatar} />` on the cliff ledge.
- **Component Library:** Utilize standardized components from `src/components/game/` (`SectionDivider`, `GameModuleCard`, `StatTile`, `SegmentedSwitcher`).
- **Invisible Scrollbars:** All scrollable divs and page bodies must keep scroll functional but with scrollbars hidden.
- **Typography:** "Outfit" font for headings/titles/numbers, "Inter" font for body text and micro-labels.

---

## 📋 Task Planning & Verification Protocol (/pm)

For every non-trivial feature, refactor, or bug fix, we must generate a structured implementation plan containing the following components:

### 1. User & System Flow Diagrams
Render **both** a Mermaid sequence/state diagram AND a plain-text ASCII diagram representing user-initiated actions and system transitions:
- Use double-border boxes `╔════╗` / `╚════╝` for user-initiated entry/exit points (e.g., clicks, page opens, requests).
- Use single-border boxes `┌────┐` / `└────┘` for system transitions, state changes, or database operations.
- Limit ASCII flow diagrams to 4–12 nodes for clarity.

### 2. Confidence Level Assessment
Each plan step must be assigned a confidence level (0-100%) with a brief justification.
- **Example:** `95% Confidence - Context exports the correct state hook, no new imports needed.`
- **Action Gate:** If any step falls below **90% confidence**, we *must* pause and ask specific clarifying questions before continuing.

### 3. Approval Gate
Stop and present the plan to the user. **No code modification or file generation can occur until the plan is explicitly approved by the user.**
