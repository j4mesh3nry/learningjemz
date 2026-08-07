// src/pages/Leaderboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { Trophy, Flame, Zap } from 'lucide-react';
import { Header } from '../components/Header';
import '../index.css';

// Helper to calculate effective streak based on last_visit date
const getEffectiveStreak = (item: any) => {
  if (!item || !item.last_visit) return 0;
  const todayStr = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const itemDate = new Date(item.last_visit).toDateString();
  if (itemDate === todayStr || itemDate === yesterdayStr) {
    return item.streak || 0;
  }
  return 0;
};

export default function Leaderboard() {
  const { user } = useAuth();
  const { xp, level, streak } = useGame();
  const [leaders, setLeaders] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'xp' | 'streak'>('xp');

  const fetchLeaders = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const { data, error } = await supabase
      .from('game_progress')
      .select('id, xp, level, streak, last_visit, name, avatar')
      .order(sortBy, { ascending: false })
      .order('xp', { ascending: false })
      .limit(50);

    if (!error && data) {
      setLeaders(data);
    }
    setLoading(false);
  }, [sortBy]);

  useEffect(() => {
    fetchLeaders(leaders.length === 0);

    const subscription = supabase
      .channel('public:game_progress')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_progress' }, () => {
        fetchLeaders(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchLeaders, leaders.length]);

  const handleTabChange = (newSortBy: 'xp' | 'streak') => {
    if (newSortBy === sortBy) return;
    setSortBy(newSortBy);
    // Instant in-memory sort to prevent layout jump/flicker
    setLeaders(prev => [...prev].sort((a, b) => {
      const valA = newSortBy === 'streak' ? getEffectiveStreak(a) : (Number(a.xp) || 0);
      const valB = newSortBy === 'streak' ? getEffectiveStreak(b) : (Number(b.xp) || 0);
      if (valB !== valA) return valB - valA;
      return (Number(b.xp) || 0) - (Number(a.xp) || 0);
    }));
  };

  const currentUserRankIndex = leaders.findIndex(l => l.id === user?.id);
  const currentUserRank = currentUserRankIndex !== -1 ? currentUserRankIndex + 1 : '> 50';
  const currentUserData = currentUserRankIndex !== -1 ? leaders[currentUserRankIndex] : null;

  const myStreak = streak || 0;
  const myStreakIsZero = myStreak === 0;
  const myDayLabel = (myStreak === 0 || myStreak === 1) ? 'Day' : 'Days';

  return (
    <div style={{
      minHeight: '100vh', background: '#ffffff',
      padding: '24px 16px 80px', maxWidth: 420, margin: '0 auto',
    }}>
      <Header />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.3rem',
          margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Trophy size={24} color="#f57f17" /> Leaderboard
        </h2>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        background: '#f1f3f5',
        padding: '4px',
        borderRadius: 14,
        marginBottom: 20
      }}>
        <button
          onClick={() => handleTabChange('xp')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: sortBy === 'xp' ? '#ffffff' : 'transparent',
            color: sortBy === 'xp' ? 'var(--color-primary-dark)' : '#6c757d',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: sortBy === 'xp' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Zap size={16} color={sortBy === 'xp' ? 'var(--color-primary)' : '#6c757d'} />
          XP Rank
        </button>
        <button
          onClick={() => handleTabChange('streak')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: sortBy === 'streak' ? '#ffffff' : 'transparent',
            color: sortBy === 'streak' ? '#e53935' : '#6c757d',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: sortBy === 'streak' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Flame size={16} color={sortBy === 'streak' ? '#e53935' : '#6c757d'} />
          Streak Rank
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--color-primary)', fontWeight: 'bold' }}>
          Loading Leaderboards...
        </div>
      ) : (
        <>
          {/* List for All Ranks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leaders.map((leader, index) => {
              const rank = index + 1;
              const isMe = leader.id === user?.id;
              let rankDisplay;
              if (rank === 1) rankDisplay = <div style={{ fontSize: '1.5rem' }}>🥇</div>;
              else if (rank === 2) rankDisplay = <div style={{ fontSize: '1.5rem' }}>🥈</div>;
              else if (rank === 3) rankDisplay = <div style={{ fontSize: '1.5rem' }}>🥉</div>;
              else rankDisplay = <div style={{ fontWeight: 700, color: '#999', fontSize: '1.1rem' }}>{rank}</div>;

              const leaderStreak = getEffectiveStreak(leader);
              const leaderStreakIsZero = leaderStreak === 0;
              const dayLabel = (leaderStreak === 0 || leaderStreak === 1) ? 'Day' : 'Days';

              return (
                <div key={leader.id} style={{
                  display: 'flex', alignItems: 'center', padding: '14px 16px',
                  background: isMe ? '#f0fdf4' : '#fff', 
                  borderRadius: 16,
                  border: isMe ? '2px solid #4caf50' : '1px solid #eaeaea',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 32, flexShrink: 0 }}>
                    {rankDisplay}
                  </div>
                  <div style={{ fontSize: '1.8rem', margin: '0 12px 0 8px', background: '#f8f9fa', borderRadius: '50%', padding: 4, flexShrink: 0 }}>
                    {leader.avatar || '👤'}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingRight: 8 }}>
                    <span style={{ fontWeight: 700, color: '#333', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {leader.name || 'Learner'}
                    </span>
                    <span style={{ color: '#666', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Lv. {leader.level || 1} {sortBy === 'streak' ? `• ${leader.xp || 0} XP` : (
                        <>• <span className={leaderStreakIsZero ? 'unlit-icon' : ''}>🔥</span> <span style={{ color: leaderStreakIsZero ? '#757575' : '#e53935', fontWeight: 600 }}>{leaderStreak} {dayLabel}</span></>
                      )}
                    </span>
                  </div>
                  <div style={{
                    fontWeight: 800,
                    fontSize: '1.02rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    flexShrink: 0,
                    whiteSpace: 'nowrap'
                  }}>
                    {sortBy === 'streak' ? (
                      <>
                        <span className={leaderStreakIsZero ? 'unlit-icon' : ''}>🔥</span>
                        <span style={{ color: leaderStreakIsZero ? '#757575' : '#e53935' }}>{leaderStreak} {dayLabel}</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--color-primary)' }}>{leader.xp || 0} XP</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Sticky Current User */}
      {!loading && user && (
        <div style={{
          position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 420, padding: '0 16px', boxSizing: 'border-box',
          zIndex: 50
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', padding: '12px 16px',
            background: '#ffffff',
            borderRadius: 16, 
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            border: '2px solid var(--color-primary)'
          }}>
            <div style={{ fontWeight: 700, color: 'var(--color-primary)', width: 24, fontSize: '1rem', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              {currentUserRank}
            </div>
            <div style={{ fontSize: '1.8rem', margin: '0 12px 0 8px', background: '#f8f9fa', borderRadius: '50%', padding: 4, flexShrink: 0 }}>
              {currentUserData?.avatar || user?.user_metadata?.avatar || '👤'}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingRight: 8 }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUserData?.name || user?.user_metadata?.name || 'You'}
              </span>
              <span style={{ color: '#666', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Lv. {level} {sortBy === 'streak' ? `• ${xp} XP` : (
                  <>• <span className={myStreakIsZero ? 'unlit-icon' : ''}>🔥</span> <span style={{ color: myStreakIsZero ? '#757575' : '#e53935', fontWeight: 600 }}>{myStreak} {myDayLabel}</span></>
                )}
              </span>
            </div>
            <div style={{
              fontWeight: 800,
              fontSize: '1.02rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}>
              {sortBy === 'streak' ? (
                <>
                  <span className={myStreakIsZero ? 'unlit-icon' : ''}>🔥</span>
                  <span style={{ color: myStreakIsZero ? '#757575' : '#e53935' }}>{myStreak} {myDayLabel}</span>
                </>
              ) : (
                <span style={{ color: 'var(--color-primary)' }}>{xp} XP</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
