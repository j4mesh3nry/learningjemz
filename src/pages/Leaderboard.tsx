// src/pages/Leaderboard.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { Trophy, Gem } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

export default function Leaderboard() {
  const { user } = useAuth();
  const { xp, level, streak, hasPlayedToday } = useGame();
  const xpInLevel = xp - (level - 1) * 100;
  const pct = Math.min(xpInLevel, 100);
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      // NOTE: If RLS is enabled, this will return 0 rows for other users unless a SELECT policy is added.
      const { data, error } = await supabase
        .from('game_progress')
        .select('id, xp, level, name, avatar')
        .order('xp', { ascending: false })
        .limit(50);

      if (!error && data) {
        setLeaders(data);
      }
      setLoading(false);
    };
    fetchLeaders();

    const subscription = supabase
      .channel('public:game_progress')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_progress' }, payload => {
        fetchLeaders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--color-primary)', fontWeight: 'bold' }}>Loading Leaderboards...</div>;
  }

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  const currentUserRankIndex = leaders.findIndex(l => l.id === user?.id);
  const currentUserRank = currentUserRankIndex !== -1 ? currentUserRankIndex + 1 : '> 50';
  const currentUserData = currentUserRankIndex !== -1 ? leaders[currentUserRankIndex] : null;

  return (
    <div style={{
      minHeight: '100vh', background: '#ffffff',
      padding: '24px 16px 80px', maxWidth: 420, margin: '0 auto',
    }}>
      {/* Sticky Header Container */}
      <div style={{ 
        position: 'sticky', top: 0, zIndex: 100, background: '#ffffff',
        paddingTop: 28, paddingBottom: 20, margin: '-24px -16px 20px -16px', paddingLeft: 16, paddingRight: 16,
        borderBottom: '1px solid #eaeaea',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        {/* Top row: Title and Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          {/* Logo Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1c7c54, #4caf50)',
              borderRadius: '10px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(76, 175, 80, 0.25)'
            }}>
              <Gem size={22} color="#ffffff" strokeWidth={2.5} />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.6rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: '#1a202c',
              margin: 0,
            }}>
              Learning<span style={{ color: '#1c7c54' }}>Jemz</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3,
              background: '#fff5f5', padding: '2px 8px', borderRadius: 12,
              border: '1px solid #ffcdd2',
            }}>
              <span className={!hasPlayedToday ? "unlit-icon" : ""} style={{ fontSize: '0.75rem' }}>🔥</span>
              <span className={!hasPlayedToday ? "unlit-text" : ""} style={{ fontWeight: 800, fontSize: '0.7rem', color: '#e53935' }}>{streak}</span>
            </div>
            <div onClick={() => navigate('/profile')} style={{
              display: 'flex', alignItems: 'center', gap: 3,
              background: '#fff8e1', padding: '2px 8px', borderRadius: 12,
              border: '1px solid #ffe082', cursor: 'pointer',
            }} aria-label="Go to Profile" role="button">
              <span style={{ fontSize: '0.75rem' }}>⭐</span>
              <span style={{ fontWeight: 800, fontSize: '0.7rem', color: '#f57f17' }}>Lv.{level}</span>
            </div>
          </div>
        </div>
        {/* XP Mini bar */}
        <div>
          <div style={{
            height: 6, borderRadius: 3, background: '#e8f5e9', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 3, width: `${pct}%`,
              background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: 4 }}>
            {xpInLevel}/100 XP to Level {level + 1}
          </div>
        </div>
      </div>

      <h2 style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.3rem',
        marginBottom: 20, color: '#333', display: 'flex', alignItems: 'center', gap: 8
      }}>
        <Trophy size={24} color="#f57f17" /> Global Leaderboard
      </h2>

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

          return (
            <div key={leader.id} style={{
              display: 'flex', alignItems: 'center', padding: '16px',
              background: isMe ? '#f0fdf4' : '#fff', 
              borderRadius: 16,
              border: isMe ? '2px solid #4caf50' : '1px solid #eaeaea',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 36 }}>
                {rankDisplay}
              </div>
              <div style={{ fontSize: '2rem', margin: '0 16px 0 8px', background: '#f8f9fa', borderRadius: '50%', padding: 4 }}>
                {leader.avatar || '👤'}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 700, color: '#333', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {leader.name || 'Learner'}
                </span>
                <span style={{ color: '#666', fontSize: '0.85rem' }}>Lv. {leader.level || 1}</span>
              </div>
              <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.05rem' }}>
                {leader.xp} XP
              </div>
            </div>
          );
        })}
      </div>

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
            <div style={{ fontWeight: 700, color: 'var(--color-primary)', width: 24, fontSize: '1rem', display: 'flex', justifyContent: 'center' }}>
              {currentUserRank}
            </div>
            <div style={{ fontSize: '2rem', margin: '0 16px 0 8px', background: '#f8f9fa', borderRadius: '50%', padding: 4 }}>
              {currentUserData?.avatar || user?.user_metadata?.avatar || '👤'}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUserData?.name || user?.user_metadata?.name || 'You'}
              </span>
              <span style={{ color: '#666', fontSize: '0.85rem' }}>Lv. {level}</span>
            </div>
            <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.05rem' }}>
              {xp} XP
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
