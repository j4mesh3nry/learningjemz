# 32-Bit Pixel Mythic Companions & Layered Skeletal Tween Animation Overhaul

## 🌿 Overview
This document summarizes the complete architectural overhaul of the **Profile Avatar System**, **Layered Pixel-Art Characters**, and **Skeletal/Tween Animation Rig** on the `feature/avatar-experiment` branch (isolated from `dev`).

---

## 🚀 Key Systems & Features Implemented

### 1. 🎭 32-Bit Mythic Spirit Guides Roster
Curated fantasy RPG roster of **3 Mythic Spirit Companions**:
- **🦉 Archimedes (The Sage Owl)**:
  - *Theme*: Emerald Knowledge (`#34d399`)
  - *Profile Token*: `public/images/characters/owl-avatar-pixel.png` (Runic Emerald champion ring with gold spectacles).
  - *Layered Rig*: Articulated hooded green cowl, gold spectacles with glass glint, blinking eyes with look tracking, scholar tunic, emerald wings, and ancient runic tome with shimmering parchment runes.
- **🤖 Nexus (The Chrono-Bot)**:
  - *Theme*: Sapphire Arcane (`#38bdf8`)
  - *Profile Token*: `public/images/characters/bot-avatar-pixel.png` (Sapphire cyan runic ring with glowing optical visor).
  - *Layered Rig*: Obsidian/gold chassis, reactor core, antenna array, animated cyan scanline visor bar, and arcane Chrono-Staff with floating gyro crystal orb.
- **🦊 Aura (The Stellar Fox)**:
  - *Theme*: Amber Celestial (`#f59e0b`)
  - *Profile Token*: `public/images/characters/fox-avatar-pixel.png` (Filigree gold ring, ruby spirit pendant).
  - *Layered Rig*: Stardust fur, white chest ruff, forehead celestial star mark, twitching ears, almond gaze, and 3 independent sinuous celestial tails with sequential phase wave delay.

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

### 3. 🦴 Hierarchical Skeletal / Tween Animation System ([CompanionRig.tsx](file:///C:/projectvc/learningjemz/src/components/companion/CompanionRig.tsx), [companion-rig.css](file:///C:/projectvc/learningjemz/src/components/companion/companion-rig.css))
- **Anatomically Articulated Bone Hierarchy**:
  - `bone-torso`: Root spine respiratory sine-wave breathing (`transform-origin: bottom center`).
  - `bone-head`: Articulated neck follow-through with breathing lag, curiosity tilts (`state-look-left`, `state-look-right`, `state-look-up`), and AFK droop.
  - `bone-eyes`: Independent eye blinking state (`is-blinking`), glance pupil tracking, and robot laser scanline sweep (`bone-bot-scanline`).
  - `bone-wing-left` & `bone-wing-right`: Shoulder pivot oscillations and flourish flutters.
  - `bone-tail-left`, `bone-tail-center`, `bone-tail-right`: 3-tail sinusoidal wave propagation with phase delays.
  - `bone-ear-left` & `bone-ear-right`: Independent micro-twitch timing (Fox).
  - `bone-prop-staff` & `bone-staff-orb`: Floating gyro crystal with ambient sapphire drop-shadow levitation.

---

### 4. 🧠 Reusable Idle Behavior State Machine ([useCompanionBehavior.ts](file:///C:/projectvc/learningjemz/src/components/companion/useCompanionBehavior.ts))
- **`idle`**: Core respiratory sine-wave breathing with secondary wing/tail motion.
- **`blink`**: Rapid eye blink / visor power-save sweep every 3.2s – 5.5s (160ms duration).
- **`lookAround`**: Curiosity glance engine scheduling left/right/up head tilts and eye tracking every 7s – 13s.
- **`flourish`**: Special idle flourishes (book page rune pulse, staff crystal spin, tail ripple) every 16s – 28s.
- **`happyTap`**: Instantaneous tap response with anticipation squish, happy explosive jump, and glowing pixel ember particle burst.
- **`drowse`**: AFK relaxation after 40s of inactivity (gentle head droop, closed eyes, slow deep breathing; wakes up immediately on user movement).

---

### 5. 📱 Profile Modal & Global Integration
- **Choose Companion Modal ([Profile.tsx](file:///C:/projectvc/learningjemz/src/pages/Profile.tsx))**:
  - Rendered as 3 collectible mythic companion cards with 58px pixel medallions, names, species subtitles, and active selection glow.
- **Global Token Support ([AvatarIcon.tsx](file:///C:/projectvc/learningjemz/src/components/AvatarIcon.tsx))**:
  - Renders crisp 32-bit pixel medallions across **Rank (Leaderboards)**, **Profile (Me)**, and **Header**.

---

## 📂 Modified & Created Files Summary

| File Path | Description |
| :--- | :--- |
| `src/components/companion/useCompanionBehavior.ts` | Reusable behavioral state machine hook (idle, blink, lookAround, flourish, tap, drowse). |
| `src/components/companion/companion-rig.css` | Skeletal bone hierarchy, transform origins, secondary wave physics, and state classes. |
| `src/components/companion/sprites/OwlSpriteLayers.tsx` | Articulated layered pixel-art parts for Archimedes the Sage Owl. |
| `src/components/companion/sprites/BotSpriteLayers.tsx` | Articulated layered pixel-art parts for Nexus the Chrono-Bot. |
| `src/components/companion/sprites/FoxSpriteLayers.tsx` | Articulated layered pixel-art parts for Aura the Stellar Fox. |
| `src/components/companion/CompanionRig.tsx` | Master articulated companion rig mounting layered sprites and managing animations. |
| `src/components/companion/__tests__/CompanionRig.test.tsx` | Unit test suite for CompanionRig and state transitions. |
| `src/components/HeroCharacter.tsx` | Layered rig: fixed stationary stone pedestal + mounted swappable living `CompanionRig`. |
| `src/components/game/index.ts` | Barrel export updated with `CompanionRig`. |
| `public/images/characters/stone-pedestal-pixel.png` | 32-bit ancient mossy stone rune pillar pedestal (transparent PNG). |
| `src/pages/Profile.tsx` | Choose Companion modal with 3 spirit guide cards. |
| `src/index.css` | Fixed pedestal geometry, top footprint shadow, pixel rendering, and creature animations. |

---

## 🧪 Verification & Status
- **Current Branch**: `feature/avatar-experiment` (Clean working tree, unmerged to `dev`).
- **Build**: `npm run build` passes with **0 errors**.
- **Tests**: `CompanionRig.test.tsx`, `Home.test.tsx`, `Profile.test.tsx` pass.
