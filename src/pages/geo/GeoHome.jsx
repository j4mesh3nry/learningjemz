import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ProvinceQuiz from './ProvinceQuiz';
import MapExplorer from './MapExplorer';
import { useGame } from '../../contexts/GameContext';
import { Target, Search, Landmark, ChevronRight, Lock, Flag, MapPin, Users, Globe, Compass } from 'lucide-react';
import './geo.css';

function GeoDashboard() {
  const navigate = useNavigate();
  const { xp, level, streak, provincesCorrect } = useGame();

  return (
    <div className="geo-module-container">
      <div className="geo-top-bar">
        <div className="geo-title-area">
          <button className="geo-back-btn" onClick={() => navigate('/')}>
            ←
          </button>
          <Compass size={32} color="#64748b" />
          <h1 className="geo-title">Geography Hub</h1>
        </div>
        
        <div className="geo-stats-panel">
          <div className="geo-stat-badge">
            <span className="geo-stat-icon">🔥</span>
            <span>{streak} Streak</span>
          </div>
          <div className="geo-stat-badge">
            <span className="geo-stat-icon">🎓</span>
            <span>Lv.{level}</span>
          </div>
          <div className="geo-stat-badge">
            <span className="geo-stat-icon">✨</span>
            <span>{xp} XP</span>
          </div>
        </div>
      </div>

      <h2 className="geo-section-title">Active Expeditions</h2>

      <div className="geo-grid">
        <div className="geo-card quiz" onClick={() => navigate('quiz')}>
          <div className="geo-card-header">
            <div className="geo-card-icon-wrapper">
              <Target size={28} />
            </div>
            <ChevronRight className="geo-card-action" size={24} />
          </div>
          <div className="geo-card-content">
            <h3 className="geo-card-title">Province Quiz</h3>
            <p className="geo-card-desc">Test your knowledge of the 81 provinces on a blank map.</p>
          </div>
          <div className="geo-card-footer">
            <span className="geo-card-meta">{provincesCorrect || 0}/81 Mastered</span>
          </div>
        </div>

        <div className="geo-card explore" onClick={() => navigate('explorer')}>
          <div className="geo-card-header">
            <div className="geo-card-icon-wrapper">
              <Search size={28} />
            </div>
            <ChevronRight className="geo-card-action" size={24} />
          </div>
          <div className="geo-card-content">
            <h3 className="geo-card-title">Map Explorer</h3>
            <p className="geo-card-desc">Freely explore regions, capitals, and detailed geographical data.</p>
          </div>
          <div className="geo-card-footer">
            <span className="geo-card-meta">Free Roam Mode</span>
          </div>
        </div>
      </div>

      <h2 className="geo-section-title">Uncharted Territory (Locked)</h2>

      <div className="geo-grid">
        <div className="geo-card locked">
          <div className="geo-card-header">
            <div className="geo-card-icon-wrapper">
              <Landmark size={28} />
            </div>
            <Lock className="geo-lock-icon" size={20} />
          </div>
          <div className="geo-card-content">
            <h3 className="geo-card-title">Capital Quiz</h3>
            <p className="geo-card-desc">Match provinces to their capitals in a race against time.</p>
          </div>
        </div>

        <div className="geo-card locked">
          <div className="geo-card-header">
            <div className="geo-card-icon-wrapper">
              <Flag size={28} />
            </div>
            <Lock className="geo-lock-icon" size={20} />
          </div>
          <div className="geo-card-content">
            <h3 className="geo-card-title">Flag Guesser</h3>
            <p className="geo-card-desc">Identify regional and provincial flags accurately.</p>
          </div>
        </div>

        <div className="geo-card locked">
          <div className="geo-card-header">
            <div className="geo-card-icon-wrapper">
              <MapPin size={28} />
            </div>
            <Lock className="geo-lock-icon" size={20} />
          </div>
          <div className="geo-card-content">
            <h3 className="geo-card-title">Landmark Finder</h3>
            <p className="geo-card-desc">Pinpoint famous historical landmarks on the map.</p>
          </div>
        </div>

        <div className="geo-card locked">
          <div className="geo-card-header">
            <div className="geo-card-icon-wrapper">
              <Users size={28} />
            </div>
            <Lock className="geo-lock-icon" size={20} />
          </div>
          <div className="geo-card-content">
            <h3 className="geo-card-title">Population Sorter</h3>
            <p className="geo-card-desc">Rank provinces by population density and demographics.</p>
          </div>
        </div>

        <div className="geo-card locked">
          <div className="geo-card-header">
            <div className="geo-card-icon-wrapper">
              <Target size={28} />
            </div>
            <Lock className="geo-lock-icon" size={20} />
          </div>
          <div className="geo-card-content">
            <h3 className="geo-card-title">Geo Daily Challenge</h3>
            <p className="geo-card-desc">A unique geography puzzle that refreshes every 24 hours.</p>
          </div>
        </div>

        <div className="geo-card locked">
          <div className="geo-card-header">
            <div className="geo-card-icon-wrapper">
              <Globe size={28} />
            </div>
            <Lock className="geo-lock-icon" size={20} />
          </div>
          <div className="geo-card-content">
            <h3 className="geo-card-title">Continent Mastery</h3>
            <p className="geo-card-desc">Expand your knowledge beyond local borders to the world stage.</p>
          </div>
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
