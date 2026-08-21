import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ACHIEVEMENTS } from '../utils/achievements.js';
import {
  Settings,
  LogOut,
  Trophy,
  Lock,
  Pencil,
  Flame,
  Calendar as CalendarIcon,
  Gamepad2,
  Compass,
  BookOpen,
  Sparkles,
  GraduationCap,
  Crown
} from 'lucide-react';
import { updateAvatar, updateName } from '../api/supabase.js';
import { getPlayedDates } from '../utils/streakStorage';
import { getLocalDateString } from '../utils/dateUtils';
import { AvatarIcon } from '../components/AvatarIcon';
import { CompanionPickerModal } from '../components/companion/CompanionPickerModal';
import '../index.css';

const ACHIEVEMENT_ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  Trophy,
  Gamepad2,
  Compass,
  BookOpen,
  Sparkles,
  Flame,
  GraduationCap,
  Crown,
};

export default function Profile() {
  const navigate = useNavigate();
  const { xp, level, streak, hasPlayedToday, achievements, playedDates: contextPlayedDates, flushNow } = useGame();
  const { user, logout } = useAuth();

  const [avatar, setAvatar] = useState(() => user?.user_metadata?.avatar || localStorage.getItem('learningjemz_avatar') || 'user');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  const [name, setName] = useState(() => user?.user_metadata?.name || localStorage.getItem('learningjemz_name') || user?.email?.split('@')[0] || 'Learner');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [playedDates, setPlayedDates] = useState<string[]>([]);

  useEffect(() => {
    const local = getPlayedDates(user?.id);
    const combined = Array.from(new Set([...(contextPlayedDates || []), ...local]));
    setPlayedDates(combined);
  }, [user?.id, contextPlayedDates]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Push any unsynced progress to the cloud before signing out so the row other
  // learners see is current. The pending-sync queue survives logout regardless,
  // so a failed/aborted flush still restores on the next login.
  const handleLogout = async () => {
    try {
      await flushNow?.();
    } catch {}
    await logout();
  };


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

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      {toast && (
        <div className="toast" role="alert" aria-live="assertive">
          {toast}
        </div>
      )}

      {/* Compact Sticky Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#d4e8d5',
          paddingTop: 12,
          paddingBottom: 12,
          margin: '-24px -16px 20px -16px',
          paddingLeft: 16,
          paddingRight: 16,
          borderBottom: '2px solid #b0cbaf',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.25rem', color: '#0f3825', fontWeight: 800 }}>Profile</h2>
        <Settings
          size={20}
          color="#16653e"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/settings')}
          role="button"
          aria-label="Settings"
        />
      </div>

      {/* Responsive Dashboard Grid for Mobile, Tablet & Desktop */}
      <div className="dashboard-grid">
        {/* Left Column: Profile Card, Stats & Calendar */}
        <div>
          {/* Profile Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: 24,
              color: '#0f3825',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              border: '2.5px solid #b0cbaf',
              boxShadow: '0 4px 0 #b0cbaf',
              marginBottom: 20
            }}
          >
            {/* Background pattern */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 70,
                background: 'linear-gradient(135deg, #16653e 0%, #0e4329 100%)',
                opacity: 0.95
              }}
            />

            {/* Avatar with edit icon */}
            <div
              onClick={() => setIsEditingAvatar(true)}
              style={{
                position: 'relative',
                display: 'inline-block',
                marginTop: 20,
                marginBottom: 12,
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '4px solid #ffffff',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                <AvatarIcon avatar={avatar} size={88} iconSize={48} />
              </div>
              <button
                onClick={() => setIsEditingAvatar(true)}
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  background: '#16653e',
                  color: '#ffffff',
                  border: '2px solid #ffffff',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 3,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
                aria-label="Edit Avatar"
              >
                <Pencil size={14} />
              </button>
            </div>

            {/* Name */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8, 
              marginBottom: 4,
              padding: '0 16px',
              boxSizing: 'border-box'
            }}>
              <h2 style={{ 
                fontFamily: 'var(--font-heading)', 
                margin: 0, 
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#0f3825',
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
                  background: '#e1f0e2',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '1.5px solid #b0cbaf',
                  flexShrink: 0,
                  color: '#16653e'
                }}
              >
                <Pencil size={13} strokeWidth={2.5} />
              </div>
            </div>

            {/* Email */}
            <p style={{ color: '#4e7361', fontSize: '0.85rem', marginBottom: 16, fontWeight: 600 }}>
              {user?.email}
            </p>
            
            {/* Level & Title Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#e1f0e2',
                padding: '6px 16px',
                borderRadius: 20,
                fontWeight: 800,
                fontSize: '0.88rem',
                color: '#0f3825',
                border: '2px solid #16653e',
                boxShadow: '0 2px 0 #b0cbaf'
              }}
            >
              <span>Level {level}</span>
              <span style={{ color: '#b0cbaf' }}>•</span>
              <span>{level >= 20 ? 'Master' : level >= 10 ? 'Scholar' : level >= 5 ? 'Apprentice' : 'Beginner'}</span>
            </div>
          </div>

          {/* Stats Row (Streak & XP) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: 20, borderRadius: 20, border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf' }}>
              <Flame size={36} color={hasPlayedToday ? '#ff4d4d' : '#888888'} fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} />
              <strong style={{ fontSize: '1.4rem', marginTop: 12, fontFamily: 'var(--font-heading)', color: hasPlayedToday ? '#e53935' : '#444444' }}>{streak}</strong>
              <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: 600 }}>Day Streak</span>
            </div>

            <div
              style={{
                padding: 20,
                borderRadius: 20,
                border: '2px solid #f57f17',
                background: '#fffdf5',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 0 #f57f17'
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
            border: '2px solid #b0cbaf',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 4px 0 #b0cbaf',
            marginBottom: 20
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
                const dateObj = new Date(year, month, dayNum);
                const dateString = getLocalDateString(dateObj);
                const isPlayed = playedDates.includes(dateString);

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
        </div>

        {/* Right Column: Achievements & Logout */}
        <div>
          {/* Achievements */}
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: 16, paddingLeft: 4 }}>Achievements</h3>
          <div style={{ 
            padding: 24, borderRadius: 20, background: '#ffffff',
            border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf',
            marginBottom: 24,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 
          }}>
            {ACHIEVEMENTS.map(a => {
              const unlockedData = achievements?.find(ach => ach.id === a.id);
              const unlocked = !!unlockedData;
              const IconComponent = ACHIEVEMENT_ICON_MAP[a.icon] || Trophy;
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
                    marginBottom: 8,
                    position: 'relative',
                    boxShadow: unlocked ? '0 4px 12px rgba(255,180,0,0.3)' : 'none'
                  }}>
                    {unlocked ? <IconComponent size={28} color="#d97706" strokeWidth={2.2} /> : <Lock size={20} color="#999" />}
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

          {/* Logout Action Button */}
          <div style={{ paddingBottom: 24 }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 16,
                background: '#ffffff',
                border: '2px solid #b0cbaf',
                boxShadow: '0 4px 0 #b0cbaf',
                color: '#16653e',
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                fontWeight: 800,
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
        </div>
      </div>

      {/* Immersive Living Companion Picker Modal */}
      {isEditingAvatar && (
        <CompanionPickerModal
          currentAvatar={avatar}
          onSelect={handleSelectAvatar}
          onClose={() => setIsEditingAvatar(false)}
        />
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
            background: 'rgba(0,0,0,0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
