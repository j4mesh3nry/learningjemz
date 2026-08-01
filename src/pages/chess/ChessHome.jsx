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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              fontSize: '1.1rem', width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #0e4d2e 0%, #1c7c54 100%)', borderRadius: 8,
              boxShadow: '0 2px 6px rgba(28,124,84,0.3)'
            }}>
              ♟️
            </div>
            <h1 className="chess-page-title" style={{ margin: 0, color: '#1c7c54', fontSize: '1.4rem', fontWeight: 900 }}>Chess</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: '#fff5f5', padding: '2px 8px', borderRadius: 12,
            border: '1px solid #ffcdd2',
          }}>
            <span style={{ fontSize: '0.75rem' }}>🔥</span>
            <span style={{ fontWeight: 800, fontSize: '0.7rem', color: '#e53935' }}>{streak}</span>
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
