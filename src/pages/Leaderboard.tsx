// src/pages/Leaderboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useGame, getLevelProgress } from '../contexts/GameContext';
import { Flame, Zap, RefreshCw, Target, Lock, Users, Star } from 'lucide-react';
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

const getStreakDaysInactive = (item: any) => {
  const lastVisitStr = toLocalDateString(item?.last_visit);
  if (!lastVisitStr) return 0;
  const [y, m, d] = lastVisitStr.split('-').map(Number);
  const last = new Date(y, m - 1, d);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((todayMidnight.getTime() - last.getTime()) / 86400000));
};

const formatXP = (xp: number) => {
  if (xp >= 10000) return (xp / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return xp.toLocaleString();
};

/**
 * 11-Tier Prestige Progression System based on Player Level (Lv. 1 - 100+)
 */
export const getPrestigeInfo = (lvl: number) => {
  if (lvl >= 100) return { title: 'Cosmic Ascendant', color: '#ffffff' };
  if (lvl >= 90) return { title: 'Immortal', color: '#c084fc' };
  if (lvl >= 75) return { title: 'Mythic', color: '#f43f5e' };
  if (lvl >= 60) return { title: 'Grandmaster', color: '#ec4899' };
  if (lvl >= 50) return { title: 'Master', color: '#f97316' };
  if (lvl >= 40) return { title: 'Adept', color: '#f59e0b' };
  if (lvl >= 30) return { title: 'Sage', color: '#a78bfa' };
  if (lvl >= 20) return { title: 'Scholar', color: '#818cf8' };
  if (lvl >= 10) return { title: 'Explorer', color: '#38bdf8' };
  if (lvl >= 5) return { title: 'Apprentice', color: '#34d399' };
  return { title: 'Novice', color: '#8db5a0' };
};

/**
 * Global Rank percentile calculation matching Home page
 */
function getRankDisplay(xp: number): string {
  if (xp >= 5000) return 'Top 1%';
  if (xp >= 2000) return 'Top 2%';
  if (xp >= 1000) return 'Top 5%';
  if (xp >= 500) return 'Top 10%';
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
  const [filterTab, setFilterTab] = useState<'xp' | 'streak' | 'friends'>('xp');
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

    (flushNow?.() ?? Promise.resolve()).then(() => {
      if (cancelled) return;
      fetchLeaders(leaders.length === 0);
    });

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
    setFilterTab(tabId as 'xp' | 'streak' | 'friends');
    if (tabId === 'friends') {
      return;
    }
    const newSortBy = tabId as 'xp' | 'streak';
    if (newSortBy === sortBy) return;
    setSortBy(newSortBy);
    setLeaders(prev => processLeaders(prev, newSortBy));
  };

  const top20Leaders = leaders.slice(0, 20);
  const top1 = top20Leaders[0];
  const top2 = top20Leaders[1];
  const top3 = top20Leaders[2];
  const restLeaders = top20Leaders.slice(3);

  const fullUserRankIndex = leaders.findIndex(l => l.id === user?.id);
  const isUserQualified = filterTab === 'streak' ? (streak ?? 0) > 0 : (xp ?? 0) > 0;
  const isUserInTop20 = isUserQualified && fullUserRankIndex !== -1 && fullUserRankIndex < 20;
  const currentUserRankDisplay = isUserQualified && fullUserRankIndex !== -1 ? `#${fullUserRankIndex + 1}` : 'Unranked';

  const displayName =
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Learner';
  const userAvatar = user?.user_metadata?.avatar || 'user';
  const prestige = getPrestigeInfo(level);
  const { xpInLevel, levelXPReq, pct } = getLevelProgress(xp || 0);
  const percentileDisplay = getRankDisplay(xp || 0);

  const rankingFilterTabs = [
    { id: 'xp', label: 'XP', icon: <Zap size={14} /> },
    { id: 'streak', label: 'Streak', icon: <Flame size={14} /> },
    { id: 'friends', label: 'Friends', icon: <Users size={14} /> },
  ];

  return (
    <div className="container rank-page-container">
      {toast && (
        <div className="toast" role="alert" aria-live="assertive">
          {toast}
        </div>
      )}

      <Header />

      <div className="rank-title-row">
        <div className="rank-title-group">
          <h1 className="rank-title">RANK</h1>
          <p className="rank-subtitle">Compete with learners worldwide and climb the leaderboard.</p>
        </div>

        <button
          onClick={() => fetchLeaders(true)}
          disabled={loading}
          aria-label="Refresh rankings"
          className="rank-refresh-btn"
          title="Refresh Leaderboard"
        >
          <RefreshCw size={17} color={loading ? '#5c7c6a' : '#34d399'} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {user && (
        <div className="rank-position-card">
          <div className="rank-position-header">
            <span className="rank-position-badge-label">Your Position</span>
            <span className="rank-position-percentile">{percentileDisplay}</span>
          </div>

          <div className="rank-position-body">
            <div className="rank-position-avatar-wrap">
              <AvatarIcon avatar={userAvatar} size={48} iconSize={26} />
              <span className="rank-position-level-badge">Lv.{level}</span>
            </div>

            <div className="rank-position-details">
              <div className="rank-position-name-row">
                <span className="rank-position-rank-num">{currentUserRankDisplay}</span>
                <span className="rank-position-username">{displayName}</span>
              </div>
              <div className="rank-position-tier" style={{ color: prestige.color }}>
                <Star size={11} color={prestige.color} strokeWidth={2.2} />
                <span>{prestige.title}</span>
              </div>
            </div>
          </div>

          <div className="rank-position-progress">
            <div className="rank-position-progress-text">
              {xpInLevel.toLocaleString()} / {levelXPReq.toLocaleString()} XP to next rank
            </div>
            <div className="rank-position-progress-track">
              <div
                className="rank-position-progress-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="rank-switcher-wrap">
        <SegmentedSwitcher
          tabs={rankingFilterTabs}
          activeTab={filterTab}
          onChange={handleTabChange}
          ariaLabel="Leaderboard ranking filters"
        />
      </div>

      {filterTab === 'friends' ? (
        <div className="rank-friends-card">
          <div className="rank-friends-icon-box">
            <Users size={24} color="#34d399" />
          </div>
          <h3 className="rank-friends-heading">Friends Leaderboard</h3>
          <p className="rank-friends-subtext">
            Compete with your friends and see who holds the highest rank!
          </p>
          <div className="rank-friends-badge-pill">
            <Lock size={12} strokeWidth={2.2} /> Coming Soon
          </div>
        </div>
      ) : loading ? (
        <div style={{ padding: '30px 0' }}>
          <JemzLoader message="Loading Rankings..." subtext="Fetching Top 20 Learners..." darkTheme={true} fullScreen={false} />
        </div>
      ) : (
        <>
          {top20Leaders.length >= 3 && (
            <div className="rank-top3-grid">
              <div className="rank-top3-card rank-top3-card-2nd">
                <span className="rank-top3-badge rank-top3-badge-2nd">#2</span>
                <div className="rank-top3-avatar">
                  <AvatarIcon avatar={top2?.avatar} size={44} iconSize={24} />
                </div>
                <div className="rank-top3-name">{top2?.name || 'Player'}</div>
                <div className="rank-top3-level">Lv.{top2?.level || 1}</div>
                <div className="rank-top3-score rank-top3-score-2nd">
                  {sortBy === 'xp' ? `${formatXP(top2?.xp || 0)} XP` : <><Flame size={13} color="#38bdf8" strokeWidth={2.2} /> {getActiveStreak(top2)}</>}
                </div>
              </div>

              <div className="rank-top3-card rank-top3-card-1st">
                <span className="rank-top3-badge rank-top3-badge-1st">#1</span>
                <div className="rank-top3-avatar">
                  <AvatarIcon avatar={top1?.avatar} size={48} iconSize={26} />
                </div>
                <div className="rank-top3-name">{top1?.name || 'Champion'}</div>
                <div className="rank-top3-level">Lv.{top1?.level || 1}</div>
                <div className="rank-top3-score rank-top3-score-1st">
                  {sortBy === 'xp' ? `${formatXP(top1?.xp || 0)} XP` : <><Flame size={13} color="#fbbf24" strokeWidth={2.2} /> {getActiveStreak(top1)}</>}
                </div>
              </div>

              <div className="rank-top3-card rank-top3-card-3rd">
                <span className="rank-top3-badge rank-top3-badge-3rd">#3</span>
                <div className="rank-top3-avatar">
                  <AvatarIcon avatar={top3?.avatar} size={44} iconSize={24} />
                </div>
                <div className="rank-top3-name">{top3?.name || 'Player'}</div>
                <div className="rank-top3-level">Lv.{top3?.level || 1}</div>
                <div className="rank-top3-score rank-top3-score-3rd">
                  {sortBy === 'xp' ? `${formatXP(top3?.xp || 0)} XP` : <><Flame size={13} color="#fb923c" strokeWidth={2.2} /> {getActiveStreak(top3)}</>}
                </div>
              </div>
            </div>
          )}

          <div className="rank-list-stream">
            <div className="rank-list-header">
              <span>Rank</span>
              <span>Learner</span>
              <span>{sortBy === 'xp' ? 'Total XP' : 'Streak'}</span>
            </div>

            {top20Leaders.length === 0 ? (
              <div style={{
                background: '#05130e', borderRadius: 18, border: '1.5px solid #102d1f',
                padding: '28px 16px', textAlign: 'center', color: '#ffffff'
              }}>
                <Target size={32} color="#34d399" style={{ margin: '0 auto 8px' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  {sortBy === 'streak' ? 'No Active Streaks Yet!' : 'No XP Scores Earned Yet!'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#8db5a0', marginTop: 4, fontWeight: 500 }}>
                  {sortBy === 'streak'
                    ? 'Play any game to ignite your flame and claim the #1 spot!'
                    : 'Complete a challenge to earn your first XP and take the lead!'}
                </p>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    marginTop: 14, background: '#10b981', color: '#ffffff',
                    fontWeight: 800, fontSize: '0.85rem', padding: '10px 20px',
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
                    className={`rank-list-row ${isMe ? 'rank-list-row-me' : ''}`}
                  >
                    <div className="rank-list-left">
                      <span className={`rank-list-num ${isMe ? 'rank-list-num-me' : ''}`}>
                        {actualRank}
                      </span>
                      <AvatarIcon avatar={item.avatar} size={34} iconSize={18} />
                      <div className="rank-list-name-group">
                        <span className="rank-list-name">
                          {item.name || 'Learner'} {isMe && <span style={{ color: '#34d399', fontSize: '0.74rem' }}>(You)</span>}
                        </span>
                        <span className="rank-list-level-pill">Lv.{item.level || 1}</span>
                      </div>
                    </div>

                    <div className="rank-list-score">
                      {sortBy === 'xp' ? (
                        `${formatXP(item.xp || 0)} XP`
                      ) : (
                        <><Flame size={13} color="#ff5a5a" strokeWidth={2.2} /> {getActiveStreak(item)}</>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {!isUserInTop20 && isUserQualified && fullUserRankIndex >= 20 && (
              <>
                <div className="rank-list-ellipsis">···</div>
                <div className="rank-list-row rank-list-row-me">
                  <div className="rank-list-left">
                    <span className="rank-list-num rank-list-num-me">
                      #{fullUserRankIndex + 1}
                    </span>
                    <AvatarIcon avatar={userAvatar} size={34} iconSize={18} />
                    <div className="rank-list-name-group">
                      <span className="rank-list-name">
                        {displayName} <span style={{ color: '#34d399', fontSize: '0.74rem' }}>(You)</span>
                      </span>
                      <span className="rank-list-level-pill">Lv.{level}</span>
                    </div>
                  </div>

                  <div className="rank-list-score">
                    {sortBy === 'xp' ? (
                      `${formatXP(xp || 0)} XP`
                    ) : (
                      <><Flame size={13} color="#ff5a5a" strokeWidth={2.2} /> {streak}</>
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
