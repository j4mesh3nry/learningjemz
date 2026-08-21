import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useGame } from '../contexts/GameContext.jsx';
import { Header } from '../components/Header';
import { SectionDivider, GameModuleCard, StatTile, HeroCharacter, HeroDioramaCanvas } from '../components/game';
import {
  Lock, Swords, Orbit, Flame, Trophy, Award, Target, Gift, Gem, Globe,
} from 'lucide-react';
import '../index.css';

import { getCompanion } from '../data/companions';

/* ──────────────────────────────────────────────────────────────
   Locked Modules Data
   ────────────────────────────────────────────────────────────── */

const lockedModules = [
  { icon: <Lock size={20} color="#34d399" />, title: 'Module 3', subtitle: 'Coming Soon' },
  { icon: <Lock size={20} color="#34d399" />, title: 'Module 4', subtitle: 'Coming Soon' },
  { icon: <Lock size={20} color="#34d399" />, title: 'Module 5', subtitle: 'Coming Soon' },
];

/* ──────────────────────────────────────────────────────────────
   Greeting & Formatting Helpers
   ────────────────────────────────────────────────────────────── */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Night owl mode';
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

  // Universal Scenic Cliff Hero: Standard landscape background + dynamic companion overlay
  const avatar = user?.user_metadata?.avatar || 'owl';
  const companion = getCompanion(avatar);

  return (
    <div className="container home-page-container">
      {/* ── Top Header Widget (Logo + Streak/Level Pill + XP Bar) ── */}
      <Header />

      {/* ── 1. Hero Quest Scene (Living Diorama + Character Companion Overlay) ── */}
      <div className="home-hero-scene">
        {/* Ambient Living Environment Canvas (floating spores, light dust) */}
        <HeroDioramaCanvas ambientColor={companion.ambientColor} particleCount={10} />

        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <p className="home-hero-greeting-sub">
            {getGreeting()},
          </p>
          <div className="home-hero-username" title={displayName}>
            {displayName}!
          </div>
          <h2 className="home-hero-heading">
            What will you<br />
            <span className="home-hero-heading-highlight">explore</span> today?
          </h2>
        </div>

        {/* Dynamic Character Companion on the cliff ledge */}
        <HeroCharacter avatar={avatar} />

        {/* Bottom soft gradient fade into the page canvas */}
        <div className="home-hero-fade-bottom" />
      </div>

      {/* ── 2. Continue your journey ── */}
      <SectionDivider title="Continue your" highlightWord="journey" diamonds={1} />

      <div className="home-module-cards">
        {/* Chess Card */}
        <GameModuleCard
          theme="chess"
          title="Chess"
          subtitle="Challenge AI bots and improve your strategy."
          badgeIcon={<Swords size={18} strokeWidth={2.4} />}
          onClick={() => navigate('/chess')}
          ariaLabel="Chess module"
        />

        {/* Space Card */}
        <GameModuleCard
          theme="space"
          title="Space"
          subtitle="Explore planets, solve mysteries, and more."
          badgeIcon={<Orbit size={18} strokeWidth={2.4} />}
          onClick={() => navigate('/space')}
          ariaLabel="Space module"
        />
      </div>

      {/* ── 3. Your progress ── */}
      <SectionDivider highlightWord="Your progress" diamonds={2} />

      <div className="home-stats-grid">
        {/* Day Streak */}
        <StatTile
          variant="streak"
          icon={
            <Flame
              size={24}
              color={hasPlayedToday ? '#ff5a5a' : '#888888'}
              fill={hasPlayedToday ? '#ff5a5a' : '#bbbbbb'}
            />
          }
          value={streak ?? 0}
          label="Day Streak"
          onClick={() => navigate('/profile')}
          ariaLabel="View day streak in profile"
        />

        {/* Total XP */}
        <StatTile
          variant="xp"
          icon={<Trophy size={24} color="#fbbf24" fill="#fbbf24" />}
          value={formatNumber(xp || 0)}
          label="Total XP"
          onClick={() => navigate('/profile')}
          ariaLabel="View total XP in profile"
        />

        {/* Global Rank */}
        <StatTile
          variant="rank"
          icon={<Globe size={24} color="#38bdf8" />}
          value={getRankDisplay(xp || 0)}
          label="Global Rank"
          onClick={() => navigate('/leaderboards')}
          ariaLabel="View global rank leaderboard"
        />

        {/* Badges */}
        <StatTile
          variant="badges"
          icon={<Gem size={24} color="#34d399" fill="#34d399" />}
          value={badgeCount}
          label="Badges"
          onClick={() => navigate('/profile')}
          ariaLabel="View badges in profile"
        />
      </div>

      {/* ── 4. More ways to grow ── */}
      <SectionDivider highlightWord="More ways to grow" showLeaves={false} />

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
      <SectionDivider highlightWord="Coming Soon" showLeaves={false} />

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
