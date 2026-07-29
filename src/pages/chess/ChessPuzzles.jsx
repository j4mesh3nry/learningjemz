import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useGame } from '../../contexts/GameContext';
import puzzlesData from '../../data/chess-puzzles.json';
import './chess.css';

const PIECE_UNICODE = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
};

export default function ChessPuzzles() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [game, setGame] = useState(new Chess());
  const [board, setBoard] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [status, setStatus] = useState('');
  const { addXp } = useGame();

  const puzzle = puzzlesData[currentIndex];

  useEffect(() => {
    if (puzzle) {
      const newGame = new Chess(puzzle.fen);
      setGame(newGame);
      setBoard(newGame.board());
      setStatus('');
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [puzzle]);

  const handleSquareClick = (square) => {
    if (status === 'correct' || status === 'wrong') {
        if(status === 'wrong') setStatus(''); // allow retry
        else return;
    }

    if (selectedSquare) {
      const move = legalMoves.find(m => m.to === square);
      if (move) {
        const newGame = new Chess(game.fen());
        try {
          const moveResult = newGame.move({
            from: selectedSquare,
            to: square,
            promotion: 'q'
          });
          
          if (moveResult.san === puzzle.solution || (moveResult.san + '#') === puzzle.solution) {
            setStatus('correct');
            setBoard(newGame.board());
            addXp(25);
            let solved = parseInt(localStorage.getItem('chess_puzzlesSolved') || '0') + 1;
            localStorage.setItem('chess_puzzlesSolved', solved);
            setTimeout(() => {
              nextPuzzle();
            }, 1500);
          } else {
            setStatus('wrong');
          }
        } catch (e) {
          console.error(e);
        }
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
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

  const nextPuzzle = () => {
    setCurrentIndex((prev) => (prev + 1) % puzzlesData.length);
  };

  if (!puzzle) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="puzzle-header">
        <div style={{ color: '#ccc', marginBottom: '0.5rem' }}>
          Puzzle {currentIndex + 1} / {puzzlesData.length}
        </div>
        <div className="puzzle-prompt">
          {puzzle.description}
        </div>
        <div style={{ color: '#ffeb3b', marginTop: '0.25rem' }}>
          {'★'.repeat(puzzle.difficulty)}
        </div>
      </div>

      <div 
        className="board-container" 
        style={{ 
          borderColor: status === 'correct' ? '#4caf50' : status === 'wrong' ? '#f44336' : '#333'
        }}
      >
        {board.map((row, rIndex) => (
          row.map((piece, cIndex) => {
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
                  <div className="piece" style={{ color: piece.color === 'w' ? '#fff' : '#000' }}>
                    {PIECE_UNICODE[piece.color][piece.type]}
                  </div>
                )}
                {isLegal && <div className="legal-move-dot" />}
              </div>
            );
          })
        ))}
      </div>

      <div className="game-controls">
        <button className="btn" style={{ background: '#555' }} onClick={nextPuzzle}>
          Skip
        </button>
      </div>
      
      {status === 'wrong' && (
        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#f44336', fontWeight: 'bold' }}>
          Incorrect move, try again!
        </div>
      )}
      {status === 'correct' && (
        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#4caf50', fontWeight: 'bold' }}>
          Correct! +25 XP
        </div>
      )}
    </div>
  );
}
