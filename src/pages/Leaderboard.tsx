// src/pages/Leaderboard.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { Trophy } from 'lucide-react';
import { Header } from '../components/Header';
import '../index.css';

export default function Leaderboard() {
  const { user } = useAuth();
  const { xp, level } = useGame();
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_progress' }, () => {
        fetchLeaders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const currentUserRankIndex = leaders.findIndex(l => l.id === user?.id);
  const currentUserRank = currentUserRankIndex !== -1 ? currentUserRankIndex + 1 : '> 50';
  const currentUserData = currentUserRankIndex !== -1 ? leaders[currentUserRankIndex] : null;

  return (
    <div style={{
      minHeight: '100vh', background: '#ffffff',
      padding: '24px 16px 80px', maxWidth: 420, margin: '0 auto',
    }}>
      <Header />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--color-primary)', fontWeight: 'bold' }}>Loading Leaderboards...</div>
      ) : (
        <>

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
