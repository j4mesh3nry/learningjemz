import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProvinceQuiz from './ProvinceQuiz';
import MapExplorer from './MapExplorer';
import { useGame } from '../../contexts/GameContext';
import './geo.css';

function GeoDashboard() {
  const navigate = useNavigate();
  const { xp, level, streak, provincesCorrect } = useGame();

  return (
    <div className="geo-module-page">
      {/* Navigation Header */}
      <div className="geo-nav-header">
        <div className="geo-header-left">
          <button className="geo-back-btn" onClick={() => navigate('/')} title="Back to Home">
            ←
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#0066cc">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <h1 className="geo-page-title" style={{ margin: 0, color: '#0066cc', fontSize: '1.8rem', fontWeight: 900 }}>Geography</h1>
          </div>
        </div>

        <div className="geo-badges">
          <div className="geo-badge streak">
            <span>🔥</span>
            <span>{streak}</span>
          </div>
          <div className="geo-badge level">
            <span>⭐</span>
            <span>Lv.{level}</span>
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
