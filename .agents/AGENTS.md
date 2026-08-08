# Project Rules

- **Git Workflow**: Always work on the `dev` branch or module feature branches (`feature/*`). After completing edits and verifying changes, commit and push immediately to `origin/dev`.
- **Documentation Requirement**: Whenever merging features or releasing to `main`, always update `GAME_DOCUMENTATION.md` with the latest feature status, mechanics, and design changes.
- **Iconography Rule**: Strictly NO using emojis in UI or code for icons/graphics. Always use Lucide React icons or custom SVG icons instead.
- **Design Aesthetics Rule**: Strictly avoid glassmorphism (`backdrop-filter`), translucent fuzzy overlays, and neon glow effects (`box-shadow: 0 0 ... glow`, radial-gradient auras). Use clean, crisp, tactile 3D flat design with solid colors, solid borders, clear contrast, and tactile offset 3D shadows (e.g., `box-shadow: 0 4px 0 ...`).

