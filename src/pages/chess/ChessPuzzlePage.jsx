import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess as ChessJS } from 'chess.js';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Puzzle, ArrowLeft, RotateCw, CheckCircle2, XCircle, 
  Trophy, Flame, Clock, Zap, ChevronRight, RefreshCw, Timer,
  Lightbulb, User, HelpCircle
} from 'lucide-react';
import VictoryScreen from '../../components/VictoryScreen';
import rawPuzzleData from '../../data/chess-puzzles.json';
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

const createChess = (fen) => {
  try {
    const C = typeof ChessJS === 'function' ? ChessJS : (ChessJS?.Chess || ChessJS);
    const g = new C();
    if (fen) {
      g.load(fen);
    }
    return g;
  } catch (e) {
    console.error('Error creating Chess instance:', e);
    return new ChessJS();
  }
};

const getMoveSquares = (fen, sanMove) => {
  if (!fen || !sanMove) return null;
  try {
    const temp = createChess(fen);
    const res = temp.move(sanMove);
    if (res) {
      return { from: res.from, to: res.to, san: res.san };
    }
  } catch (e) {
    // Ignore parse error
  }
  return null;
};

export default function ChessPuzzlePage() {
  const navigate = useNavigate();
  const gameContext = useGame() || {};
  const { 
    puzzlesSolved = 0, 
    botStats = {}, 
    recordPuzzleSolved = () => 6,
    recordPuzzleRunEnd = () => {},
    level = 1
  } = gameContext;

  const authContext = useAuth() || {};
  const user = authContext.user;
  const playerName = user?.user_metadata?.name || 'You';

  const puzzleStats = botStats.puzzleStats || { 
    solved: 0, 
    survivalHighScore: 0, 
    blitzHighScore: 0,
    highStreak: 0
  };

  const survivalBest = puzzleStats.survivalHighScore || puzzleStats.highStreak || 0;
  const blitzBest = puzzleStats.blitzHighScore || 0;
  const totalSolved = puzzleStats.solved || puzzlesSolved || 0;

  // Selected Mode: null = Hub, 'SURVIVAL', 'BLITZ'
  const [gameMode, setGameMode] = useState(null);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [recentPuzzleIds, setRecentPuzzleIds] = useState([]);
  
  const [game, setGame] = useState(() => createChess());
  const [board, setBoard] = useState(() => game.board());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [isFlipped, setIsFlipped] = useState(false);

  const [moveStepIndex, setMoveStepIndex] = useState(0); // Index in puzzle.moves array
  const [status, setStatus] = useState('playing'); // 'playing', 'correct', 'incorrect', 'ended'
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [shake, setShake] = useState(false);

  // Hints and Solution Highlighting State
  const [showHint, setShowHint] = useState(false);
  const [solutionSquares, setSolutionSquares] = useState([]);
  const [mistakeSquare, setMistakeSquare] = useState(null);

  // Time Attack Blitz Timer State (180s = 3 minutes)
  const [timeLeft, setTimeLeft] = useState(180);
  const [timeModifier, setTimeModifier] = useState(null); // { text: '+5s' | '-10s', type: 'plus' | 'minus', id }
  const timerRef = useRef(null);

  // Session Stats
  const [sessionSolvedCount, setSessionSolvedCount] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [sessionMaxStreak, setSessionMaxStreak] = useState(0);
  const [sessionXPEarned, setSessionXPEarned] = useState(0);
  const [showVictory, setShowVictory] = useState(false);

  // Determine current puzzle difficulty dynamically
  const getCurrentDifficultyTier = useCallback(() => {
    if (gameMode === 'SURVIVAL') {
      if (sessionStreak < 5) return 'Easy';
      if (sessionStreak < 12) return 'Medium';
      return 'Hard';
    } else if (gameMode === 'BLITZ') {
      if (sessionSolvedCount < 4) return 'Easy';
      if (sessionSolvedCount < 10) return 'Medium';
      return 'Hard';
    }
    return 'Easy';
  }, [gameMode, sessionStreak, sessionSolvedCount]);

  // Filter puzzles by difficulty
  const getPuzzlesByDifficulty = useCallback((diff) => {
    if (!diff) return rawPuzzleData;
    const diffNum = diff === 'Easy' ? 1 : diff === 'Medium' ? 2 : 3;
    return rawPuzzleData.filter(p => p.difficulty === diffNum);
  }, []);

  // Pick random puzzle matching the dynamic tier
  const pickRandomPuzzle = useCallback((diff) => {
    const tier = diff || getCurrentDifficultyTier();
    const pool = getPuzzlesByDifficulty(tier);
    if (pool.length === 0) return rawPuzzleData[0];

    const available = pool.filter(p => !recentPuzzleIds.includes(p.id));
    const candidatePool = available.length > 0 ? available : pool;
    const chosen = candidatePool[Math.floor(Math.random() * candidatePool.length)];

    setRecentPuzzleIds(prev => [...prev.slice(-8), chosen.id]);
    return chosen;
  }, [getCurrentDifficultyTier, getPuzzlesByDifficulty, recentPuzzleIds]);

  const loadPuzzle = useCallback((puzzle) => {
    setCurrentPuzzle(puzzle);
    const g = createChess(puzzle.fen);
    const actualTurn = g.turn();
    
    setGame(g);
    setBoard(g.board());
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveStepIndex(0);
    setStatus('playing');
    setFeedbackMsg('');
    setShake(false);
    setShowHint(false);
    setSolutionSquares([]);
    setMistakeSquare(null);
    setIsFlipped(actualTurn === 'b');
  }, []);

  // Start Mode
  const startMode = (mode) => {
    setGameMode(mode);
    setSessionSolvedCount(0);
    setSessionStreak(0);
    setSessionMaxStreak(0);
    setSessionXPEarned(0);
    setShowVictory(false);
    setStatus('playing');
    setShowHint(false);
    setSolutionSquares([]);
    setMistakeSquare(null);

    if (mode === 'BLITZ') {
      setTimeLeft(180);
      setTimeModifier(null);
    }

    const firstPuzzle = pickRandomPuzzle('Easy');
    loadPuzzle(firstPuzzle);
  };

  // Blitz Countdown Timer Effect
  useEffect(() => {
    if (gameMode !== 'BLITZ' || showVictory) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameMode, showVictory]);

  // Handle Blitz Time Up
  useEffect(() => {
    if (gameMode === 'BLITZ' && timeLeft === 0 && !showVictory && currentPuzzle) {
      setStatus('ended');
      recordPuzzleRunEnd('BLITZ', sessionSolvedCount);
      setShowVictory(true);
    }
  }, [gameMode, timeLeft, showVictory, currentPuzzle, recordPuzzleRunEnd, sessionSolvedCount]);

  const triggerTimeModifier = (text, type) => {
    setTimeModifier({ text, type, id: Date.now() });
    setTimeout(() => {
      setTimeModifier(null);
    }, 850);
  };

  const handleNextPuzzle = () => {
    if (!gameMode) return;
    const nextPuzzle = pickRandomPuzzle();
    loadPuzzle(nextPuzzle);
  };

  const updateBoardState = useCallback((newGame) => {
    setGame(newGame);
    setBoard(newGame.board());
  }, []);

  const getSquareLabel = (r, c) => {
    const row = 8 - r;
    const col = String.fromCharCode(97 + c);
    return `${col}${row}`;
  };

  const handleSquareClick = (square) => {
    if (status !== 'playing' || !game || !currentPuzzle) return;

    if (selectedSquare) {
      const chosenMove = legalMoves.find(m => m.to === square);

      if (chosenMove) {
        const newGame = createChess(game.fen());
        newGame.move(chosenMove.san);

        const expectedSan = currentPuzzle.moves[moveStepIndex];
        const normChosen = chosenMove.san.replace(/[+#]/g, '');
        const normExpected = expectedSan.replace(/[+#]/g, '');
        const isExactMatch = normChosen === normExpected || chosenMove.san === expectedSan;
        
        const isCheckmateSolve = (expectedSan.includes('#') || (currentPuzzle.goal || '').toLowerCase().includes('mate')) && newGame.isCheckmate();
        const isMatch = isExactMatch || isCheckmateSolve;

        if (isMatch) {
          // Correct move!
          updateBoardState(newGame);
          setShowHint(false);
          setSolutionSquares([]);
          setMistakeSquare(null);

          const nextIndex = moveStepIndex + 1;
          const isFinished = isCheckmateSolve || nextIndex >= currentPuzzle.moves.length;
          
          if (!isFinished) {
            // Multi-move puzzle: Bot responds
            setMoveStepIndex(nextIndex);
            setFeedbackMsg('Good move! Opponent responding...');
            setSelectedSquare(null);
            setLegalMoves([]);

            const autoSan = currentPuzzle.moves[nextIndex];
            setTimeout(() => {
              try {
                const afterBotGame = createChess(newGame.fen());
                afterBotGame.move(autoSan);
                updateBoardState(afterBotGame);
                setMoveStepIndex(nextIndex + 1);
                setFeedbackMsg('Opponent moved! Find the follow-up.');
              } catch (e) {
                console.error('Bot auto move error:', e);
              }
            }, 450);
          } else {
            // Puzzle Fully Solved!
            setStatus('correct');
            const diffTier = getCurrentDifficultyTier();
            const newSolvedCount = sessionSolvedCount + 1;
            const newStreak = sessionStreak + 1;
            
            const xpGained = recordPuzzleSolved(
              gameMode, 
              diffTier, 
              gameMode === 'SURVIVAL' ? newStreak : newSolvedCount
            );

            setSessionSolvedCount(newSolvedCount);
            setSessionStreak(newStreak);
            setSessionMaxStreak(prev => Math.max(prev, newStreak));
            setSessionXPEarned(prev => prev + xpGained);
            setSelectedSquare(null);
            setLegalMoves([]);

            if (gameMode === 'BLITZ') {
              setTimeLeft(t => t + 5);
              triggerTimeModifier('+5s', 'plus');
              setFeedbackMsg(`Solved! +5s & +${xpGained} XP`);
              // Smoothly proceed to next puzzle
              setTimeout(() => {
                handleNextPuzzle();
              }, 550);
            } else {
              setFeedbackMsg(`Puzzle Solved! +${xpGained} XP`);
              // Survival auto-loads next puzzle
              setTimeout(() => {
                handleNextPuzzle();
              }, 600);
            }
          }
        } else {
          // Incorrect Move!
          setShake(true);
          setSelectedSquare(null);
          setLegalMoves([]);
          setTimeout(() => setShake(false), 450);

          // Highlight the mistake and the correct solution move
          const sol = getMoveSquares(game.fen(), expectedSan);
          if (sol) {
            setSolutionSquares([sol.from, sol.to]);
          }
          setMistakeSquare(chosenMove.to);

          if (gameMode === 'SURVIVAL') {
            // Sudden Death - Show solution clearly before ending run
            setStatus('incorrect');
            setFeedbackMsg(`Mistake! The winning move was: ${expectedSan}`);
            setTimeout(() => {
              setStatus('ended');
              recordPuzzleRunEnd('SURVIVAL', sessionStreak);
              setShowVictory(true);
            }, 1800);
          } else if (gameMode === 'BLITZ') {
            // Blitz - Show solution briefly, deduct 10s & continue
            setTimeLeft(t => Math.max(0, t - 10));
            triggerTimeModifier('-10s', 'minus');
            setStatus('incorrect');
            setFeedbackMsg(`Mistake! Winning move: ${expectedSan} (-10s)`);
            setTimeout(() => {
              handleNextPuzzle();
            }, 1300);
          }
        }
        return;
      }
    }

    // Select piece
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handleRetry = () => {
    if (currentPuzzle) {
      const g = createChess(currentPuzzle.fen);
      setGame(g);
      setBoard(g.board());
      setSelectedSquare(null);
      setLegalMoves([]);
      setMoveStepIndex(0);
      setStatus('playing');
      setFeedbackMsg('');
      setShowHint(false);
      setSolutionSquares([]);
      setMistakeSquare(null);
      setIsFlipped(g.turn() === 'b');
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Check hint piece square
  const hintPieceSquare = useMemo(() => {
    if (!showHint || !currentPuzzle || !game) return null;
    const expectedSan = currentPuzzle.moves[moveStepIndex];
    const sol = getMoveSquares(game.fen(), expectedSan);
    return sol ? sol.from : null;
  }, [showHint, currentPuzzle, game, moveStepIndex]);

  return (
    <div className="chess-module-page">
      {/* Navigation Header */}
      <div className="chess-nav-header">
        <div className="chess-header-left">
          <button 
            className="chess-back-btn"
            onClick={() => {
              if (gameMode) {
                setGameMode(null);
                setShowVictory(false);
              } else {
                navigate('/chess');
              }
            }}
            title="Back to Chess Menu"
            aria-label="Back to Chess Menu"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#4a2c11', borderRadius: 10,
              boxShadow: '0 2px 0 #2f1a08'
            }}>
              <Puzzle size={18} color="#ffffff" />
            </div>
            <h1 className="chess-page-title" style={{ margin: 0, color: '#2c1b0d', fontSize: '1.4rem', fontWeight: 900 }}>
              Chess Puzzles
            </h1>
          </div>
        </div>
      </div>

      {/* Hub / Game Mode Selection View */}
      {!gameMode ? (
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#faf6ee',
            border: '2px solid #b89f80',
            boxShadow: '0 2.5px 0 #b89f80',
            borderRadius: 12,
            padding: '6px 12px',
            marginBottom: 14,
            fontSize: '0.82rem',
            color: '#2c1b0d',
            fontWeight: 700,
            width: 'fit-content'
          }}>
            <Zap size={14} color="#4a2c11" /> Choose your tactical challenge mode
          </div>

          {/* Mode Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginBottom: 14 }}>
            {/* Sudden Death Mode Card */}
            <div 
              className="puzzle-mode-card"
              onClick={() => startMode('SURVIVAL')}
            >
              <div className="puzzle-mode-avatar survival">
                <Flame size={24} />
              </div>
              <div className="puzzle-mode-info">
                <h3>Sudden Death Survival</h3>
                <p>1 mistake ends the run! Difficulty dynamically ramps up as your streak grows.</p>
              </div>
            </div>

            {/* Time Attack Blitz Mode Card */}
            <div 
              className="puzzle-mode-card"
              onClick={() => startMode('BLITZ')}
            >
              <div className="puzzle-mode-avatar blitz">
                <Clock size={24} />
              </div>
              <div className="puzzle-mode-info">
                <h3>Time Attack Blitz</h3>
                <p>3 minutes on the clock! Solve fast: +5s for correct moves, -10s for mistakes.</p>
              </div>
            </div>
          </div>

          {/* Remodeled 2-Card Career Stats Showcase */}
          <div className="global-stats-box" style={{ padding: 14, background: '#faf6ee', borderRadius: 18, border: '2px solid #b89f80', boxShadow: '0 4px 0 #b89f80' }}>
            <h3 style={{ textAlign: 'center', marginBottom: 12, color: '#2c1b0d', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Trophy size={18} color="#d97706" /> Puzzle Career Stats
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, textAlign: 'center', marginBottom: 10 }}>
              {/* Survival Best Card */}
              <div style={{ background: '#ebe3cf', padding: '12px 8px', borderRadius: 14, border: '1.5px solid #b89f80', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#4a2c11', letterSpacing: '0.5px', borderBottom: '1px solid #b89f80', width: '100%', paddingBottom: 4 }}>
                  SURVIVAL STREAK
                </div>
                <span style={{ color: '#d97706', fontWeight: 900, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Flame size={18} fill="#ffb300" color="#f57f17" /> {survivalBest}
                </span>
              </div>

              {/* Blitz Best Card */}
              <div style={{ background: '#ebe3cf', padding: '12px 8px', borderRadius: 14, border: '1.5px solid #b89f80', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#4a2c11', letterSpacing: '0.5px', borderBottom: '1px solid #b89f80', width: '100%', paddingBottom: 4 }}>
                  BLITZ HIGH SCORE
                </div>
                <span style={{ color: '#b45309', fontWeight: 900, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Timer size={18} color="#b45309" /> {blitzBest}
                </span>
              </div>
            </div>

            {/* Total Solved Bottom Accent Pill */}
            <div style={{
              background: '#ebe3cf', border: '1.5px solid #b89f80', borderRadius: 10,
              padding: '6px 12px', fontSize: '0.8rem', fontWeight: 800, color: '#4a2c11',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}>
              <span>Total Puzzles Solved:</span>
              <span style={{ fontWeight: 900, color: '#2c1b0d', fontSize: '0.9rem' }}>{totalSolved}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Puzzle Play Game View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', alignItems: 'center' }}>
          <div className="chess-play-layout">
            {/* Top Puzzle Objective Banner */}
            <div className="player-profile-banner">
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: game?.turn() === 'w' ? '#ffffff' : '#2c1b0d',
                color: game?.turn() === 'w' ? '#2c1b0d' : '#ffffff',
                border: '1.5px solid #b89f80',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1.2rem', flexShrink: 0
              }}>
                {game?.turn() === 'w' ? '♔' : '♚'}
              </div>

              <div className="player-info" style={{ flex: 1, minWidth: 0 }}>
                <div className="player-name" style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2c1b0d', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span>{(game?.turn() === 'w' ? 'White' : 'Black')} to move — {(currentPuzzle?.goal || '').toLowerCase().includes('mate') ? 'Find Checkmate' : 'Find the Winning Move'}</span>
                  {currentPuzzle?.theme && (
                    <span className="puzzle-theme-tag">{currentPuzzle.theme}</span>
                  )}
                </div>
                <div className="player-tagline" style={{ fontSize: '0.75rem', color: '#6e5843', fontWeight: 600, marginTop: 2 }}>
                  {gameMode === 'SURVIVAL' ? `Survival • ${getCurrentDifficultyTier()}` : `Blitz • Score: ${sessionSolvedCount}`}
                </div>
              </div>

              {/* Mode-Specific Header Display */}
              {gameMode === 'SURVIVAL' ? (
                <div style={{
                  background: '#4a2c11', color: '#ffffff',
                  padding: '5px 10px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0
                }}>
                  <Flame size={14} fill="#ff4d4d" color="#ff4d4d" /> {sessionStreak}
                </div>
              ) : (
                <div className={`blitz-timer-chip ${timeLeft <= 30 ? 'urgent' : ''}`}>
                  <Clock size={15} />
                  <span>{formatTimer(timeLeft)}</span>
                  {timeModifier && (
                    <div className={`time-modifier-popup ${timeModifier.type}`}>
                      {timeModifier.text}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chess Board Grid */}
            <div className="board-outer-wrapper">
              <div className={`chess-board ${shake ? 'shake-anim' : ''}`}>
                {(isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]).map((r, rowIndex) => (
                  <div key={r} className="board-row">
                    {(isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]).map((c, colIndex) => {
                      const squareLabel = getSquareLabel(r, c);
                      const isDark = (r + c) % 2 === 1;
                      const piece = game ? game.get(squareLabel) : null;
                      const isSelected = selectedSquare === squareLabel;
                      const isLegalMove = legalMoves.some(m => m.to === squareLabel);
                      const isSolution = solutionSquares.includes(squareLabel);
                      const isMistake = mistakeSquare === squareLabel;
                      const isHintSquare = hintPieceSquare === squareLabel;

                      const squareClasses = [
                        'square',
                        isDark ? 'dark' : 'light',
                        isSelected ? 'selected' : '',
                        isSolution ? 'solution-square' : '',
                        isMistake ? 'mistake-square' : '',
                        isHintSquare ? 'hint-piece' : ''
                      ].filter(Boolean).join(' ');

                      return (
                        <div
                          key={c}
                          className={squareClasses}
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

            {/* Bottom Player Profile Banner */}
            <div className="player-profile-banner bottom">
              <div className="player-avatar" style={{ background: '#ebe3cf' }}>
                {user?.user_metadata?.avatar && typeof user.user_metadata.avatar === 'string' && user.user_metadata.avatar.startsWith('http') ? (
                  <img src={user.user_metadata.avatar} alt={playerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={20} color="#4a2c11" strokeWidth={2.5} />
                )}
              </div>
              <div className="player-info" style={{ minWidth: 0 }}>
                <div className="player-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {playerName}
                </div>
                <div className="player-tagline">Lv.{level}</div>
              </div>
            </div>

            {/* Action Bar / Controls */}
            <div className="puzzle-actions-bar">
              <button
                type="button"
                className="puzzle-action-btn"
                onClick={() => setIsFlipped(prev => !prev)}
                title="Flip Board"
              >
                <RefreshCw size={15} /> Flip
              </button>

              <button
                type="button"
                className={`puzzle-action-btn ${showHint ? 'hint-active' : ''}`}
                onClick={() => setShowHint(prev => !prev)}
                disabled={status !== 'playing' || !currentPuzzle?.hint}
                title="Tactical Hint"
              >
                <Lightbulb size={15} /> Hint
              </button>

              <button
                type="button"
                className="puzzle-action-btn"
                onClick={handleRetry}
                disabled={!currentPuzzle}
                title="Reset Position"
              >
                <RotateCw size={15} /> Reset
              </button>
            </div>
          </div>

          {/* Tactical Hint Box */}
          {showHint && currentPuzzle?.hint && (
            <div className="puzzle-hint-box">
              <Lightbulb size={16} color="#ca8a04" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <span style={{ fontWeight: 800, color: '#854d0e', marginRight: 4 }}>Hint:</span>
                <span>{currentPuzzle.hint}</span>
              </div>
            </div>
          )}

          {/* Feedback Card */}
          {feedbackMsg && (
            <div style={{
              width: '100%', maxWidth: 500, background: '#faf6ee', border: '2px solid #b89f80',
              boxShadow: '0 3px 0 #b89f80', borderRadius: 14, padding: '10px 14px', fontSize: '0.85rem',
              color: '#2c1b0d', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxSizing: 'border-box', animation: 'slideUp 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {status === 'correct' ? (
                  <CheckCircle2 size={20} color="#4a2c11" />
                ) : status === 'incorrect' || status === 'ended' ? (
                  <XCircle size={20} color="#dc2626" />
                ) : (
                  <Zap size={20} color="#d97706" />
                )}
                <span>{feedbackMsg}</span>
              </div>
              <div style={{ background: '#ebe3cf', border: '1px solid #b89f80', color: '#4a2c11', padding: '3px 8px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 900 }}>
                +{sessionXPEarned} XP
              </div>
            </div>
          )}
        </div>
      )}

      {/* Victory / Run-Over Summary Modal */}
      <VictoryScreen
        isOpen={showVictory}
        theme="chess"
        title={gameMode === 'SURVIVAL' ? "Sudden Death Over!" : "Blitz Time's Up!"}
        subtitle={
          gameMode === 'SURVIVAL' 
            ? `You achieved a streak of ${sessionMaxStreak} puzzle${sessionMaxStreak === 1 ? '' : 's'}!`
            : `You solved ${sessionSolvedCount} puzzle${sessionSolvedCount === 1 ? '' : 's'} in 3 minutes!`
        }
        xpGained={sessionXPEarned}
        onContinue={() => {
          setShowVictory(false);
          setGameMode(null);
        }}
        onPlayAgain={() => {
          setShowVictory(false);
          startMode(gameMode || 'SURVIVAL');
        }}
        continueText="Back to Menu"
      />
    </div>
  );
}

