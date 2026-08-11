# LearningJemz — Experience Points (XP) Distribution Guide

This document outlines the detailed Experience Point (XP) distribution logic across all active game modules in the LearningJemz application. Use this guide to understand how XP is calculated, awarded, and accumulated.

---

## 🚀 Space Module (`/space`)

### 1. Cosmic Mystery Card Challenge (`/space/mystery`)
This multiple-choice trivia challenge awards XP based on the chosen mode, accuracy, and speed performance.

#### **10-Card Sprint Mode**
Earn up to a **maximum of 20 XP** per completed run:
- **Base Reward**: `+1 XP` per correct answer (up to `10 XP`).
- **Perfect Run Bonus**: `+5 XP` if you finish the run with zero mistakes (10/10 correct).
- **Speed Demon Bonus**: `+5 XP` if you finish the speedrun in **under 30 seconds** with zero mistakes.

#### **Endless Survival Mode**
Earn XP based on your score milestone achievements (answering correct cards under a 3-lives limit):
- **Base Reward**: `+1 XP` per correct answer.
- **Bronze Tier Bonus**: `+5 XP` if your final score reaches **10+ points**.
- **Silver Tier Bonus**: `+10 XP` if your final score reaches **20+ points**.

---

### 2. Illuminate the System Spelling Challenge (`/space/objects-by-size`)
This size-ordering spelling challenge awards XP based on the chosen difficulty level, hint avoidance, and completion speed.

| Difficulty Tier | Object Scope | Base XP | Zero-Hint Bonus | Speed Bonus | Time Limit | Max XP |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Easy** | Top 8 (Sun → Mars) | `6 XP` | `+2 XP` | `+1 XP` | < 45 seconds | **9 XP** |
| **Medium** | Top 15 (Sun → Europa) | `13 XP` | `+3 XP` | `+3 XP` | < 120 seconds | **19 XP** |
| **Hard** | All 35 (Sun → Salacia) | `22 XP` | `+5 XP` | `+4 XP` | < 240 seconds | **31 XP** |

---

## ♟️ Chess Module (`/chess`)

### Play vs Stockfish AI Bot
XP is awarded upon game termination (Checkmate, Draw, or Resignation) based on the bot's difficulty level and the player's outcome.

#### **1. Winning Outcomes**
Defeating the Stockfish AI bot awards:
- **Easy (Beginner Bob ~400 Elo)**: `+15 XP`
- **Medium (Intermediate Ivy ~1200 Elo)**: `+30 XP`
- **Hard (Grandmaster Gary ~2500 Elo)**: `+45 XP`

#### **2. Drawing Outcomes**
Drawing against the Stockfish AI bot awards:
- **Easy (Beginner Bob ~400 Elo)**: `+8 XP`
- **Medium (Intermediate Ivy ~1200 Elo)**: `+16 XP`
- **Hard (Grandmaster Gary ~2500 Elo)**: `+22 XP`

#### **3. Effort-based Losing Outcomes**
Effort rewards are given for sustained gameplay, requiring a game of **at least 10 moves** before losing:
- **Easy (Beginner Bob ~400 Elo)**: `+5 XP`
- **Medium (Intermediate Ivy ~1200 Elo)**: `+10 XP`
- **Hard (Grandmaster Gary ~2500 Elo)**: `+15 XP`
- *Note: Games ending in under 10 moves award `0 XP` on loss.*

---

## 📈 Level Progression Curve
To advance to a higher level, players must accumulate total XP according to this mathematical progression:

$$\text{Total XP Required for Level } N = \text{Math.round}(38 \times (N - 1)^{1.6})$$

#### **Milestone Benchmarks:**
- **Level 1**: `0 XP`
- **Level 2**: `38 XP`
- **Level 3**: `97 XP`
- **Level 4**: `166 XP`
- **Level 5**: `326 XP`
- **Level 10**: `1,277 XP`
- **Level 20**: `4,188 XP`
