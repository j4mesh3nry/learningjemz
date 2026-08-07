import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import { Card } from '../../components/Card';
import { Flame, Star, ArrowLeft } from 'lucide-react';
import './space.css';

export default function ObjectsBySizeMenu() {
  const navigate = useNavigate();
  const { level, streak, hasPlayedToday } = useGame();

  return (
    <div className="space-module-page">
      {/* Navigation Header */}
      <div className="space-nav-header">
        <div className="space-header-left">
          <button className="space-back-btn" onClick={() => navigate('/space')} title="Back to Space">
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              fontSize: '1.1rem', width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 100%)', borderRadius: 8,
              boxShadow: '0 2px 6px rgba(26,26,62,0.3)'
            }}>
              🪐
            </div>
            <h1 className="space-page-title" style={{ margin: 0, color: '#111324', fontSize: '1.3rem', fontWeight: 900 }}>
              Objects by Size
            </h1>
          </div>
        </div>

        {/* Top Badges */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 3,
          background: '#fafafa', padding: '5px 9px', borderRadius: 12,
          border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          minWidth: 76, boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <Flame 
              size={13} 
              color={hasPlayedToday ? '#ff4d4d' : '#888888'} 
              fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} 
            />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: hasPlayedToday ? '#e53935' : '#444444' }}>
              {streak ?? 0}
            </span>
          </div>
          <div style={{ height: 1, background: '#eee', margin: '1px 0' }} />
          <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, cursor: 'pointer' }}>
            <Star size={13} color="#f57f17" fill="#ffb300" />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#f57f17' }}>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: '4px 0', marginBottom: '20px' }}>
        <p style={{ color: '#4a4e69', fontSize: '0.95rem', lineHeight: '1.5', margin: 0, fontWeight: 500 }}>
          Explore and memorize the 35 largest objects in our Solar System!
        </p>
      </div>

      {/* Mode List */}
      <div className="space-card-list">
        <Card
          className="space-card-item"
          onClick={() => navigate('/space/size-stack')}
          ariaLabel="Size Stack"
        >
          <div className="space-card-icon">📏</div>
          <div className="space-card-info">
            <h3 className="space-card-title">Size Stack</h3>
            <p className="space-card-subtitle">Drag and drop to order the planets</p>
          </div>
          <div className="space-card-arrow">→</div>
        </Card>

        <Card
          className="space-card-item"
          onClick={() => navigate('/space/illuminate')}
          ariaLabel="Illuminate the System"
        >
          <div className="space-card-icon">💡</div>
          <div className="space-card-info">
            <h3 className="space-card-title">Illuminate the System</h3>
            <p className="space-card-subtitle">Type the names in order</p>
          </div>
          <div className="space-card-arrow">→</div>
        </Card>
      </div>
    </div>
  );
}
