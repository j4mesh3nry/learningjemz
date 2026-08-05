import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import './space.css';

export default function ObjectsBySizeMenu() {
  const navigate = useNavigate();

  return (
    <div className="space-module">
      {/* Background Starfield */}
      <div className="starfield">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="star" style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <button className="space-back-btn" onClick={() => navigate('/space')}>
            ←
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
            <h1 className="space-page-title" style={{ color: '#fff', WebkitTextFillColor: '#fff', textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}>
              Objects by Size
            </h1>
          </div>
        </div>

        <div style={{ padding: '0 4px', marginBottom: '24px' }}>
          <p style={{ color: '#d1c4e9', fontSize: '1.1rem', lineHeight: '1.5' }}>
            Explore and memorize the 35 largest objects in our Solar System!
          </p>
        </div>

        <div className="space-card-list">
          <Card
            className="space-card-item light-card"
            onClick={() => navigate('/space/size-stack')}
          ariaLabel="Size Stack"
        >
            <div className="space-card-icon" style={{ background: '#e8f5e9', color: '#4caf50' }}>📏</div>
          <div className="space-card-info">
            <h3 className="space-card-title">Size Stack</h3>
            <p className="space-card-subtitle">Drag and drop to order the planets</p>
          </div>
          <div className="space-card-arrow">→</div>
        </Card>

          <Card
            className="space-card-item light-card"
            onClick={() => navigate('/space/illuminate')}
            ariaLabel="Illuminate the Solar System"
          >
            <div className="space-card-icon" style={{ background: '#fff3e0', color: '#ff9800' }}>💡</div>
          <div className="space-card-info">
            <h3 className="space-card-title">Illuminate the System</h3>
            <p className="space-card-subtitle">Type the names in order</p>
          </div>
          <div className="space-card-arrow">→</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
