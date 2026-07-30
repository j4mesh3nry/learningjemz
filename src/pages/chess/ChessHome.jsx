import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Target, Gamepad2, GraduationCap, Crown, ChevronRight } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import ChessPlay from './ChessPlay';
import ChessPuzzles from './ChessPuzzles';
import ChessLessons from './ChessLessons';
import './chess.css';

function ChessMenu() {
  const navigate = useNavigate();
  const { xp, level, streak, puzzlesSolved } = useGame();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem', paddingBottom: '2rem' }}>
      {/* Stats Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-around',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem' }}>🔥</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{streak}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Streak</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem' }}>🎓</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Lv.{level}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Level</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem' }}>✨</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{xp}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>XP</div>
        </div>
      </div>

      <h2 style={{ color: '#fff', margin: '0.5rem 0 0 0', fontSize: '1.2rem', fontWeight: 600 }}>Training Regimen</h2>

      {/* Play Button */}
      <div 
        onClick={() => navigate('play')}
        style={{
          background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 10px 20px rgba(76, 175, 80, 0.3)',
          transition: 'transform 0.2s',
          color: '#fff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
            <Gamepad2 size={32} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Play with Bot</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Hone your skills against AI</div>
          </div>
        </div>
        <ChevronRight size={28} />
      </div>

      {/* Puzzles Button */}
      <div 
        onClick={() => navigate('puzzles')}
        style={{
          background: 'linear-gradient(135deg, #ff9800, #ef6c00)',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 10px 20px rgba(255, 152, 0, 0.3)',
          transition: 'transform 0.2s',
          color: '#fff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
            <Target size={32} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Tactics Puzzles</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{puzzlesSolved} completed</div>
          </div>
        </div>
        <ChevronRight size={28} />
      </div>

      {/* Lessons Button */}
      <div 
        onClick={() => navigate('lessons')}
        style={{
          background: 'linear-gradient(135deg, #2196f3, #1565c0)',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 10px 20px rgba(33, 150, 243, 0.3)',
          transition: 'transform 0.2s',
          color: '#fff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
            <GraduationCap size={32} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Mastery Lessons</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Coming Soon</div>
          </div>
        </div>
        <ChevronRight size={28} />
      </div>
    </div>
  );
}

export default function ChessHome() {
  const location = useLocation();
  const navigate = useNavigate();
  const { chessWins } = useGame();

  const isMenu = location.pathname === '/chess' || location.pathname === '/chess/';
  const handleBack = () => {
    if (isMenu) {
      navigate('/');
    } else {
      navigate('/chess');
    }
  };

  return (
    <div className="chess-container">
      <div className="chess-header" style={{ marginBottom: isMenu ? '0' : '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            onClick={handleBack} 
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0 8px 0 0', display: 'flex', alignItems: 'center' }}
          >
            ←
          </button>
          <Crown size={32} color="#ffeb3b" />
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Chess Mastery</h1>
        </div>
        <div style={{ fontSize: '0.8rem', textAlign: 'right' }}>
          <div>Wins: {chessWins}</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<ChessMenu />} />
          <Route path="play" element={<ChessPlay />} />
          <Route path="puzzles" element={<ChessPuzzles />} />
          <Route path="lessons" element={<ChessLessons />} />
        </Routes>
      </div>
    </div>
  );
}
