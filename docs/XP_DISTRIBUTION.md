# LearningJemz — Experience Points (XP), Prestige & League Distribution Guide

This document outlines the detailed Experience Point (XP) distribution logic, the **11-Tier Prestige Progression Ladder (up to Lv. 100+)**, and the **7-Tier Competitive League Division System** across LearningJemz.

---

## 🌌 1. The 11-Tier Prestige Progression Ladder *(Level Milestones)*

Prestige titles are permanently unlocked as players level up their total account. They are displayed prominently on the player profile and rankings hero showcase card.

| Level Range | Prestige Title | Accent Color | Vibe & Visual Flair |
| :--- | :--- | :--- | :--- |
| **Lv. 100+** | **`★ Cosmic Ascendant`** | `#ffffff` | Prismatic Starlight Apex Tier |
| **Lv. 90 – 99** | **`★ Immortal`** | `#c084fc` | Astral Violet Glow |
| **Lv. 75 – 89** | **`★ Mythic`** | `#f43f5e` | Crimson Gem Glow |
| **Lv. 60 – 74** | **`★ Grandmaster`** | `#ec4899` | Ruby Rose Glow |
| **Lv. 50 – 59** | **`★ Master`** | `#f97316` | Radiant Topaz Glow |
| **Lv. 40 – 49** | **`★ Adept`** | `#f59e0b` | Amber Gold Glow |
| **Lv. 30 – 39** | **`★ Sage`** | `#a78bfa` | Mystic Amethyst Glow |
| **Lv. 20 – 29** | **`★ Scholar`** | `#818cf8` | Indigo Amethyst Glow |
| **Lv. 10 – 19** | **`★ Explorer`** | `#38bdf8` | Sapphire Blue Glow |
| **Lv. 5 – 9** | **`★ Apprentice`** | `#34d399` | Emerald Green Glow |
| **Lv. 1 – 4** | **`★ Novice`** | `#8db5a0` | Sage Green Glow |

---

## 🛡️ 2. The 7-Tier Competitive League Division System *(Rank Standing)*

Competitive League Divisions represent a player's real-time competitive standing on the public leaderboard. They are showcased on the right column of the Hero Card with dedicated glowing badges and status pills.

| Division Name | Leaderboard Criteria | Emblem Icon & Glow | Status Pill Tag |
| :--- | :--- | :--- | :--- |
| **👑 Champions League** | **Rank #1 – #3** (Podium) | Crown (`#f59e0b` Gold) | `CHAMPIONS` |
| **💎 Mythic Diamond** | **Rank #4 – #10** or **Top 1%** | Diamond Gem (`#38bdf8` Cyan) | `MYTHIC DIAMOND` |
| **🌿 Emerald Master** | **Rank #11 – #20** or **Top 5%** | Shield (`#34d399` Emerald) | `EMERALD LEAGUE` |
| **💠 Platinum League** | **Top 10% Percentile** | Shield (`#22d3ee` Sky Blue) | `PLATINUM LEAGUE` |
| **🥇 Gold League** | **Top 25% Percentile** | Shield (`#fbbf24` Gold) | `GOLD LEAGUE` |
| **🥈 Silver League** | **Top 40% Percentile** | Shield (`#94a3b8` Silver) | `SILVER LEAGUE` |
| **🥉 Bronze League** | **Top 50%+ Percentile** | Shield (`#d97706` Bronze) | `BRONZE LEAGUE` |

---

## 📈 3. Level Progression Curve

To advance to higher levels, players accumulate total XP according to this mathematical progression:

$$\text{Total XP Required for Level } N = \text{Math.round}(38 \times (N - 1)^{1.6})$$

| Target Level | Prestige Milestone | Total XP Required |
| :---: | :--- | :---: |
| **Level 1** | Novice | `0 XP` |
| **Level 2** | Novice | `38 XP` |
| **Level 5** | Apprentice | `350 XP` |
| **Level 10** | Explorer | `1,277 XP` |
| **Level 20** | Scholar | `4,188 XP` |
| **Level 30** | Sage | `8,300 XP` |
| **Level 40** | Adept | `13,446 XP` |
| **Level 50** | Master | `19,531 XP` |
| **Level 60** | Grandmaster | `26,493 XP` |
| **Level 75** | Mythic | `38,368 XP` |
| **Level 90** | Immortal | `51,791 XP` |
| **Level 100** | Cosmic Ascendant | `61,643 XP` |

---

## 🚀 4. Space Module XP Distribution (`/space`)

### A. Cosmic Mystery Card Challenge
| Mode | Condition / Milestone | XP Awarded |
| :--- | :--- | :---: |
| **10-Card Sprint** | Correct Answer (Per Card) | `+1 XP` (Max 10) |
| **10-Card Sprint** | Perfect Score (10/10 Correct) | `+5 XP` |
| **10-Card Sprint** | Speed Demon (Perfect score and time < 30s) | `+5 XP` |
| **Endless Survival** | Correct Answer (Per Card) | `+1 XP` |
| **Endless Survival** | Bronze Tier (Score reaches 10+ pts) | `+5 XP` |
| **Endless Survival** | Silver Tier (Score reaches 20+ pts) | `+10 XP` |

### B. Illuminate the System Spelling Challenge
| Difficulty Tier | Scope | Base XP | Zero-Hint Bonus | Speed Bonus | Time Limit | Max XP |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Easy** | Top 8 (Sun → Mars) | `6 XP` | `+2 XP` | `+1 XP` | < 45 seconds | **9 XP** |
| **Medium** | Top 15 (Sun → Europa) | `13 XP` | `+3 XP` | `+3 XP` | < 120 seconds | **19 XP** |
| **Hard** | All 35 (Sun → Salacia) | `22 XP` | `+5 XP` | `+4 XP` | < 240 seconds | **31 XP** |

---

## ♟️ 5. Chess Module XP Distribution (`/chess`)

### A. Play vs Stockfish AI Bot
| Game Outcome | Bot Level / Name | Move Constraint | XP Awarded |
| :--- | :--- | :---: | :---: |
| **Win** | Easy (Beginner Bob ~400 Elo) | None | `+15 XP` |
| **Win** | Medium (Intermediate Ivy ~1200 Elo) | None | `+30 XP` |
| **Win** | Hard (Grandmaster Gary ~2500 Elo) | None | `+45 XP` |
| **Draw** | Easy (Beginner Bob ~400 Elo) | None | `+8 XP` |
| **Draw** | Medium (Intermediate Ivy ~1200 Elo) | None | `+16 XP` |
| **Draw** | Hard (Grandmaster Gary ~2500 Elo) | None | `+22 XP` |
| **Loss** (Effort Reward) | Easy (Beginner Bob ~400 Elo) | $\ge$ 10 moves | `+5 XP` |
| **Loss** (Effort Reward) | Medium (Intermediate Ivy ~1200 Elo) | $\ge$ 10 moves | `+10 XP` |
| **Loss** (Effort Reward) | Hard (Grandmaster Gary ~2500 Elo) | $\ge$ 10 moves | `+15 XP` |
| **Loss** | Any Bot Level | < 10 moves | `0 XP` |

### B. Chess Tactics Puzzles
| Puzzle Activity / Tier | Condition / Milestone | XP Awarded |
| :--- | :--- | :---: |
| **Easy Puzzle** | Solved | `+6 XP` |
| **Medium Puzzle** | Solved | `+10 XP` |
| **Hard Puzzle** | Solved | `+15 XP` |
| **Survival Milestone** | 5 Streak Milestone | `+10 XP` Bonus |
| **Survival Milestone** | 10 Streak Milestone | `+20 XP` Bonus |
| **Survival Milestone** | 20 Streak Milestone | `+30 XP` Bonus |
