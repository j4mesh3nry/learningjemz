import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import ChessPlay from './ChessPlay';
import { Flame, Star, BookOpen, Gamepad2 } from 'lucide-react';
import { Card } from '../../components/Card';
import './chess.css';

function ChessMenu() {
  const navigate = useNavigate();
  const { level, streak, puzzlesSolved, hasPlayedToday } = useGame();
  const [tab, setTab] = useState<'learn' | 'play'>('play');

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
          background: '#ffffff', padding: '5px 9px', borderRadius: 12,
          border: '2px solid #b0cbaf', boxShadow: '0 2px 0 #b0cbaf',
          minWidth: 76, boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <Flame 
              size={13} 
              color={hasPlayedToday ? '#ff4d4d' : '#888888'} 
              fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} 
            />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: hasPlayedToday ? '#e53935' : '#4e7361' }}>{streak ?? 0}</span>
          </div>
          <div style={{ height: 1, background: '#b0cbaf', margin: '1px 0' }} />
          <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, cursor: 'pointer' }}>
            <Star size={13} color="#f57f17" fill="#ffb300" />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#d97706' }}>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* Mode Selector: Play vs Learn */}
      <div style={{
        display: 'flex',
        background: '#ffffff',
        padding: '4px',
        borderRadius: 14,
        border: '2px solid #b0cbaf',
        boxShadow: '0 3px 0 #b0cbaf',
        marginBottom: 20
      }}>
        <button
          onClick={() => setTab('play')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'play' ? '#16653e' : 'transparent',
            color: tab === 'play' ? '#ffffff' : '#4e7361',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Gamepad2 size={16} color={tab === 'play' ? '#ffffff' : '#4e7361'} />
          Play
        </button>
        <button
          onClick={() => setTab('learn')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'learn' ? '#16653e' : 'transparent',
            color: tab === 'learn' ? '#ffffff' : '#4e7361',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <BookOpen size={16} color={tab === 'learn' ? '#ffffff' : '#4e7361'} />
          Learn
        </button>
      </div>

      {tab === 'learn' ? (
        <>
          <div className="chess-card-list">
            <Card className="chess-card-item locked" ariaLabel="Mystery Module (Locked)" onClick={() => {}}>
              <div className="chess-card-icon">❓</div>
              <div className="chess-card-info">
                <h3 className="chess-card-title">Mystery Module</h3>
                <p className="chess-card-subtitle">Coming Soon...</p>
              </div>
              <div className="chess-lock-badge">🔒 Locked</div>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Active Play & Earn Modes */}
          <h2 className="chess-section-heading">Earn XP & Streaks</h2>
          <div className="chess-card-list">
            <Card className="chess-card-item" onClick={() => navigate('play')} ariaLabel="Play with Bot">
              <div className="chess-card-icon">🤖</div>
              <div className="chess-card-info">
                <h3 className="chess-card-title">Play with Bot</h3>
                <p className="chess-card-subtitle">Practice against AI bots & earn XP</p>
              </div>
              <div className="chess-card-arrow">→</div>
            </Card>
            {/* Locked Play Modes merged into same list */}
            <Card className="chess-card-item locked" ariaLabel="Upcoming Challenge (Locked)" onClick={() => {}}>
              <div className="chess-card-icon">❓</div>
              <div className="chess-card-info">
                <h3 className="chess-card-title">Upcoming Challenge</h3>
                <p className="chess-card-subtitle">Coming Soon...</p>
              </div>
              <div className="chess-lock-badge">🔒 Locked</div>
            </Card>
            <Card className="chess-card-item locked" ariaLabel="Mystery Mode (Locked)" onClick={() => {}}>
              <div className="chess-card-icon">❓</div>
              <div className="chess-card-info">
                <h3 className="chess-card-title">Mystery Mode</h3>
                <p className="chess-card-subtitle">Coming Soon...</p>
              </div>
              <div className="chess-lock-badge">🔒 Locked</div>
            </Card>
          </div>
        </>
      )}
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
