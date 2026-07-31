import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { Trophy, Medal, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../index.css';

export default function Leaderboard() {
  const { user } = useAuth();
  const { streak, level } = useGame();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      minHeight: '100vh', background: '#ffffff',
      padding: '24px 16px 80px', maxWidth: 420, margin: '0 auto',
    }}>
      {/* Sticky Header Container (From Home.jsx) */}
      <div style={{ 
        position: 'sticky', top: 0, zIndex: 100, background: '#ffffff',
        paddingTop: 24, paddingBottom: 16, margin: '-24px -16px 16px -16px', paddingLeft: 16, paddingRight: 16,
        borderBottom: '1px solid #eaeaea',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
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
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: '#fff5f5', padding: '4px 10px', borderRadius: 20,
              border: '1px solid #ffcdd2',
            }}>
              <span style={{ fontSize: '1rem' }}>🔥</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e53935' }}>{streak}</span>
            </div>
            <Link to="/profile" style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: '#fff8e1', padding: '4px 10px', borderRadius: 20,
              border: '1px solid #ffe082', textDecoration: 'none',
            }}>
              <span style={{ fontSize: '0.85rem' }}>⭐</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f57f17' }}>Lv.{level}</span>
            </Link>
          </div>
        </div>
      </div>

      <h2 style={{
        fontFamily: 'var(--font-heading)', fontSize: '1.3rem',
        marginBottom: 20, color: '#333', display: 'flex', alignItems: 'center', gap: 8
      }}>
        <Trophy size={24} color="#f57f17" /> Global Leaderboard
      </h2>

      {/* Podium */}
      {top3.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '8px', marginBottom: 32, height: 160, marginTop: 24 }}>
          
          {/* Rank 2 */}
          {top3[1] && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ fontSize: '2.5rem', background: '#f8f9fa', borderRadius: '50%', padding: 4, border: '3px solid #9e9e9e' }}>
                {top3[1].avatar || '👤'}
              </div>
              <div style={{ background: '#9e9e9e', color: '#fff', fontWeight: 700, borderRadius: '12px', padding: '2px 8px', fontSize: '0.8rem', marginTop: -10, zIndex: 1 }}>2nd</div>
              <div style={{ fontWeight: 700, color: '#333', fontSize: '0.9rem', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80 }}>{top3[1].name || 'Learner'}</div>
              <div style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.85rem' }}>{top3[1].xp} XP</div>
              <div style={{ background: '#f5f5f5', width: '100%', height: 50, borderRadius: '8px 8px 0 0', marginTop: 8 }} />
            </div>
          )}

          {/* Rank 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1.2 }}>
            <div style={{ fontSize: '3rem', background: '#fff9c4', borderRadius: '50%', padding: 6, border: '3px solid #f57f17' }}>
              {top3[0].avatar || '👤'}
            </div>
            <div style={{ background: '#f57f17', color: '#fff', fontWeight: 700, borderRadius: '12px', padding: '2px 8px', fontSize: '0.8rem', marginTop: -12, zIndex: 1 }}>1st</div>
            <div style={{ fontWeight: 800, color: '#222', fontSize: '1rem', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90 }}>{top3[0].name || 'Learner'}</div>
            <div style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.95rem' }}>{top3[0].xp} XP</div>
            <div style={{ background: '#fff8e1', width: '100%', height: 70, borderRadius: '8px 8px 0 0', marginTop: 8 }} />
          </div>

          {/* Rank 3 */}
          {top3[2] && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ fontSize: '2.5rem', background: '#efebe9', borderRadius: '50%', padding: 4, border: '3px solid #bcaaa4' }}>
                {top3[2].avatar || '👤'}
              </div>
              <div style={{ background: '#bcaaa4', color: '#fff', fontWeight: 700, borderRadius: '12px', padding: '2px 8px', fontSize: '0.8rem', marginTop: -10, zIndex: 1 }}>3rd</div>
              <div style={{ fontWeight: 700, color: '#333', fontSize: '0.9rem', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80 }}>{top3[2].name || 'Learner'}</div>
              <div style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.85rem' }}>{top3[2].xp} XP</div>
              <div style={{ background: '#fafafa', width: '100%', height: 35, borderRadius: '8px 8px 0 0', marginTop: 8 }} />
            </div>
          )}

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
              borderRadius: 16,
              border: isMe ? '2px solid #4caf50' : '1px solid #eaeaea',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontWeight: 700, color: '#999', width: 24, fontSize: '1rem' }}>
                {rank}
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
          )
        })}
      </div>
      
      {/* Sticky Current User (if not in top 3) */}
      {!loading && currentUserRankIndex > 2 && (
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
            <div style={{ fontWeight: 700, color: 'var(--color-primary)', width: 24, fontSize: '1rem' }}>
              {currentUserRank}
            </div>
            <div style={{ fontSize: '2rem', margin: '0 16px 0 8px', background: '#f8f9fa', borderRadius: '50%', padding: 4 }}>
              {currentUserData?.avatar || user?.user_metadata?.avatar || '👤'}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUserData?.name || user?.user_metadata?.name || 'You'}
              </span>
              <span style={{ color: '#666', fontSize: '0.85rem' }}>Lv. {currentUserData?.level || 1}</span>
            </div>
            <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.05rem' }}>
              {currentUserData?.xp || 0} XP
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
