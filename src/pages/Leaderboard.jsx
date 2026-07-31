import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal } from 'lucide-react';
import '../index.css';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase
        .from('game_progress')
        .select('id, xp, name, avatar')
        .order('xp', { ascending: false })
        .limit(50);
        
      if (!error && data) {
        setLeaders(data);
      }
      setLoading(false);
    };
    fetchLeaders();
    
    // Set up realtime subscription (optional, but cool)
    const subscription = supabase
      .channel('public:game_progress')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_progress' }, payload => {
        fetchLeaders();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    }
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
      minHeight: '100vh', background: '#f8f9fa',
      padding: '24px 16px 100px', maxWidth: 420, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32, paddingTop: 16 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', color: '#ffb300', fontSize: '2.2rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Trophy size={36} fill="#ffb300" color="#e65100" /> Diamond League
        </h1>
        <p style={{ color: 'var(--color-muted)', margin: '8px 0 0 0', fontSize: '0.95rem' }}>Top 50 learners this week</p>
      </div>

      {/* Podium */}
      {top3.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '12px', marginBottom: 40, height: 180 }}>
          
          {/* Rank 2 - Silver */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <div style={{ fontSize: '2.5rem', background: '#e0e0e0', borderRadius: '50%', padding: 8, border: '4px solid #9e9e9e', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                {top3[1].avatar || '👤'}
              </div>
              <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: '#9e9e9e', color: '#fff', fontWeight: 800, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>2</div>
            </div>
            <div style={{ fontWeight: 700, color: '#333', fontSize: '0.9rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80 }}>{top3[1].name || 'Learner'}</div>
            <div style={{ color: '#4caf50', fontWeight: 800, fontSize: '0.85rem' }}>{top3[1].xp} XP</div>
            <div style={{ background: 'linear-gradient(to bottom, #e0e0e0, #f5f5f5)', width: '100%', height: 60, borderRadius: '8px 8px 0 0', marginTop: 12, border: '1px solid #d4d4d4', borderBottom: 'none' }} />
          </div>

          {/* Rank 1 - Gold */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1.2, zIndex: 3 }}>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <Medal size={28} color="#f57f17" fill="#ffeb3b" style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)' }} />
              <div style={{ fontSize: '3rem', background: '#fff9c4', borderRadius: '50%', padding: 12, border: '4px solid #ffb300', boxShadow: '0 12px 24px rgba(255, 179, 0, 0.3)' }}>
                {top3[0].avatar || '👤'}
              </div>
              <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: '#ffb300', color: '#fff', fontWeight: 800, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>1</div>
            </div>
            <div style={{ fontWeight: 800, color: '#222', fontSize: '1rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90 }}>{top3[0].name || 'Learner'}</div>
            <div style={{ color: '#4caf50', fontWeight: 800, fontSize: '0.95rem' }}>{top3[0].xp} XP</div>
            <div style={{ background: 'linear-gradient(to bottom, #ffecb3, #fff8e1)', width: '100%', height: 90, borderRadius: '8px 8px 0 0', marginTop: 12, border: '1px solid #ffe082', borderBottom: 'none' }} />
          </div>

          {/* Rank 3 - Bronze */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1 }}>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <div style={{ fontSize: '2.5rem', background: '#efebe9', borderRadius: '50%', padding: 8, border: '4px solid #bcaaa4', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                {top3[2].avatar || '👤'}
              </div>
              <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: '#bcaaa4', color: '#fff', fontWeight: 800, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>3</div>
            </div>
            <div style={{ fontWeight: 700, color: '#333', fontSize: '0.9rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80 }}>{top3[2].name || 'Learner'}</div>
            <div style={{ color: '#4caf50', fontWeight: 800, fontSize: '0.85rem' }}>{top3[2].xp} XP</div>
            <div style={{ background: 'linear-gradient(to bottom, #efebe9, #fafafa)', width: '100%', height: 40, borderRadius: '8px 8px 0 0', marginTop: 12, border: '1px solid #d7ccc8', borderBottom: 'none' }} />
          </div>

        </div>
      )}

      {/* List for 4+ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 60 }}>
        {rest.map((leader, index) => {
          const rank = index + 4;
          const isMe = leader.id === user?.id;
          
          return (
            <div key={leader.id} style={{
              display: 'flex', alignItems: 'center', padding: '12px 16px',
              background: isMe ? '#e8f5e9' : '#fff', 
              borderRadius: 16,
              border: isMe ? '2px solid #8bc34a' : '1px solid #eaeaea',
              boxShadow: isMe ? '0 4px 12px rgba(76,175,80,0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              <div style={{ fontWeight: 700, color: isMe ? '#388e3c' : '#999', width: 28, fontSize: '1rem' }}>
                {rank}
              </div>
              <div style={{ fontSize: '2rem', margin: '0 12px 0 4px' }}>
                {leader.avatar || '👤'}
              </div>
              <div style={{ flex: 1, fontWeight: isMe ? 700 : 600, color: isMe ? '#2e7d32' : '#333', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {leader.name || 'Learner'}
              </div>
              <div style={{ fontWeight: 800, color: '#4caf50' }}>
                {leader.xp} XP
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Sticky Current User (if not in top 3) */}
      {!loading && currentUserRankIndex > 2 && (
        <div style={{
          position: 'fixed', bottom: 64, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 420, padding: '12px 16px', boxSizing: 'border-box',
          zIndex: 50
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', padding: '12px 20px',
            background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
            borderRadius: 20, border: '2px solid var(--color-primary)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{ fontWeight: 800, color: 'var(--color-primary-dark)', width: 32, fontSize: '1.1rem' }}>
              {currentUserRank}
            </div>
            <div style={{ fontSize: '2rem', margin: '0 12px 0 4px' }}>
              {currentUserData?.avatar || user?.user_metadata?.avatar || '👤'}
            </div>
            <div style={{ flex: 1, fontWeight: 800, color: 'var(--color-primary-dark)', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUserData?.name || user?.user_metadata?.name || 'You'}
            </div>
            <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
              {currentUserData?.xp || 0} XP
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
