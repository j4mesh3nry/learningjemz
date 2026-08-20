// src/pages/Leaderboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { Trophy, Flame, Zap, Crown, ArrowRight, Target, RefreshCw, Award } from 'lucide-react';
import { Header } from '../components/Header';
import { JemzLoader } from '../components/JemzLoader';
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
  if (val >= 1000) {
    const kVal = val / 1000;
    return kVal.toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return String(val);
};

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

  const handleTabChange = (newSortBy: 'xp' | 'streak') => {
    if (newSortBy === sortBy) return;
    setSortBy(newSortBy);
    setLeaders(prev => processLeaders(prev, newSortBy));
  };

  // Strictly cap visible ranks to Top 20
  const top20Leaders = leaders.slice(0, 20);
  const top1 = top20Leaders[0];
  const top2 = top20Leaders[1];
  const top3 = top20Leaders[2];
  const restLeaders = top20Leaders.slice(3);

  // User rank calculation
  const fullUserRankIndex = leaders.findIndex(l => l.id === user?.id);
  const isUserQualified = sortBy === 'streak' ? streak > 0 : xp > 0;
  const isUserInTop20 = isUserQualified && fullUserRankIndex !== -1 && fullUserRankIndex < 20;
  const currentUserRankDisplay = isUserInTop20 ? `#${fullUserRankIndex + 1}` : 'Unranked';

  // Target motivation message
  const getTargetMessage = () => {
    if (!isUserQualified) {
      return sortBy === 'streak'
        ? 'No active streak! Play today to ignite your flame and enter Top 20!'
        : 'Complete a lesson to earn your first XP and enter Top 20!';
    }

    if (!isUserInTop20) {
      const rank20Item = top20Leaders[19];
      if (rank20Item) {
        const targetVal = sortBy === 'streak' ? getActiveStreak(rank20Item) : Number(rank20Item.xp);
        const myVal = sortBy === 'streak' ? streak : xp;
        const needed = Math.max(1, targetVal - myVal + 1);

        return sortBy === 'streak'
          ? `Keep streak ${needed} more ${needed === 1 ? 'day' : 'days'} to reach Top 20! (#20 is ${rank20Item.name || 'Learner'})`
          : `Earn ${needed} XP more to break into Top 20! (#20 is ${rank20Item.name || 'Learner'})`;
      }
      return 'You qualify! Complete daily challenges to climb higher!';
    }

    if (fullUserRankIndex === 0) {
      return 'Leaderboard Champion! You hold #1 Rank!';
    }

    const playerAhead = top20Leaders[fullUserRankIndex - 1];
    if (playerAhead) {
      const aheadVal = sortBy === 'streak' ? getActiveStreak(playerAhead) : Number(playerAhead.xp);
      const myVal = sortBy === 'streak' ? streak : xp;
      const needed = Math.max(1, aheadVal - myVal + 1);

      return sortBy === 'streak'
        ? `Streak ${needed} more ${needed === 1 ? 'day' : 'days'} to overtake #${fullUserRankIndex} ${playerAhead.name || 'Learner'}!`
        : `Rank #${fullUserRankIndex + 1}! Earn ${needed} XP more to overtake #${fullUserRankIndex} ${playerAhead.name || 'Learner'}!`;
    }

    return `Great job! You are Rank #${fullUserRankIndex + 1}!`;
  };

  return (
    <div className="container" style={{
      minHeight: '100vh', background: 'var(--color-bg-page)',
      paddingBottom: '130px',
    }}>
      <Header />

      {/* Title & Tabs Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
            margin: 0, color: '#0f3825', fontWeight: 800,
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Trophy size={22} color="#d97706" /> Leaderboard
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#4e7361', fontWeight: 600 }}>
            Top 20 Qualified Learners
          </span>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => fetchLeaders(true)}
            disabled={loading}
            aria-label="Refresh leaderboard"
            style={{
              background: '#ffffff', border: '2px solid #b0cbaf', borderRadius: 12,
              padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
              boxShadow: '0 3px 0 #b0cbaf', transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={14} color={loading ? '#9db8a9' : '#16653e'} />
          </button>
          <div style={{
            display: 'flex', background: '#ffffff', padding: '3px',
            borderRadius: 14, border: '2px solid #b0cbaf'
          }}>
          <button
            onClick={() => handleTabChange('xp')}
            style={{
              background: sortBy === 'xp' ? '#16653e' : 'transparent',
              color: sortBy === 'xp' ? '#ffffff' : '#4e7361',
              fontWeight: 800, fontSize: '0.78rem', padding: '6px 12px',
              borderRadius: 11, border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            <Zap size={13} color={sortBy === 'xp' ? '#ffc107' : '#4e7361'} /> XP
          </button>
          <button
            onClick={() => handleTabChange('streak')}
            style={{
              background: sortBy === 'streak' ? '#16653e' : 'transparent',
              color: sortBy === 'streak' ? '#ffffff' : '#4e7361',
              fontWeight: 800, fontSize: '0.78rem', padding: '6px 12px',
              borderRadius: 11, border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            <Flame size={13} color={sortBy === 'streak' ? '#ff5252' : '#4e7361'} /> Streak
          </button>
          </div>
        </div>
      </div>

      {/* Loading State or Leaderboard Content */}
      {loading ? (
        <div style={{ padding: '20px 0' }}>
          <JemzLoader message="Loading Rankings..." subtext="Fetching Top 20 Learners..." fullScreen={false} />
        </div>
      ) : (
        <>
          {/* Gamified Top 3 Podium */}
          {top20Leaders.length >= 3 && (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 8,
              alignItems: 'flex-end', marginBottom: 20, paddingTop: 12
            }}>
              {/* 2nd Place */}
              <div style={{
                background: '#ffffff',
                borderRadius: 18, border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf',
                padding: '12px 8px', textAlign: 'center', position: 'relative'
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', border: '1.5px solid #94a3b8', marginTop: '-18px' }}>
                  <Award size={16} color="#64748b" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <AvatarIcon avatar={top2?.avatar} size={44} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f3825', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {top2?.name || 'Player'}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16653e', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  {sortBy === 'xp' ? `Lv.${top2?.level || 1} · ${formatXP(top2?.xp || 0)}` : <><Flame size={13} color="#ff4d4d" fill="#ff4d4d" /> {getActiveStreak(top2)}</>}
                </div>
              </div>

              {/* 1st Place (Gold Center Crown) */}
              <div style={{
                background: '#fffdf0',
                borderRadius: 20, border: '2.5px solid #f59e0b', boxShadow: '0 5px 0 #d97706',
                padding: '16px 8px', textAlign: 'center', position: 'relative', transform: 'scale(1.05)', zIndex: 2
              }}>
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
                  <Crown size={24} color="#f59e0b" fill="#fbbf24" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 2px' }}>
                  <AvatarIcon avatar={top1?.avatar} size={52} />
                </div>
                <div style={{ fontWeight: 900, fontSize: '0.92rem', color: '#78350f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {top1?.name || 'Champion'}
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#d97706', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  {sortBy === 'xp' ? `Lv.${top1?.level || 1} · ${formatXP(top1?.xp || 0)}` : <><Flame size={14} color="#ff4d4d" fill="#ff4d4d" /> {getActiveStreak(top1)}</>}
                </div>
              </div>

              {/* 3rd Place */}
              <div style={{
                background: '#ffffff',
                borderRadius: 18, border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf',
                padding: '12px 8px', textAlign: 'center', position: 'relative'
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#fef3c7', border: '1.5px solid #d97706', marginTop: '-18px' }}>
                  <Award size={16} color="#b45309" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <AvatarIcon avatar={top3?.avatar} size={44} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#4a2c1d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {top3?.name || 'Player'}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  {sortBy === 'xp' ? `Lv.${top3?.level || 1} · ${formatXP(top3?.xp || 0)}` : <><Flame size={13} color="#ff4d4d" fill="#ff4d4d" /> {getActiveStreak(top3)}</>}
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {top20Leaders.length === 0 ? (
              <div style={{
                background: '#ffffff', borderRadius: 20, border: '2px solid #b0cbaf',
                padding: '24px 16px', textAlign: 'center', color: '#0f3825'
              }}>
                <Target size={32} color="#16653e" style={{ margin: '0 auto 8px' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  {sortBy === 'streak' ? 'No Active Streaks Yet!' : 'No XP Scores Earned Yet!'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#4e7361', marginTop: 4, fontWeight: 500 }}>
                  {sortBy === 'streak'
                    ? 'Play any game to ignite your flame and claim the #1 spot!'
                    : 'Complete a challenge to earn your first XP and take the Lead!'}
                </p>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    marginTop: 12, background: '#16653e', color: '#ffffff',
                    fontWeight: 800, fontSize: '0.85rem', padding: '8px 20px',
                    borderRadius: 14, border: 'none', boxShadow: '0 3px 0 #0e4329',
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
                const inactiveDays = sortBy === 'streak' ? getStreakDaysInactive(item) : 0;

                return (
                  <div
                    key={item.id || idx}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: isMe ? '#e1f0e2' : '#ffffff',
                      border: isMe ? '2px solid #16653e' : '2px solid #b0cbaf',
                      boxShadow: isMe ? '0 3px 0 #0e4329' : '0 3px 0 #b0cbaf',
                      borderRadius: 16, padding: '12px 14px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 10,
                        background: isMe ? '#16653e' : '#e1f0e2',
                        color: isMe ? '#ffffff' : '#0f3825',
                        fontWeight: 900, fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {actualRank}
                      </div>
                      <AvatarIcon avatar={item.avatar} size={36} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f3825' }}>
                          {item.name || 'Learner'} {isMe && <span style={{ color: '#16653e', fontSize: '0.75rem' }}>(You)</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.8rem', color: '#16653e', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {sortBy === 'xp' ? `Lv.${item.level || 1} · ${formatXP(item.xp || 0)}` : <><Flame size={15} color="#ff4d4d" fill="#ff4d4d" /> {getActiveStreak(item)}</>}
                    </div>
                  </div>
                );
              })
            )}

            {/* Open Spots Invitation Tile if Top 20 is not full and user is not in Top 20 yet */}
            {!isUserInTop20 && top20Leaders.length > 0 && top20Leaders.length < 20 && (
              <div style={{
                background: 'rgba(225, 240, 226, 0.6)',
                borderRadius: 16, border: '2px dashed #b0cbaf',
                padding: '12px 16px', textAlign: 'center',
                fontSize: '0.82rem', color: '#0f3825', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                <Zap size={15} color="#16653e" />
                <span>Open spots in Top 20! Only {top20Leaders.length} {top20Leaders.length === 1 ? 'player has' : 'players have'} {sortBy === 'streak' ? 'a streak' : 'earned XP'} — {sortBy === 'streak' ? 'keep your streak alive to hold the spot, or play to take it!' : 'earn XP to claim a spot!'}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Pinned Bottom User Rank & Target Goal Bar (Only visible when loading is complete) */}
      {!loading && user && (
        <div className="leaderboard-user-rank-bar" style={{
          flexDirection: 'column',
          gap: !isUserInTop20 ? 6 : 0,
          padding: !isUserInTop20 ? '10px 14px' : '10px 16px'
        }}>
          {/* Header Row: Rank Badge + Your Current Score */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                background: isUserInTop20 ? '#ffffff' : '#f57f17',
                color: isUserInTop20 ? '#16653e' : '#ffffff',
                fontWeight: 900,
                padding: '3px 10px', borderRadius: 8, fontSize: '0.8rem'
              }}>
                {currentUserRankDisplay}
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>Your Rank</div>
            </div>

            <div style={{ fontWeight: 900, fontSize: '0.82rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: 4 }}>
              {sortBy === 'xp' ? `Lv.${level} · ${formatXP(xp)}` : <><Flame size={15} color="#ff4d4d" fill="#ff4d4d" /> {streak}</>}
            </div>
          </div>

          {/* Motivational Target Message Row (Only visible for unranked / non-Top20 players) */}
          {!isUserInTop20 && (
            <div style={{
              background: 'rgba(0,0,0,0.18)',
              borderRadius: 12,
              padding: '6px 10px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#e1f0e2'
            }}>
              <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {getTargetMessage()}
              </span>
              {!isUserQualified && (
                <button
                  onClick={() => navigate('/')}
                  style={{
                    background: '#ffffff', color: '#16653e',
                    fontWeight: 900, fontSize: '0.72rem',
                    padding: '4px 10px', borderRadius: 10,
                    border: 'none', cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 3
                  }}
                >
                  Play <ArrowRight size={11} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
