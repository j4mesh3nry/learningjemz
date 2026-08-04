# Contributing to LearningJemz

Thank you for your interest in LearningJemz! This guide will help you get set up and contributing quickly.

## Getting Started

### Prerequisites
- **Node.js** 20+
- **npm** 10+
- A code editor (VS Code recommended)

### Clone & Install

```bash
git clone https://github.com/j4mesh3nry/learningjemz.git
cd learningjemz
npm install
```

### Environment Variables

Create a `.env.local` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Development Workflow

### Branching Strategy

- `main` — Production-ready code, deployed to Vercel.
- `enhance/*` — Feature/enhancement branches.
- `fix/*` — Bug fix branches.

**Always branch off `main`:**

```bash
git checkout -b enhance/my-feature main
```

### Code Style

- **TypeScript** is preferred for all new files (`.tsx` / `.ts`).
- **Vanilla CSS** — Use the design tokens in `src/theme.css` and `src/index.css`. No CSS frameworks.
- **Reusable components** — Use `Card` and `Button` from `src/components/` for consistency.
- **Formatting** — Prettier runs automatically. Config is in `.prettierrc`.

### Linting

```bash
npm run lint
```

We use [oxlint](https://oxc-project.github.io/docs/guide/usage/linter.html) for fast linting. The config is in `.oxlintrc.json`.

### Testing

```bash
npm test
```

Tests use [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/). Place test files in `__tests__/` directories next to the code they test.

**Naming convention:** `ComponentName.test.tsx`

### Pre-commit Hooks

[Husky](https://typicode.github.io/husky/) runs `npm run lint` automatically before every commit. If linting fails, the commit is blocked.

---

## Commit Guidelines

Use clear, concise commit messages:

```
feat: add solar system interactive explorer
fix: correct streak counter on profile page
refactor: migrate ChessHome to TypeScript
test: add Card component test suite
docs: update CONTRIBUTING.md
chore: configure GitHub Actions CI
```

**Prefix types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`.

---

## Project Structure

```
src/
├── components/       # Shared UI components (Card, Button, etc.)
│   └── __tests__/    # Component tests
├── contexts/         # React Contexts (Auth, Game)
├── pages/            # Route pages
│   ├── auth/         # Login, Signup
│   ├── chess/        # Chess module
│   ├── geo/          # Geography module
│   ├── reading/      # Reading module
│   └── space/        # Space module
├── utils/            # Helpers & API clients
├── test/             # Test setup files
├── index.css         # Global styles & design tokens
└── theme.css         # CSS custom properties
```

---

## Accessibility

All interactive elements must:
- Be keyboard-focusable (visible `:focus-visible` outlines are global)
- Have appropriate `aria-label` attributes
- Support Enter/Space activation for custom clickable elements (e.g., `Card`)

---

## Questions?

This is a personal project by **James Henry Emorricha**. Reach out directly if you have questions or ideas.
