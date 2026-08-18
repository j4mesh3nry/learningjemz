import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess as ChessJS } from 'chess.js';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Puzzle, ArrowLeft, RotateCw, CheckCircle2, XCircle, 
  Trophy, Flame, Clock, Zap, RefreshCw, Timer,
  Lightbulb, User, Sparkles, BookOpen, Eye, LogOut, SkipForward, List,
  ShieldAlert, Star
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

const normalizeSan = (san) => {
  if (!san) return '';
  return san.replace(/[+#=]/g, '').toUpperCase();
};

const getMoveSquares = (fen, sanMove) => {
  if (!fen || !sanMove) return null;
  try {
    const temp = createChess(fen);
    const res = temp.move(sanMove);
    if (res) {
      return { from: res.from, to: res.to, san: res.san };
    }
    const normTarget = normalizeSan(sanMove);
    const allMoves = temp.moves({ verbose: true });
    const match = allMoves.find(m => normalizeSan(m.san) === normTarget);
    if (match) {
      return { from: match.from, to: match.to, san: match.san };
    }
  } catch (e) {
    try {
      const temp = createChess(fen);
      const normTarget = normalizeSan(sanMove);
      const allMoves = temp.moves({ verbose: true });
      const match = allMoves.find(m => normalizeSan(m.san) === normTarget);
      if (match) {
        return { from: match.from, to: match.to, san: match.san };
      }
    } catch (err) {}
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
  const [activeInfoBubble, setActiveInfoBubble] = useState(null);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [recentPuzzleIds, setRecentPuzzleIds] = useState(() => {
    try {
      const saved = localStorage.getItem('learningjemz_recent_puzzles');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync recent puzzle IDs array changes to localStorage
  const updateRecentPuzzleIds = (newId) => {
    setRecentPuzzleIds(prev => {
      const next = [...prev.slice(-49), newId];
      try {
        localStorage.setItem('learningjemz_recent_puzzles', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save recent puzzle IDs to localStorage:', e);
      }
      return next;
    });
  };

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
  const [showExitModal, setShowExitModal] = useState(false);

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

  // Puzzle History — array of all attempts for this run
  // Each entry: { puzzle, result: 'correct'|'incorrect'|'skipped', xpGained }
  const [sessionHistory, setSessionHistory] = useState([]);
  // When reviewing a history puzzle, store the puzzle object so back-btn restores victory
  const [reviewingHistoryPuzzle, setReviewingHistoryPuzzle] = useState(null);


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

    updateRecentPuzzleIds(chosen.id);
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
  const startMode = (mode, e) => {
    if (e && (e.target.closest('.chess-mode-info-btn') || e.target.closest('.chess-info-bubble'))) {
      return;
    }
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
    setSessionHistory([]);
    setReviewingHistoryPuzzle(null);

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
    if (gameMode === 'BLITZ' && timeLeft <= 0 && status === 'playing') {
      setStatus('ended');
      recordPuzzleRunEnd('BLITZ', sessionSolvedCount);
      setShowVictory(true);
    }
  }, [gameMode, timeLeft, status, recordPuzzleRunEnd, sessionSolvedCount]);

  const triggerTimeModifier = (text, type) => {
    const id = Date.now();
    setTimeModifier({ text, type, id });
    setTimeout(() => {
      setTimeModifier(prev => (prev?.id === id ? null : prev));
    }, 800);
  };

  const handleNextPuzzle = () => {
    if (!gameMode) return;
    setSessionAttemptedCount(prev => prev + 1);
    const nextPuzzle = pickRandomPuzzle();
    loadPuzzle(nextPuzzle);
  };

  const handleSkipPuzzle = () => {
    if (gameMode !== 'BLITZ' || status !== 'playing' || !currentPuzzle) return;
    setTimeLeft(t => Math.max(0, t - 15));
    triggerTimeModifier('-15s', 'minus');
    setSessionStreak(0);
    setSessionHistory(prev => [...prev, {
      puzzle: currentPuzzle,
      result: 'skipped',
      xpGained: 0,
    }]);
    handleNextPuzzle();
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
      const candidateMoves = legalMoves.filter(m => m.to === square);

      if (candidateMoves.length > 0) {
        const expectedSan = currentPuzzle.moves[moveStepIndex];
        const normExpected = normalizeSan(expectedSan);

        // Match candidate move by normalized SAN to support pawn promotions and notation variations
        let chosenMove = candidateMoves.find(m => normalizeSan(m.san) === normExpected);
        if (!chosenMove) {
          chosenMove = candidateMoves[0];
        }

        const newGame = createChess(game.fen());
        newGame.move(chosenMove.san);

        const normChosen = normalizeSan(chosenMove.san);
        const isExactMatch = normChosen === normExpected;
        
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

            // Record correct solve in history
            setSessionHistory(prev => [...prev, {
              puzzle: currentPuzzle,
              result: 'correct',
              xpGained,
            }]);

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

          // Record incorrect attempt in history
          setSessionHistory(prev => [...prev, {
            puzzle: currentPuzzle,
            result: 'incorrect',
            xpGained: 0,
          }]);

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

  // Calculate total player moves required and current move step counter (e.g. 0/2, 1/2, 2/2)
  const requiredPlayerMoves = useMemo(() => {
    if (!currentPuzzle?.moves) return 1;
    return Math.max(1, Math.ceil(currentPuzzle.moves.length / 2));
  }, [currentPuzzle]);

  const completedPlayerMoves = useMemo(() => {
    if (status === 'correct') return requiredPlayerMoves;
    return Math.min(requiredPlayerMoves, Math.floor(moveStepIndex / 2));
  }, [status, requiredPlayerMoves, moveStepIndex]);

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
                // Directly exit to Chess Puzzles Hub/Menu
                setGameMode(null);
                setShowVictory(false);
                setIsReviewing(false);
                setReviewingHistoryPuzzle(null);
              } else if (gameMode && status === 'playing') {
                setShowExitModal(true);
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

          {/* Backdrop Catcher to dismiss active info bubble */}
          {activeInfoBubble && (
            <div className="chess-bubble-catcher" onClick={() => setActiveInfoBubble(null)} />
          )}

          {/* Mode Cards */}
          <div className="puzzle-mode-cards-container">
            {/* Sudden Death Mode Card */}
            <div 
              className="puzzle-mode-card"
              onClick={(e) => startMode('SURVIVAL', e)}
            >
              <button
                type="button"
                className="chess-mode-info-btn"
                title="Sudden Death Rules & XP"
                aria-label="Sudden Death Rules & XP"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveInfoBubble(prev => prev === 'SURVIVAL' ? null : 'SURVIVAL');
                }}
              >
                <span className="chess-info-icon-text">i</span>
              </button>

              {activeInfoBubble === 'SURVIVAL' && (
                <div className="chess-info-bubble" onClick={(e) => e.stopPropagation()}>
                  <div className="chess-bubble-arrow" />
                  <div className="chess-bubble-title">Sudden Death Rules</div>
                  <div className="chess-bubble-list">
                    <div className="chess-bubble-item">
                      <Flame size={14} color="#ff4d4d" className="flex-shrink-0" />
                      <span>1 mistake immediately ends your run</span>
                    </div>
                    <div className="chess-bubble-item">
                      <Trophy size={14} color="#d97706" className="flex-shrink-0" />
                      <span>Difficulty ramps up as your streak grows</span>
                    </div>
                    <div className="chess-bubble-item">
                      <Zap size={14} color="#16653e" className="flex-shrink-0" />
                      <span>Earn 6-15 XP/puzzle (Easy: 6, Med: 10, Hard: 15)</span>
                    </div>
                    <div className="chess-bubble-item">
                      <Star size={14} color="#d97706" className="flex-shrink-0" />
                      <span>Streak bonuses: +10 XP at 5, +20 at 10, +30 at 20</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="puzzle-mode-avatar survival">
                <Flame size={24} />
              </div>
              <div className="puzzle-mode-info">
                <h3>Sudden Death Survival</h3>
                <p>1 mistake ends run • Dynamic difficulty</p>
              </div>
            </div>

            {/* Time Attack Blitz Mode Card */}
            <div 
              className="puzzle-mode-card"
              onClick={(e) => startMode('BLITZ', e)}
            >
              <button
                type="button"
                className="chess-mode-info-btn"
                title="Time Attack Blitz Rules & XP"
                aria-label="Time Attack Blitz Rules & XP"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveInfoBubble(prev => prev === 'BLITZ' ? null : 'BLITZ');
                }}
              >
                <span className="chess-info-icon-text">i</span>
              </button>

              {activeInfoBubble === 'BLITZ' && (
                <div className="chess-info-bubble" onClick={(e) => e.stopPropagation()}>
                  <div className="chess-bubble-arrow" />
                  <div className="chess-bubble-title">Time Attack Blitz Rules</div>
                  <div className="chess-bubble-list">
                    <div className="chess-bubble-item">
                      <Clock size={14} color="#d97706" className="flex-shrink-0" />
                      <span>Solve as many puzzles as possible in 3:00</span>
                    </div>
                    <div className="chess-bubble-item">
                      <Timer size={14} color="#b45309" className="flex-shrink-0" />
                      <span>+5s on solve • -10s on mistake • Skip (-15s)</span>
                    </div>
                    <div className="chess-bubble-item">
                      <Zap size={14} color="#16653e" className="flex-shrink-0" />
                      <span>Earn 6-15 XP per solved puzzle</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="puzzle-mode-avatar blitz">
                <Clock size={24} />
              </div>
              <div className="puzzle-mode-info">
                <h3>Time Attack Blitz</h3>
                <p>3:00 speedrun • Rapid fire tactics</p>
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
            <div className="puzzle-header-banner">
              {/* Row 1: Mode, Difficulty & Timer/Streak */}
              <div className="puzzle-header-meta-row">
                <div className="puzzle-header-mode-info">
                  <span className="puzzle-mode-label">
                    {gameMode === 'SURVIVAL' ? 'Survival' : 'Blitz'}
                  </span>
                  <span className={`puzzle-difficulty-badge puzzle-difficulty-badge--${getCurrentDifficultyTier().toLowerCase()}`}>
                    {getCurrentDifficultyTier()}
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

              {/* Row 2: Turn Indicator Dot & Objective Text + Far Right Step Counter (e.g. 0/2) */}
              <div className="puzzle-header-objective-row">
                <div className="puzzle-objective-left">
                  <div className={`puzzle-turn-indicator ${game?.turn() === 'w' ? 'white' : 'black'}`} />
                  <div className="puzzle-objective-text">
                    {(game?.turn() === 'w' ? 'White' : 'Black')} to move — {(currentPuzzle?.goal || '').toLowerCase().includes('mate') ? 'Find Checkmate' : 'Find the Winning Move'}
                  </div>
                </div>
                <div className="puzzle-step-counter">
                  {completedPlayerMoves}/{requiredPlayerMoves}
                </div>
              </div>
            </div>

            {/* Chess Board Grid */}
            <div className="board-outer-wrapper">
              {showExitModal && (
                <div className="modal-overlay">
                  <div className="tactile-exit-modal">
                    <div className="tactile-exit-icon">
                      <LogOut size={24} />
                    </div>
                    <h3 className="tactile-exit-title">Quit Puzzle Run?</h3>
                    <p className="tactile-exit-desc">Are you sure you want to quit? Exiting now will end your active streak and return to the menu.</p>
                    <div className="tactile-modal-actions">
                      <button type="button" className="tactile-modal-btn cancel" onClick={() => setShowExitModal(false)}>Keep Playing</button>
                      <button type="button" className="tactile-modal-btn confirm-danger" onClick={() => {
                        recordPuzzleRunEnd(gameMode, gameMode === 'SURVIVAL' ? sessionStreak : sessionSolvedCount);
                        setShowExitModal(false);
                        setGameMode(null);
                        setShowVictory(false);
                        setIsReviewing(false);
                      }}>Quit Run</button>
                    </div>
                  </div>
                </div>
              )}

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
              <div className="player-profile-left">
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
                  <div className="player-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span>{playerName}</span>
                  </div>
                  <div className="player-tagline">Lv.{level} • Puzzle #{sessionAttemptedCount}</div>
                </div>
              </div>

              {currentPuzzle?.theme && (
                <span className="puzzle-theme-tag">{currentPuzzle.theme}</span>
              )}
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

                  {gameMode === 'BLITZ' && status === 'playing' && (
                    <button
                      type="button"
                      className="puzzle-action-btn puzzle-skip-btn"
                      onClick={handleSkipPuzzle}
                      title="Skip Puzzle (-15s)"
                    >
                      <SkipForward size={15} /> Skip
                    </button>
                  )}
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
        isMinimized={isReviewing}
        onMinimizeChange={(minimized) => {
          setIsReviewing(minimized);
          if (!minimized) {
            setReviewingHistoryPuzzle(null);
          }
        }}
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
          setReviewingHistoryPuzzle(null);
        }}
        onPlayAgain={() => {
          setShowVictory(false);
          startMode(gameMode || 'SURVIVAL');
        }}
        onShowScreen={() => {
          // "Show Screen" now also enters review mode for the last puzzle
          setIsReviewing(true);
          setReviewingHistoryPuzzle(currentPuzzle);
        }}
        continueText="Back to Menu"
      >
        {/* Puzzle History List */}
        {sessionHistory.length > 0 && (
          <div className="puzzle-history-section">
            <div className="puzzle-history-heading">
              <List size={14} color="#b89f80" />
              <span>Puzzle History</span>
            </div>
            <div className="puzzle-history-list">
              {sessionHistory.map((attempt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`puzzle-history-row puzzle-history-row--${attempt.result}`}
                  onClick={() => {
                    loadPuzzle(attempt.puzzle);
                    setIsReviewing(true);
                    setReviewingHistoryPuzzle(attempt.puzzle);
                  }}
                  title={`Review puzzle #${idx + 1}`}
                >
                  <span className="puzzle-history-num">#{idx + 1}</span>
                  <span className="puzzle-history-status-icon">
                    {attempt.result === 'correct'
                      ? <CheckCircle2 size={14} color="#4ade80" />
                      : attempt.result === 'incorrect'
                        ? <XCircle size={14} color="#f87171" />
                        : <SkipForward size={14} color="#b89f80" />
                    }
                  </span>
                  <span className="puzzle-history-theme">
                    {attempt.puzzle?.theme || '—'}
                  </span>
                  <span className={`puzzle-history-diff puzzle-history-diff--${(attempt.puzzle?.difficultyLabel || 'Easy').toLowerCase()}`}>
                    {attempt.puzzle?.difficultyLabel || 'Easy'}
                  </span>
                  {attempt.result === 'correct' && attempt.xpGained > 0 && (
                    <span className="puzzle-history-xp">+{attempt.xpGained} XP</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </VictoryScreen>
    </div>
  );
}


