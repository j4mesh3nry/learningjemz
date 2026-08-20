# Recipe — Scaffold a New Learning Module

Follow this step-by-step checklist to implement a new learning module (such as **Geography** or **Reading**) in **LearningJemz**. This ensures visual, architectural, and data sync consistency.

---

## 🛠️ Step 1: Scaffolding Directory & CSS
1. Create a new directory under: `src/pages/<module-name>/` (lowercase, e.g. `src/pages/geo/`).
2. Create `<module-name>.css` for custom page components (e.g., `geo.css`).
3. Bind your CSS module variable selectors:
   ```css
   /* src/pages/geo/geo.css */
   [data-module-theme="geo"] {
     --color-bg-page: #e8f5e9;
     --color-brand-primary: #2e7d32;
     --color-border-dark: #1b5e20;
     /* Solid offsets only, no transparency / glows */
   }
   ```
4. Create the main landing component `<ModuleName>Home.tsx` (e.g., `GeoHome.tsx`).
   > [!IMPORTANT]
   > Ensure the Streak/XP header widget ONLY renders on `GeoHome.tsx`. Sub-pages/sub-games must only render a back button and title banner.

---

## 🧭 Step 2: Routing & Layout Theme Hook
1. Open [App.jsx](file:///c:/projectvc/learningjemz/src/App.jsx).
2. Lazy-import the new homepage component:
   ```javascript
   const GeoHome = lazy(() => import('./pages/geo/GeoHome.tsx'));
   ```
3. Update the theme matcher inside the `Layout()` component's `useEffect`:
   ```javascript
   const theme = location.pathname.startsWith('/chess') ? 'chess' :
                 location.pathname.startsWith('/space') ? 'space' :
                 location.pathname.startsWith('/geo') ? 'geo' : 'main';
   ```
4. Register the route path:
   ```jsx
   <Route path="/geo/*" element={<ProtectedRoute><GeoHome /></ProtectedRoute>} />
   ```

---

## 🏠 Step 3: Add to Dashboard Card Grid
1. Open [Home.tsx](file:///c:/projectvc/learningjemz/src/pages/Home.tsx).
2. Remove the module entry from `lockedModules`.
3. Add the module entry to `modules` to render it in the active grid:
   ```javascript
   {
     to: '/geo',
     icon: <Globe size={24} color="#ffffff" />,
     title: 'Geography',
     subtitle: 'Maps & Regions',
     bg: '#1b5e20',
     shadow: '0 4px 0 #0f3d14',
     pattern: 'geo',
   }
   ```

---

## 🏆 Step 4: Hook into Progression State
If the game introduces module-specific achievements or special score tracking:
1. Review [GameContext.jsx](file:///c:/projectvc/learningjemz/src/contexts/GameContext.jsx) to see if you need to register a custom state field or a completion action.
2. Ensure you call the existing `completeGame(xpGained)` logic or update achievements in Supabase database tables `game_progress` / `achievements`.

---

## 🧪 Step 5: Test Scaffolding & Verification
1. Create a `__tests__` folder: `src/pages/<module-name>/__tests__/`.
2. Add a basic rendering test matching the other modules, mocking `GameContext` and `AuthContext` contexts:
   ```typescript
   // src/pages/geo/__tests__/GeoHome.test.tsx
   import { render, screen } from '@testing-library/react';
   import GeoHome from '../GeoHome';
   // mock your Context hooks ...
   ```
3. Run project verification command:
   ```bash
   npm run verify
   ```
   Verify that Lint, Build, and Tests all return **PASS**.
