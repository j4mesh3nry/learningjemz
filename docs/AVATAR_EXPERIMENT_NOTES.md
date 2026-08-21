# 32-Bit Pixel Mythic Companions & Fixed Stone Pedestal Overhaul

## 🌿 Overview
This document summarizes the complete architectural overhaul of the **Profile Avatar System** and **Home Hero Companion Presentation** on the `feature/avatar-experiment` branch (isolated from `dev`).

---

## 🚀 Key Systems & Features Implemented

### 1. 🎭 32-Bit Mythic Spirit Guides Roster
Replaced the generic icon selector with a curated fantasy RPG roster of **3 Mythic Spirit Companions**:
- **🦉 Archimedes (The Sage Owl)**:
  - *Theme*: Emerald Knowledge (`#34d399`)
  - *Profile Token*: `public/images/characters/owl-avatar-pixel.png` (Runic Emerald champion ring with gold spectacles).
  - *Hero Sprite*: `public/images/characters/owl-pixel.png` (Hooded green cowl, ancient book, sharp talons).
- **🤖 Nexus (The Chrono-Bot)**:
  - *Theme*: Sapphire Arcane (`#38bdf8`)
  - *Profile Token*: `public/images/characters/bot-avatar-pixel.png` (Sapphire cyan runic ring with glowing optical visor).
  - *Hero Sprite*: `public/images/characters/bot-pixel.png` (Obsidian/gold chassis, glowing blue circuit runes, arcane staff).
- **🦊 Aura (The Stellar Fox)**:
  - *Theme*: Amber Celestial (`#f59e0b`)
  - *Profile Token*: `public/images/characters/fox-avatar-pixel.png` (Filigree gold ring, ruby spirit pendant).
  - *Hero Sprite*: `public/images/characters/fox-pixel.png` (Stardust fur, three celestial tails with glowing tips).

---

### 2. 🪨 Fixed Stationary Stone Rune Pedestal ([HeroCharacter.tsx](file:///C:/projectvc/learningjemz/src/components/HeroCharacter.tsx))
- **100% Stationary Anchor**:
  - The ancient carved stone pillar (`public/images/characters/stone-pedestal-pixel.png`) is permanently planted on the cliff ledge with **0px movement** (never breathes, shakes, or shifts).
- **Dynamic Rune Ambient Glow**:
  - The Celtic/Nordic runes on the stone pillar cylinder gently pulse with the selected companion's signature energy color (Emerald for Owl, Sapphire for Bot, Amber for Fox).
- **Double Contact Occlusion Shadows**:
  - **Cliff Base Shadow**: Soft ground shadow anchoring the bottom of the pillar to the cliff rock.
  - **Platform Disc Shadow**: Soft footprint shadow beneath the character's feet/claws on top of the circular stone disc platform.

---

### 3. 🕊️ Isolated Living Creature Rig
- **Separated Animation Layers**:
  - Idle breathing sine-wave (`scaleY(1.02) translateY(-2px)`), randomized micro-tilts (every 7s–12s), and tap spring bounce apply **only to the creature layer mounted on top of the stone**, keeping the stone pillar rock-solid.
- **Auto-Cropped Pixel Boundaries**:
  - Auto-cropped all character sprites so the bottom-most pixel of the claws/boots/paws rests squarely on the stone disc plane with zero vertical floating gap.
- **Interactive Tap Particles**:
  - Tapping the companion triggers a spring bounce and a burst of glowing pixel ember particles.

---

### 4. 📱 Profile Modal & Global Integration
- **Choose Companion Modal ([Profile.tsx](file:///C:/projectvc/learningjemz/src/pages/Profile.tsx))**:
  - Rendered as 3 collectible mythic companion cards with 58px pixel medallions, names, species subtitles, and active selection glow.
- **Global Token Support ([AvatarIcon.tsx](file:///C:/projectvc/learningjemz/src/components/AvatarIcon.tsx))**:
  - Renders crisp 32-bit pixel medallions across **Rank (Leaderboards)**, **Profile (Me)**, and **Header**.

---

## 📂 Modified & Created Files Summary

| File Path | Description |
| :--- | :--- |
| `public/images/characters/owl-avatar-pixel.png` | 32-bit pixel portrait medallion for Archimedes (transparent PNG). |
| `public/images/characters/bot-avatar-pixel.png` | 32-bit pixel portrait medallion for Nexus (transparent PNG). |
| `public/images/characters/fox-avatar-pixel.png` | 32-bit pixel portrait medallion for Aura (transparent PNG). |
| `public/images/characters/owl-pixel.png` | Clean, tightly cropped 32-bit full-body sprite of Archimedes. |
| `public/images/characters/bot-pixel.png` | Clean, tightly cropped 32-bit full-body sprite of Nexus. |
| `public/images/characters/fox-pixel.png` | Clean, tightly cropped 32-bit full-body sprite of Aura. |
| `public/images/characters/stone-pedestal-pixel.png` | 32-bit ancient mossy stone rune pillar pedestal (transparent PNG). |
| `src/data/companions.ts` | Registry of companion metadata, sprite paths, avatar paths, and ambient colors. |
| `src/components/AvatarIcon.tsx` | Avatar component updated to render pixel medallions with `image-rendering: pixelated`. |
| `src/components/HeroCharacter.tsx` | Layered rig: fixed stationary stone pedestal + mounted swappable living creature. |
| `src/components/game/HeroDioramaCanvas.tsx` | Ambient floating spore/firefly particles over the cliff scenery. |
| `src/pages/Profile.tsx` | Choose Companion modal with 3 spirit guide cards. |
| `src/index.css` | Fixed pedestal geometry, top footprint shadow, pixel rendering, and creature animations. |
| `src/pages/__tests__/Profile.test.tsx` | Updated test suite to verify companion selection flow. |

---

## 🧪 Verification & Status
- **Current Branch**: `feature/avatar-experiment` (All changes committed, clean working tree, unmerged to `dev`).
- **Build**: `npm run build` passes with **0 errors**.
- **Tests**: `npm test` passes with **15/15 test files (96 tests)**.
