# 🎮 LearningJemz

> **Gamified learning for the mobile generation.** Learn chess, geography, space, and books—all in one app. Earn XP, build streaks, unlock achievements, and compete on leaderboards.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://learningjemz.vercel.app)
[![Open Source](https://img.shields.io/badge/Open%20Source-MIT-green?style=flat-square)](./LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue?style=flat-square)](https://web.dev/progressive-web-apps/)

**🔗 [Play LearningJemz](https://learningjemz.vercel.app)** | 📱 Install as app on iOS/Android | 🎯 Offline-first PWA

---

## 🎯 What is LearningJemz?

LearningJemz is a **mobile-first, gamified learning platform** designed to make education feel less like a chore and more like a game you *want* to play. Unlike Duolingo (languages only), LearningJemz covers multiple subjects with a unified progression system that keeps you motivated across all of them.

### Why LearningJemz?

- **📱 Mobile First** — Designed for phones like Duolingo or Seterra. Install as a PWA and play offline.
- **🎮 One Progression System** — Earn XP, level up, and build streaks across *all* modules. Your progress matters everywhere.
- **🏆 Real Achievements** — Unlock badges, compete on leaderboards, and celebrate milestones.
- **🔄 Cross-Device Sync** — Start on your phone, continue on your laptop. Your progress follows you (coming Phase 2).
- **⚡ Fast & Responsive** — Built with React + Vite for snappy performance, even on slow connections.
- **📴 Works Offline** — Play anywhere. Syncs automatically when you reconnect.

---

## 🧩 Learning Modules

### ♟️ **Chess**
Master the game of kings. Play full games against an AI opponent, solve tactical puzzles, and learn strategies from interactive lessons.
- **ChessPlay** — Full game mode with move validation
- **ChessPuzzles** — Tactical drill problems
- **ChessLessons** — Learn rules and openings

### 🌍 **Geography**
Explore the world, starting with the Philippines. Interactive maps, province identification, and geography quizzes.
- **MapExplorer** — Visual map of Philippine provinces
- **ProvinceQuiz** — Test your regional knowledge
- **Expanding globally** — More regions coming

### 📖 **Reading**
Discover and read thousands of books from Open Library and Project Gutenberg. Track your reading time and earn XP for every page.
- **BookSearch** — Find novels, non-fiction, classics
- **BookReader** — Built-in reader with progress tracking
- **Reading Stats** — See your reading habits at a glance

### 🪐 **Space**
Explore astronomy and the cosmos. Interactive solar system, planet facts, and space trivia quizzes.
- **SolarSystem** — Visual explorer of planets and moons
- **Flashcards** — Memorize space facts
- **SpaceQuiz** — Test your cosmic knowledge

---

## 🎮 Gamification Engine

Everything you do earns **XP**. Level up by accumulating XP across any module.

| Feature | What It Does |
|---------|-------------|
| **XP & Levels** | Earn XP from activities (chess wins, reading time, quiz scores). Level progression: Beginner → Scholar → Master → Legend |
| **Daily Streaks** | Play every day to build streaks. Fire emoji 🔥 visualizes your momentum. Miss a day and the streak resets. |
| **Achievements** | Unlock badges for milestones ("First Win", "Bookworm", "Space Explorer", etc.). |
| **Leaderboards** | Compete globally. See your rank and climb to the top. (Coming in Phase 2) |
| **Persistence** | All progress is saved locally in your browser, with cloud sync coming soon. |

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, React Router v7 |
| **Styling** | Vanilla CSS (design tokens + modular component styles) |
| **State** | React Context API (GameContext for global user state) |
| **PWA** | Service Workers, Web App Manifest (offline-ready) |
| **Game Logic** | chess.js (chess validation), custom algorithms for quizzes |
| **APIs** | axios (Open Library, Project Gutenberg) |
| **Deployment** | Vercel |
| **Coming Soon** | Supabase (PostgreSQL + Auth for cloud sync) |

---

## 📋 Getting Started

### Play Online
👉 **[Visit LearningJemz](https://learningjemz.vercel.app)**

No signup required. Start playing immediately. Install as an app on your phone for the best experience.

### Set Up Locally

```bash
# Clone the repo
git clone https://github.com/j4mesh3nry/LearningJemz.git
cd LearningJemz

# Install dependencies
npm install

# Start dev server
npm run dev

# Opens at http://localhost:5173
```

### Build for Production

```bash
npm run build

# Outputs to /dist
npm run preview  # Test production build locally
```

---

## 🛣️ Roadmap

### ✅ Phase 0: MVP (Complete)
- [x] 4 core learning modules
- [x] Unified gamification system (XP, levels, streaks, achievements)
- [x] Progressive Web App (offline support)
- [x] Mobile-first design
- [x] Live on Vercel

### 🚧 Phase 1: Auth & Cloud Sync (In Progress)
- [ ] Email/password authentication
- [ ] Supabase PostgreSQL integration
- [ ] Cross-device data persistence
- [ ] Cloud backup for user progress
- [ ] Password reset flow
- **ETA: 3–4 weeks**

### 📋 Phase 2: Expansion (Coming Next)
- [ ] Global leaderboards
- [ ] More learning modules (Math, History, Tagalog)
- [ ] Social features (friend challenges, team competitions)
- [ ] Admin dashboard for content management
- [ ] Achievement notifications

### 🎯 Phase 3: Native Apps (Long-term)
- [ ] React Native iOS app
- [ ] React Native Android app
- [ ] App Store & Google Play distribution
- [ ] Push notifications for streaks/achievements

---

## 📊 Project Structure

```
src/
├── components/        # Reusable UI components (SplashScreen, BottomNav)
├── contexts/          # Global state (GameContext.jsx)
├── pages/             # Route-level components
│   ├── chess/         # Chess module pages
│   ├── geo/           # Geography module pages
│   ├── reading/       # Reading module pages
│   └── space/         # Space module pages
├── data/              # Static data (puzzles, province info, space data)
├── utils/             # Utilities (bookService.js, helpers)
├── App.jsx            # Main app component with routing
├── index.css          # Global styles & design tokens
└── main.jsx           # Entry point
```

---

## 🎨 Design Philosophy

- **Mobile-First** — Optimized for 375px–768px widths. Desktop is a bonus.
- **Micro-interactions** — Smooth transitions, hover effects, animations that delight without distracting.
- **Accessibility** — Semantic HTML, keyboard navigation, readable contrast ratios.
- **Offline-First** — Works without internet. Syncs when you reconnect.

---

## 🔐 Privacy & Data

- **No Accounts Yet** — Currently, progress is saved locally in your browser's `localStorage`.
- **No Tracking** — No analytics, no ads, no third-party trackers.
- **When Auth Launches** — Your data will be encrypted and stored securely on Supabase. You control your data.

---

## 🤝 Contributing

This is a solo learning project, but contributions are welcome! If you find a bug or have a feature idea:

1. **Open an Issue** — Describe the problem or feature
2. **Fork & Branch** — Create a feature branch (`git checkout -b feature/amazing-idea`)
3. **Make Your Changes** — Write clean, commented code
4. **Submit a PR** — Include a clear description of your changes

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/new-module

# Make changes, test locally
npm run dev

# Commit with clear messages
git commit -m "feat: add math module with quiz"

# Push and create PR
git push origin feature/new-module
```

---

## 📝 License

MIT License — See [LICENSE](./LICENSE) for details.

---

## 👨‍💻 Author

Built by **James Henry Emorricha** ([@j4mesh3nry](https://github.com/j4mesh3nry))

- 🎓 3rd-year BS Computer Science @ USTP-CDO
- 🔐 Tier 1 SOC Analyst @ CyTech Development & Operations
- 🎮 Competitive chess player
- 📚 Lifelong learner

---

## 🎉 Features in Action

### Earn XP Across Modules
Play chess, explore geography, read books, learn space facts. Every activity earns XP that counts toward your level.

### Build Your Streak
Play every day and watch your streak grow. The streak counter motivates you to come back. Miss a day? Start fresh tomorrow.

### Unlock Achievements
Hit milestones and unlock badges:
- 🏆 "First Win" — Win your first chess game
- 📖 "Bookworm" — Read 3 books
- 🌍 "Map Master" — Answer 50 geography questions correctly
- 🚀 "Space Explorer" — Complete all space quizzes

### Offline, Always Ready
Install as a PWA on your phone. No internet? No problem. Play offline, and your progress syncs when you reconnect.

---

## 🗺️ Planned Features

- **Leaderboards** — See where you rank globally and compete with friends
- **Difficulty Levels** — Adjust challenge to match your skill
- **Spaced Repetition** — Smart algorithms for better retention
- **Multiplayer Modes** — Play chess against real opponents
- **Content Expansion** — Math, history, languages, more
- **Mobile Apps** — Native iOS/Android apps via React Native

---

## 📞 Feedback & Suggestions

Have ideas? Found a bug? Want to chat about the project?

- **GitHub Issues** — Report bugs or suggest features [here](https://github.com/j4mesh3nry/LearningJemz/issues)
- **Email** — [Your email if you add it]

---

## 📈 Stats

- **Lines of Code** — 5000+ (and growing)
- **Modules** — 4 (Chess, Geography, Reading, Space)
- **Learning Categories** — 20+ (puzzles, quizzes, flashcards, etc.)
- **Time to Build** — 3+ months (solo, part-time alongside studies + internship)
- **Users** — 1 (you!), scaling up

---

**Made with ❤️ by James Henry**

*Last updated: July 2026*
