import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Target, Gamepad2, GraduationCap, Crown, ChevronRight, Lock, Trophy, FastForward, BookOpen, Clock, EyeOff } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import ChessPlay from './ChessPlay';
import ChessPuzzles from './ChessPuzzles';
import ChessLessons from './ChessLessons';
import './chess.css';

function ChessMenu() {
  const navigate = useNavigate();
  const { xp, level, streak, puzzlesSolved } = useGame();
  
  const handleMouseMove = (e) => {
    const cards = document.querySelectorAll('.chess-card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  };
  
  return (
    <div className="chess-module-container" onMouseMove={handleMouseMove}>
      <div className="chess-top-bar">
        <div className="chess-title-area">
          <button className="chess-back-btn" onClick={() => navigate('/')}>
            ←
          </button>
          <Crown size={32} color="#8c9b8c" />
          <h1 className="chess-title">Chess Mastery</h1>
        </div>
        
        <div className="chess-stats-panel">
          <div className="chess-stat-badge">
            <span className="chess-stat-icon">🔥</span>
            <span>{streak} Streak</span>
          </div>
          <div className="chess-stat-badge">
            <span className="chess-stat-icon">🎓</span>
            <span>Lv.{level}</span>
          </div>
          <div className="chess-stat-badge">
            <span className="chess-stat-icon">✨</span>
            <span>{xp} XP</span>
          </div>
        </div>
      </div>

      <h2 className="chess-section-title">Active Training Regimen</h2>

      <div className="chess-grid">
        {/* Play Button */}
        <div className="chess-card play" onClick={() => navigate('play')}>
          <div className="chess-card-header">
            <div className="chess-card-icon-wrapper">
              <Gamepad2 size={28} />
            </div>
            <ChevronRight className="chess-card-action" size={24} />
          </div>
          <div className="chess-card-content">
            <h3 className="chess-card-title">Play with Bot</h3>
            <p className="chess-card-desc">Hone your skills against our advanced AI engines.</p>
          </div>
          <div className="chess-card-footer">
            <span className="chess-card-meta">Standard & Blitz modes</span>
          </div>
        </div>

        {/* Puzzles Button */}
        <div className="chess-card tactics" onClick={() => navigate('puzzles')}>
          <div className="chess-card-header">
            <div className="chess-card-icon-wrapper">
              <Target size={28} />
            </div>
            <ChevronRight className="chess-card-action" size={24} />
          </div>
          <div className="chess-card-content">
            <h3 className="chess-card-title">Tactics Puzzles</h3>
            <p className="chess-card-desc">Improve your pattern recognition and tactical vision.</p>
          </div>
          <div className="chess-card-footer">
            <span className="chess-card-meta">{puzzlesSolved || 0} Puzzles Solved</span>
          </div>
        </div>

        {/* Lessons Button */}
        <div className="chess-card lessons" onClick={() => navigate('lessons')}>
          <div className="chess-card-header">
            <div className="chess-card-icon-wrapper">
              <GraduationCap size={28} />
            </div>
            <ChevronRight className="chess-card-action" size={24} />
          </div>
          <div className="chess-card-content">
            <h3 className="chess-card-title">Mastery Lessons</h3>
            <p className="chess-card-desc">Learn from curated courses spanning openings to endgames.</p>
          </div>
          <div className="chess-card-footer">
            <span className="chess-card-meta">12 Modules Available</span>
          </div>
        </div>
      </div>

      <h2 className="chess-section-title">Advanced Regimen (Locked)</h2>

      <div className="chess-grid">
        <div className="chess-card locked">
          <div className="chess-card-header">
            <div className="chess-card-icon-wrapper">
              <Trophy size={28} />
            </div>
            <Lock className="chess-lock-icon" size={20} />
          </div>
          <div className="chess-card-content">
            <h3 className="chess-card-title">Grandmaster Tournaments</h3>
            <p className="chess-card-desc">Compete in high-stakes seasonal events for legendary rewards.</p>
          </div>
        </div>

        <div className="chess-card locked">
          <div className="chess-card-header">
            <div className="chess-card-icon-wrapper">
              <FastForward size={28} />
            </div>
            <Lock className="chess-lock-icon" size={20} />
          </div>
          <div className="chess-card-content">
            <h3 className="chess-card-title">Endgame Practice</h3>
            <p className="chess-card-desc">Master complex endgame scenarios and theoretical draws.</p>
          </div>
        </div>

        <div className="chess-card locked">
          <div className="chess-card-header">
            <div className="chess-card-icon-wrapper">
              <BookOpen size={28} />
            </div>
            <Lock className="chess-lock-icon" size={20} />
          </div>
          <div className="chess-card-content">
            <h3 className="chess-card-title">Opening Explorer</h3>
            <p className="chess-card-desc">Deep dive into millions of master games and theoretical lines.</p>
          </div>
        </div>
        
        <div className="chess-card locked">
          <div className="chess-card-header">
            <div className="chess-card-icon-wrapper">
              <Clock size={28} />
            </div>
            <Lock className="chess-lock-icon" size={20} />
          </div>
          <div className="chess-card-content">
            <h3 className="chess-card-title">Daily Challenge</h3>
            <p className="chess-card-desc">A unique, high-difficulty puzzle every single day.</p>
          </div>
        </div>

        <div className="chess-card locked">
          <div className="chess-card-header">
            <div className="chess-card-icon-wrapper">
              <EyeOff size={28} />
            </div>
            <Lock className="chess-lock-icon" size={20} />
          </div>
          <div className="chess-card-content">
            <h3 className="chess-card-title">Blindfold Chess</h3>
            <p className="chess-card-desc">Test your absolute limits by playing without seeing the pieces.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChessHome() {
  const location = useLocation();
  const isMenu = location.pathname === '/chess' || location.pathname === '/chess/';

  return (
    <Routes>
      <Route path="/" element={<ChessMenu />} />
      <Route path="play" element={<ChessPlay />} />
      <Route path="puzzles" element={<ChessPuzzles />} />
      <Route path="lessons" element={<ChessLessons />} />
    </Routes>
  );
}
