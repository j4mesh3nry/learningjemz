// src/pages/Store.tsx
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { useGame } from '../contexts/GameContext';
import { Gem, ShoppingBag, Shield, Zap, Crown, Sparkles } from 'lucide-react';
import '../index.css';

const STORE_ITEMS = [
  {
    id: 'streak_shield',
    name: 'Streak Freeze',
    description: 'Protects your daily streak if you miss a day of learning.',
    price: 100,
    icon: Shield,
    badge: 'Popular',
    category: 'Protection'
  },
  {
    id: 'xp_boost',
    name: 'Double XP (30m)',
    description: 'Earn 2x Experience Points across all modules for 30 minutes.',
    price: 150,
    icon: Zap,
    badge: '2x Boost',
    category: 'Boosters'
  },
  {
    id: 'avatar_king',
    name: 'Royal King Avatar',
    description: 'Unlock the exclusive Royal Crown avatar icon for your profile.',
    price: 200,
    icon: Crown,
    badge: 'Exclusive',
    category: 'Avatars'
  },
  {
    id: 'avatar_dragon',
    name: 'Dragon Avatar',
    description: 'Unlock the mythical Golden Dragon avatar icon.',
    price: 200,
    icon: Sparkles,
    badge: 'Mythic',
    category: 'Avatars'
  }
];

export default function Store() {
  const { xp } = useGame();
  const [jemz] = useState<number>(() => Math.max(100, Math.floor(xp / 2) + 50));

  return (
    <div className="container" style={{
      minHeight: '100vh',
      background: 'var(--game-bg-canvas, #030d09)',
      paddingBottom: 90,
      position: 'relative'
    }}>
      <Header />

      {/* Centered Clean "Coming Soon" Overlay Card */}
      <div style={{
        position: 'absolute',
        top: 150,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: 460,
        zIndex: 50,
        background: 'var(--game-surface-card, #05130e)',
        border: '1.5px solid var(--game-border-default, #102d1f)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
        borderRadius: 24,
        padding: '32px 24px',
        textAlign: 'center',
        color: '#ffffff'
      }}>
        <div style={{
          width: 56, height: 56, background: 'rgba(52, 211, 153, 0.12)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto'
        }}>
          <ShoppingBag size={28} color="var(--game-accent-emerald, #34d399)" strokeWidth={2.2} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0, fontWeight: 800, color: '#ffffff' }}>
          Store Opening Soon!
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--game-text-secondary, #cbe0d4)', marginTop: 8, lineHeight: 1.4, fontWeight: 500 }}>
          We're crafting exclusive companions, streak protections, and badges for the Jemz Store! Check back soon for updates.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            marginTop: 16,
            background: 'var(--game-accent-emerald, #34d399)',
            color: '#030d09',
            fontWeight: 800,
            fontSize: '0.9rem',
            padding: '12px 24px',
            borderRadius: 16,
            border: 'none',
            boxShadow: '0 3px 0 #064e3b',
            cursor: 'pointer'
          }}
        >
          Back to Exploring
        </button>
      </div>

      {/* Background Dimmed Store Preview */}
      <div style={{ filter: 'blur(5px) opacity(0.35)', pointerEvents: 'none', userSelect: 'none' }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #05130e 0%, #081d15 100%)',
          borderRadius: 22,
          padding: '20px',
          color: '#ffffff',
          marginBottom: 16,
          border: '1.5px solid var(--game-border-default, #102d1f)',
          boxShadow: '0 6px 14px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, background: 'rgba(52, 211, 153, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShoppingBag size={24} color="#34d399" strokeWidth={2.2} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: 0, fontWeight: 800, color: '#ffffff' }}>
                Jemz Store
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#6b8f7b', fontWeight: 500 }}>
                Power up your learning!
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)',
            padding: '6px 12px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Gem size={18} color="#34d399" fill="#34d399" />
            <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#ffffff' }}>{jemz}</span>
          </div>
        </div>

        {/* Shop Item List */}
        <div className="responsive-grid-locked">
          {STORE_ITEMS.map((item) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--game-surface-card, #05130e)',
                  borderRadius: 20,
                  border: '1.5px solid var(--game-border-default, #102d1f)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 50, height: 50,
                    background: 'rgba(52, 211, 153, 0.1)', borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ItemIcon size={26} color="#34d399" strokeWidth={2.2} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <h3 style={{
                        fontFamily: 'var(--font-heading)', fontSize: '1.05rem',
                        margin: 0, fontWeight: 800, color: '#ffffff'
                      }}>{item.name}</h3>
                      <span style={{
                        background: '#102d1f', color: '#34d399',
                        fontSize: '0.65rem', fontWeight: 800,
                        padding: '2px 6px', borderRadius: 8
                      }}>
                        {item.badge}
                      </span>
                    </div>
                    <p style={{
                      margin: '3px 0 0', fontSize: '0.78rem', color: '#6b8f7b', fontWeight: 500,
                      maxWidth: 200
                    }}>
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  disabled
                  style={{
                    background: '#102d1f',
                    color: '#34d399',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    padding: '10px 14px',
                    borderRadius: 14,
                    border: '1px solid #1a452f',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Gem size={14} color="#34d399" /> {item.price}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
