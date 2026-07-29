import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext.jsx';
import Flashcards from './Flashcards.jsx';
import SpaceQuiz from './SpaceQuiz.jsx';
import SolarSystem from './SolarSystem.jsx';
import './space.css';
import { BookOpen, HelpCircle, Compass, Award } from 'lucide-react';

const SpaceHub = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    cardsMastered: 0,
    quizHighScore: 0,
    planetsExplored: 0
  });

  useEffect(() => {
    const savedStats = localStorage.getItem('learningjemz-space-stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  return (
    <div className="space-module">
      <div className="starfield">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`
          }}></div>
        ))}
      </div>
      
      <div className="space-header">
        <h1>🪐 Space Explorer</h1>
        <p>Discover the wonders of the cosmos</p>
      </div>

      <div className="space-stats">
        <div className="stat-card">
          <Award size={24} className="stat-icon text-gold" />
          <div className="stat-info">
            <span className="stat-value">{stats.cardsMastered}</span>
            <span className="stat-label">Cards Mastered</span>
          </div>
        </div>
        <div className="stat-card">
          <Award size={24} className="stat-icon text-gold" />
          <div className="stat-info">
            <span className="stat-value">{stats.quizHighScore}</span>
            <span className="stat-label">Quiz High Score</span>
          </div>
        </div>
        <div className="stat-card">
          <Award size={24} className="stat-icon text-gold" />
          <div className="stat-info">
            <span className="stat-value">{stats.planetsExplored}</span>
            <span className="stat-label">Planets Explored</span>
          </div>
        </div>
      </div>

      <div className="space-modes">
        <div className="mode-card" onClick={() => navigate('/space/flashcards')}>
          <div className="mode-icon-wrapper">
            <BookOpen size={32} />
          </div>
          <div className="mode-content">
            <h2>Cosmic Cards</h2>
            <p>Master facts about planets, moons, and stars.</p>
          </div>
        </div>

        <div className="mode-card" onClick={() => navigate('/space/quiz')}>
          <div className="mode-icon-wrapper">
            <HelpCircle size={32} />
          </div>
          <div className="mode-content">
            <h2>Space Quiz</h2>
            <p>Test your knowledge of the solar system.</p>
          </div>
        </div>

        <div className="mode-card" onClick={() => navigate('/space/solar-system')}>
          <div className="mode-icon-wrapper">
            <Compass size={32} />
          </div>
          <div className="mode-content">
            <h2>Solar Explorer</h2>
            <p>Interactive 2D map of our solar neighborhood.</p>
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
