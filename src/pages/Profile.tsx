// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ACHIEVEMENTS } from '../utils/achievements.js';
import { Settings, LogOut, Flame, Trophy, Map as MapIcon, BookOpen, Rocket, Check, Lock, Pencil } from 'lucide-react';
import { supabase } from '../utils/supabase.js';
import { updateAvatar, updateName } from '../api/supabase.js';
import '../index.css';

export default function Profile() {
  const { xp, level, streak, hasPlayedToday, stats } = useGame();
  const { user, logout } = useAuth();

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay(); // 0=Sun, 1=Mon
  const currentDayIdx = today === 0 ? 6 : today - 1;
  const refDayIdx = hasPlayedToday ? currentDayIdx : (currentDayIdx - 1 + 7) % 7;

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 4 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.8rem' }}>{name}</h2>
          <div
            onClick={() => {
              setTempName(name);
              setIsEditingName(true);
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.4)',
              transition: 'transform 0.1s ease',
              color: '#fff'
            }}
          >
            <Pencil size={12} strokeWidth={2.5} />
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
          <span className={!hasPlayedToday ? "unlit-icon" : ""} style={{ fontSize: '2rem' }}>🔥</span>
          <strong className={!hasPlayedToday ? "unlit-text" : ""} style={{ fontSize: '1.4rem', marginTop: 12, fontFamily: 'var(--font-heading)' }}>{streak}</strong>
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
      {/* ... rest of component unchanged ... */}
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
              onChange={e => setTempName(e.target.value)}
              placeholder="Enter your name..."
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
                background: '#fcfcfc'
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
                  const trimmed = tempName.trim();
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
