import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Crown } from 'lucide-react';
import '../index.css';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaders = async () => {
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
    
    // Set up realtime subscription
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
      minHeight: '100vh', background: '#f5f7fa',
      paddingBottom: 100, maxWidth: 420, margin: '0 auto',
    }}>
      {/* Sticky Header Container */}
      <div style={{ 
        position: 'sticky', top: 0, zIndex: 100, background: '#ffffff',
        padding: '24px 16px 16px',
        borderBottom: '1px solid #eaeaea',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #a855f7, #6366f1)', 
          padding: 8, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
        }}>
          <Trophy size={24} color="#fff" />
        </div>
        <h1 style={{ 
          fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: 0,
          background: 'linear-gradient(135deg, #a855f7, #6366f1)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontWeight: 800
        }}>
          Diamond League
        </h1>
      </div>

      <div style={{ padding: '24px 16px' }}>
        {/* Podium */}
        {top3.length >= 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '8px', marginBottom: 40, height: 200, marginTop: 20 }}>
            
            {/* Rank 2 - Silver */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>
              <div style={{ fontWeight: 800, color: '#222', fontSize: '0.9rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80, marginBottom: 4 }}>{top3[1].name || 'Learner'}</div>
              <div style={{ color: '#6366f1', fontWeight: 800, fontSize: '0.85rem', marginBottom: 8 }}>{top3[1].xp} XP</div>
              
              <div style={{ position: 'relative', marginBottom: -16, zIndex: 10 }}>
                <div style={{ fontSize: '2.5rem', background: '#f8f9fa', borderRadius: '50%', padding: 4, border: '4px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {top3[1].avatar || '👤'}
                </div>
                <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', background: '#cbd5e1', color: '#334155', fontWeight: 900, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>2</div>
              </div>
              
              <div style={{ background: 'linear-gradient(to bottom, #e2e8f0, #f1f5f9)', width: '100%', height: 70, borderRadius: '16px 16px 0 0', border: '2px solid #cbd5e1', borderBottom: 'none' }} />
            </div>

            {/* Rank 1 - Gold */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1.2, zIndex: 3 }}>
              <div style={{ fontWeight: 800, color: '#222', fontSize: '1rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90, marginBottom: 4 }}>{top3[0].name || 'Learner'}</div>
              <div style={{ color: '#a855f7', fontWeight: 800, fontSize: '0.95rem', marginBottom: 8 }}>{top3[0].xp} XP</div>
              
              <div style={{ position: 'relative', marginBottom: -16, zIndex: 10 }}>
                <Crown size={32} color="#fbbf24" fill="#fbbf24" style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', filter: 'drop-shadow(0 2px 4px rgba(251,191,36,0.5))' }} />
                <div style={{ fontSize: '3.2rem', background: '#fffbeb', borderRadius: '50%', padding: 6, border: '4px solid #fbbf24', boxShadow: '0 8px 24px rgba(251, 191, 36, 0.4)' }}>
                  {top3[0].avatar || '👤'}
                </div>
                <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', background: '#fbbf24', color: '#fff', fontWeight: 900, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>1</div>
              </div>
              
              <div style={{ background: 'linear-gradient(to bottom, #fde68a, #fef3c7)', width: '100%', height: 100, borderRadius: '16px 16px 0 0', border: '2px solid #fbbf24', borderBottom: 'none' }} />
            </div>

            {/* Rank 3 - Bronze */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1 }}>
              <div style={{ fontWeight: 800, color: '#222', fontSize: '0.9rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80, marginBottom: 4 }}>{top3[2].name || 'Learner'}</div>
              <div style={{ color: '#6366f1', fontWeight: 800, fontSize: '0.85rem', marginBottom: 8 }}>{top3[2].xp} XP</div>
              
              <div style={{ position: 'relative', marginBottom: -16, zIndex: 10 }}>
                <div style={{ fontSize: '2.5rem', background: '#f8f9fa', borderRadius: '50%', padding: 4, border: '4px solid #d97706', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {top3[2].avatar || '👤'}
                </div>
                <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', background: '#d97706', color: '#fff', fontWeight: 900, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>3</div>
              </div>
              
              <div style={{ background: 'linear-gradient(to bottom, #fcd34d, #fef3c7)', width: '100%', height: 50, borderRadius: '16px 16px 0 0', border: '2px solid #d97706', borderBottom: 'none' }} />
            </div>

          </div>
        )}

        {/* List for 4+ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rest.map((leader, index) => {
            const rank = index + 4;
            const isMe = leader.id === user?.id;
            
            return (
              <div key={leader.id} style={{
                display: 'flex', alignItems: 'center', padding: '16px',
                background: isMe ? '#f0fdf4' : '#fff', 
                borderRadius: 20,
                border: isMe ? '2px solid #4caf50' : '2px solid #eaeaea',
                borderBottom: isMe ? '6px solid #4caf50' : '6px solid #eaeaea', // Duolingo style thick bottom border
                boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
              }}>
                <div style={{ fontWeight: 800, color: isMe ? '#2e7d32' : '#94a3b8', width: 32, fontSize: '1.2rem' }}>
                  {rank}
                </div>
                <div style={{ fontSize: '2.5rem', margin: '0 16px 0 8px', background: '#f8f9fa', borderRadius: '50%', padding: 4 }}>
                  {leader.avatar || '👤'}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 800, color: isMe ? '#2e7d32' : '#334155', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {leader.name || 'Learner'}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Lv. {leader.level || 1}</span>
                </div>
                <div style={{ fontWeight: 800, color: isMe ? '#4caf50' : '#8b5cf6', fontSize: '1.1rem' }}>
                  {leader.xp} XP
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Sticky Current User (if not in top 3) */}
      {!loading && currentUserRankIndex > 2 && (
        <div style={{
          position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 420, padding: '0 16px', boxSizing: 'border-box',
          zIndex: 50
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', padding: '16px',
            background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
            borderRadius: 20, 
            boxShadow: '0 8px 30px rgba(76, 175, 80, 0.4)',
            border: '2px solid #fff'
          }}>
            <div style={{ fontWeight: 800, color: '#c8e6c9', width: 32, fontSize: '1.2rem' }}>
              {currentUserRank}
            </div>
            <div style={{ fontSize: '2.5rem', margin: '0 16px 0 8px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: 4 }}>
              {currentUserData?.avatar || user?.user_metadata?.avatar || '👤'}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUserData?.name || user?.user_metadata?.name || 'You'}
              </span>
              <span style={{ color: '#c8e6c9', fontSize: '0.85rem', fontWeight: 600 }}>Lv. {currentUserData?.level || 1}</span>
            </div>
            <div style={{ fontWeight: 900, color: '#fff', fontSize: '1.1rem' }}>
              {currentUserData?.xp || 0} XP
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
