# LearningJemz — Experience Points (XP) Distribution Guide

This document outlines the detailed Experience Point (XP) distribution logic across all active game modules in the LearningJemz application. Use these tables to quickly reference how XP is calculated and awarded.

---

## 🚀 Space Module (`/space`)

### 1. Cosmic Mystery Card Challenge
This trivia challenge awards XP based on the game mode, accuracy, speed, and milestone points reached.

| Mode | Condition / Milestone | XP Awarded |
| :--- | :--- | :---: |
| **10-Card Sprint** | Correct Answer (Per Card) | `+1 XP` (Max 10) |
| **10-Card Sprint** | Perfect Score (10/10 Correct) | `+5 XP` |
| **10-Card Sprint** | Speed Demon (Perfect score and time < 30s) | `+5 XP` |
| **Endless Survival** | Correct Answer (Per Card) | `+1 XP` |
| **Endless Survival** | Bronze Tier (Score reaches 10+ pts) | `+5 XP` |
| **Endless Survival** | Silver Tier (Score reaches 20+ pts) | `+10 XP` |

### 2. Illuminate the System Spelling Challenge
This spelling challenge awards XP based on the chosen difficulty level, hint avoidance, and completion speed.

| Difficulty Tier | Scope | Base XP | Zero-Hint Bonus | Speed Bonus | Time Limit | Max XP |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Easy** | Top 8 (Sun → Mars) | `6 XP` | `+2 XP` | `+1 XP` | < 45 seconds | **9 XP** |
| **Medium** | Top 15 (Sun → Europa) | `13 XP` | `+3 XP` | `+3 XP` | < 120 seconds | **19 XP** |
| **Hard** | All 35 (Sun → Salacia) | `22 XP` | `+5 XP` | `+4 XP` | < 240 seconds | **31 XP** |

---

## ♟️ Chess Module (`/chess`)

### 1. Play vs Stockfish AI Bot
XP is awarded upon game termination based on the bot's difficulty level, move count, and the game outcome.

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

### 2. Chess Tactics Puzzles
XP is awarded immediately upon solving each puzzle based on difficulty tier and Survival mode streak milestones.

| Puzzle Activity / Tier | Condition / Milestone | XP Awarded |
| :--- | :--- | :---: |
| **Easy Puzzle** | Solved | `+6 XP` |
| **Medium Puzzle** | Solved | `+10 XP` |
| **Hard Puzzle** | Solved | `+15 XP` |
| **Survival Milestone** | 5 Streak Milestone | `+10 XP` Bonus |
| **Survival Milestone** | 10 Streak Milestone | `+20 XP` Bonus |
| **Survival Milestone** | 20 Streak Milestone | `+30 XP` Bonus |

---

## 📈 Level Progression Curve
To advance to a higher level, players must accumulate total XP according to this mathematical progression:

$$\text{Total XP Required for Level } N = \text{Math.round}(38 \times (N - 1)^{1.6})$$

| Target Level | Total XP Required |
| :---: | :---: |
| **Level 1** | `0 XP` |
| **Level 2** | `38 XP` |
| **Level 3** | `97 XP` |
| **Level 4** | `166 XP` |
| **Level 5** | `326 XP` |
| **Level 10** | `1,277 XP` |
| **Level 20** | `4,188 XP` |
