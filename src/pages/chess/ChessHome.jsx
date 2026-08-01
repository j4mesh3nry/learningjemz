import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import ChessPlay from './ChessPlay';
import ChessPuzzles from './ChessPuzzles';
import ChessLessons from './ChessLessons';
import './chess.css';

function ChessMenu() {
  const navigate = useNavigate();
  const { xp, level, streak, puzzlesSolved } = useGame();

  return (
    <div className="chess-module-page">
      {/* Navigation Header */}
      <div className="chess-nav-header">
        <div className="chess-header-left">
          <button className="chess-back-btn" onClick={() => navigate('/')} title="Back to Home">
            ←
          </button>
          <h1 className="chess-page-title">♟️ Chess</h1>
        </div>

        <div className="chess-badges">
          <div className="chess-badge streak">
            <span>🔥</span>
            <span>{streak}</span>
          </div>
          <div className="chess-badge level">
            <span>⭐</span>
            <span>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* Active Modes */}
      <h2 className="chess-section-heading">Training Modes</h2>

      <div className="chess-card-list">
        <div className="chess-card-item" onClick={() => navigate('play')}>
          <div className="chess-card-icon">🤖</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Play with Bot</h3>
            <p className="chess-card-subtitle">Practice against smart AI opponents</p>
          </div>
          <div className="chess-card-arrow">→</div>
        </div>

        <div className="chess-card-item" onClick={() => navigate('puzzles')}>
          <div className="chess-card-icon">🧩</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Tactics Puzzles</h3>
            <p className="chess-card-subtitle">{puzzlesSolved || 0} puzzles completed</p>
          </div>
          <div className="chess-card-arrow">→</div>
        </div>

        <div className="chess-card-item" onClick={() => navigate('lessons')}>
          <div className="chess-card-icon">🎓</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Mastery Lessons</h3>
            <p className="chess-card-subtitle">Learn fundamentals & strategies</p>
          </div>
          <div className="chess-card-arrow">→</div>
        </div>
      </div>

      {/* Locked Modes */}
      <h2 className="chess-section-heading">Future Modes (Locked)</h2>

      <div className="chess-card-list">
        <div className="chess-card-item locked">
          <div className="chess-card-icon">🏆</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Grandmaster Tournaments</h3>
            <p className="chess-card-subtitle">Compete in seasonal events</p>
          </div>
          <div className="chess-lock-badge">🔒 Locked</div>
        </div>

        <div className="chess-card-item locked">
          <div className="chess-card-icon">⚡</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Endgame Practice</h3>
            <p className="chess-card-subtitle">Master checkmates & draws</p>
          </div>
          <div className="chess-lock-badge">🔒 Locked</div>
        </div>

        <div className="chess-card-item locked">
          <div className="chess-card-icon">📖</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Opening Explorer</h3>
            <p className="chess-card-subtitle">Study popular chess openings</p>
          </div>
          <div className="chess-lock-badge">🔒 Locked</div>
        </div>

        <div className="chess-card-item locked">
          <div className="chess-card-icon">🎯</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Daily Challenge</h3>
            <p className="chess-card-subtitle">Unique high-level daily puzzle</p>
          </div>
          <div className="chess-lock-badge">🔒 Locked</div>
        </div>
      </div>
    </div>
  );
}

export default function ChessHome() {
  return (
    <Routes>
      <Route path="/" element={<ChessMenu />} />
      <Route path="play" element={<ChessPlay />} />
      <Route path="puzzles" element={<ChessPuzzles />} />
      <Route path="lessons" element={<ChessLessons />} />
    </Routes>
  );
}
