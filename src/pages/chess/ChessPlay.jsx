import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { RotateCw, Flag, Play, Bot, BrainCircuit, Cpu, Trophy, Swords, Percent, Eye } from 'lucide-react';
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
  const [showBackModal, setShowBackModal] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [promotionPending, setPromotionPending] = useState(null);
  const [victoryStats, setVictoryStats] = useState(null);
  const [igniting, setIgniting] = useState(false);
  const [displayedStreak, setDisplayedStreak] = useState(0);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [playerColor, setPlayerColor] = useState('w');
  const navigate = useNavigate();
  const historyScrollRef = React.useRef(null);
  const { winChessGame, recordChessGame, addXp, level, streak, recordActivity, hasPlayedToday, botStats } = useGame();
  const { user } = useAuth();
  const workerRef = React.useRef(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../../utils/chessWorker.js', import.meta.url), { type: 'module' });
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);
  
  const playerName = user?.user_metadata?.name || 'You';
  const playerAvatar = user?.user_metadata?.avatar || '👤';

  const capturedStats = React.useMemo(() => {
    const startCount = { w: { p: 8, n: 2, b: 2, r: 2, q: 1 }, b: { p: 8, n: 2, b: 2, r: 2, q: 1 } };
    const currentCount = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };

    board.forEach(row => {
      row.forEach(piece => {
        if (piece && piece.type !== 'k') {
          currentCount[piece.color][piece.type]++;
        }
      });
    });

    const captured = { w: [], b: [] }; 
    let wScore = 0; let bScore = 0;
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    // Sort order for display: Q, R, B, N, P
    const sortOrder = { q: 1, r: 2, b: 3, n: 4, p: 5 };

    Object.keys(startCount.w).forEach(type => {
      const diff = startCount.w[type] - currentCount.w[type];
      for (let i = 0; i < diff; i++) {
        captured.w.push(type);
        bScore += values[type];
      }
    });

    Object.keys(startCount.b).forEach(type => {
      const diff = startCount.b[type] - currentCount.b[type];
      for (let i = 0; i < diff; i++) {
        captured.b.push(type);
        wScore += values[type];
      }
    });

    captured.w.sort((a, b) => sortOrder[a] - sortOrder[b]);
    captured.b.sort((a, b) => sortOrder[a] - sortOrder[b]);

    return { 
      capturedByWhite: captured.b,
      capturedByBlack: captured.w,
      whiteScoreDiff: wScore - bScore,
      blackScoreDiff: bScore - wScore
    };
  }, [board]);

  const playerCapturedPieces = playerColor === 'w' ? capturedStats.capturedByWhite : capturedStats.capturedByBlack;
  const playerScoreDiff = playerColor === 'w' ? capturedStats.whiteScoreDiff : capturedStats.blackScoreDiff;
  const playerCapturedColor = playerColor === 'w' ? 'b' : 'w';

  const botCapturedPieces = playerColor === 'w' ? capturedStats.capturedByBlack : capturedStats.capturedByWhite;
  const botScoreDiff = playerColor === 'w' ? capturedStats.blackScoreDiff : capturedStats.whiteScoreDiff;
  const botCapturedColor = playerColor === 'w' ? 'w' : 'b';

  const updateGame = useCallback((newGame) => {
    setGame(newGame);
    setBoard(newGame.board());
    setHistory(newGame.history({ verbose: true }));
    
    if (newGame.isCheckmate()) {
      setGameState('checkmate');
      setShowOverlay(true);
      if (newGame.turn() !== playerColor) {
        const oldStreak = streak;
        const xpGained = winChessGame(difficulty);
        recordChessGame(difficulty, true);
        const streakIncreased = recordActivity();
        
        setVictoryStats({ streakIncreased, xpGained });
        setDisplayedStreak(oldStreak);
        
        if (streakIncreased) {
          setTimeout(() => {
            setIgniting(true);
            setDisplayedStreak(oldStreak + 1);
          }, 800);
        } else {
          setDisplayedStreak(oldStreak);
        }
      } else {
        recordChessGame(difficulty, false);
      }
    } else if (newGame.isDraw()) {
      setGameState('draw');
      setShowOverlay(true);
    }
  }, [winChessGame, recordActivity, streak, playerColor]);

  const makeAIMove = useCallback(() => {
    if (game.isGameOver() || gameState !== 'playing') return;

    setIsThinking(true);
    
    workerRef.current.onmessage = (e) => {
      const { type, move, message } = e.data;
      if (type === 'MOVE_FOUND') {
        const newGame = new Chess();
        newGame.loadPgn(game.pgn());
        newGame.move(move);
        updateGame(newGame);
        setTimeout(() => {
          if (historyScrollRef.current) {
            historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
          }
        }, 50);
      } else {
        console.error(message);
      }
      setIsThinking(false);
    };

    workerRef.current.postMessage({ 
      fen: game.fen(), 
      depth: difficulty === 'Hard' ? 3 : 2, 
      difficulty 
    });
  }, [game, difficulty, updateGame, gameState]);

  useEffect(() => {
    const botColor = playerColor === 'w' ? 'b' : 'w';
    if (gameState === 'playing' && difficulty && game.turn() === botColor && !game.isGameOver()) {
      makeAIMove();
    }
  }, [game, makeAIMove, playerColor, gameState, difficulty]);

  const handleSquareClick = (square) => {
    const botColor = playerColor === 'w' ? 'b' : 'w';
    if (game.turn() === botColor || game.isGameOver() || gameState !== 'playing') return;

    if (selectedSquare) {
      const possibleMoves = legalMoves.filter(m => m.to === square);
      if (possibleMoves.length > 0) {
        const isPromotion = possibleMoves.some(m => m.promotion);
        
        if (isPromotion) {
          setPromotionPending({ from: selectedSquare, to: square });
          return;
        }

        const newGame = new Chess();
        newGame.loadPgn(game.pgn());
        try {
          newGame.move({
            from: selectedSquare,
            to: square,
            promotion: 'q'
          });
          updateGame(newGame);
          setTimeout(() => {
            if (historyScrollRef.current) {
              historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
            }
          }, 50);
        } catch (e) {
          console.error(e);
        }
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
    }

    const piece = game.get(square);
    if (piece && piece.color === playerColor) {
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
    setShowOverlay(true);
    setVictoryStats(null);
    setIgniting(false);
    setPromotionPending(null);
    setIsFlipped(playerColor === 'b');
  };

  const startGame = (diff, color) => {
    setPlayerColor(color);
    setDifficulty(diff);
    setSelectedOpponent(null);
    setIsFlipped(color === 'b');
    
    const newGame = new Chess();
    updateGame(newGame);
    setSelectedSquare(null);
    setLegalMoves([]);
    setGameState('playing');
    setShowRestartModal(false);
    setShowOverlay(true);
    setVictoryStats(null);
    setIgniting(false);
    setPromotionPending(null);
  };

  const handleRestartClick = () => {
    setShowRestartModal(true);
  };

  const confirmRestart = () => {
    setShowRestartModal(false);
    resetGame();
  };

  const handleBackClick = () => {
    if (difficulty && gameState === 'playing' && history.length > 0) {
      setShowBackModal(true);
    } else {
      confirmBack();
    }
  };

  const confirmBack = () => {
    setShowBackModal(false);
    if (difficulty) {
      setDifficulty(null);
      setGameState('playing');
      setVictoryStats(null);
      setIgniting(false);
      updateGame(new Chess());
      setSelectedSquare(null);
      setLegalMoves([]);
    } else {
      navigate('/chess');
    }
  };

  const handleResign = () => {
    setGameState('resigned');
    setShowOverlay(true);
    recordChessGame(difficulty, false);
  };

  const handlePromotionSelect = (pieceType) => {
    const newGame = new Chess();
    newGame.loadPgn(game.pgn());
    try {
      newGame.move({
        from: promotionPending.from,
        to: promotionPending.to,
        promotion: pieceType
      });
      updateGame(newGame);
      setTimeout(() => {
        if (historyScrollRef.current) {
          historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
        }
      }, 50);
    } catch (e) {
      console.error(e);
    }
    setPromotionPending(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const cancelPromotion = () => {
    setPromotionPending(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  const renderHistoryMove = (move, isLastMove) => {
    if (!move) return null;
    const isPawn = move.piece === 'p';
    const sanText = isPawn ? move.san : move.san.replace(/^[NBRQK]/, '');
    
    return (
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: 6, 
        padding: '4px 8px', borderRadius: 6,
        background: isLastMove ? 'rgba(28, 124, 84, 0.1)' : 'transparent',
        border: isLastMove ? '1px solid rgba(28, 124, 84, 0.3)' : '1px solid transparent',
      }}>
        {!isPawn && (
          <img 
            src={PIECE_IMAGES[move.color][move.piece]} 
            alt={move.piece} 
            style={{ width: 14, height: 14, opacity: 0.9 }} 
          />
        )}
        <span style={{ 
          color: isLastMove ? '#1c7c54' : '#444', 
          fontWeight: isLastMove ? 800 : 600,
          fontFamily: 'monospace',
          fontSize: '0.9rem'
        }}>
          {sanText}
        </span>
      </div>
    );
  };

  return (
    <div className="chess-module-page">
      <div className="chess-nav-header">
        <div className="chess-header-left">
          <button className="chess-back-btn" onClick={handleBackClick} title="Back">
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
            <span className={!hasPlayedToday ? "unlit-icon" : ""} style={{ fontSize: '0.75rem' }}>🔥</span>
            <span className={!hasPlayedToday ? "unlit-text" : ""} style={{ fontWeight: 800, fontSize: '0.7rem', color: '#e53935' }}>{streak}</span>
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
            <div className={`opponent-card easy ${selectedOpponent === 'Easy' ? 'selected' : ''}`} onClick={() => setSelectedOpponent(selectedOpponent === 'Easy' ? null : 'Easy')}>
              <div className="opponent-avatar"><Bot size={40} color="#4caf50" /></div>
              <div className="opponent-info" style={{ flex: 1 }}>
                <h3>Beginner Bob</h3>
                <p>Easy • High blunder rate</p>
              </div>
              {selectedOpponent === 'Easy' && (
                <div style={{ display: 'flex', gap: 6, animation: 'fadeIn 0.2s' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => startGame('Easy', 'w')} style={{ padding: '8px 14px', borderRadius: '20px', background: '#f8f9fa', border: '1px solid #dee2e6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#333', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>White</button>
                  <button onClick={() => startGame('Easy', 'b')} style={{ padding: '8px 14px', borderRadius: '20px', background: '#343a40', border: '1px solid #212529', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>Black</button>
                </div>
              )}
            </div>
            <div className={`opponent-card medium ${selectedOpponent === 'Medium' ? 'selected' : ''}`} onClick={() => setSelectedOpponent(selectedOpponent === 'Medium' ? null : 'Medium')}>
              <div className="opponent-avatar"><BrainCircuit size={40} color="#ff9800" /></div>
              <div className="opponent-info" style={{ flex: 1 }}>
                <h3>Intermediate Ivy</h3>
                <p>Medium • Looks for captures</p>
              </div>
              {selectedOpponent === 'Medium' && (
                <div style={{ display: 'flex', gap: 6, animation: 'fadeIn 0.2s' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => startGame('Medium', 'w')} style={{ padding: '8px 14px', borderRadius: '20px', background: '#f8f9fa', border: '1px solid #dee2e6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#333', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>White</button>
                  <button onClick={() => startGame('Medium', 'b')} style={{ padding: '8px 14px', borderRadius: '20px', background: '#343a40', border: '1px solid #212529', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>Black</button>
                </div>
              )}
            </div>
            <div className={`opponent-card hard ${selectedOpponent === 'Hard' ? 'selected' : ''}`} onClick={() => setSelectedOpponent(selectedOpponent === 'Hard' ? null : 'Hard')}>
              <div className="opponent-avatar"><Cpu size={40} color="#f44336" /></div>
              <div className="opponent-info" style={{ flex: 1 }}>
                <h3>Grandmaster Gary</h3>
                <p>Hard • Calculates deeply</p>
              </div>
              {selectedOpponent === 'Hard' && (
                <div style={{ display: 'flex', gap: 6, animation: 'fadeIn 0.2s' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => startGame('Hard', 'w')} style={{ padding: '8px 14px', borderRadius: '20px', background: '#f8f9fa', border: '1px solid #dee2e6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#333', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>White</button>
                  <button onClick={() => startGame('Hard', 'b')} style={{ padding: '8px 14px', borderRadius: '20px', background: '#343a40', border: '1px solid #212529', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>Black</button>
                </div>
              )}
            </div>
          </div>
          
          {botStats && (
            <div className="global-stats-box" style={{ marginTop: 32, padding: 20, background: '#fff', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
              <h3 style={{ textAlign: 'center', marginBottom: 16, color: '#333', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Trophy size={20} color="#ffb300" /> Career Stats
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
                {['Easy', 'Medium', 'Hard'].map(diff => {
                  const stats = botStats[diff];
                  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
                  const color = diff === 'Easy' ? '#4caf50' : diff === 'Medium' ? '#ff9800' : '#f44336';
                  return (
                    <div key={diff} style={{ display: 'flex', flexDirection: 'column', gap: 4, background: '#f8f9fa', padding: '12px 8px', borderRadius: 12, borderTop: `3px solid ${color}` }}>
                      <div style={{ fontWeight: 800, color: '#333', fontSize: '0.9rem' }}>{diff}</div>
                      <div style={{ color: color, fontWeight: 900, fontSize: '1.2rem' }}>{winRate}% <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 600 }}>WIN</span></div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 4 }}>{stats.won}W - {stats.lost}L</div>
                      <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{stats.played} Matches</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
        <div className="chess-play-layout">
          
          <div className={`player-profile-banner ${isFlipped ? 'bottom' : ''}`} style={{ order: isFlipped ? 3 : 1 }}>
            <div className="player-avatar">
              {difficulty === 'Easy' ? <Bot size={24} color="#4caf50" /> : 
               difficulty === 'Medium' ? <BrainCircuit size={24} color="#ff9800" /> : 
               <Cpu size={24} color="#f44336" />}
            </div>
            <div className="player-info" style={{ minWidth: 0 }}>
              <div className="player-name" style={{ flexWrap: 'wrap' }}>
                <span style={{ whiteSpace: 'nowrap' }}>
                  {difficulty === 'Easy' ? 'Beginner Bob' : 
                   difficulty === 'Medium' ? 'Intermediate Ivy' : 'Grandmaster Gary'}
                </span>
                
                {botCapturedPieces.length > 0 && (
                  <>
                    <span style={{ color: '#aaa', margin: '0 2px' }}>-</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      {botCapturedPieces.map((type, i) => (
                        <img key={i} src={PIECE_IMAGES[botCapturedColor][type]} alt={type} style={{ width: 14, height: 14 }} />
                      ))}
                      {botScoreDiff > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginLeft: 4 }}>+{botScoreDiff}</span>}
                    </div>
                  </>
                )}
              </div>
              <div className="player-tagline" style={{ position: 'relative' }}>
                Bot • {difficulty}
                {isThinking && <span className="thinking-indicator" style={{ position: 'absolute', marginLeft: 6, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>(thinking...)</span>}
              </div>
            </div>
          </div>

          <div className="board-outer-wrapper" style={{ order: 2 }}>
            {showBackModal && (
              <div className="modal-overlay">
                <div className="restart-modal">
                  <h3>Leave Game?</h3>
                  <p>Are you sure you want to leave? This counts as a loss!</p>
                  <div className="modal-actions">
                    <button className="btn primary" onClick={() => setShowBackModal(false)}>Cancel</button>
                    <button className="btn" style={{ background: '#e53935', color: 'white' }} onClick={confirmBack}>Leave</button>
                  </div>
                </div>
              </div>
            )}
            
            {showRestartModal && (
              <div className="modal-overlay">
                <div className="restart-modal">
                  <h3>Restart Game?</h3>
                  <p>Are you sure you want to abandon this match? This counts as a loss!</p>
                  <div className="modal-actions">
                    <button className="btn primary" onClick={() => setShowRestartModal(false)}>Cancel</button>
                    <button className="btn" style={{ background: '#e53935', color: 'white' }} onClick={confirmRestart}>Restart</button>
                  </div>
                </div>
              </div>
            )}

            {promotionPending && (
              <div className="modal-overlay">
                <div className="promotion-modal" style={{ background: '#fff', padding: 24, borderRadius: 20, textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', minWidth: 300, animation: 'cinematicIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  <h3 style={{ marginBottom: 20, fontFamily: 'var(--font-heading)', color: '#333', fontSize: '1.4rem' }}>Promote Pawn</h3>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    {['q', 'r', 'n', 'b'].map(type => (
                      <div 
                        key={type}
                        onClick={() => handlePromotionSelect(type)}
                        style={{ 
                          width: 60, height: 60, background: '#f5f5f5', borderRadius: 12, 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', border: '2px solid transparent',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = '#e8f5e9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#f5f5f5'; }}
                      >
                        <img 
                          src={PIECE_IMAGES[game.turn()][type]} 
                          alt={type} 
                          style={{ width: '85%', height: '85%' }}
                        />
                      </div>
                    ))}
                  </div>
                  <button className="btn" style={{ marginTop: 24, width: '100%', background: '#f5f5f5', color: '#555' }} onClick={cancelPromotion}>Cancel</button>
                </div>
              </div>
            )}
            
            {(gameState === 'resigned' || gameState === 'checkmate' || gameState === 'draw') && showOverlay && (
              <div className={`game-over-overlay ${gameState === 'checkmate' && game.turn() !== playerColor ? 'win' : ''}`}>
                <h2>{gameState === 'resigned' ? 'You Resigned' : gameState === 'draw' ? 'Draw!' : 'Checkmate!'}</h2>
                <p>
                  {gameState === 'resigned' ? `${difficulty === 'Easy' ? 'Beginner Bob' : difficulty === 'Medium' ? 'Intermediate Ivy' : 'Grandmaster Gary'} wins!` :
                   gameState === 'draw' ? 'The game is a draw.' :
                   game.turn() !== playerColor ? 'You win!' : `${difficulty === 'Easy' ? 'Beginner Bob' : difficulty === 'Medium' ? 'Intermediate Ivy' : 'Grandmaster Gary'} wins!`}
                </p>
                {victoryStats && (
                  <div className="victory-stats-container">
                    <div className={`victory-stat-card ${igniting ? 'igniting' : ''}`} style={{ animationDelay: '0.1s' }}>
                      <div className={`stat-icon ${!hasPlayedToday && !igniting ? 'unlit-icon' : ''}`}>🔥</div>
                      <div className={`stat-value ${!hasPlayedToday && !igniting ? 'unlit-text' : ''}`}>{displayedStreak}</div>
                      <div className="stat-label">Day Streak</div>
                    </div>
                    <div className="victory-stat-card" style={{ animationDelay: '0.2s' }}>
                      <div className="stat-icon">🏆</div>
                      <div className="stat-value">+{victoryStats.xpGained}</div>
                      <div className="stat-label">Total XP</div>
                    </div>
                  </div>
                )}
                
                <button 
                  className="btn" 
                  onClick={() => setShowOverlay(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '20px auto 0 auto', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 20, padding: '6px 16px', fontSize: '0.9rem' }}
                >
                  <Eye size={18} /> View Board
                </button>
              </div>
            )}

            <div className={`board-container`}>
              {(isFlipped ? [...board].reverse() : board).map((row, rIndexMapped) => {
                const rIndex = isFlipped ? 7 - rIndexMapped : rIndexMapped;
                return (isFlipped ? [...row].reverse() : row).map((piece, cIndexMapped) => {
                  const cIndex = isFlipped ? 7 - cIndexMapped : cIndexMapped;
                  const squareLabel = getSquareLabel(rIndex, cIndex);
                  const isLight = (rIndex + cIndex) % 2 === 0;
                  const isSelected = selectedSquare === squareLabel;
                  const isLegal = legalMoves.some(m => m.to === squareLabel);
                  const isLastMove = lastMove && (lastMove.from === squareLabel || lastMove.to === squareLabel);
                  const isLeftEdge = cIndexMapped === 0;
                  const isBottomEdge = rIndexMapped === 7;
                  const rankLabel = isLeftEdge ? (8 - rIndex) : null;
                  const fileLabel = isBottomEdge ? String.fromCharCode(97 + cIndex) : null;

                  return (
                    <div 
                      key={squareLabel}
                      className={`square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isLastMove ? 'last-move' : ''}`}
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

          <div className={`player-profile-banner ${isFlipped ? '' : 'bottom'}`} style={{ order: isFlipped ? 1 : 3 }}>
            <div className="player-avatar" style={{ background: '#e3f2fd', fontSize: '1.2rem' }}>
              {playerAvatar}
            </div>
            <div className="player-info" style={{ minWidth: 0 }}>
              <div className="player-name" style={{ flexWrap: 'wrap' }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  {playerName}
                </span>
                {playerCapturedPieces.length > 0 && (
                  <>
                    <span style={{ color: '#aaa', margin: '0 2px' }}>-</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      {playerCapturedPieces.map((type, i) => (
                        <img key={i} src={PIECE_IMAGES[playerCapturedColor][type]} alt={type} style={{ width: 14, height: 14 }} />
                      ))}
                      {playerScoreDiff > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginLeft: 4 }}>+{playerScoreDiff}</span>}
                    </div>
                  </>
                )}
              </div>
              <div className="player-tagline">Lv.{level} • 🔥 {streak} Streak</div>
            </div>
          </div>

          <div className="game-controls" style={{ order: 4 }}>
            {gameState !== 'playing' ? (
              <>
                <button className="btn primary" onClick={resetGame}>
                  <Play size={18} /> Rematch
                </button>
                {!showOverlay && (
                  <button className="btn" onClick={() => setShowOverlay(true)} style={{ background: '#fff8e1', color: '#f57f17' }}>
                    Show Results
                  </button>
                )}
              </>
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

        <div className="move-history-panel-container" style={{ width: '100%', maxWidth: 480, margin: '24px auto 40px auto', background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', height: 260 }}>
          <h2 style={{ margin: 0, padding: '16px 20px', background: '#1c7c54', color: 'white', textAlign: 'center', fontSize: '1.4rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.5px' }}>
            History
          </h2>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px', background: '#fafafa' }} ref={historyScrollRef}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <tbody>
                {history.reduce((acc, curr, i) => {
                  if (i % 2 === 0) acc.push([curr]);
                  else acc[acc.length - 1].push(curr);
                  return acc;
                }, []).map((pair, i) => {
                  const isWhiteLast = pair.length === 1 && history.length === i * 2 + 1;
                  const isBlackLast = pair.length === 2 && history.length === i * 2 + 2;
                  
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '8px 12px', color: '#999', width: '40px', fontWeight: 700, fontSize: '0.9rem' }}>{i + 1}.</td>
                      <td style={{ padding: '4px 12px', width: '50%' }}>
                        {renderHistoryMove(pair[0], isWhiteLast)}
                      </td>
                      <td style={{ padding: '4px 12px', width: '50%' }}>
                        {renderHistoryMove(pair[1], isBlackLast)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {history.length === 0 && <p style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center', margin: '40px 0', fontWeight: 600 }}>Moves will appear here</p>}
          </div>
        </div>
      </>
      )}
    </div>
  );
}
