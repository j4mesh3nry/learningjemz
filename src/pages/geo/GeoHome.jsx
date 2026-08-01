import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProvinceQuiz from './ProvinceQuiz';
import MapExplorer from './MapExplorer';
import { useGame } from '../../contexts/GameContext';
import './geo.css';

function GeoDashboard() {
  const navigate = useNavigate();
  const { xp, level, streak, provincesCorrect, hasPlayedToday } = useGame();

  return (
    <div className="geo-module-page">
      {/* Navigation Header */}
      <div className="geo-nav-header">
        <div className="geo-header-left">
          <button className="geo-back-btn" onClick={() => navigate('/')} title="Back to Home">
            ←
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              fontSize: '1.1rem', width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #004e92 0%, #0077b6 100%)', borderRadius: 8,
              boxShadow: '0 2px 6px rgba(0,119,182,0.3)'
            }}>
              🌍
            </div>
            <h1 className="geo-page-title" style={{ margin: 0, color: '#0066cc', fontSize: '1.4rem', fontWeight: 900 }}>Geography</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: '#fff5f5', padding: '2px 8px', borderRadius: 12,
            border: '1px solid #ffcdd2',
          }}>
            <span className={!hasPlayedToday ? "unlit-icon" : ""} style={{ fontSize: '0.75rem' }}>🔥</span>
            <span className={!hasPlayedToday ? "unlit-text" : ""} style={{ fontWeight: 800, fontSize: '0.7rem', color: '#e53935' }}>{streak}</span>
          </div>
          <div onClick={() => navigate('/profile')} style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: '#fff8e1', padding: '2px 8px', borderRadius: 12,
            border: '1px solid #ffe082', cursor: 'pointer',
          }}>
            <span style={{ fontSize: '0.75rem' }}>⭐</span>
            <span style={{ fontWeight: 800, fontSize: '0.7rem', color: '#f57f17' }}>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* Active Modes */}
      <h2 className="geo-section-heading">Expeditions</h2>

      <div className="geo-card-list">
        <div className="geo-card-item" onClick={() => navigate('quiz')}>
          <div className="geo-card-icon">🎯</div>
          <div className="geo-card-info">
            <h3 className="geo-card-title">Province Quiz</h3>
            <p className="geo-card-subtitle">{provincesCorrect || 0}/81 provinces mastered</p>
          </div>
          <div className="geo-card-arrow">→</div>
        </div>

        <div className="geo-card-item" onClick={() => navigate('explorer')}>
          <div className="geo-card-icon">🗺️</div>
          <div className="geo-card-info">
            <h3 className="geo-card-title">Map Explorer</h3>
            <p className="geo-card-subtitle">Free roam interactive map</p>
          </div>
          <div className="geo-card-arrow">→</div>
        </div>
      </div>

      {/* Locked Modes */}
      <h2 className="geo-section-heading">Future Expeditions (Locked)</h2>

      <div className="geo-card-list">
        <div className="geo-card-item locked">
          <div className="geo-card-icon">🏛️</div>
          <div className="geo-card-info">
            <h3 className="geo-card-title">Capital Quiz</h3>
            <p className="geo-card-subtitle">Match provinces to their capitals</p>
          </div>
          <div className="geo-lock-badge">🔒 Locked</div>
        </div>

        <div className="geo-card-item locked">
          <div className="geo-card-icon">🚩</div>
          <div className="geo-card-info">
            <h3 className="geo-card-title">Flag Guesser</h3>
            <p className="geo-card-subtitle">Identify regional & provincial flags</p>
          </div>
          <div className="geo-lock-badge">🔒 Locked</div>
        </div>

        <div className="geo-card-item locked">
          <div className="geo-card-icon">📍</div>
          <div className="geo-card-info">
            <h3 className="geo-card-title">Landmark Finder</h3>
            <p className="geo-card-subtitle">Locate historical landmarks</p>
          </div>
          <div className="geo-lock-badge">🔒 Locked</div>
        </div>

        <div className="geo-card-item locked">
          <div className="geo-card-icon">👥</div>
          <div className="geo-card-info">
            <h3 className="geo-card-title">Population Sorter</h3>
            <p className="geo-card-subtitle">Rank provinces by population</p>
          </div>
          <div className="geo-lock-badge">🔒 Locked</div>
        </div>
      </div>
    </div>
  );
}

export default function GeoHome() {
  return (
    <Routes>
      <Route path="/" element={<GeoDashboard />} />
      <Route path="quiz" element={<ProvinceQuiz />} />
      <Route path="explorer" element={<MapExplorer />} />
    </Routes>
  );
}
