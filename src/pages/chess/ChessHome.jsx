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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#1c7c54">
              <path d="M12 2a3 3 0 0 0-2.83 4H9a1 1 0 0 0 0 2h.34A5.96 5.96 0 0 0 8 13.5L7 17a1 1 0 0 0 0 2h10a1 1 0 0 0 0-2l-1-3.5a5.96 5.96 0 0 0-1.34-5.5H15a1 1 0 0 0 0-2h-.17A3 3 0 0 0 12 2zm-4 20h8v2H8v-2z"/>
            </svg>
            <h1 className="chess-page-title" style={{ margin: 0, color: '#1c7c54', fontSize: '1.8rem', fontWeight: 900 }}>Chess</h1>
          </div>
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
