import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import ProvinceQuiz from './ProvinceQuiz';
import MapExplorer from './MapExplorer';
import { Map, MapPin, Trophy } from 'lucide-react';
import './geo.css';

function GeoDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ mastered: 0, accuracy: 0, streak: 0 });

  useEffect(() => {
    const savedStats = localStorage.getItem('learningjemz-geo-stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  return (
    <div className="geo-home animate-fade-in">
      <header className="geo-header" style={{ position: 'relative' }}>
        <button onClick={() => navigate('/')} style={{ position: 'absolute', left: '1rem', top: '1.5rem', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>←</button>
        <h1>🌍 Geography Hub</h1>
        <p>Explore the 81 provinces of the Philippines!</p>
      </header>

      <div className="geo-stats-panel">
        <div className="stat-box">
          <Trophy size={24} color="#f1c40f" />
          <div className="stat-text">
            <span>{stats.mastered}/81</span>
            <small>Provinces Mastered</small>
          </div>
        </div>
        <div className="stat-box">
          <MapPin size={24} color="#e74c3c" />
          <div className="stat-text">
            <span>{stats.accuracy}%</span>
            <small>Accuracy</small>
          </div>
        </div>
      </div>

      <div className="geo-cards">
        <div className="geo-card quiz-card" onClick={() => navigate('quiz')}>
          <div className="card-icon">🎯</div>
          <h2>Province Quiz</h2>
          <p>Test your knowledge of the 81 provinces!</p>
          <button className="geo-btn">Play Now</button>
        </div>

        <div className="geo-card explorer-card" onClick={() => navigate('explorer')}>
          <div className="card-icon">🔍</div>
          <h2>Map Explorer</h2>
          <p>Free roam the map and learn fun facts.</p>
          <button className="geo-btn">Explore</button>
        </div>
        
        <div className="geo-card disabled-card">
          <div className="card-icon">🏛️</div>
          <h2>Capital Quiz</h2>
          <p>Coming Soon</p>
          <button className="geo-btn" disabled>Locked</button>
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
