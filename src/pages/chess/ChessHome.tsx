// src/pages/chess/ChessHome.tsx
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import ChessPlay from './ChessPlay';
import { Flame, Star } from 'lucide-react';
import { Card } from '../../components/Card';
import './chess.css';

function ChessMenu() {
  const navigate = useNavigate();
  const { level, streak, puzzlesSolved, hasPlayedToday } = useGame();

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
            <h1 className="chess-page-title" style={{ margin: 0, color: '#1c7c54', fontSize: '1.4rem', fontWeight: 900 }}>
              Chess
            </h1>
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 3,
          background: '#fafafa', padding: '5px 9px', borderRadius: 12,
          border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          minWidth: 76, boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <Flame 
              size={13} 
              color={hasPlayedToday ? '#ff4d4d' : '#888888'} 
              fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} 
            />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: hasPlayedToday ? '#e53935' : '#444444' }}>{streak ?? 0}</span>
          </div>
          <div style={{ height: 1, background: '#eee', margin: '1px 0' }} />
          <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, cursor: 'pointer' }}>
            <Star size={13} color="#f57f17" fill="#ffb300" />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#f57f17' }}>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* Active Modes */}
      <h2 className="chess-section-heading">Training Modes</h2>

      <div className="chess-card-list">
        <Card className="chess-card-item" onClick={() => navigate('play')} ariaLabel="Play with Bot">
          <div className="chess-card-icon">🤖</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Play with Bot</h3>
            <p className="chess-card-subtitle">Practice against smart AI opponents</p>
          </div>
          <div className="chess-card-arrow">→</div>
        </Card>
      </div>

      {/* Locked Modes */}
      <h2 className="chess-section-heading">Future Modes (Locked)</h2>

      <div className="chess-card-list">
        <Card className="chess-card-item locked" ariaLabel="Tactics Puzzles (Locked)" onClick={() => {}}>
          <div className="chess-card-icon">🧩</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Tactics Puzzles</h3>
            <p className="chess-card-subtitle">{puzzlesSolved || 0} puzzles completed</p>
          </div>
          <div className="chess-lock-badge">🔒 Locked</div>
        </Card>
        <Card className="chess-card-item locked" ariaLabel="Mastery Lessons (Locked)" onClick={() => {}}>
          <div className="chess-card-icon">🎓</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Mastery Lessons</h3>
            <p className="chess-card-subtitle">Learn fundamentals & strategies</p>
          </div>
          <div className="chess-lock-badge">🔒 Locked</div>
        </Card>
        <Card className="chess-card-item locked" ariaLabel="Grandmaster Tournaments (Locked)" onClick={() => {}}>
          <div className="chess-card-icon">🏆</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Grandmaster Tournaments</h3>
            <p className="chess-card-subtitle">Compete in seasonal events</p>
          </div>
          <div className="chess-lock-badge">🔒 Locked</div>
        </Card>
        <Card className="chess-card-item locked" ariaLabel="Endgame Practice (Locked)" onClick={() => {}}>
          <div className="chess-card-icon">⚡</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Endgame Practice</h3>
            <p className="chess-card-subtitle">Master checkmates & draws</p>
          </div>
          <div className="chess-lock-badge">🔒 Locked</div>
        </Card>
        <Card className="chess-card-item locked" ariaLabel="Opening Explorer (Locked)" onClick={() => {}}>
          <div className="chess-card-icon">📖</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Opening Explorer</h3>
            <p className="chess-card-subtitle">Study popular chess openings</p>
          </div>
          <div className="chess-lock-badge">🔒 Locked</div>
        </Card>
        <Card className="chess-card-item locked" ariaLabel="Daily Challenge (Locked)" onClick={() => {}}>
          <div className="chess-card-icon">🎯</div>
          <div className="chess-card-info">
            <h3 className="chess-card-title">Daily Challenge</h3>
            <p className="chess-card-subtitle">Unique high-level daily puzzle</p>
          </div>
          <div className="chess-lock-badge">🔒 Locked</div>
        </Card>
      </div>
    </div>
  );
}

export default function ChessHome() {
  return (
    <Routes>
      <Route path="/" element={<ChessMenu />} />
      <Route path="play" element={<ChessPlay />} />
    </Routes>
  );
}
