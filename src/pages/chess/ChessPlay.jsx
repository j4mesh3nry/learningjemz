import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { useGame } from '../../contexts/GameContext';
import { RotateCw, Flag, Play, Bot, BrainCircuit, Cpu } from 'lucide-react';
import { getBestMove } from '../../utils/chessEngine';
import './chess.css';

import w_p from '../../assets/pieces/w_p.svg';
import w_n from '../../assets/pieces/w_n.svg';
import w_b from '../../assets/pieces/w_b.svg';
import w_r from '../../assets/pieces/w_r.svg';
import w_q from '../../assets/pieces/w_q.svg';
import w_k from '../../assets/pieces/w_k.svg';
import b_p from '../../assets/pieces/b_p.svg';
import b_n from '../../assets/pieces/b_n.svg';
import b_b from '../../assets/pieces/b_b.svg';
import b_r from '../../assets/pieces/b_r.svg';
import b_q from '../../assets/pieces/b_q.svg';
import b_k from '../../assets/pieces/b_k.svg';

const PIECE_IMAGES = {
  w: { p: w_p, n: w_n, b: w_b, r: w_r, q: w_q, k: w_k },
  b: { p: b_p, n: b_n, b: b_b, r: b_r, q: b_q, k: b_k }
};

export default function ChessPlay() {
  const [game, setGame] = useState(new Chess());
  const [board, setBoard] = useState(game.board());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [difficulty, setDifficulty] = useState(null); // null means in selection screen
  const [isFlipped, setIsFlipped] = useState(false);
  const [status, setStatus] = useState('');
  const [history, setHistory] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'resigned', 'checkmate', 'draw'
  const [showRestartModal, setShowRestartModal] = useState(false);
  const navigate = useNavigate();
  const { winChessGame, addXp, level, streak } = useGame();

  const updateGame = useCallback((newGame) => {
    setGame(newGame);
    setBoard(newGame.board());
    setHistory(newGame.history());
    
    if (newGame.isCheckmate()) {
      setGameState('checkmate');
      if (newGame.turn() === 'b') {
        winChessGame();
      }
    } else if (newGame.isDraw()) {
      setGameState('draw');
    }
  }, [winChessGame]);

  const makeAIMove = useCallback(() => {
    if (game.isGameOver() || gameState !== 'playing') return;

    setIsThinking(true);
    setTimeout(() => {
      const moves = game.moves({ verbose: true });
      if (moves.length === 0) {
        setIsThinking(false);
        return;
      }

      let move;
      if (difficulty === 'Easy') {
        move = moves[Math.floor(Math.random() * moves.length)];
      } else if (difficulty === 'Medium') {
        move = getBestMove(game, 2) || moves[0];
      } else {
        move = getBestMove(game, 3) || moves[0];
      }

      if (move) {
        const newGame = new Chess(game.fen());
        newGame.move(move.san);
        updateGame(newGame);
      }
      setIsThinking(false);
    }, 100);
  }, [game, difficulty, updateGame]);

  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver()) {
      makeAIMove();
    }
  }, [game, makeAIMove]);

  const handleSquareClick = (square) => {
    if (game.turn() === 'b' || game.isGameOver() || gameState !== 'playing') return;

    if (selectedSquare) {
      const move = legalMoves.find(m => m.to === square);
      if (move) {
        const newGame = new Chess(game.fen());
        try {
          newGame.move({
            from: selectedSquare,
            to: square,
            promotion: 'q'
          });
          updateGame(newGame);
        } catch (e) {
          console.error(e);
        }
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
    }

    const piece = game.get(square);
    if (piece && piece.color === 'w') {
      setSelectedSquare(square);
      setLegalMoves(game.moves({ square, verbose: true }));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const getSquareLabel = (r, c) => {
    const row = 8 - r;
    const col = String.fromCharCode(97 + c);
    return `${col}${row}`;
  };

  const resetGame = () => {
    updateGame(new Chess());
    setSelectedSquare(null);
    setLegalMoves([]);
    setGameState('playing');
    setShowRestartModal(false);
  };

  const handleRestartClick = () => {
    setShowRestartModal(true);
  };

  const confirmRestart = () => {
    setShowRestartModal(false);
    resetGame();
  };

  const handleResign = () => {
    setGameState('resigned');
  };

  return (
    <div className="chess-module-page">
      <div className="chess-nav-header">
        <div className="chess-header-left">
          <button className="chess-back-btn" onClick={() => difficulty ? setDifficulty(null) : navigate('/chess')} title="Back">
            ←
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="chess-page-title" style={{ margin: 0, color: '#1c7c54', fontSize: '1.4rem', fontWeight: 900 }}>Play with Bot</h1>
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

      {!difficulty ? (
        <div className="opponent-selection-screen">
          <h2 style={{ textAlign: 'center', marginBottom: 20, fontFamily: 'var(--font-heading)', color: '#333' }}>Choose Your Opponent</h2>
          <div className="opponent-cards">
            <div className="opponent-card easy" onClick={() => setDifficulty('Easy')}>
              <div className="opponent-avatar"><Bot size={40} color="#4caf50" /></div>
              <div className="opponent-info">
                <h3>Beginner Bob</h3>
                <p>Easy • Makes random moves</p>
              </div>
            </div>
            <div className="opponent-card medium" onClick={() => setDifficulty('Medium')}>
              <div className="opponent-avatar"><BrainCircuit size={40} color="#ff9800" /></div>
              <div className="opponent-info">
                <h3>Intermediate Ivy</h3>
                <p>Medium • Looks for captures</p>
              </div>
            </div>
            <div className="opponent-card hard" onClick={() => setDifficulty('Hard')}>
              <div className="opponent-avatar"><Cpu size={40} color="#f44336" /></div>
              <div className="opponent-info">
                <h3>Grandmaster Gary</h3>
                <p>Hard • Calculates deeply</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="chess-play-layout">
          
          <div className="player-profile-banner">
            <div className="player-avatar">
              {difficulty === 'Easy' ? <Bot size={24} color="#4caf50" /> : 
               difficulty === 'Medium' ? <BrainCircuit size={24} color="#ff9800" /> : 
               <Cpu size={24} color="#f44336" />}
            </div>
            <div className="player-info">
              <div className="player-name">
                {difficulty === 'Easy' ? 'Beginner Bob' : 
                 difficulty === 'Medium' ? 'Intermediate Ivy' : 'Grandmaster Gary'}
                {isThinking && <span className="thinking-indicator" style={{ marginLeft: 8, fontSize: '0.8rem' }}>(thinking...)</span>}
              </div>
              <div className="player-tagline">Bot • {difficulty}</div>
            </div>
          </div>

          {status && gameState === 'playing' && (
            <div style={{ textAlign: 'center', margin: '0.5rem 0', fontWeight: 'bold', color: '#ff9800', width: '100%' }}>
              {status}
            </div>
          )}

          <div className="board-outer-wrapper">
            {showRestartModal && (
              <div className="modal-overlay">
                <div className="restart-modal">
                  <h3>Restart Game?</h3>
                  <p>Are you sure you want to abandon this match? This counts as a loss!</p>
                  <div className="modal-actions">
                    <button className="btn" onClick={() => setShowRestartModal(false)}>Cancel</button>
                    <button className="btn primary" onClick={confirmRestart}>Restart</button>
                  </div>
                </div>
              </div>
            )}
            
            {(gameState === 'resigned' || gameState === 'checkmate' || gameState === 'draw') && (
              <div className="game-over-overlay">
                <h2>{gameState === 'resigned' ? 'You Resigned' : gameState === 'draw' ? 'Draw!' : 'Checkmate!'}</h2>
                <p>
                  {gameState === 'resigned' ? `${difficulty === 'Easy' ? 'Beginner Bob' : difficulty === 'Medium' ? 'Intermediate Ivy' : 'Grandmaster Gary'} wins!` :
                   gameState === 'draw' ? 'The game is a draw.' :
                   game.turn() === 'b' ? 'You win!' : `${difficulty === 'Easy' ? 'Beginner Bob' : difficulty === 'Medium' ? 'Intermediate Ivy' : 'Grandmaster Gary'} wins!`}
                </p>
              </div>
            )}

            <div className={`board-container ${isFlipped ? 'flipped' : ''}`}>
              {board.map((row, rIndex) => {
                return row.map((piece, cIndex) => {
                  const squareLabel = getSquareLabel(rIndex, cIndex);
                  const isLight = (rIndex + cIndex) % 2 === 0;
                  const isSelected = selectedSquare === squareLabel;
                  const isLegal = legalMoves.some(m => m.to === squareLabel);
                  
                  const isLeftEdge = cIndex === 0;
                  const isBottomEdge = rIndex === 7;
                  const rankLabel = isLeftEdge ? (8 - rIndex) : null;
                  const fileLabel = isBottomEdge ? String.fromCharCode(97 + cIndex) : null;

                  return (
                    <div 
                      key={squareLabel}
                      className={`square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSquareClick(squareLabel)}
                    >
                      {rankLabel && <span className="coord-rank">{rankLabel}</span>}
                      {fileLabel && <span className="coord-file">{fileLabel}</span>}
                      
                      {piece && (
                        <img 
                          src={PIECE_IMAGES[piece.color][piece.type]} 
                          alt={`${piece.color} ${piece.type}`} 
                          className="piece" 
                        />
                      )}
                      {isLegal && <div className="legal-move-dot" />}
                    </div>
                  );
                });
              })}
            </div>
          </div>

          <div className="player-profile-banner bottom">
            <div className="player-avatar" style={{ background: '#e3f2fd', fontSize: '1.2rem' }}>
              👤
            </div>
            <div className="player-info">
              <div className="player-name">
                You
              </div>
              <div className="player-tagline">Lv.{level} • 🔥 {streak} Streak</div>
            </div>
          </div>

          <div className="game-controls">
            {gameState !== 'playing' ? (
              <button className="btn primary" onClick={resetGame}>
                <Play size={18} /> Rematch
              </button>
            ) : (
              <>
                <button className="btn" onClick={() => setIsFlipped(!isFlipped)}>
                  <RotateCw size={18} /> Flip
                </button>
                <button className="btn primary" onClick={handleRestartClick}>
                  <Play size={18} /> Restart
                </button>
                <button className="btn danger" onClick={handleResign}>
                  <Flag size={18} /> Resign
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
