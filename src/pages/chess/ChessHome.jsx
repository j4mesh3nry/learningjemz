import React from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Target, Gamepad2, GraduationCap, Crown } from 'lucide-react';
import ChessPlay from './ChessPlay';
import ChessPuzzles from './ChessPuzzles';
import ChessLessons from './ChessLessons';
import './chess.css';

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
          <Route path="/" element={<Navigate to="play" replace />} />
          <Route path="play" element={<ChessPlay />} />
          <Route path="puzzles" element={<ChessPuzzles />} />
          <Route path="lessons" element={<ChessLessons />} />
        </Routes>
      </div>
    </div>
  );
}
