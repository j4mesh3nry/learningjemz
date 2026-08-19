import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useGame } from '../contexts/GameContext.jsx';
import { Header } from '../components/Header';
import { HeroCharacter } from '../components/HeroCharacter';
import {
  Lock, ArrowRight, BookOpen, Globe, Music, ScrollText, Calculator,
  Swords, Orbit, Flame, Trophy, Award, Target, Gift, Gem, Sprout,
} from 'lucide-react';
import '../index.css';

/* ──────────────────────────────────────────────────────────────
   Locked Modules Data
   ────────────────────────────────────────────────────────────── */

const lockedModules = [
  { icon: <BookOpen size={20} color="#34d399" />, title: 'Reading', subtitle: 'Books & Stories' },
  { icon: <Globe size={20} color="#34d399" />, title: 'Geography', subtitle: 'Maps & Regions' },
  { icon: <Music size={20} color="#34d399" />, title: 'Songs', subtitle: 'Sing & Learn' },
  { icon: <ScrollText size={20} color="#34d399" />, title: 'Poems', subtitle: 'Rhymes & Verses' },
  { icon: <Calculator size={20} color="#34d399" />, title: 'Math', subtitle: 'Numbers & Logic' },
];

/* ──────────────────────────────────────────────────────────────
   Greeting & Formatting Helpers
   ────────────────────────────────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}

function getRankDisplay(xp: number): string {
  if (xp >= 5000) return 'Top 1%';
  if (xp >= 2000) return 'Top 2%';
  if (xp >= 1000) return 'Top 5%';
  if (xp >= 500) return 'Top 10%';
  if (xp >= 100) return 'Top 25%';
  return 'Top 50%';
}

/* ──────────────────────────────────────────────────────────────
   Home Component
   ────────────────────────────────────────────────────────────── */

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { xp, streak, hasPlayedToday, achievements } = useGame();

  // Attach dark theme attribute on mount, clean up on unmount
  useEffect(() => {
    document.body.dataset.homeDark = 'true';
    document.documentElement.dataset.homeDark = 'true';
    document.body.dataset.moduleTheme = 'home';
    document.documentElement.dataset.moduleTheme = 'home';
    return () => {
      delete document.body.dataset.homeDark;
      delete document.documentElement.dataset.homeDark;
    };
  }, []);

  const displayName =
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Learner';

  const badgeCount = Array.isArray(achievements) ? achievements.length : 0;

  return (
    <div className="container home-page-container">
      {/* ── Top Header Widget (Logo + Streak/Level Pill + XP Bar) ── */}
      <Header />

      {/* ── 1. Hero Quest Scene (Full-Bleed Landscape + Character) ── */}
      <div className="home-hero-scene">
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <p className="home-hero-greeting-sub">
            {getGreeting()},
          </p>
          <div className="home-hero-username">
            {displayName}! 👋
          </div>
          <h2 className="home-hero-heading">
            What will you<br />
            <span className="home-hero-heading-highlight">explore</span> today?
          </h2>
        </div>

        {/* Character companion slot (default owl, extensible to profile avatars) */}
        <HeroCharacter avatar={user?.user_metadata?.avatar} characterType="owl" />

        {/* Bottom soft gradient fade into the page canvas */}
        <div className="home-hero-fade-bottom" />
      </div>

      {/* ── 2. Continue your journey ── */}
      <div className="home-section-divider">
        <Sprout size={16} className="home-divider-icon" />
        <span className="home-divider-label">
          Continue your <span className="text-emerald">journey</span>
        </span>
        <Sprout size={16} className="home-divider-icon flip-h" />
        <div className="home-section-divider-line" />
        <span className="home-divider-diamond">◆</span>
        <div className="home-section-divider-line" />
      </div>

      <div className="home-module-cards">
        {/* Chess Card */}
        <div
          className="home-module-card home-module-card-chess"
          onClick={() => navigate('/chess')}
          role="button"
          tabIndex={0}
          aria-label="Chess"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/chess'); }}
        >
          <div className="home-module-card-overlay-chess" />
          <div className="home-module-card-info">
            <div className="home-module-card-header">
              <div className="home-module-mini-badge-chess">
                <Swords size={18} strokeWidth={2.4} />
              </div>
              <h3 className="home-module-card-title">Chess</h3>
            </div>
            <p className="home-module-card-subtitle">
              Challenge AI bots and improve your strategy.
            </p>
          </div>
          <div className="home-module-action-btn-chess">
            <ArrowRight size={18} strokeWidth={2.5} />
          </div>
        </div>

        {/* Space Card */}
        <div
          className="home-module-card home-module-card-space"
          onClick={() => navigate('/space')}
          role="button"
          tabIndex={0}
          aria-label="Space"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/space'); }}
        >
          <div className="home-module-card-overlay-space" />
          <div className="home-module-card-info">
            <div className="home-module-card-header">
              <div className="home-module-mini-badge-space">
                <Orbit size={18} strokeWidth={2.4} />
              </div>
              <h3 className="home-module-card-title">Space</h3>
            </div>
            <p className="home-module-card-subtitle">
              Explore planets, solve mysteries, and more.
            </p>
          </div>
          <div className="home-module-action-btn-space">
            <ArrowRight size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* ── 3. Your progress ── */}
      <div className="home-section-divider">
        <Sprout size={16} className="home-divider-icon" />
        <span className="home-divider-label text-emerald">
          Your progress
        </span>
        <div className="home-section-divider-line" />
        <span className="home-divider-diamond">◆</span>
        <div className="home-section-divider-line" />
        <span className="home-divider-diamond">◆</span>
        <div className="home-section-divider-line" />
      </div>

      <div className="home-stats-grid">
        {/* Day Streak */}
        <div
          className="home-stat-tile"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          aria-label="Day Streak"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
        >
          <div className="home-stat-icon-wrapper">
            <Flame
              size={24}
              color={hasPlayedToday ? '#ff5a5a' : '#888888'}
              fill={hasPlayedToday ? '#ff5a5a' : '#bbbbbb'}
            />
          </div>
          <div className="home-stat-value home-stat-value-streak">
            {streak ?? 0}
          </div>
          <div className="home-stat-label">Day Streak</div>
        </div>

        {/* Total XP */}
        <div
          className="home-stat-tile"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          aria-label="Total XP"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
        >
          <div className="home-stat-icon-wrapper">
            <Trophy size={24} color="#fbbf24" fill="#fbbf24" />
          </div>
          <div className="home-stat-value home-stat-value-xp">
            {formatNumber(xp || 0)}
          </div>
          <div className="home-stat-label">Total XP</div>
        </div>

        {/* Global Rank */}
        <div
          className="home-stat-tile"
          onClick={() => navigate('/leaderboards')}
          role="button"
          tabIndex={0}
          aria-label="Global Rank"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/leaderboards'); }}
        >
          <div className="home-stat-icon-wrapper">
            <Globe size={24} color="#38bdf8" />
          </div>
          <div className="home-stat-value home-stat-value-rank">
            {getRankDisplay(xp || 0)}
          </div>
          <div className="home-stat-label">Global Rank</div>
        </div>

        {/* Badges */}
        <div
          className="home-stat-tile"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          aria-label="Badges"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
        >
          <div className="home-stat-icon-wrapper">
            <Gem size={24} color="#34d399" fill="#34d399" />
          </div>
          <div className="home-stat-value home-stat-value-badges">
            {badgeCount}
          </div>
          <div className="home-stat-label">Badges</div>
        </div>
      </div>

      {/* ── 4. More ways to grow ── */}
      <div className="home-section-divider">
        <Sprout size={16} className="home-divider-icon" />
        <span className="home-divider-label text-emerald">
          More ways to grow
        </span>
        <div className="home-section-divider-line" />
      </div>

      <div className="home-quick-actions-row">
        <div
          className="home-quick-chip"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          aria-label="Daily Quests"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
        >
          <div className="home-quick-chip-icon" style={{ background: '#0e291b' }}>
            <Target size={22} color="#34d399" />
          </div>
          <span className="home-quick-chip-label">Daily<br />Quests</span>
        </div>

        <div
          className="home-quick-chip"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          aria-label="Achievements"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
        >
          <div className="home-quick-chip-icon" style={{ background: '#261e0b' }}>
            <Award size={22} color="#fbbf24" />
          </div>
          <span className="home-quick-chip-label">Achieve-<br />ments</span>
        </div>

        <div
          className="home-quick-chip"
          onClick={() => navigate('/store')}
          role="button"
          tabIndex={0}
          aria-label="Rewards Store"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/store'); }}
        >
          <div className="home-quick-chip-icon" style={{ background: '#241433' }}>
            <Gift size={22} color="#c084fc" />
          </div>
          <span className="home-quick-chip-label">Rewards</span>
        </div>
      </div>

      {/* ── 5. Coming Soon (Locked Expeditions) ── */}
      <div className="home-section-divider">
        <Sprout size={16} className="home-divider-icon" />
        <span className="home-divider-label text-emerald">
          Coming Soon
        </span>
        <div className="home-section-divider-line" />
      </div>

      <div className="home-locked-grid">
        {lockedModules.map((m, idx) => (
          <div key={idx} className="home-locked-card">
            <div className="home-locked-badge">
              <Lock size={12} strokeWidth={2.5} color="#34d399" /> Locked
            </div>
            <div className="home-locked-content">
              <div className="home-locked-icon-box">
                {m.icon}
              </div>
              <h4 className="home-locked-title">{m.title}</h4>
              <p className="home-locked-subtitle">{m.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
