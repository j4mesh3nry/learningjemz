import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess as ChessJS } from 'chess.js';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { RotateCw, Flag, Play, Bot, BrainCircuit, Cpu, Trophy, ArrowLeft, RefreshCw, ScrollText, Sparkles, Target } from 'lucide-react';
import './chess.css';
import VictoryScreen from '../../components/VictoryScreen';

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

const createChess = (pgn) => {
  try {
    const C = typeof ChessJS === 'function' ? ChessJS : (ChessJS?.Chess || ChessJS);
    const g = new C();
    if (pgn) {
      try { g.loadPgn(pgn); } catch (e) {}
    }
    return g;
  } catch (e) {
    console.error('Error creating Chess instance:', e);
    return new ChessJS();
  }
};

export default function ChessPlay() {
  const [game, setGame] = useState(() => createChess());
  const [board, setBoard] = useState(() => game.board());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [difficulty, setDifficulty] = useState(null); // null means in selection screen
  const [isFlipped, setIsFlipped] = useState(false);
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

  const gameContext = useGame() || {};
  const { 
    winChessGame = () => 30, 
    drawChessGame = () => 10,
    lossChessGame = () => 5,
    recordChessGame = () => {}, 
    level = 1, 
    streak = 0, 
    recordActivity = () => {}, 
    hasPlayedToday = false, 
    botStats = {} 
  } = gameContext;

  const authContext = useAuth() || {};
  const user = authContext.user;

  const workerRef = React.useRef(null);

  useEffect(() => {
    try {
      workerRef.current = new Worker('/stockfish/stockfish.js');
      workerRef.current.postMessage('uci');
    } catch (e) {
      console.warn('Stockfish Worker failed to initialize:', e);
    }
    return () => {
      if (workerRef.current) {
        try { workerRef.current.terminate(); } catch (e) {}
      }
    };
  }, []);
  
  const playerName = user?.user_metadata?.name || 'You';
  const playerAvatar = user?.user_metadata?.avatar || '👤';

  const capturedStats = React.useMemo(() => {
    const startCount = { w: { p: 8, n: 2, b: 2, r: 2, q: 1 }, b: { p: 8, n: 2, b: 2, r: 2, q: 1 } };
    const currentCount = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };

    if (board && Array.isArray(board)) {
      board.forEach(row => {
        if (Array.isArray(row)) {
          row.forEach(piece => {
            if (piece && piece.type !== 'k' && currentCount[piece.color]) {
              currentCount[piece.color][piece.type]++;
            }
          });
        }
      });
    }

    const captured = { w: [], b: [] }; 
    let wScore = 0; let bScore = 0;
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    const sortOrder = { q: 1, r: 2, b: 3, n: 4, p: 5 };

    Object.keys(startCount.w).forEach(type => {
      const diff = startCount.w[type] - currentCount.w[type];
      for (let i = 0; i < diff; i++) {
        captured.w.push(type);
        bScore += values[type] || 0;
      }
    });

    Object.keys(startCount.b).forEach(type => {
      const diff = startCount.b[type] - currentCount.b[type];
      for (let i = 0; i < diff; i++) {
        captured.b.push(type);
        wScore += values[type] || 0;
      }
    });

    captured.w.sort((a, b) => (sortOrder[a] || 5) - (sortOrder[b] || 5));
    captured.b.sort((a, b) => (sortOrder[a] || 5) - (sortOrder[b] || 5));

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
    const moves = newGame.history({ verbose: true });
    setHistory(moves);
    
    if (newGame.isCheckmate()) {
      setGameState('checkmate');
      setShowOverlay(true);
      if (newGame.turn() !== playerColor) {
        const xpGained = winChessGame(difficulty);
        recordChessGame(difficulty, true);
        recordActivity();
        setVictoryStats({ xpGained, result: 'win' });
      } else {
        const xpGained = lossChessGame(difficulty, moves.length);
        recordChessGame(difficulty, false);
        recordActivity();
        setVictoryStats({ xpGained, result: 'loss' });
      }
    } else if (newGame.isDraw()) {
      setGameState('draw');
      setShowOverlay(true);
      const xpGained = drawChessGame(difficulty);
      recordChessGame(difficulty, false);
      recordActivity();
      setVictoryStats({ xpGained, result: 'draw' });
    }
  }, [winChessGame, drawChessGame, lossChessGame, recordActivity, streak, playerColor, difficulty, recordChessGame]);

  const makeAIMove = useCallback(() => {
    if (!game || game.isGameOver() || gameState !== 'playing') return;

    setIsThinking(true);
    
    if (difficulty === 'Easy' || !workerRef.current) {
      setTimeout(() => {
        try {
          const moves = game.moves();
          if (moves && moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            const newGame = createChess(game.pgn());
            newGame.move(randomMove);
            updateGame(newGame);
          }
        } catch (e) {
          console.error(e);
        }
        setTimeout(() => {
          if (historyScrollRef.current) {
            historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
          }
        }, 50);
        setIsThinking(false);
      }, 500);
      return;
    }

    try {
      workerRef.current.onmessage = (e) => {
        const message = typeof e.data === 'string' ? e.data : e.data?.data;
        
        if (message && message.startsWith('bestmove')) {
          const moveStr = message.split(' ')[1];
          const newGame = createChess(game.pgn());
          
          const moveMatch = moveStr ? moveStr.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/) : null;
          if (moveMatch) {
            newGame.move({ from: moveMatch[1], to: moveMatch[2], promotion: moveMatch[3] });
          } else if (moveStr) {
            try { newGame.move(moveStr); } catch (err) {}
          }
          
          updateGame(newGame);
          setTimeout(() => {
            if (historyScrollRef.current) {
              historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
            }
          }, 50);
          setIsThinking(false);
        }
      };

      if (difficulty === 'Medium') {
        workerRef.current.postMessage('setoption name Skill Level value 10');
      } else {
        workerRef.current.postMessage('setoption name Skill Level value 20');
      }

      workerRef.current.postMessage(`position fen ${game.fen()}`);
      const depth = difficulty === 'Hard' ? 10 : 4;
      workerRef.current.postMessage(`go depth ${depth}`);
    } catch (err) {
      console.error('Stockfish error:', err);
      setIsThinking(false);
    }
  }, [game, difficulty, updateGame, gameState]);

  useEffect(() => {
    const botColor = playerColor === 'w' ? 'b' : 'w';
    if (gameState === 'playing' && difficulty && game && game.turn() === botColor && !game.isGameOver()) {
      makeAIMove();
    }
  }, [game, makeAIMove, playerColor, gameState, difficulty]);

  const handleSquareClick = (square) => {
    const botColor = playerColor === 'w' ? 'b' : 'w';
    if (!game || game.turn() === botColor || game.isGameOver() || gameState !== 'playing') return;

    if (selectedSquare) {
      const possibleMoves = legalMoves.filter(m => m.to === square);
      if (possibleMoves.length > 0) {
        const isPromotion = possibleMoves.some(m => m.promotion);
        
        if (isPromotion) {
          setPromotionPending({ from: selectedSquare, to: square });
          return;
        }

        const newGame = createChess(game.pgn());
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
    if (workerRef.current) {
      workerRef.current.onmessage = null;
    }
    setIsThinking(false);
    updateGame(createChess());
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
    
    const newGame = createChess();
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
    if (game.history().length > 0 && gameState === 'playing') {
      recordChessGame(difficulty, false);
    }
    setShowRestartModal(false);
    resetGame();
  };

  const handleBackClick = () => {
    if (difficulty && gameState === 'playing' && game.history().length > 0) {
      setShowBackModal(true);
    } else {
      confirmBack();
    }
  };

  const confirmBack = () => {
    setShowBackModal(false);
    if (difficulty) {
      if (game.history().length > 0 && gameState === 'playing') {
        recordChessGame(difficulty, false);
      }
      setDifficulty(null);
      setGameState('playing');
      setVictoryStats(null);
      setIgniting(false);
      
      if (workerRef.current) {
        workerRef.current.onmessage = null;
      }
      setIsThinking(false);
      updateGame(createChess());
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
    
    const moveCount = history.length;
    const xpGained = lossChessGame(difficulty, moveCount);
    
    setVictoryStats({ streakIncreased: false, xpGained, result: 'resigned' });
    setDisplayedStreak(streak);
    setIgniting(false);
  };

  const handlePromotionSelect = (pieceType) => {
    const newGame = createChess(game.pgn());
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

  const renderMoveHistoryList = () => {
    if (!history || history.length === 0) {
      return (
        <div style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#4e7361', fontStyle: 'italic', textAlign: 'center' }}>
          No moves played yet. Make your first move!
        </div>
      );
    }

    const pairs = [];
    for (let i = 0; i < history.length; i += 2) {
      pairs.push({
        moveNum: Math.floor(i / 2) + 1,
        white: history[i],
        black: history[i + 1] || null
      });
    }

    return (
      <div 
        ref={historyScrollRef}
        style={{ 
          maxHeight: 110, 
          overflowY: 'auto', 
          padding: '8px 12px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 4 
        }}
      >
        {pairs.map((pair) => {
          const isWhiteLast = history[history.length - 1] === pair.white;
          const isBlackLast = history[history.length - 1] === pair.black;
          return (
            <div key={pair.moveNum} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ fontWeight: 800, color: '#4e7361', fontSize: '0.78rem' }}>{pair.moveNum}.</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 6, background: isWhiteLast ? '#e1f0e2' : 'transparent', fontWeight: isWhiteLast ? 800 : 600, color: '#0f3825' }}>
                {pair.white && (
                  <>
                    <img src={PIECE_IMAGES.w[pair.white.piece]} alt={pair.white.piece} style={{ width: 14, height: 14 }} />
                    <span>{pair.white.san}</span>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 6, background: isBlackLast ? '#e1f0e2' : 'transparent', fontWeight: isBlackLast ? 800 : 600, color: '#0f3825' }}>
                {pair.black && (
                  <>
                    <img src={PIECE_IMAGES.b[pair.black.piece]} alt={pair.black.piece} style={{ width: 14, height: 14 }} />
                    <span>{pair.black.san}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const topIsBot = playerColor === 'w' ? !isFlipped : isFlipped;

  const renderBotProfile = () => (
    <div className="player-profile-banner">
      <div className="player-avatar">
        {difficulty === 'Easy' ? <Bot size={24} color="#16653e" /> : 
         difficulty === 'Medium' ? <BrainCircuit size={24} color="#d97706" /> : 
         <Cpu size={24} color="#e53935" />}
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
        <div className="player-tagline">
          {difficulty === 'Easy' ? 'Rating: 400 • Casual' : 
           difficulty === 'Medium' ? 'Rating: 1200 • Tactical' : 'Rating: 2500 • Stockfish'}
          {isThinking && <span style={{ color: '#16653e', fontWeight: 'bold', marginLeft: 6 }}>Thinking...</span>}
        </div>
      </div>
    </div>
  );

  const renderUserProfile = () => (
    <div className="player-profile-banner bottom">
      <div className="player-avatar" style={{ background: '#e1f0e2', fontSize: '1.2rem' }}>
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
  );

  return (
    <div className="chess-module-page">
      {/* Header Container with Separated Back Button & Long Green Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {/* Separated Back Button */}
        <button 
          onClick={handleBackClick} 
          title="Back"
          aria-label="Back"
          style={{
            background: '#ffffff',
            border: '2px solid #b0cbaf',
            boxShadow: '0 3px 0 #b0cbaf',
            borderRadius: 14,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16653e',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>

        {/* Long Green Banner Rectangle */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #16653e 0%, #0d462b 100%)',
          borderRadius: 16,
          border: '2px solid #0f3825',
          boxShadow: '0 4px 0 #092c1d',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <h1 style={{
            margin: 0, color: '#ffffff', fontSize: '1.25rem',
            fontFamily: 'var(--font-heading)', fontWeight: 900
          }}>
            Play with Bot
          </h1>
        </div>
      </div>

      {!difficulty ? (
        <div className="opponent-selection-screen">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#ffffff',
            border: '2px solid #b0cbaf',
            boxShadow: '0 2.5px 0 #b0cbaf',
            borderRadius: 12,
            padding: '6px 14px',
            marginBottom: 16,
            fontSize: '0.82rem',
            color: '#0f3825',
            fontWeight: 700,
            width: 'fit-content'
          }}>
            <Target size={14} color="#16653e" /> Choose an opponent difficulty below
          </div>
          <div className="opponent-cards">
            <div className={`opponent-card easy ${selectedOpponent === 'Easy' ? 'selected' : ''}`} onClick={() => setSelectedOpponent(selectedOpponent === 'Easy' ? null : 'Easy')}>
              <div className="opponent-card-header">
                <div className="opponent-avatar"><Bot size={36} color="#16653e" /></div>
                <div className="opponent-info">
                  <h3>Beginner Bob</h3>
                  <p>Easy • High blunder rate</p>
                </div>
              </div>
              {selectedOpponent === 'Easy' && (
                <div className="color-select-bar" onClick={e => e.stopPropagation()}>
                  <span className="color-select-label">Play as:</span>
                  <button className="color-btn white" onClick={() => startGame('Easy', 'w')}>
                    <span style={{ fontSize: '1.1rem' }}>♔</span> White
                  </button>
                  <button className="color-btn black" onClick={() => startGame('Easy', 'b')}>
                    <span style={{ fontSize: '1.1rem' }}>♚</span> Black
                  </button>
                </div>
              )}
            </div>
            <div className={`opponent-card medium ${selectedOpponent === 'Medium' ? 'selected' : ''}`} onClick={() => setSelectedOpponent(selectedOpponent === 'Medium' ? null : 'Medium')}>
              <div className="opponent-card-header">
                <div className="opponent-avatar"><BrainCircuit size={36} color="#d97706" /></div>
                <div className="opponent-info">
                  <h3>Intermediate Ivy</h3>
                  <p>Medium • Looks for captures</p>
                </div>
              </div>
              {selectedOpponent === 'Medium' && (
                <div className="color-select-bar" onClick={e => e.stopPropagation()}>
                  <span className="color-select-label">Play as:</span>
                  <button className="color-btn white" onClick={() => startGame('Medium', 'w')}>
                    <span style={{ fontSize: '1.1rem' }}>♔</span> White
                  </button>
                  <button className="color-btn black" onClick={() => startGame('Medium', 'b')}>
                    <span style={{ fontSize: '1.1rem' }}>♚</span> Black
                  </button>
                </div>
              )}
            </div>
            <div className={`opponent-card hard ${selectedOpponent === 'Hard' ? 'selected' : ''}`} onClick={() => setSelectedOpponent(selectedOpponent === 'Hard' ? null : 'Hard')}>
              <div className="opponent-card-header">
                <div className="opponent-avatar"><Cpu size={36} color="#e53935" /></div>
                <div className="opponent-info">
                  <h3>Grandmaster Gary</h3>
                  <p>Hard • Calculates deeply</p>
                </div>
              </div>
              {selectedOpponent === 'Hard' && (
                <div className="color-select-bar" onClick={e => e.stopPropagation()}>
                  <span className="color-select-label">Play as:</span>
                  <button className="color-btn white" onClick={() => startGame('Hard', 'w')}>
                    <span style={{ fontSize: '1.1rem' }}>♔</span> White
                  </button>
                  <button className="color-btn black" onClick={() => startGame('Hard', 'b')}>
                    <span style={{ fontSize: '1.1rem' }}>♚</span> Black
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {botStats && (
            <div className="global-stats-box" style={{ marginTop: 28, padding: 16, background: '#ffffff', borderRadius: 18, border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf' }}>
              <h3 style={{ textAlign: 'center', marginBottom: 14, color: '#0f3825', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Trophy size={20} color="#d97706" /> Career Stats
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
                {['Easy', 'Medium', 'Hard'].map(diff => {
                  const stats = (botStats && botStats[diff]) ? botStats[diff] : { played: 0, won: 0, lost: 0 };
                  const played = stats.played || 0;
                  const won = stats.won || 0;
                  const lost = stats.lost || 0;
                  const winRate = played > 0 ? Math.round((won / played) * 100) : 0;
                  const color = diff === 'Easy' ? '#16653e' : diff === 'Medium' ? '#d97706' : '#e53935';
                  return (
                    <div key={diff} style={{ display: 'flex', flexDirection: 'column', gap: 4, background: '#e1f0e2', padding: '10px 8px', borderRadius: 12, border: '1.5px solid #b0cbaf', borderTop: `3px solid ${color}` }}>
                      <div style={{ fontWeight: 800, color: '#0f3825', fontSize: '0.85rem' }}>{diff}</div>
                      <div style={{ color: color, fontWeight: 900, fontSize: '1.15rem' }}>{winRate}% <span style={{ fontSize: '0.7rem', color: '#4e7361', fontWeight: 600 }}>WIN</span></div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 4 }}>{won}W - {lost}L</div>
                      <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{played} Matches</div>
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
          {topIsBot ? renderBotProfile() : renderUserProfile()}

          <div className="board-outer-wrapper">
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
                  <h3>Restart Match?</h3>
                  <p>Restarting will count current game as a loss.</p>
                  <div className="modal-actions">
                    <button className="btn primary" onClick={() => setShowRestartModal(false)}>Cancel</button>
                    <button className="btn" style={{ background: '#e53935', color: 'white' }} onClick={confirmRestart}>Restart</button>
                  </div>
                </div>
              </div>
            )}

            {promotionPending && (
              <div className="modal-overlay" style={{ zIndex: 100 }}>
                <div className="restart-modal" style={{ maxWidth: 320, padding: 20 }}>
                  <h3 style={{ marginBottom: 12 }}>Promote Pawn</h3>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 16 }}>Select a piece to promote your pawn:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                    {['q', 'r', 'b', 'n'].map(type => (
                      <button
                        key={type}
                        onClick={() => handlePromotionSelect(type)}
                        style={{
                          background: 'white',
                          border: '2px solid #16653e',
                          borderRadius: 12,
                          padding: 10,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 3px 0 #0e4329'
                        }}
                      >
                        <img src={PIECE_IMAGES[playerColor][type]} alt={type} style={{ width: 36, height: 36 }} />
                      </button>
                    ))}
                  </div>
                  <button className="btn" onClick={cancelPromotion} style={{ width: '100%', background: '#eee', color: '#333' }}>Cancel</button>
                </div>
              </div>
            )}

            <div className="chess-board">
              {(isFlipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7]).map((r, rowIndex) => (
                <div key={r} className="board-row">
                  {(isFlipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7]).map((c, colIndex) => {
                    const squareLabel = getSquareLabel(r, c);
                    const isDark = (r + c) % 2 === 1;
                    const piece = game ? game.get(squareLabel) : null;
                    const isSelected = selectedSquare === squareLabel;
                    const isLegalMove = legalMoves.some(m => m.to === squareLabel);
                    const isLastMoveSquare = lastMove && (lastMove.from === squareLabel || lastMove.to === squareLabel);

                    return (
                      <div
                        key={c}
                        className={`square ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} ${isLastMoveSquare ? 'last-move' : ''}`}
                        onClick={() => handleSquareClick(squareLabel)}
                      >
                        {colIndex === 0 && <span className="rank-label">{8 - r}</span>}
                        {rowIndex === 7 && <span className="file-label">{String.fromCharCode(97 + c)}</span>}
                        
                        {piece && (
                          <img
                            src={PIECE_IMAGES[piece.color][piece.type]}
                            alt={`${piece.color} ${piece.type}`}
                            className="piece-img"
                          />
                        )}
                        {isLegalMove && <div className={`move-dot ${piece ? 'capture' : ''}`} />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {topIsBot ? renderUserProfile() : renderBotProfile()}

          {/* Action Bar with Flip, Restart, Resign */}
          <div style={{ display: 'flex', gap: 8, padding: 12, width: '100%', background: '#f8faf8', borderTop: '1.5px solid #b0cbaf', boxSizing: 'border-box' }}>
            <button 
              onClick={() => setIsFlipped(prev => !prev)} 
              title="Flip Board"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 12px', background: '#ffffff', border: '2px solid #b0cbaf',
                boxShadow: '0 3px 0 #b0cbaf', borderRadius: 12, fontWeight: 700, fontSize: '0.85rem',
                color: '#16653e', cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} /> Flip
            </button>

            <button 
              onClick={handleRestartClick} 
              title="Restart Match"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 12px', background: '#ffffff', border: '2px solid #b0cbaf',
                boxShadow: '0 3px 0 #b0cbaf', borderRadius: 12, fontWeight: 700, fontSize: '0.85rem',
                color: '#16653e', cursor: 'pointer'
              }}
            >
              <RotateCw size={15} /> Restart
            </button>

            <button 
              onClick={handleResign} 
              title="Resign Match"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 12px', background: '#fff5f5', border: '2px solid #ffcdd2',
                boxShadow: '0 3px 0 #ffcdd2', borderRadius: 12, fontWeight: 700, fontSize: '0.85rem',
                color: '#e53935', cursor: 'pointer'
              }}
            >
              <Flag size={15} /> Resign
            </button>
          </div>

          {/* Scrollable Move History Box */}
          <div style={{ width: '100%', background: '#ffffff', borderTop: '1.5px solid #b0cbaf' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', background: '#f4f9f4', borderBottom: '1px solid #e1f0e2' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f3825', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ScrollText size={14} color="#16653e" /> Game Notation
              </span>
            </div>
            {renderMoveHistoryList()}
          </div>
        </div>

        <VictoryScreen
          isOpen={gameState !== 'playing' && showOverlay}
          theme="chess"
          title={gameState === 'checkmate' && game && game.turn() !== playerColor ? 'Checkmate! You Won!' : 
                 gameState === 'checkmate' ? 'Checkmate! Bot Won!' : 
                 gameState === 'resigned' ? 'Game Resigned' : 'Stalemate / Draw!'}
          subtitle={gameState === 'checkmate' && game && game.turn() !== playerColor ? 'Great tactical play!' : 'Better luck next match!'}
          xpGained={victoryStats?.xpGained || 0}
          onContinue={() => confirmBack()}
          onPlayAgain={() => resetGame()}
          continueText="Back to Menu"
        />
        </>
      )}
    </div>
  );
}
