import React from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Target, Gamepad2, GraduationCap, Crown, ChevronRight } from 'lucide-react';
import ChessPlay from './ChessPlay';
import ChessPuzzles from './ChessPuzzles';
import ChessLessons from './ChessLessons';
import './chess.css';
import './chess.css';

function ChessMenu() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
      <button 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '1rem', color: '#fff', cursor: 'pointer' }}
        onClick={() => navigate('play')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
          <Gamepad2 size={24} color="#4caf50" /> Play with Bots
        </div>
        <ChevronRight />
      </button>

      <button 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '1rem', color: '#fff', cursor: 'pointer' }}
        onClick={() => navigate('puzzles')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
          <Target size={24} color="#ffeb3b" /> Puzzles
        </div>
        <ChevronRight />
      </button>

      <button 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '1rem', color: '#fff', cursor: 'pointer' }}
        onClick={() => navigate('lessons')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
          <GraduationCap size={24} color="#2196f3" /> Lessons
        </div>
        <ChevronRight />
      </button>
    </div>
  );
}
export default function ChessHome() {
  const location = useLocation();
  
  // Stats placeholder
  const stats = {
    gamesPlayed: localStorage.getItem('chess_gamesPlayed') || 0,
    puzzlesSolved: localStorage.getItem('chess_puzzlesSolved') || 0,
  };

  return (
    <div className="chess-container">
      <div className="chess-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Crown size={32} color="#ffeb3b" />
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Chess Mastery</h1>
        </div>
        <div style={{ fontSize: '0.8rem', textAlign: 'right' }}>
          <div>Games: {stats.gamesPlayed}</div>
          <div>Puzzles: {stats.puzzlesSolved}</div>
        </div>
      </div>

      <nav className="chess-nav">
        <NavLink 
          to="/chess/play" 
          className={({ isActive }) => (isActive || location.pathname === '/chess') ? 'active' : ''}
        >
          <Gamepad2 size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Play
        </NavLink>
        <NavLink to="/chess/puzzles" className={({ isActive }) => isActive ? 'active' : ''}>
          <Target size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Puzzles
        </NavLink>
        <NavLink to="/chess/lessons" className={({ isActive }) => isActive ? 'active' : ''}>
          <GraduationCap size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Lessons
        </NavLink>
      </nav>

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
