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
  const navigate = useNavigate();
  const { winChessGame, addXp, level, streak } = useGame();

  const updateGame = useCallback((newGame) => {
    setGame(newGame);
    setBoard(newGame.board());
    setHistory(newGame.history());
    
    if (newGame.isCheckmate()) {
      setStatus(`Checkmate! ${newGame.turn() === 'w' ? 'Black' : 'White'} wins!`);
      if (newGame.turn() === 'b') {
        winChessGame();
        addXp(50);
      }
    } else if (newGame.isDraw()) {
      setStatus('Draw!');
    } else if (newGame.isCheck()) {
      setStatus('Check!');
    } else {
      setStatus('');
    }
  }, [addXp, winChessGame]);

  const makeAIMove = useCallback(() => {
    if (game.isGameOver()) return;

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
    if (game.turn() === 'b' || game.isGameOver()) return;

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
    const row = isFlipped ? r + 1 : 8 - r;
    const col = isFlipped ? String.fromCharCode(104 - c) : String.fromCharCode(97 + c);
    return `${col}${row}`;
  };

  const resetGame = () => {
    updateGame(new Chess());
    setSelectedSquare(null);
    setLegalMoves([]);
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
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold', color: '#555' }}>vs {difficulty} AI</div>
            {isThinking && <div className="thinking-indicator">AI is thinking...</div>}
          </div>

          {status && (
            <div style={{ textAlign: 'center', margin: '0.5rem 0', fontWeight: 'bold', color: '#ff9800' }}>
              {status}
            </div>
          )}

          <div className="chess-play-layout">
            <div className="board-outer-wrapper">
              <div className="board-labels-left">
                {[8, 7, 6, 5, 4, 3, 2, 1].map(num => (
                  <span key={num}>{isFlipped ? 9 - num : num}</span>
                ))}
              </div>
              
              <div className="board-container">
                {board.map((row, rIndex) => {
                  const displayRow = isFlipped ? [...row].reverse() : row;
                  
                  return displayRow.map((piece, cIndex) => {
                    const squareLabel = getSquareLabel(rIndex, cIndex);
                    const isLight = (rIndex + cIndex) % 2 === 0;
                    const isSelected = selectedSquare === squareLabel;
                    const isLegal = legalMoves.some(m => m.to === squareLabel);
                    
                    return (
                      <div 
                        key={squareLabel}
                        className={`square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSquareClick(squareLabel)}
                      >
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
              
              <div className="board-labels-bottom">
                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
                  <span key={letter}>{isFlipped ? String.fromCharCode(201 - letter.charCodeAt(0)) : letter}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="game-controls">
            <button className="btn" onClick={resetGame}>
              <Play size={16} /> New Game
            </button>
            <button className="btn" style={{ background: '#555' }} onClick={() => setIsFlipped(!isFlipped)}>
              <RotateCw size={16} /> Flip
            </button>
            <button className="btn danger" onClick={resetGame}>
              <Flag size={16} /> Resign
            </button>
          </div>

          <div className="history-panel">
            {history.map((move, i) => (
              <span key={i} style={{ color: i % 2 === 0 ? '#fff' : '#aaa' }}>
                {i % 2 === 0 ? `${i/2 + 1}. ` : ''}{move}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
