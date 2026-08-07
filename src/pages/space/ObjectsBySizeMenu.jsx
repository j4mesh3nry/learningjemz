import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { ArrowLeft } from 'lucide-react';
import './space.css';

export default function ObjectsBySizeMenu() {
  const navigate = useNavigate();

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
          className="space-card-item locked"
          onClick={() => {}}
          ariaLabel="Size Stack (Under Development)"
        >
          <div className="space-card-icon">📏</div>
          <div className="space-card-info">
            <h3 className="space-card-title">Size Stack</h3>
            <p className="space-card-subtitle">Drag and drop to order the planets</p>
          </div>
          <div className="space-lock-badge">🛠️ Under Development</div>
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
