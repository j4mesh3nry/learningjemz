// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ACHIEVEMENTS } from '../utils/achievements.js';
import { Settings, LogOut, Trophy, BookOpen, Rocket, Lock, Pencil, Flame } from 'lucide-react';
import { updateAvatar, updateName } from '../api/supabase.js';
import '../index.css';

export default function Profile() {
  const { xp, level, streak, hasPlayedToday, booksReading, readingMinutes, flashcardsMastered, quizHighScore, achievements } = useGame();
  const { user, logout } = useAuth();



  const [avatar, setAvatar] = useState(() => user?.user_metadata?.avatar || localStorage.getItem('learningjemz_avatar') || '👤');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  const [name, setName] = useState(() => user?.user_metadata?.name || localStorage.getItem('learningjemz_name') || user?.email?.split('@')[0] || 'Learner');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const PFP_OPTIONS = ['👤', '🦊', '🦉', '🐯', '🐼', '🐸', '🐶', '🦄', '🤖', '👽', '🦸‍♂️', '👩‍🚀', '🐱', '🦁'];

  // Sync with cloud when user data loads on new device
  useEffect(() => {
    if (user?.user_metadata?.avatar) setAvatar(user.user_metadata.avatar);
    if (user?.user_metadata?.name) setName(user.user_metadata.name);
  }, [user]);

  const handleSelectAvatar = async (a: string) => {
    setAvatar(a);
    localStorage.setItem('learningjemz_avatar', a);
    setIsEditingAvatar(false);
    if (user) {
      const result = await updateAvatar(user.id, a);
      if (result.success) {
        showToast('Avatar updated');
      } else {
        console.error(result.error);
        showToast('Failed to update avatar');
      }
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      {toast && (
        <div className="toast" role="alert" aria-live="assertive">
          {toast}
        </div>
      )}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#ffffff',
          paddingTop: 24,
          paddingBottom: 16,
          margin: '-24px -16px 24px -16px',
          paddingLeft: 16,
          paddingRight: 16,
          borderBottom: '1px solid #eaeaea',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.4rem' }}>Profile</h2>
        <Settings size={24} color="var(--color-muted)" style={{ cursor: 'pointer' }} />
      </div>
      {/* ID Card / Avatar */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))',
          borderRadius: 24,
          padding: 32,
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(28,124,84,0.25)',
          marginBottom: 24
        }}
      >
        <div
          onClick={() => setIsEditingAvatar(true)}
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            margin: '0 auto',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          {avatar}
          <div
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              background: '#ffb400',
              borderRadius: '50%',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              color: '#222'
            }}
          >
            <Pencil size={12} strokeWidth={3} />
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 8, 
          marginTop: 20, 
          marginBottom: 4,
          maxWidth: '100%',
          padding: '0 16px',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ 
            fontFamily: 'var(--font-heading)', 
            margin: 0, 
            fontSize: '1.6rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 'calc(100% - 36px)'
          }}>
            {name}
          </h2>
          <div
            onClick={() => {
              setTempName(name);
              setIsEditingName(true);
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.4)',
              flexShrink: 0,
              color: '#fff'
            }}
          >
            <Pencil size={13} strokeWidth={2.5} />
          </div>
        </div>
        <p style={{ opacity: 0.9, fontSize: '0.9rem', marginBottom: 20 }}>{user?.email}</p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: 20,
            backdropFilter: 'blur(10px)',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          <span>Level {level}</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span>{level >= 10 ? '👑 Master' : level >= 5 ? '🎓 Scholar' : '🌱 Beginner'}</span>
        </div>
      </div>
      {/* Stats Row (Streak & XP) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 30 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #ffebee' }}>
          <Flame size={36} color={hasPlayedToday ? '#ff4d4d' : '#888888'} fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} />
          <strong style={{ fontSize: '1.4rem', marginTop: 12, fontFamily: 'var(--font-heading)', color: hasPlayedToday ? '#e53935' : '#444444' }}>{streak}</strong>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>Day Streak</span>
        </div>
        <div
          style={{
            padding: 20,
            borderRadius: 20,
            border: '2px solid #fff8e1',
            background: '#fffdf5',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 16px rgba(255,180,0,0.06)'
          }}
        >
          <Trophy size={36} color="#ffb400" style={{ fill: '#ffb400' }} />
          <strong style={{ fontSize: '1.4rem', marginTop: 12, fontFamily: 'var(--font-heading)' }}>{xp}</strong>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 500 }}>Total XP</span>
        </div>
      </div>
      {/* Module Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        
        <div style={{
          background: 'linear-gradient(135deg, #b85c1e, #d66c24)', borderRadius: 20, padding: 20, color: '#fff',
          boxShadow: '0 8px 24px rgba(184,92,30,0.25)', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.1, transform: 'scale(2)' }}>
            <BookOpen size={64} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, opacity: 0.9 }}>
            <BookOpen size={24} color="#fff" />
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Reading</strong>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Books: <strong style={{color:'#fff'}}>{booksReading || 0}</strong></div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Mins: <strong style={{color:'#fff'}}>{readingMinutes || 0}</strong></div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #0a0a1a, #1a1a3e)', borderRadius: 20, padding: 20, color: '#fff',
          boxShadow: '0 8px 24px rgba(10,10,26,0.4)', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.05, transform: 'scale(2)' }}>
            <Rocket size={64} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, opacity: 0.9 }}>
            <Rocket size={24} color="#fff" />
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Space</strong>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Mastered: <strong style={{color:'#fff'}}>{flashcardsMastered || 0}</strong></div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Best: <strong style={{color:'#fff'}}>{quizHighScore || 0}%</strong></div>
        </div>

      </div>

      {/* Achievements */}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: 16, paddingLeft: 8 }}>Achievements</h3>
      <div style={{ 
        padding: 24, borderRadius: 20, background: '#ffffff',
        border: '1px solid #eaeaea', boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        marginBottom: 32,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 
      }}>
        {ACHIEVEMENTS.map(a => {
          const unlockedData = achievements?.find(ach => ach.id === a.id);
          const unlocked = !!unlockedData;
          return (
            <div key={a.id} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              opacity: unlocked ? 1 : 0.4,
              filter: unlocked ? 'none' : 'grayscale(100%)'
            }}>
              <div style={{ 
                width: 60, height: 60, borderRadius: '50%', 
                background: unlocked ? '#fff8e1' : '#f5f5f5',
                border: unlocked ? '2px solid #ffb400' : '2px dashed #ddd',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', marginBottom: 8,
                position: 'relative',
                boxShadow: unlocked ? '0 4px 12px rgba(255,180,0,0.3)' : 'none'
              }}>
                {unlocked ? a.icon : <Lock size={20} color="#999" />}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#333', lineHeight: 1.2 }}>{a.name}</div>
              {unlocked && (
                <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: 4 }}>
                  {new Date(unlockedData.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Logout */}
      <div style={{ paddingBottom: 24 }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: 18,
            borderRadius: 16,
            background: '#fff',
            border: '2px solid #ff4d4d',
            color: '#ff4d4d',
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(255,77,77,0.1)'
          }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
      {/* Avatar Selection Modal */}
      {isEditingAvatar && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
          }}
          onClick={() => setIsEditingAvatar(false)}
        >
          <div
            style={{
              background: '#fff',
              padding: 24,
              borderRadius: 24,
              width: '90%',
              maxWidth: 360,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', marginBottom: 20 }}>Choose Avatar</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {PFP_OPTIONS.map(a => (
                <div
                  key={a}
                  onClick={() => handleSelectAvatar(a)}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: avatar === a ? '#e8f5e9' : '#f5f5f5',
                    border: avatar === a ? '3px solid #4caf50' : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease',
                    transform: avatar === a ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: avatar === a ? '0 4px 12px rgba(76,175,80,0.3)' : 'none'
                  }}
                >
                  {a}
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsEditingAvatar(false)}
              style={{
                width: '100%',
                marginTop: 24,
                padding: 14,
                borderRadius: 12,
                background: '#f5f5f5',
                color: '#333',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Name Edit Modal */}
      {isEditingName && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
          }}
          onClick={() => setIsEditingName(false)}
        >
          <div
            style={{
              background: '#fff',
              padding: 24,
              borderRadius: 24,
              width: '90%',
              maxWidth: 360,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', marginBottom: 20, color: '#333' }}>Edit Name</h3>
            <input
              type="text"
              value={tempName}
              onChange={e => setTempName(e.target.value.slice(0, 20))}
              maxLength={20}
              placeholder="Enter your name (max 20 chars)..."
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: '2px solid #eaeaea',
                fontSize: '1.1rem',
                fontFamily: 'var(--font-body)',
                marginBottom: 24,
                outline: 'none',
                color: '#333',
                background: '#fcfcfc',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setIsEditingName(false)}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  background: '#f5f5f5',
                  color: '#555',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const trimmed = tempName.trim().slice(0, 20);
                  if (trimmed) {
                    setName(trimmed);
                    localStorage.setItem('learningjemz_name', trimmed);
                    setIsEditingName(false);
                    if (user) {
                      const result = await updateName(user.id, trimmed);
                      if (result.success) {
                        showToast('Name updated');
                      } else {
                        console.error(result.error);
                        showToast('Failed to update name');
                      }
                    }
                  } else {
                    setIsEditingName(false);
                  }
                }}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
