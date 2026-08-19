import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useGame, getLevelProgress } from '../contexts/GameContext.jsx';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { JemzMascot } from '../components/icons/JemzMascot';
import {
  Lock, ArrowRight, BookOpen, Globe, Music, ScrollText, Calculator,
  Rocket, Swords, Orbit, Flame, Star, Trophy, Award, Zap,
  Target, Gift, Sparkles,
} from 'lucide-react';
import '../index.css';

/* ──────────────────────────────────────────────────────────────
   Data
   ────────────────────────────────────────────────────────────── */

const modules = [
  {
    to: '/chess',
    icon: <Swords size={26} color="#ffffff" />,
    title: 'Chess',
    subtitle: 'Challenge AI bots and improve your strategy.',
    bg: '#4a2c11',
    shadow: '0 4px 0 #251406',
    border: '#6e441f',
    arrowBg: '#6e441f',
    arrowBorder: '#8a6035',
    badgeBg: '#6e441f',
    badgeBorder: '#8a6035',
  },
  {
    to: '/space',
    icon: <Orbit size={26} color="#38bdf8" />,
    title: 'Space',
    subtitle: 'Explore planets, solve mysteries, and more.',
    bg: '#161936',
    shadow: '0 4px 0 #0b0d1e',
    border: '#385e8a',
    arrowBg: '#232752',
    arrowBorder: '#385e8a',
    badgeBg: '#232752',
    badgeBorder: '#385e8a',
    hasStars: true,
  },
];

const lockedModules = [
  { icon: <BookOpen size={22} color="#16653e" />, title: 'Reading', subtitle: 'Books & Stories' },
  { icon: <Globe size={22} color="#16653e" />, title: 'Geography', subtitle: 'Maps & Regions' },
  { icon: <Music size={22} color="#16653e" />, title: 'Songs', subtitle: 'Sing & Learn' },
  { icon: <ScrollText size={22} color="#16653e" />, title: 'Poems', subtitle: 'Rhymes & Verses' },
  { icon: <Calculator size={22} color="#16653e" />, title: 'Math', subtitle: 'Numbers & Logic' },
];

/* ──────────────────────────────────────────────────────────────
   Star dots for the Space card background
   ────────────────────────────────────────────────────────────── */

function StarDots() {
  const dots = Array.from({ length: 18 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    color: Math.random() > 0.5 ? '#ffdd57' : '#ffffff',
    delay: Math.random() * 3,
  }));
  return (
    <>
      {dots.map((d, i) => (
        <span key={i} style={{
          position: 'absolute', left: `${d.x}%`, top: `${d.y}%`,
          width: d.size, height: d.size, borderRadius: '50%',
          background: d.color, opacity: 0.7,
          animation: `twinkle ${1.5 + d.delay}s ease-in-out infinite alternate`,
        }} />
      ))}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   Greeting helper
   ────────────────────────────────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ──────────────────────────────────────────────────────────────
   Format helpers
   ────────────────────────────────────────────────────────────── */

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}

/* ──────────────────────────────────────────────────────────────
   Home Page
   ────────────────────────────────────────────────────────────── */

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { xp, level, streak, hasPlayedToday, achievements } = useGame();
  const { xpInLevel, levelXPReq, pct } = getLevelProgress(xp || 0);

  const displayName =
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Learner';

  const badgeCount = Array.isArray(achievements) ? achievements.length : 0;

  return (
    <div className="container" style={{
      minHeight: '100vh',
      background: 'var(--color-bg-page)',
      paddingBottom: 90,
    }}>
      {/* ── Sticky Top Header (Logo + Streak/Level) ── */}
      <Header />

      {/* ── 1. Hero Quest Banner ── */}
      <div className="game-hero-banner">
        <p className="game-hero-greeting">
          {getGreeting()}, {displayName}!
        </p>
        <h2 className="game-hero-headline">
          What will you<br />explore <span style={{ color: '#ffb400' }}>today</span>?
        </h2>

        {/* XP progress bar */}
        <div className="game-hero-xp-track">
          <div
            className="game-hero-xp-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="game-hero-xp-labels">
          <span>{xpInLevel} / {levelXPReq} XP</span>
          <span>Next: Lv.{level + 1}</span>
        </div>

        {/* Mascot watermark */}
        <div className="game-hero-mascot">
          <JemzMascot size={72} />
        </div>
      </div>

      {/* ── 2. Continue Your Journey ── */}
      <h3 className="game-section-heading">
        <Rocket size={18} color="#16653e" />
        Continue your journey
      </h3>

      <div className="game-module-cards">
        {modules.map((m) => (
          <Card
            key={m.to}
            className="game-module-card"
            onClick={() => navigate(m.to)}
            ariaLabel={m.title}
            style={{
              background: m.bg,
              border: `2px solid ${m.border}`,
              boxShadow: m.shadow,
            }}
          >
            {m.hasStars && <StarDots />}

            {/* Icon badge */}
            <div
              className="game-module-art-badge"
              style={{
                background: m.badgeBg,
                borderColor: m.badgeBorder,
              }}
            >
              {m.icon}
            </div>

            {/* Info */}
            <div className="game-module-info">
              <h4 className="game-module-title">{m.title}</h4>
              <p className="game-module-subtitle">{m.subtitle}</p>
            </div>

            {/* Arrow */}
            <div
              className="game-module-arrow"
              style={{
                background: m.arrowBg,
                borderColor: m.arrowBorder,
              }}
            >
              <ArrowRight size={16} strokeWidth={2.5} color="#ffffff" />
            </div>
          </Card>
        ))}
      </div>

      {/* ── 3. Your Progress ── */}
      <h3 className="game-section-heading">
        <Zap size={18} color="#16653e" />
        Your progress
      </h3>

      <div className="game-stats-grid">
        {/* Streak */}
        <div
          className="game-stat-tile"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          aria-label="Day Streak"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
        >
          <Flame
            size={20}
            color={hasPlayedToday ? '#e53935' : '#888888'}
            fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'}
          />
          <div className="game-stat-value" style={{ color: hasPlayedToday ? '#e53935' : '#0f3825' }}>
            {streak ?? 0}
          </div>
          <div className="game-stat-label">Day Streak</div>
        </div>

        {/* Total XP */}
        <div
          className="game-stat-tile"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          aria-label="Total XP"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
        >
          <Star size={20} color="#f57f17" fill="#ffb300" />
          <div className="game-stat-value">{formatNumber(xp || 0)}</div>
          <div className="game-stat-label">Total XP</div>
        </div>

        {/* Global Rank */}
        <div
          className="game-stat-tile"
          onClick={() => navigate('/leaderboards')}
          role="button"
          tabIndex={0}
          aria-label="Global Rank"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/leaderboards'); }}
        >
          <Trophy size={20} color="#16653e" />
          <div className="game-stat-value">
            <Trophy size={16} color="#16653e" style={{ verticalAlign: '-2px' }} />
          </div>
          <div className="game-stat-label">Rank</div>
        </div>

        {/* Badges */}
        <div
          className="game-stat-tile"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          aria-label="Go to Profile"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
        >
          <Award size={20} color="#7c3aed" />
          <div className="game-stat-value">{badgeCount}</div>
          <div className="game-stat-label">Badges</div>
        </div>
      </div>

      {/* ── 4. More Ways to Grow ── */}
      <h3 className="game-section-heading">
        <Sparkles size={18} color="#16653e" />
        More ways to grow
      </h3>

      <div className="game-quick-actions-row">
        <div
          className="game-quick-chip"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          aria-label="Daily Quests"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
        >
          <div className="game-quick-chip-icon" style={{ background: '#e1f0e2' }}>
            <Target size={20} color="#16653e" />
          </div>
          <span className="game-quick-chip-label">Daily<br />Quests</span>
        </div>

        <div
          className="game-quick-chip"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          aria-label="Achievements"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/profile'); }}
        >
          <div className="game-quick-chip-icon" style={{ background: '#fef3c7' }}>
            <Award size={20} color="#d97706" />
          </div>
          <span className="game-quick-chip-label">Achieve-<br />ments</span>
        </div>

        <div
          className="game-quick-chip"
          onClick={() => navigate('/store')}
          role="button"
          tabIndex={0}
          aria-label="Rewards Store"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/store'); }}
        >
          <div className="game-quick-chip-icon" style={{ background: '#ede9fe' }}>
            <Gift size={20} color="#7c3aed" />
          </div>
          <span className="game-quick-chip-label">Rewards</span>
        </div>
      </div>

      {/* ── 5. Coming Soon (Locked Expeditions) ── */}
      <h3 className="game-section-heading">
        <Rocket size={18} color="#16653e" />
        Coming Soon
      </h3>

      <div className="game-locked-grid">
        {lockedModules.map((m, idx) => (
          <div key={idx} className="game-locked-card">
            <div className="game-locked-badge">
              <Lock size={11} color="#ffffff" /> Locked
            </div>
            <div className="game-locked-content">
              <div className="game-locked-icon-box">
                {m.icon}
              </div>
              <h4 className="game-locked-title">{m.title}</h4>
              <p className="game-locked-subtitle">{m.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 6. Motivational Footer ── */}
      <div className="game-footer-banner">
        <div className="game-footer-mascot">
          <JemzMascot size={44} />
        </div>
        <p className="game-footer-text">
          Keep learning.<br />
          Keep leveling up.<br />
          Keep exploring!
        </p>
      </div>
    </div>
  );
}
