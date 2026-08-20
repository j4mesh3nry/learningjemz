// src/pages/Leaderboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useGame, getLevelProgress } from '../contexts/GameContext';
import { Trophy, Flame, Zap, Crown, ArrowRight, Target, RefreshCw, Gem, Lock } from 'lucide-react';
import { Header } from '../components/Header';
import { JemzLoader } from '../components/JemzLoader';
import { SegmentedSwitcher } from '../components/game';
import { toLocalDateString } from '../utils/dateUtils';
import { AvatarIcon } from '../components/AvatarIcon';
import '../index.css';

// Streaks are ranked by their active value. If a user is inactive for more than 1 day,
// their streak is considered broken (0) and is filtered off the board.
const getActiveStreak = (item: any) => {
  const raw = Number(item?.streak) || 0;
  if (raw <= 0) return 0;
  if (getStreakDaysInactive(item) > 1) {
    return 0;
  }
  return raw;
};

// Whole days since the player's last recorded visit (0 = today, 1 = yesterday).
const getStreakDaysInactive = (item: any) => {
  const lastVisitStr = toLocalDateString(item?.last_visit);
  if (!lastVisitStr) return 0;
  const [y, m, d] = lastVisitStr.split('-').map(Number);
  const last = new Date(y, m - 1, d);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((todayMidnight.getTime() - last.getTime()) / 86400000));
};

const formatXP = (val: number) => {
  if (val >= 10000) {
    const kVal = val / 1000;
    return kVal.toFixed(1).replace(/\.0$/, '') + 'k';
  }
  if (val >= 1000) {
    return val.toLocaleString();
  }
  return String(val);
};

function getRankDisplay(xp: number): string {
  if (xp >= 5000) return 'Top 1%';
  if (xp >= 2000) return 'Top 2%';
  if (xp >= 1000) return 'Top 5%';
  if (xp >= 500) return 'Top 8%';
  if (xp >= 100) return 'Top 25%';
  return 'Top 50%';
}

// The user's own entry is ranked/displayed with LIVE app values: the server row
// can lag the debounced sync by seconds, so the board must never contradict what
// the app itself shows for the signed-in learner.
export const withLiveUserValues = (list: any[], user: any, xp: number, streak: number, level: number) => {
  if (!user?.id) return list;
  return list.map(item => (item.id === user?.id ? { ...item, xp: xp ?? item.xp, streak: streak ?? item.streak, level: level ?? item.level } : item));
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { xp, streak, level, flushNow } = useGame();
  const [leaders, setLeaders] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'xp' | 'streak'>('xp');
  const [toast, setToast] = useState<string | null>(null);

  // Set dark theme attributes on mount, clean up on unmount
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const processLeaders = useCallback((data: any[], type: 'xp' | 'streak') => {
    const merged = withLiveUserValues(data, user, xp, streak, level);
    const qualified = merged.filter(item => {
      if (type === 'streak') {
        return getActiveStreak(item) > 0;
      }
      return (Number(item.xp) || 0) > 0;
    });

    return qualified.sort((a, b) => {
      const valA = type === 'streak' ? getActiveStreak(a) : (Number(a.xp) || 0);
      const valB = type === 'streak' ? getActiveStreak(b) : (Number(b.xp) || 0);
      if (valB !== valA) return valB - valA;
      return (Number(b.xp) || 0) - (Number(a.xp) || 0);
    });
  }, [user, xp, streak, level]);

  const fetchLeaders = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const { data, error } = await supabase
      .from('game_progress')
      .select('id, xp, level, streak, last_visit, name, avatar')
      .order(sortBy, { ascending: false })
      .order('xp', { ascending: false })
      .limit(100);

    if (!error && data) {
      setLeaders(processLeaders(data, sortBy));
    }
    setLoading(false);
  }, [sortBy, processLeaders]);

  useEffect(() => {
    let cancelled = false;

    // Push any unsynced local progress first so the board reflects the app's
    // latest values (the realtime channel re-fetches when the upsert commits).
    (flushNow?.() ?? Promise.resolve()).then(() => {
      if (cancelled) return;
      fetchLeaders(leaders.length === 0);
    });

    // Mobile browsers drop websockets/background timers aggressively — refresh
    // whenever the app returns to the foreground so the board is never stale.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        (flushNow?.() ?? Promise.resolve()).then(() => {
          if (cancelled) return;
          fetchLeaders(false);
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const subscription = supabase
      .channel('public:game_progress')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_progress' }, () => {
        fetchLeaders(false);
      })
      .subscribe();

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      supabase.removeChannel(subscription);
    };
  }, [fetchLeaders, leaders.length, flushNow]);

  const handleTabChange = (tabId: string) => {
    if (tabId === 'friends') {
      showToast('Friends leaderboard coming soon! Add friends to compete.');
      return;
    }
    const newSortBy = tabId as 'xp' | 'streak';
    if (newSortBy === sortBy) return;
    setSortBy(newSortBy);
    setLeaders(prev => processLeaders(prev, newSortBy));
  };

  // Strictly cap visible podium & main list to Top 20
  const top20Leaders = leaders.slice(0, 20);
  const top1 = top20Leaders[0];
  const top2 = top20Leaders[1];
  const top3 = top20Leaders[2];
  const restLeaders = top20Leaders.slice(3);

  // User rank metrics
  const fullUserRankIndex = leaders.findIndex(l => l.id === user?.id);
  const isUserQualified = sortBy === 'streak' ? (streak ?? 0) > 0 : (xp ?? 0) > 0;
  const isUserInTop20 = isUserQualified && fullUserRankIndex !== -1 && fullUserRankIndex < 20;
  const currentUserRankDisplay = isUserQualified && fullUserRankIndex !== -1 ? `#${fullUserRankIndex + 1}` : 'Unranked';

  const displayName =
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Learner';
  const userAvatar = user?.user_metadata?.avatar || 'user';
  const rankTitle = level >= 30 ? 'Master' : level >= 10 ? 'Scholar' : level >= 5 ? 'Explorer' : 'Learner';
  const { xpInLevel, levelXPReq, pct } = getLevelProgress(xp || 0);
  const percentileDisplay = getRankDisplay(xp || 0);

  const switcherTabs = [
    { id: 'xp', label: 'XP', icon: <Zap size={14} /> },
    { id: 'streak', label: 'Streak', icon: <Flame size={14} /> },
    { id: 'friends', label: 'Friends', icon: <Lock size={12} /> },
  ];

  return (
    <div className="container rank-page-container">
      {toast && (
        <div className="toast" role="alert" aria-live="assertive">
          {toast}
        </div>
      )}

      {/* ── Top Header Widget (Streak Flame + Level Star + XP Bar) ── */}
      <Header />

      {/* ── YOUR POSITION Hero Showcase Card ── */}
      {user && (
        <div className="rank-hero-card">
          {/* Left Column: Avatar + Rank + Progress */}
          <div className="rank-hero-left">
            <div className="rank-hero-avatar-col">
              <div className="rank-hero-avatar-ring">
                <AvatarIcon avatar={userAvatar} size={54} iconSize={30} />
              </div>
              <span className="rank-hero-level-tag">Lv.{level}</span>
            </div>

            <div className="rank-hero-info">
              <span className="rank-hero-position-sub">Your Position</span>
              <div className="rank-hero-name">
                <span style={{ color: '#34d399', marginRight: 6 }}>{currentUserRankDisplay}</span>
                {displayName}!
              </div>
              <div className="rank-hero-title">
                <span>★ {rankTitle}</span>
              </div>

              <div className="rank-hero-progress-box">
                <div className="rank-hero-progress-label">
                  {xpInLevel.toLocaleString()} / {levelXPReq.toLocaleString()} XP to next rank
                </div>
                <div className="rank-hero-progress-track">
                  <div
                    className="rank-hero-progress-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Percentile + Gem Emblem + View Rewards */}
          <div className="rank-hero-right">
            <div>
              <div className="rank-hero-percentile-label">{percentileDisplay}</div>
              <div className="rank-hero-percentile-sub">of all learners</div>
            </div>

            <div className="rank-hero-gem-badge">
              <Gem size={20} color="#34d399" strokeWidth={2.4} />
            </div>

            <button
              onClick={() => navigate('/store')}
              className="rank-hero-rewards-btn"
              aria-label="View store rewards"
            >
              <span>Rewards</span>
              <ArrowRight size={11} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* ── Title & Switcher Header Section ── */}
      <div className="rank-header-section">
        <div className="rank-title-row">
          <div className="rank-title-group">
            <h2 className="rank-title">
              <Crown size={26} color="#f59e0b" fill="#fbbf24" />
              RANK
            </h2>
            <p className="rank-subtitle">Compete. Climb. Become legendary.</p>
          </div>

          <button
            onClick={() => fetchLeaders(true)}
            disabled={loading}
            aria-label="Refresh leaderboard"
            className="rank-refresh-btn"
            title="Refresh Leaderboard"
          >
            <RefreshCw size={17} color={loading ? '#5c7c6a' : '#34d399'} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {/* Segmented Switcher (XP | Streak | Friends) */}
        <SegmentedSwitcher
          tabs={switcherTabs}
          activeTab={sortBy}
          onChange={handleTabChange}
          ariaLabel="Leaderboard category switcher"
        />
      </div>

      {/* ── Loading State ── */}
      {loading ? (
        <div style={{ padding: '30px 0' }}>
          <JemzLoader message="Loading Rankings..." subtext="Fetching Top 20 Learners..." darkTheme={true} fullScreen={false} />
        </div>
      ) : (
        <>
          {/* ── Castle Arena Top 3 Podium ── */}
          {top20Leaders.length >= 3 && (
            <div className="rank-podium-arena">
              <div className="rank-podium-grid">
                {/* 2nd Place (Left) */}
                <div className="rank-podium-card rank-podium-card-2nd">
                  <div className="rank-podium-rank-tag rank-podium-rank-tag-2nd">#2</div>
                  <div className="rank-podium-avatar-wrapper">
                    <AvatarIcon avatar={top2?.avatar} size={44} iconSize={24} />
                  </div>
                  <div className="rank-podium-name">{top2?.name || 'Player'}</div>
                  <div className="rank-podium-level">★ Lv.{top2?.level || 1}</div>
                  <div className="rank-podium-score rank-podium-score-2nd">
                    {sortBy === 'xp' ? `${formatXP(top2?.xp || 0)} XP` : <><Flame size={13} color="#ff5a5a" fill="#ff5a5a" /> {getActiveStreak(top2)}</>}
                  </div>
                </div>

                {/* 1st Place (Center Champion) */}
                <div className="rank-podium-card rank-podium-card-1st">
                  <Crown size={26} color="#f59e0b" fill="#fbbf24" className="rank-podium-crown-badge-1st" />
                  <div className="rank-podium-avatar-wrapper">
                    <AvatarIcon avatar={top1?.avatar} size={54} iconSize={30} />
                  </div>
                  <div className="rank-podium-name">{top1?.name || 'Champion'}</div>
                  <div className="rank-podium-level">★ Lv.{top1?.level || 1}</div>
                  <div className="rank-podium-score rank-podium-score-1st">
                    {sortBy === 'xp' ? `${formatXP(top1?.xp || 0)} XP` : <><Flame size={14} color="#ff5a5a" fill="#ff5a5a" /> {getActiveStreak(top1)}</>}
                  </div>
                </div>

                {/* 3rd Place (Right) */}
                <div className="rank-podium-card rank-podium-card-3rd">
                  <div className="rank-podium-rank-tag rank-podium-rank-tag-3rd">#3</div>
                  <div className="rank-podium-avatar-wrapper">
                    <AvatarIcon avatar={top3?.avatar} size={44} iconSize={24} />
                  </div>
                  <div className="rank-podium-name">{top3?.name || 'Player'}</div>
                  <div className="rank-podium-level">★ Lv.{top3?.level || 1}</div>
                  <div className="rank-podium-score rank-podium-score-3rd">
                    {sortBy === 'xp' ? `${formatXP(top3?.xp || 0)} XP` : <><Flame size={13} color="#ff5a5a" fill="#ff5a5a" /> {getActiveStreak(top3)}</>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Table Stream ── */}
          <div className="rank-table-stream">
            <div className="rank-table-header">
              <span>Rank</span>
              <span>Learner</span>
              <span>{sortBy === 'xp' ? 'Total XP' : 'Streak'}</span>
            </div>

            {top20Leaders.length === 0 ? (
              <div style={{
                background: '#05130e', borderRadius: 20, border: '1.5px solid #102d1f',
                padding: '28px 16px', textAlign: 'center', color: '#ffffff'
              }}>
                <Target size={36} color="#34d399" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  {sortBy === 'streak' ? 'No Active Streaks Yet!' : 'No XP Scores Earned Yet!'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#8db5a0', marginTop: 4, fontWeight: 500 }}>
                  {sortBy === 'streak'
                    ? 'Play any game to ignite your flame and claim the #1 spot!'
                    : 'Complete a challenge to earn your first XP and take the lead!'}
                </p>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    marginTop: 14, background: '#10b981', color: '#ffffff',
                    fontWeight: 800, fontSize: '0.85rem', padding: '10px 22px',
                    borderRadius: 14, border: 'none', boxShadow: '0 3px 10px rgba(16, 185, 129, 0.4)',
                    cursor: 'pointer'
                  }}
                >
                  Start Playing →
                </button>
              </div>
            ) : (
              (top20Leaders.length >= 3 ? restLeaders : top20Leaders).map((item, idx) => {
                const actualRank = top20Leaders.length >= 3 ? idx + 4 : idx + 1;
                const isMe = item.id === user?.id;

                return (
                  <div
                    key={item.id || idx}
                    className={`rank-table-row ${isMe ? 'rank-table-row-me' : ''}`}
                  >
                    <div className="rank-table-left">
                      <span className={`rank-table-num ${isMe ? 'rank-table-num-me' : ''}`}>
                        {actualRank}
                      </span>
                      <AvatarIcon avatar={item.avatar} size={34} iconSize={18} />
                      <div className="rank-table-name-group">
                        <span className="rank-table-name">
                          {item.name || 'Learner'} {isMe && <span style={{ color: '#34d399', fontSize: '0.74rem' }}>(You)</span>}
                        </span>
                        <span className="rank-table-level-pill">Lv.{item.level || 1}</span>
                      </div>
                    </div>

                    <div className="rank-table-score">
                      {sortBy === 'xp' ? (
                        `${formatXP(item.xp || 0)} XP`
                      ) : (
                        <><Flame size={14} color="#ff5a5a" fill="#ff5a5a" /> {getActiveStreak(item)}</>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* If user is qualified but ranked beyond Top 20, render an ellipsis jump to their row */}
            {!isUserInTop20 && isUserQualified && fullUserRankIndex >= 20 && (
              <>
                <div className="rank-table-ellipsis">···</div>
                <div className="rank-table-row rank-table-row-me">
                  <div className="rank-table-left">
                    <span className="rank-table-num rank-table-num-me">
                      #{fullUserRankIndex + 1}
                    </span>
                    <AvatarIcon avatar={userAvatar} size={34} iconSize={18} />
                    <div className="rank-table-name-group">
                      <span className="rank-table-name">
                        {displayName} <span style={{ color: '#34d399', fontSize: '0.74rem' }}>(You)</span>
                      </span>
                      <span className="rank-table-level-pill">Lv.{level}</span>
                    </div>
                  </div>

                  <div className="rank-table-score">
                    {sortBy === 'xp' ? (
                      `${formatXP(xp || 0)} XP`
                    ) : (
                      <><Flame size={14} color="#ff5a5a" fill="#ff5a5a" /> {streak}</>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

