import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess as ChessJS } from 'chess.js';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Puzzle, ArrowLeft, RotateCw, CheckCircle2, XCircle, 
  Trophy, Flame, Clock, Zap, RefreshCw, Timer,
  Lightbulb, User, Sparkles, BookOpen, Eye
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

  // Hints, Solution Highlighting & Review Mode State
  const [showHint, setShowHint] = useState(false);
  const [solutionSquares, setSolutionSquares] = useState([]);
  const [mistakeSquare, setMistakeSquare] = useState(null);
  const [lastXPGained, setLastXPGained] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);

  // Time Attack Blitz Timer State (180s = 3 minutes)
  const [timeLeft, setTimeLeft] = useState(180);
  const [timeModifier, setTimeModifier] = useState(null); // { text: '+5s' | '-10s', type: 'plus' | 'minus', id }
  const timerRef = useRef(null);

  // Session Stats
  const [sessionSolvedCount, setSessionSolvedCount] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [sessionMaxStreak, setSessionMaxStreak] = useState(0);
  const [sessionAttemptedCount, setSessionAttemptedCount] = useState(1);
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
    setLastXPGained(0);
    setIsReviewing(false);
    setIsFlipped(actualTurn === 'b');
  }, []);

  // Start Mode
  const startMode = (mode) => {
    setGameMode(mode);
    setSessionSolvedCount(0);
    setSessionStreak(0);
    setSessionMaxStreak(0);
    setSessionAttemptedCount(1);
    setSessionXPEarned(0);
    setLastXPGained(0);
    setShowVictory(false);
    setStatus('playing');
    setShowHint(false);
    setSolutionSquares([]);
    setMistakeSquare(null);
    setIsReviewing(false);

    if (mode === 'BLITZ') {
      setTimeLeft(180);
      setTimeModifier(null);
    }

    const firstPuzzle = pickRandomPuzzle('Easy');
    loadPuzzle(firstPuzzle);
  };

  // Blitz Countdown Timer Effect
  useEffect(() => {
    if (gameMode !== 'BLITZ' || showVictory || isReviewing) {
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
  }, [gameMode, showVictory, isReviewing]);

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
    setSessionAttemptedCount(prev => prev + 1);
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
    if (status !== 'playing' || !game || !currentPuzzle || isReviewing) return;

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

            setLastXPGained(xpGained);
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
          setLastXPGained(0);
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
      setLastXPGained(0);
      setIsReviewing(false);
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
              if (isReviewing) {
                setIsReviewing(false);
                setShowVictory(true);
              } else if (gameMode) {
                setGameMode(null);
                setShowVictory(false);
                setIsReviewing(false);
              } else {
                navigate('/chess');
              }
            }}
            title="Back to Chess Menu"
            aria-label="Back to Chess Menu"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="chess-badges">
            <div className="puzzle-mode-avatar survival" style={{ width: 32, height: 32, borderRadius: 10 }}>
              <Puzzle size={18} color="#ffffff" />
            </div>
            <h1 className="chess-page-title">
              Chess Puzzles
            </h1>
          </div>
        </div>
      </div>

      {/* Hub / Game Mode Selection View */}
      {!gameMode ? (
        <div>
          <div className="puzzle-prompt-chip">
            <Zap size={14} color="#4a2c11" /> Choose your tactical challenge mode
          </div>

          {/* Mode Cards */}
          <div className="puzzle-mode-cards-container">
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

          {/* 2-Card Career Stats Showcase */}
          <div className="puzzle-career-stats-card">
            <h3 className="puzzle-stats-heading">
              <Trophy size={18} color="#d97706" /> Puzzle Career Stats
            </h3>

            <div className="puzzle-stats-grid">
              {/* Survival Best Card */}
              <div className="puzzle-stat-box">
                <div className="puzzle-stat-box-title">
                  SURVIVAL STREAK
                </div>
                <span className="puzzle-stat-box-val">
                  <Flame size={18} fill="#ffb300" color="#f57f17" /> {survivalBest}
                </span>
              </div>

              {/* Blitz Best Card */}
              <div className="puzzle-stat-box">
                <div className="puzzle-stat-box-title">
                  BLITZ HIGH SCORE
                </div>
                <span className="puzzle-stat-box-val blitz-val">
                  <Timer size={18} color="#b45309" /> {blitzBest}
                </span>
              </div>
            </div>

            {/* Total Solved Bottom Accent Pill */}
            <div className="puzzle-total-solved-banner">
              <span>Total Puzzles Solved:</span>
              <strong style={{ color: '#2c1b0d', fontSize: '0.9rem' }}>{totalSolved}</strong>
            </div>
          </div>
        </div>
      ) : (
        /* Puzzle Play Game View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', alignItems: 'center' }}>
          
          {/* Review Mode Banner */}
          {isReviewing && currentPuzzle && (
            <div className="puzzle-review-callout">
              <div className="puzzle-review-header">
                <span className="puzzle-review-title">
                  <BookOpen size={16} color="#4a2c11" /> Reviewing Solution
                </span>
                {currentPuzzle.theme && (
                  <span className="puzzle-theme-tag">{currentPuzzle.theme}</span>
                )}
              </div>
              <div className="puzzle-review-moves">
                <strong>Solution:</strong> {currentPuzzle.moves.join(' ')}
              </div>
            </div>
          )}

          <div className="chess-play-layout">
            {/* Top Puzzle Objective Banner */}
            <div className="player-profile-banner">
              {/* Row 1: Mode, Difficulty, Progress & Timer/Streak */}
              <div className="puzzle-header-meta-row">
                <div className="puzzle-header-mode-info">
                  <span className="puzzle-mode-label">
                    {gameMode === 'SURVIVAL' ? 'Sudden Death Survival' : 'Time Attack Blitz'}
                  </span>
                  <span className="puzzle-difficulty-badge">
                    {getCurrentDifficultyTier()}
                  </span>
                  <span className="puzzle-progress-label">
                    Puzzle #{sessionAttemptedCount}
                  </span>
                </div>

                {gameMode === 'SURVIVAL' ? (
                  <div className="puzzle-survival-streak-chip" style={{
                    background: '#4a2c11', color: '#ffffff',
                    padding: '4px 8px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, border: '1.5px solid #b89f80'
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

              {/* Row 2: Turn Indicator, Objective, Theme Badge */}
              <div className="puzzle-header-objective-row">
                <div className="puzzle-objective-left">
                  <div className={`puzzle-turn-indicator ${game?.turn() === 'w' ? 'white' : 'black'}`}>
                    <img 
                      src={game?.turn() === 'w' ? PIECE_IMAGES.w.k : PIECE_IMAGES.b.k} 
                      alt={`${game?.turn() === 'w' ? 'White' : 'Black'} King`} 
                      style={{ width: '85%', height: '85%', objectFit: 'contain' }}
                    />
                  </div>
                  <div className="puzzle-objective-text">
                    {(game?.turn() === 'w' ? 'White' : 'Black')} to move — {(currentPuzzle?.goal || '').toLowerCase().includes('mate') ? 'Find Checkmate' : 'Find the Winning Move'}
                  </div>
                </div>
                {currentPuzzle?.theme && (
                  <span className="puzzle-theme-tag">{currentPuzzle.theme}</span>
                )}
              </div>
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
              <div className="player-avatar" style={{
                background: '#ebe3cf',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                borderRadius: 10,
                border: '1.5px solid #b89f80',
                overflow: 'hidden'
              }}>
                {(() => {
                  const av = user?.user_metadata?.avatar || localStorage.getItem('learningjemz_avatar');
                  if (av) {
                    if (typeof av === 'string' && av.startsWith('http')) {
                      return <img src={av} alt={playerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                    }
                    return <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>{av}</span>;
                  }
                  return <User size={20} color="#4a2c11" strokeWidth={2.5} />;
                })()}
              </div>
              <div className="player-info" style={{ minWidth: 0 }}>
                <div className="player-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{playerName}</span>
                  <span className={`orientation-tag ${isFlipped ? 'black' : 'white'}`}>
                    Playing as {isFlipped ? 'Black' : 'White'}
                  </span>
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

              {!isReviewing ? (
                <>
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
                </>
              ) : (
                <button
                  type="button"
                  className="puzzle-action-btn primary"
                  onClick={() => {
                    setIsReviewing(false);
                    startMode(gameMode || 'SURVIVAL');
                  }}
                  title="Play Again"
                >
                  Play Again
                </button>
              )}
            </div>
          </div>

          {/* Tactical Hint Box */}
          {showHint && currentPuzzle?.hint && !isReviewing && (
            <div className="puzzle-hint-box">
              <Lightbulb size={16} color="#ca8a04" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <span style={{ fontWeight: 800, color: '#854d0e', marginRight: 4 }}>Hint:</span>
                <span>{currentPuzzle.hint}</span>
              </div>
            </div>
          )}

          {/* Feedback Card */}
          {feedbackMsg && !isReviewing && (
            <div className="puzzle-feedback-card">
              <div className="puzzle-feedback-content">
                {status === 'correct' ? (
                  <CheckCircle2 size={20} color="#4a2c11" />
                ) : status === 'incorrect' || status === 'ended' ? (
                  <XCircle size={20} color="#dc2626" />
                ) : (
                  <Zap size={20} color="#d97706" />
                )}
                <span>{feedbackMsg}</span>
              </div>
              {status === 'correct' && lastXPGained > 0 && (
                <div className="puzzle-feedback-xp-pill">
                  +{lastXPGained} XP
                </div>
              )}
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
          setIsReviewing(false);
        }}
        onPlayAgain={() => {
          setShowVictory(false);
          startMode(gameMode || 'SURVIVAL');
        }}
        continueText="Back to Menu"
      >
        {currentPuzzle && (
          <div className="puzzle-review-callout" style={{ margin: '10px 0', textAlign: 'left' }}>
            <div className="puzzle-review-header">
              <span className="puzzle-review-title">
                <Sparkles size={16} color="#d97706" /> Last Puzzle Solution
              </span>
              {currentPuzzle.theme && (
                <span className="puzzle-theme-tag">{currentPuzzle.theme}</span>
              )}
            </div>
            <div className="puzzle-review-moves">
              <strong>Line:</strong> {currentPuzzle.moves.join(' ')}
            </div>
            <button
              type="button"
              className="puzzle-action-btn"
              onClick={() => {
                setShowVictory(false);
                setIsReviewing(true);
              }}
              style={{ width: '100%', marginTop: 4 }}
            >
              <Eye size={15} /> Inspect Solution on Board
            </button>
          </div>
        )}
      </VictoryScreen>
    </div>
  );
}


