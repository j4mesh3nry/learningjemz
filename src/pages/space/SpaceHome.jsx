import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext.jsx';
import Flashcards from './Flashcards.jsx';
import SpaceQuiz from './SpaceQuiz.jsx';
import SolarSystem from './SolarSystem.jsx';
import './space.css';
import { BookOpen, HelpCircle, Compass, ChevronRight, Lock, Map, Search, Orbit, Aperture } from 'lucide-react';

const SpaceHub = () => {
  const navigate = useNavigate();
  const { xp, level, streak, flashcardsMastered, quizHighScore } = useGame();

  return (
    <div className="space-module-container">
      {/* Starfield overlay background */}
      <div className="starfield">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`
          }}></div>
        ))}
      </div>

      <div className="space-top-bar">
        <div className="space-title-area">
          <button className="space-back-btn" onClick={() => navigate('/')}>
            ←
          </button>
          <Aperture size={32} color="#94a3b8" />
          <h1 className="space-title">Space Explorer</h1>
        </div>
        
        <div className="space-stats-panel">
          <div className="space-stat-badge">
            <span className="space-stat-icon">🔥</span>
            <span>{streak} Streak</span>
          </div>
          <div className="space-stat-badge">
            <span className="space-stat-icon">🎓</span>
            <span>Lv.{level}</span>
          </div>
          <div className="space-stat-badge">
            <span className="space-stat-icon">✨</span>
            <span>{xp} XP</span>
          </div>
        </div>
      </div>

      <h2 className="space-section-title">Cosmic Missions</h2>

      <div className="space-grid">
        <div className="space-card cards" onClick={() => navigate('/space/flashcards')}>
          <div className="space-card-header">
            <div className="space-card-icon-wrapper">
              <BookOpen size={28} />
            </div>
            <ChevronRight className="space-card-action" size={24} />
          </div>
          <div className="space-card-content">
            <h3 className="space-card-title">Cosmic Cards</h3>
            <p className="space-card-desc">Master universal facts through spaced repetition flashcards.</p>
          </div>
          <div className="space-card-footer">
            <span className="space-card-meta">{flashcardsMastered || 0} Mastered</span>
          </div>
        </div>

        <div className="space-card quiz" onClick={() => navigate('/space/quiz')}>
          <div className="space-card-header">
            <div className="space-card-icon-wrapper">
              <HelpCircle size={28} />
            </div>
            <ChevronRight className="space-card-action" size={24} />
          </div>
          <div className="space-card-content">
            <h3 className="space-card-title">Space Quiz</h3>
            <p className="space-card-desc">Test your knowledge of the cosmos in a timed challenge.</p>
          </div>
          <div className="space-card-footer">
            <span className="space-card-meta">High Score: {quizHighScore || 0}%</span>
          </div>
        </div>

        <div className="space-card explore" onClick={() => navigate('/space/solar-system')}>
          <div className="space-card-header">
            <div className="space-card-icon-wrapper">
              <Orbit size={28} />
            </div>
            <ChevronRight className="space-card-action" size={24} />
          </div>
          <div className="space-card-content">
            <h3 className="space-card-title">Solar Explorer</h3>
            <p className="space-card-desc">Navigate an interactive map of our solar system and its planets.</p>
          </div>
          <div className="space-card-footer">
            <span className="space-card-meta">Interactive Map</span>
          </div>
        </div>
      </div>

      <h2 className="space-section-title">Deep Space (Locked)</h2>

      <div className="space-grid">
        <div className="space-card locked">
          <div className="space-card-header">
            <div className="space-card-icon-wrapper">
              <Map size={28} />
            </div>
            <Lock className="space-lock-icon" size={20} />
          </div>
          <div className="space-card-content">
            <h3 className="space-card-title">Constellation Guide</h3>
            <p className="space-card-desc">Learn to identify star patterns in the night sky.</p>
          </div>
        </div>

        <div className="space-card locked">
          <div className="space-card-header">
            <div className="space-card-icon-wrapper">
              <Search size={28} />
            </div>
            <Lock className="space-lock-icon" size={20} />
          </div>
          <div className="space-card-content">
            <h3 className="space-card-title">Telescope View</h3>
            <p className="space-card-desc">Zoom in on high-resolution images of distant galaxies.</p>
          </div>
        </div>

        <div className="space-card locked">
          <div className="space-card-header">
            <div className="space-card-icon-wrapper">
              <Compass size={28} />
            </div>
            <Lock className="space-lock-icon" size={20} />
          </div>
          <div className="space-card-content">
            <h3 className="space-card-title">Galaxy Mapper</h3>
            <p className="space-card-desc">Explore the structure of the Milky Way and our neighboring galaxies.</p>
          </div>
        </div>

        <div className="space-card locked">
          <div className="space-card-header">
            <div className="space-card-icon-wrapper">
              <Orbit size={28} />
            </div>
            <Lock className="space-lock-icon" size={20} />
          </div>
          <div className="space-card-content">
            <h3 className="space-card-title">Mars Rover Sim</h3>
            <p className="space-card-desc">Drive a virtual rover across the Martian surface.</p>
          </div>
        </div>
        
        <div className="space-card locked">
          <div className="space-card-header">
            <div className="space-card-icon-wrapper">
              <Aperture size={28} />
            </div>
            <Lock className="space-lock-icon" size={20} />
          </div>
          <div className="space-card-content">
            <h3 className="space-card-title">Black Hole Explorer</h3>
            <p className="space-card-desc">Simulate the extreme physics near an event horizon.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
