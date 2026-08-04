// src/pages/space/SpaceHome.tsx
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import Flashcards from './Flashcards';
import SpaceQuiz from './SpaceQuiz';
import SolarSystem from './SolarSystem';
import { Card } from '../../components/Card';
import './space.css';

function SpaceHub() {
  const navigate = useNavigate();
  const { level, streak, flashcardsMastered, quizHighScore, hasPlayedToday } = useGame();

  return (
    <div className="space-module-page">
      {/* Navigation Header */}
      <div className="space-nav-header">
        <div className="space-header-left">
          <button className="space-back-btn" onClick={() => navigate('/')} title="Back to Home">
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
            <h1 className="space-page-title" style={{ margin: 0, color: '#111324', fontSize: '1.4rem', fontWeight: 900 }}>
              Space
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: '#fff5f5', padding: '2px 8px', borderRadius: 12,
            border: '1px solid #ffcdd2',
          }}>
            <span className={!hasPlayedToday ? "unlit-icon" : ""} style={{ fontSize: '0.75rem' }}>🔥</span>
            <span className={!hasPlayedToday ? "unlit-text" : ""} style={{ fontWeight: 800, fontSize: '0.7rem', color: '#e53935' }}>
              {streak}
            </span>
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
      <h2 className="space-section-heading">Cosmic Missions</h2>

      <div className="space-card-list">
        <Card
          className="space-card-item"
          onClick={() => navigate('/space/flashcards')}
          ariaLabel="Cosmic Cards"
        >
          <div className="space-card-icon">🎴</div>
          <div className="space-card-info">
            <h3 className="space-card-title">Cosmic Cards</h3>
            <p className="space-card-subtitle">{flashcardsMastered || 0} cards mastered</p>
          </div>
          <div className="space-card-arrow">→</div>
        </Card>

        <Card
          className="space-card-item"
          onClick={() => navigate('/space/quiz')}
          ariaLabel="Space Quiz"
        >
          <div className="space-card-icon">❓</div>
          <div className="space-card-info">
            <h3 className="space-card-title">Space Quiz</h3>
            <p className="space-card-subtitle">High Score: {quizHighScore || 0}%</p>
          </div>
          <div className="space-card-arrow">→</div>
        </Card>

        <Card
          className="space-card-item"
          onClick={() => navigate('/space/solar-system')}
          ariaLabel="Solar Explorer"
        >
          <div className="space-card-icon">🪐</div>
          <div className="space-card-info">
            <h3 className="space-card-title">Solar Explorer</h3>
            <p className="space-card-subtitle">Interactive solar system map</p>
          </div>
          <div className="space-card-arrow">→</div>
        </Card>
      </div>

      {/* Locked Modes */}
      <h2 className="space-section-heading">Deep Space (Locked)</h2>

      <div className="space-card-list">
        <Card className="space-card-item locked" ariaLabel="Constellation Guide (Locked)" onClick={() => {}}>
          <div className="space-card-icon">🌌</div>
          <div className="space-card-info">
            <h3 className="space-card-title">Constellation Guide</h3>
            <p className="space-card-subtitle">Identify star patterns</p>
          </div>
          <div className="space-lock-badge">🔒 Locked</div>
        </Card>
        <Card className="space-card-item locked" ariaLabel="Telescope View (Locked)" onClick={() => {}}>
          <div className="space-card-icon">🔭</div>
          <div className="space-card-info">
            <h3 className="space-card-title">Telescope View</h3>
            <p className="space-card-subtitle">Distant galaxy imagery</p>
          </div>
          <div className="space-lock-badge">🔒 Locked</div>
        </Card>
        <Card className="space-card-item locked" ariaLabel="Galaxy Mapper (Locked)" onClick={() => {}}>
          <div className="space-card-icon">🗺️</div>
          <div className="space-card-info">
            <h3 className="space-card-title">Galaxy Mapper</h3>
            <p className="space-card-subtitle">Milky Way structure map</p>
          </div>
          <div className="space-lock-badge">🔒 Locked</div>
        </Card>
        <Card className="space-card-item locked" ariaLabel="Mars Rover Sim (Locked)" onClick={() => {}}>
          <div className="space-card-icon">🚀</div>
          <div className="space-card-info">
            <h3 className="space-card-title">Mars Rover Sim</h3>
            <p className="space-card-subtitle">Drive virtual rovers</p>
          </div>
          <div className="space-lock-badge">🔒 Locked</div>
        </Card>
      </div>
    </div>
  );
}

export default function SpaceHome() {
  return (
    <Routes>
      <Route path="/" element={<SpaceHub />} />
      <Route path="flashcards" element={<Flashcards />} />
      <Route path="quiz" element={<SpaceQuiz />} />
      <Route path="solar-system" element={<SolarSystem />} />
    </Routes>
  );
}
