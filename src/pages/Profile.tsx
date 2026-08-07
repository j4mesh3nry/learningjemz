// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ACHIEVEMENTS } from '../utils/achievements.js';
import { Settings, LogOut, Trophy, Lock, Pencil, Flame, Calendar as CalendarIcon, RotateCcw, Trash2 } from 'lucide-react';
import { updateAvatar, updateName } from '../api/supabase.js';
import { getPlayedDates } from '../components/StreakScreen';
import '../index.css';

export default function Profile() {
  const navigate = useNavigate();
  const { xp, level, streak, hasPlayedToday, achievements, resetProgress } = useGame();
  const { user, logout, deleteAccount } = useAuth();

  const [avatar, setAvatar] = useState(() => user?.user_metadata?.avatar || localStorage.getItem('learningjemz_avatar') || '👤');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  const [name, setName] = useState(() => user?.user_metadata?.name || localStorage.getItem('learningjemz_name') || user?.email?.split('@')[0] || 'Learner');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playedDates, setPlayedDates] = useState<string[]>([]);

  useEffect(() => {
    setPlayedDates(getPlayedDates(user?.id));
  }, [user?.id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleResetProgress = async () => {
    if (resetProgress) {
      await resetProgress();
    }
    setShowResetModal(false);
    showToast('Account progress reset to 0');
  };

  const handleDeleteAccount = async () => {
    if (deleteAccount) {
      await deleteAccount();
    }
    setShowDeleteModal(false);
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

  // Calendar month math
  const todayDate = new Date();
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = todayDate.toLocaleString('default', { month: 'long' });
  const todayDateStr = todayDate.toISOString().split('T')[0];

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      {toast && (
        <div className="toast" role="alert" aria-live="assertive">
          {toast}
        </div>
      )}

      {/* Sticky Header */}
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
        <h2 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.4rem' }}>Me</h2>
        <Settings
          size={24}
          color="var(--color-muted)"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/settings')}
          role="button"
          aria-label="Settings"
        />
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: 20, borderRadius: 20, border: '1px solid #ffebee', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <Flame size={36} color={hasPlayedToday ? '#ff4d4d' : '#888888'} fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} />
          <strong style={{ fontSize: '1.4rem', marginTop: 12, fontFamily: 'var(--font-heading)', color: hasPlayedToday ? '#e53935' : '#444444' }}>{streak}</strong>
          <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: 600 }}>Day Streak</span>
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
            boxShadow: '0 4px 14px rgba(255,180,0,0.06)'
          }}
        >
          <Trophy size={36} color="#ffb400" style={{ fill: '#ffb400' }} />
          <strong style={{ fontSize: '1.4rem', marginTop: 12, fontFamily: 'var(--font-heading)', color: '#b78103' }}>{xp}</strong>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 600 }}>Total XP</span>
        </div>
      </div>

      {/* Dedicated Streak Calendar Section */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eaeaea',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        marginBottom: 32
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#e8f5e9', borderRadius: 12, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarIcon size={22} color="var(--color-primary)" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.2rem', color: '#222' }}>Streak Calendar</h3>
              <span style={{ fontSize: '0.8rem', color: '#777', fontWeight: 500 }}>{monthName} {year}</span>
            </div>
          </div>
        </div>

        {/* Monthly Calendar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 6,
          textAlign: 'center'
        }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayHeader, i) => (
            <div key={i} style={{ fontSize: '0.8rem', fontWeight: 800, color: '#999', paddingBottom: 6 }}>
              {dayHeader}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} style={{ height: 36 }} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isPlayed = playedDates.includes(dateString) || (dateString === todayDateStr && hasPlayedToday);

            return (
              <div
                key={dayNum}
                style={{
                  height: 38,
                  borderRadius: 12,
                  background: isPlayed ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : '#f8f9fa',
                  border: isPlayed ? 'none' : '1px solid #eee',
                  color: isPlayed ? '#ffffff' : '#666666',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: isPlayed ? 800 : 600,
                  position: 'relative',
                  boxShadow: isPlayed ? '0 3px 8px rgba(16,185,129,0.3)' : 'none'
                }}
              >
                <span>{dayNum}</span>
                {isPlayed && (
                  <Flame size={10} color="#ffd600" fill="#ffd600" style={{ marginTop: 1 }} />
                )}
              </div>
            );
          })}
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

      {/* Account Action Buttons (Reset Progress, Delete Account & Logout) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 24 }}>
        <button
          onClick={() => setShowResetModal(true)}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 16,
            background: '#fff',
            border: '2px solid #ff9800',
            color: '#e65100',
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(255,152,0,0.1)',
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={18} />
          Reset Account Progress
        </button>

        {user && (
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 16,
              background: '#fff',
              border: '2px solid #ff4d4d',
              color: '#ff4d4d',
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(255,77,77,0.1)',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={18} />
            Delete Account
          </button>
        )}

        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 16,
            background: '#f8f9fa',
            border: '2px solid #eaeaea',
            color: '#555',
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer'
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Reset Progress Confirmation Modal */}
      {showResetModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 20, maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 12px 0', color: '#333' }}>Reset Account Progress?</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 20, lineHeight: 1.4 }}>
              This will reset your Streak, XP, Level, and game records to 0. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowResetModal(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#eee', color: '#444', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetProgress}
                style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#ff9800', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 20, maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 12px 0', color: '#d32f2f' }}>Delete Account?</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 20, lineHeight: 1.4 }}>
              This will permanently delete your account data, achievements, and progress. You will be signed out immediately.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#eee', color: '#444', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#ff4d4d', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
