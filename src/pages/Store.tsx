// src/pages/Store.tsx
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { useGame } from '../contexts/GameContext';
import { Gem, Flame, Zap, Shield, Sparkles, Check, ShoppingBag } from 'lucide-react';
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
  // Jemz balance calculation based on total XP or local state
  const [jemz, setJemz] = useState<number>(() => {
    const saved = localStorage.getItem('learningjemz_jemz');
    return saved ? parseInt(saved, 10) : Math.max(100, Math.floor(xp / 2) + 50);
  });

  const [purchased, setPurchased] = useState<string[]>(() => {
    const saved = localStorage.getItem('learningjemz_purchased');
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleBuy = (item: typeof STORE_ITEMS[0]) => {
    if (purchased.includes(item.id)) {
      showToast(`You already own ${item.name}!`);
      return;
    }

    if (jemz < item.price) {
      showToast(`Not enough Jemz! You need 💎 ${item.price - jemz} more.`);
      return;
    }

    const newBalance = jemz - item.price;
    setJemz(newBalance);
    localStorage.setItem('learningjemz_jemz', newBalance.toString());

    const newPurchased = [...purchased, item.id];
    setPurchased(newPurchased);
    localStorage.setItem('learningjemz_purchased', JSON.stringify(newPurchased));

    showToast(`Successfully unlocked ${item.name}! 🎉`);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg-page)',
      padding: '24px 16px 90px', maxWidth: 420, margin: '0 auto',
    }}>
      <Header />

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)',
          background: '#0e3d26', color: '#38d989', border: '1px solid #38d989',
          padding: '10px 18px', borderRadius: 14, fontWeight: 700, fontSize: '0.85rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 200, textAlign: 'center'
        }}>
          {toast}
        </div>
      )}

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

        {/* Currency Balance Badge */}
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
        {STORE_ITEMS.map((item) => {
          const isOwned = purchased.includes(item.id);

          return (
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
                onClick={() => handleBuy(item)}
                disabled={isOwned}
                style={{
                  background: isOwned ? '#e0e0e0' : 'var(--color-primary)',
                  color: isOwned ? '#666666' : '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  padding: '10px 14px',
                  borderRadius: 14,
                  border: 'none',
                  boxShadow: isOwned ? 'none' : '0 4px 0 #0e3d26',
                  cursor: isOwned ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap'
                }}
              >
                {isOwned ? (
                  <><Check size={14} /> Owned</>
                ) : (
                  <><Gem size={14} color="#ffffff" /> {item.price}</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
