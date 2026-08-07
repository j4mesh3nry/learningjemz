// src/pages/Store.tsx
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { useGame } from '../contexts/GameContext';
import { Gem, Lock, ShoppingBag, Check } from 'lucide-react';
import '../index.css';

const STORE_ITEMS = [
  {
    id: 'streak_shield',
    name: 'Streak Freeze',
    description: 'Protects your daily streak if you miss a day of learning.',
    price: 100,
    icon: '🛡️',
    badge: 'Popular',
    category: 'Protection'
  },
  {
    id: 'xp_boost',
    name: 'Double XP (30m)',
    description: 'Earn 2x Experience Points across all modules for 30 minutes.',
    price: 150,
    icon: '⚡',
    badge: '2x Boost',
    category: 'Boosters'
  },
  {
    id: 'avatar_king',
    name: 'Royal King Avatar 👑',
    description: 'Unlock the exclusive Royal Crown avatar icon for your profile.',
    price: 200,
    icon: '👑',
    badge: 'Exclusive',
    category: 'Avatars'
  },
  {
    id: 'avatar_dragon',
    name: 'Dragon Avatar 🐉',
    description: 'Unlock the mythical Golden Dragon avatar icon.',
    price: 200,
    icon: '🐉',
    badge: 'Mythic',
    category: 'Avatars'
  }
];

export default function Store() {
  const { xp } = useGame();
  const [jemz] = useState<number>(() => Math.max(100, Math.floor(xp / 2) + 50));

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg-page)',
      padding: '24px 16px 90px', maxWidth: 420, margin: '0 auto',
      position: 'relative'
    }}>
      <Header />

      {/* Centered Glassmorphic "Coming Soon" Overlay */}
      <div style={{
        position: 'absolute',
        top: 150,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: 380,
        zIndex: 50,
        background: 'rgba(10, 46, 29, 0.88)',
        backdropFilter: 'blur(12px)',
        border: '2px solid #38d989',
        boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
        borderRadius: 24,
        padding: '32px 24px',
        textAlign: 'center',
        color: '#ffffff'
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(56, 217, 137, 0.15)',
          border: '2px solid #38d989',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Lock size={28} color="#38d989" />
        </div>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.5rem',
          margin: '0 0 8px 0',
          fontWeight: 800,
          color: '#ffffff'
        }}>
          Jemz Store — Coming Soon!
        </h2>
        <p style={{
          margin: 0,
          fontSize: '0.88rem',
          color: 'rgba(255, 255, 255, 0.85)',
          lineHeight: 1.5,
          fontWeight: 500
        }}>
          We're preparing exclusive avatar skins, streak freezes, and XP boosters. Stay tuned!
        </p>
      </div>

      {/* Blurred Store Content Backdrop */}
      <div style={{
        filter: 'blur(6px)',
        opacity: 0.55,
        pointerEvents: 'none',
        userSelect: 'none'
      }}>
        {/* Title & Currency Balance Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0e3d26 0%, #16603b 100%)',
          borderRadius: 20, padding: '16px 18px', marginBottom: 20,
          boxShadow: '0 6px 0 #072415', color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid rgba(255,255,255,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'linear-gradient(135deg, #1c7c54, #38d989)',
              borderRadius: 14, padding: '8px', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <ShoppingBag size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>
                Jemz Store
              </h2>
              <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 500 }}>
                Power up your learning!
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px 12px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Gem size={18} color="#38d989" fill="#38d989" />
            <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#ffffff' }}>{jemz}</span>
          </div>
        </div>

        {/* Shop Item List */}
        <div style={{ display: 'grid', gap: 14 }}>
          {STORE_ITEMS.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: 20,
                border: '2px solid #cce3d7',
                boxShadow: '0 5px 0 #b7d6c5',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  fontSize: '2rem', width: 50, height: 50,
                  background: '#e8f3ed', borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h3 style={{
                      fontFamily: 'var(--font-heading)', fontSize: '1.05rem',
                      margin: 0, fontWeight: 800, color: '#0e3d26'
                    }}>{item.name}</h3>
                    <span style={{
                      background: '#dcf0e5', color: '#165e3d',
                      fontSize: '0.65rem', fontWeight: 800,
                      padding: '2px 6px', borderRadius: 8
                    }}>
                      {item.badge}
                    </span>
                  </div>
                  <p style={{
                    margin: '3px 0 0', fontSize: '0.78rem', color: '#496c5b', fontWeight: 500,
                    maxWidth: 200
                  }}>
                    {item.description}
                  </p>
                </div>
              </div>

              <button
                disabled
                style={{
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  padding: '10px 14px',
                  borderRadius: 14,
                  border: 'none',
                  boxShadow: '0 4px 0 #0e3d26',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap'
                }}
              >
                <Gem size={14} color="#ffffff" /> {item.price}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
