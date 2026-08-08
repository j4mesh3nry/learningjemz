// src/pages/Leaderboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { Trophy, Flame, Zap, Crown } from 'lucide-react';
import { Header } from '../components/Header';
import '../index.css';

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
      const sortedData = [...data].sort((a, b) => {
        const valA = sortBy === 'streak' ? getEffectiveStreak(a) : (Number(a.xp) || 0);
        const valB = sortBy === 'streak' ? getEffectiveStreak(b) : (Number(b.xp) || 0);
        if (valB !== valA) return valB - valA;
        return (Number(b.xp) || 0) - (Number(a.xp) || 0);
      });
      setLeaders(sortedData);
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
    setLeaders(prev => [...prev].sort((a, b) => {
      const valA = newSortBy === 'streak' ? getEffectiveStreak(a) : (Number(a.xp) || 0);
      const valB = newSortBy === 'streak' ? getEffectiveStreak(b) : (Number(b.xp) || 0);
      if (valB !== valA) return valB - valA;
      return (Number(b.xp) || 0) - (Number(a.xp) || 0);
    }));
  };

  const currentUserRankIndex = leaders.findIndex(l => l.id === user?.id);
  const currentUserRank = currentUserRankIndex !== -1 ? currentUserRankIndex + 1 : '> 50';

  const top1 = leaders[0];
  const top2 = leaders[1];
  const top3 = leaders[2];
  const restLeaders = leaders.slice(3);

  return (
    <div className="container" style={{
      minHeight: '100vh', background: 'var(--color-bg-page)',
      paddingBottom: '100px',
    }}>
      <Header />

      {/* Title & Tabs Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
          margin: 0, color: '#0f3825', fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Trophy size={22} color="#d97706" /> Leaderboard
        </h2>

        {/* Tab Switcher */}
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

      {/* Gamified Top 3 Podium */}
      {leaders.length >= 3 && (
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
            <div style={{ fontSize: '1.4rem', marginTop: '-18px' }}>🥈</div>
            <div style={{ fontSize: '1.8rem', margin: '4px 0' }}>{top2?.avatar || '👤'}</div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f3825', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {top2?.name || 'Player'}
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16653e', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              {sortBy === 'xp' ? `${top2?.xp || 0} XP` : <><Flame size={13} color="#ff4d4d" fill="#ff4d4d" /> {getEffectiveStreak(top2)}</>}
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
            <div style={{ fontSize: '2.2rem', margin: '6px 0 2px' }}>{top1?.avatar || '👑'}</div>
            <div style={{ fontWeight: 900, fontSize: '0.92rem', color: '#78350f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {top1?.name || 'Champion'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#d97706', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              {sortBy === 'xp' ? `${top1?.xp || 0} XP` : <><Flame size={14} color="#ff4d4d" fill="#ff4d4d" /> {getEffectiveStreak(top1)}</>}
            </div>
          </div>

          {/* 3rd Place */}
          <div style={{
            background: '#ffffff',
            borderRadius: 18, border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf',
            padding: '12px 8px', textAlign: 'center', position: 'relative'
          }}>
            <div style={{ fontSize: '1.4rem', marginTop: '-18px' }}>🥉</div>
            <div style={{ fontSize: '1.8rem', margin: '4px 0' }}>{top3?.avatar || '👤'}</div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#4a2c1d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {top3?.name || 'Player'}
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#b45309', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              {sortBy === 'xp' ? `${top3?.xp || 0} XP` : <><Flame size={13} color="#ff4d4d" fill="#ff4d4d" /> {getEffectiveStreak(top3)}</>}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#16653e', fontWeight: 700 }}>
            Loading rankings...
          </div>
        ) : (
          (leaders.length > 3 ? restLeaders : leaders).map((item, idx) => {
            const actualRank = leaders.length > 3 ? idx + 4 : idx + 1;
            const isMe = item.id === user?.id;

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
                  <div style={{ fontSize: '1.4rem' }}>{item.avatar || '👤'}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f3825' }}>
                      {item.name || 'Learner'} {isMe && <span style={{ color: '#16653e', fontSize: '0.75rem' }}>(You)</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#4e7361', fontWeight: 600 }}>
                      Level {item.level || 1}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.9rem', color: '#16653e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {sortBy === 'xp' ? `${item.xp || 0} XP` : <><Flame size={15} color="#ff4d4d" fill="#ff4d4d" /> {getEffectiveStreak(item)}</>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pinned Bottom User Rank Bar */}
      {user && (
        <div className="leaderboard-user-rank-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: '#ffffff', color: '#16653e', fontWeight: 900,
              padding: '3px 8px', borderRadius: 8, fontSize: '0.8rem'
            }}>
              #{currentUserRank}
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Your Rank</div>
          </div>
          <div style={{ fontWeight: 900, fontSize: '0.9rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: 4 }}>
            {sortBy === 'xp' ? `${xp} XP` : <><Flame size={15} color="#ff4d4d" fill="#ff4d4d" /> {streak}</>}
          </div>
        </div>
      )}
    </div>
  );
}
