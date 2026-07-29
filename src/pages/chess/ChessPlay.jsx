import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { useGame } from '../../contexts/GameContext';
import { RotateCw, Flag, Play } from 'lucide-react';
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
  const [difficulty, setDifficulty] = useState('Easy'); // Easy, Medium, Hard
  const [isFlipped, setIsFlipped] = useState(false);
  const [status, setStatus] = useState('');
  const [history, setHistory] = useState([]);
  const { addXp } = useGame();

  const updateGame = useCallback((newGame) => {
    setGame(newGame);
    setBoard(newGame.board());
    setHistory(newGame.history());
    
    if (newGame.isCheckmate()) {
      setStatus(`Checkmate! ${newGame.turn() === 'w' ? 'Black' : 'White'} wins!`);
      if (newGame.turn() === 'b') {
        addXp(50);
        localStorage.setItem('chess_gamesPlayed', (parseInt(localStorage.getItem('chess_gamesPlayed') || '0') + 1));
      }
    } else if (newGame.isDraw()) {
      setStatus('Draw!');
    } else if (newGame.isCheck()) {
      setStatus('Check!');
    } else {
      setStatus('');
    }
  }, [addXp]);

  const makeAIMove = useCallback(() => {
    if (game.isGameOver()) return;

    setTimeout(() => {
      const moves = game.moves({ verbose: true });
      if (moves.length === 0) return;

      let move;
      if (difficulty === 'Easy') {
        move = moves[Math.floor(Math.random() * moves.length)];
      } else if (difficulty === 'Medium') {
        const captures = moves.filter(m => m.flags.includes('c'));
        if (captures.length > 0) {
          move = captures[Math.floor(Math.random() * captures.length)];
        } else {
          move = moves[Math.floor(Math.random() * moves.length)];
        }
      } else {
        // Hard mode placeholder: just random for now if worker fails, but try to use logic
        const checks = moves.filter(m => m.san.includes('+'));
        move = checks.length ? checks[0] : moves[Math.floor(Math.random() * moves.length)];
      }

      const newGame = new Chess(game.fen());
      newGame.move(move.san);
      updateGame(newGame);
    }, 500);
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="difficulty-selector">
        {['Easy', 'Medium', 'Hard'].map(level => (
          <div 
            key={level}
            className={`difficulty-pill ${difficulty === level ? 'active' : ''}`}
            onClick={() => setDifficulty(level)}
          >
            {level}
          </div>
        ))}
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
  );
}
