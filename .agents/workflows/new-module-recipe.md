# Recipe — Scaffold a New Learning Module

Follow this step-by-step checklist to implement a new learning module in **LearningJemz**. This ensures visual, architectural, and data sync consistency.

---

## 🛠️ Step 1: Scaffolding Directory & CSS
1. Create a new directory under: `src/pages/<module-name>/` (lowercase, e.g. `src/pages/mymodule/`).
2. Create `<module-name>.css` for custom page components (e.g., `mymodule.css`).
3. Bind your CSS module variable selectors with your module's **unique thematic color palette** (surface tint, glowing border, and button colors) anchored to the Atmospheric Mobile-Game design system:
   ```css
   /* src/pages/mymodule/mymodule.css */
   [data-module-theme="mymodule"] {
     --color-bg-page: var(--game-bg-canvas);
     --game-theme-border: rgba(46, 125, 50, 0.45); /* Unique glowing border */
     --game-theme-surface: #06150d;               /* Unique dark card surface */
     --game-theme-btn: #0d281a;                   /* Unique button background */
   }
   ```
4. Create the main landing component `<ModuleName>Home.tsx` (e.g., `MyModuleHome.tsx`).
   > [!IMPORTANT]
   > Ensure the Streak/XP header capsule widget (`Flame` + `Star`) ONLY renders on the root `<ModuleName>Home.tsx`. Sub-pages and gameplay views must only render a back button and title banner, placing metrics in floating review docks (`GameReviewDock` or `VictoryScreen`).

---

## 🧭 Step 2: Routing & Layout Theme Hook
1. Open [App.jsx](file:///c:/projectvc/learningjemz/src/App.jsx).
2. Lazy-import the new homepage component:
   ```javascript
   const MyModuleHome = lazy(() => import('./pages/mymodule/MyModuleHome.tsx'));
   ```
3. Update the theme matcher inside the `Layout()` component's `useEffect`:
   ```javascript
   const theme = location.pathname.startsWith('/chess') ? 'chess' :
                 location.pathname.startsWith('/space') ? 'space' :
                 location.pathname.startsWith('/mymodule') ? 'mymodule' :
                 location.pathname === '/' ? 'home' : 'main';
   ```
4. Register the route path:
   ```jsx
   <Route path="/mymodule/*" element={<ProtectedRoute><MyModuleHome /></ProtectedRoute>} />
   ```

---

## 🏠 Step 3: Add to Dashboard Card Grid
1. Open [Home.tsx](file:///c:/projectvc/learningjemz/src/pages/Home.tsx).
2. Remove the placeholder module entry from `lockedModules`.
3. Add the illustrated `GameModuleCard` component to the active mission cards grid:
   ```tsx
   <GameModuleCard
     theme="mymodule"
     title="My Module"
     subtitle="Learn new concepts and master challenges."
     badgeIcon={<Sparkles size={18} strokeWidth={2.4} />}
     onClick={() => navigate('/mymodule')}
     ariaLabel="My Module"
   />
   ```

---

## 🏆 Step 4: Hook into Progression State (`useModuleProgress`)
Connect the module to the global gamification engine using the modular progress hook:
```tsx
import { useModuleProgress } from '../../contexts/GameContext';

export default function MyModuleChallenge() {
  const { recordProgress, stats } = useModuleProgress('mymodule');

  const handleComplete = (score: number) => {
    recordProgress({
      xpGained: 15,
      statsUpdate: {
        challengesCompleted: (stats.challengesCompleted || 0) + score,
        gamesPlayed: (stats.gamesPlayed || 0) + 1,
      },
      streakEligible: true,
    });
  };
  // ...
}
```

---

## 🧪 Step 5: Test Scaffolding & Verification
1. Create a `__tests__` folder: `src/pages/<module-name>/__tests__/`.
2. Add a basic rendering test matching the other modules, mocking `GameContext` and `AuthContext`:
   ```typescript
   // src/pages/mymodule/__tests__/MyModuleHome.test.tsx
   import { render, screen } from '@testing-library/react';
   import { describe, it, expect, vi } from 'vitest';
   import MyModuleHome from '../MyModuleHome';
   // mock context hooks and test module home rendering...
   ```
3. Run project verification:
   ```bash
   npm test
   npm run lint
   npm run build
   ```
   Verify that Lint, Build, and Tests all return **PASS**.
