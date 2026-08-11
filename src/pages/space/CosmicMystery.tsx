import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPACE_OBJECTS_BY_SIZE } from '../../data/space-objects';
import { useGame } from '../../contexts/GameContext';
import VictoryScreen from '../../components/VictoryScreen';
import { 
  ArrowLeft, 
  Timer, 
  Trophy, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award,
  Heart,
  ShieldAlert,
  Flame,
  Info,
  Crown
} from 'lucide-react';
import './space.css';

interface SpaceObject {
  id: string;
  name: string;
  type: string;
  astronomicalType: string;
  iconType: string;
  typeDescription: string;
  diameter: string;
  orbitalOrder: string;
  funFact: string;
  img?: string;
  acceptedNames: string[];
}

interface Question {
  target: SpaceObject;
  clue: string;
  options: SpaceObject[];
}

type GameMode = 'SPRINT' | 'SURVIVAL';

const SPRINT_ROUNDS = 10;
const INITIAL_LIVES = 3;

const SPRINT_BEST_TIME_KEY = 'cosmic_mystery_sprint_best_time';
const SPRINT_BEST_CORRECT_KEY = 'cosmic_mystery_sprint_best_correct';
const SURVIVAL_HIGH_SCORE_KEY = 'cosmic_mystery_survival_high_score';
const SPRINT_HISTORY_KEY = 'cosmic_mystery_sprint_history';
const SURVIVAL_HISTORY_KEY = 'cosmic_mystery_survival_history';
const MAX_COMBO_KEY = 'cosmic_mystery_max_combo';

function sanitizeClue(clue: string, target: SpaceObject): string {
  let result = clue;
  const namesToHide = [target.name, ...target.acceptedNames];
  
  namesToHide.forEach(name => {
    if (!name || name.length < 2) return;
    const regex = new RegExp(`\\b${name}\\b`, 'gi');
    result = result.replace(regex, '___');
  });

  return result;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateSingleQuestion(usedIds: Set<string> = new Set()): Question {
  const availablePool = SPACE_OBJECTS_BY_SIZE.filter(obj => !usedIds.has(obj.id));
  const targetPool = availablePool.length > 0 ? availablePool : SPACE_OBJECTS_BY_SIZE;
  const target = targetPool[Math.floor(Math.random() * targetPool.length)];

  const sameCategoryDistractors = SPACE_OBJECTS_BY_SIZE.filter(
    (obj) => obj.id !== target.id && (
      obj.astronomicalType === target.astronomicalType || 
      obj.type === target.type
    )
  );

  const otherDistractors = SPACE_OBJECTS_BY_SIZE.filter(
    (obj) => obj.id !== target.id && !sameCategoryDistractors.includes(obj)
  );

  const distractorsPool = shuffleArray(sameCategoryDistractors).concat(
    shuffleArray(otherDistractors)
  );

  const chosenDistractors = distractorsPool.slice(0, 3);
  const options = shuffleArray([target, ...chosenDistractors]);
  const rawClue = target.funFact || target.typeDescription;
  const sanitized = sanitizeClue(rawClue, target);

  return {
    target,
    clue: sanitized,
    options
  };
}

function generateSprintQuestions(): Question[] {
  const shuffledPool = shuffleArray(SPACE_OBJECTS_BY_SIZE);
  const selectedTargets = shuffledPool.slice(0, SPRINT_ROUNDS);

  return selectedTargets.map((target) => {
    const sameCategoryDistractors = SPACE_OBJECTS_BY_SIZE.filter(
      (obj) => obj.id !== target.id && (
        obj.astronomicalType === target.astronomicalType || 
        obj.type === target.type
      )
    );

    const otherDistractors = SPACE_OBJECTS_BY_SIZE.filter(
      (obj) => obj.id !== target.id && !sameCategoryDistractors.includes(obj)
    );

    const distractorsPool = shuffleArray(sameCategoryDistractors).concat(
      shuffleArray(otherDistractors)
    );

    const chosenDistractors = distractorsPool.slice(0, 3);
    const options = shuffleArray([target, ...chosenDistractors]);
    const rawClue = target.funFact || target.typeDescription;
    const sanitized = sanitizeClue(rawClue, target);

    return {
      target,
      clue: sanitized,
      options
    };
  });
}

function formatTime(ms: number): string {
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

export default function CosmicMystery() {
  const navigate = useNavigate();
  const { addXp, recordActivity, streak, hasPlayedToday, botStats, recordCosmicMysteryRun } = useGame();

  const [mode, setMode] = useState<GameMode>('SPRINT');
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'FINISHED'>('START');
  const [activeInfoBubble, setActiveInfoBubble] = useState<'SPRINT' | 'SURVIVAL' | null>(null);

  // Question & Session State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Sprint Stats
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [penaltyMs, setPenaltyMs] = useState<number>(0);

  // Common & Survival Stats
  const [lives, setLives] = useState<number>(INITIAL_LIVES);
  const [score, setScore] = useState<number>(0);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [earnedXp, setEarnedXp] = useState<number>(0);

  // Personal Records
  const [sprintBestTime, setSprintBestTime] = useState<number | null>(() => {
    const saved = localStorage.getItem(SPRINT_BEST_TIME_KEY);
    return saved ? parseFloat(saved) : null;
  });

  const [sprintBestCorrect, setSprintBestCorrect] = useState<number | null>(() => {
    const saved = localStorage.getItem(SPRINT_BEST_CORRECT_KEY);
    if (saved) return parseInt(saved, 10);
    const timeSaved = localStorage.getItem(SPRINT_BEST_TIME_KEY);
    return timeSaved ? SPRINT_ROUNDS : null;
  });

  const [survivalHighScore, setSurvivalHighScore] = useState<number | null>(() => {
    const saved = localStorage.getItem(SURVIVAL_HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) : null;
  });

  const [sprintHistory, setSprintHistory] = useState<Array<{ time: number, correct: number, timestamp: number }>>(() => {
    try {
      const saved = localStorage.getItem(SPRINT_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [survivalHistory, setSurvivalHistory] = useState<Array<{ score: number, timestamp: number }>>(() => {
    try {
      const saved = localStorage.getItem(SURVIVAL_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [globalMaxCombo, setGlobalMaxCombo] = useState<number>(() => {
    const saved = localStorage.getItem(MAX_COMBO_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [currentCombo, setCurrentCombo] = useState(0);
  const [sessionMaxCombo, setSessionMaxCombo] = useState(0);
  const [isNewComboRecord, setIsNewComboRecord] = useState(false);

  // Sync Remote Account Data from GameContext (Supabase) if available
  useEffect(() => {
    const remoteData = (botStats as any)?.cosmicMystery;
    if (remoteData) {
      if (remoteData.sprintBestTime !== undefined && remoteData.sprintBestTime !== null) {
        setSprintBestTime(remoteData.sprintBestTime);
        localStorage.setItem(SPRINT_BEST_TIME_KEY, remoteData.sprintBestTime.toString());
      }
      if (remoteData.sprintBestCorrect !== undefined && remoteData.sprintBestCorrect !== null) {
        setSprintBestCorrect(remoteData.sprintBestCorrect);
        localStorage.setItem(SPRINT_BEST_CORRECT_KEY, remoteData.sprintBestCorrect.toString());
      }
      if (remoteData.survivalHighScore !== undefined && remoteData.survivalHighScore !== null) {
        setSurvivalHighScore(remoteData.survivalHighScore);
        localStorage.setItem(SURVIVAL_HIGH_SCORE_KEY, remoteData.survivalHighScore.toString());
      }
      if (Array.isArray(remoteData.sprintHistory)) {
        setSprintHistory(remoteData.sprintHistory);
        localStorage.setItem(SPRINT_HISTORY_KEY, JSON.stringify(remoteData.sprintHistory));
      }
      if (Array.isArray(remoteData.survivalHistory)) {
        setSurvivalHistory(remoteData.survivalHistory);
        localStorage.setItem(SURVIVAL_HISTORY_KEY, JSON.stringify(remoteData.survivalHistory));
      }
      if (remoteData.globalMaxCombo !== undefined && remoteData.globalMaxCombo !== null) {
        setGlobalMaxCombo(remoteData.globalMaxCombo);
        localStorage.setItem(MAX_COMBO_KEY, remoteData.globalMaxCombo.toString());
      }
    }
  }, [botStats]);

  const [isNewRecord, setIsNewRecord] = useState(false);
  const timerRef = useRef<number | null>(null);

  const startNewGame = useCallback((selectedMode: GameMode = mode) => {
    setMode(selectedMode);
    setSelectedOptionId(null);
    setIsAnswering(false);
    setElapsedMs(0);
    setPenaltyMs(0);
    setMistakesCount(0);
    setScore(0);
    setIsNewRecord(false);
    setEarnedXp(0);
    setUsedQuestionIds(new Set());
    setActiveInfoBubble(null);
    setCurrentCombo(0);
    setSessionMaxCombo(0);
    setIsNewComboRecord(false);

    if (selectedMode === 'SPRINT') {
      const qList = generateSprintQuestions();
      setQuestions(qList);
      setCurrentIndex(0);
      setCurrentQuestion(qList[0]);
      setStartTime(Date.now());
    } else {
      // SURVIVAL
      setLives(INITIAL_LIVES);
      const firstQ = generateSingleQuestion();
      setCurrentQuestion(firstQ);
      setUsedQuestionIds(new Set([firstQ.target.id]));
      setStartTime(Date.now());
    }

    setGameState('PLAYING');
  }, [mode]);

  useEffect(() => {
    if (gameState === 'PLAYING' && mode === 'SPRINT') {
      timerRef.current = window.setInterval(() => {
        if (startTime) {
          setElapsedMs(Date.now() - startTime);
        }
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, startTime, mode]);

  const handleSelectOption = (optionId: string) => {
    if (isAnswering || gameState !== 'PLAYING' || !currentQuestion) return;

    setIsAnswering(true);
    setSelectedOptionId(optionId);

    const isCorrect = optionId === currentQuestion.target.id;

    if (mode === 'SPRINT') {
      let nextScore = score;
      let nextMistakes = mistakesCount;

      if (isCorrect) {
        nextScore += 1;
        setScore(nextScore);
        const nextCombo = currentCombo + 1;
        setCurrentCombo(nextCombo);
        if (nextCombo > sessionMaxCombo) {
          setSessionMaxCombo(nextCombo);
        }
      } else {
        nextMistakes += 1;
        setMistakesCount(nextMistakes);
        setPenaltyMs(prev => prev + 3000);
        setCurrentCombo(0);
      }

      setTimeout(() => {
        if (currentIndex + 1 < SPRINT_ROUNDS) {
          const nextIdx = currentIndex + 1;
          setCurrentIndex(nextIdx);
          setCurrentQuestion(questions[nextIdx]);
          setSelectedOptionId(null);
          setIsAnswering(false);
        } else {
          finishSprintGame(nextScore, nextMistakes);
        }
      }, 450);

    } else {
      // SURVIVAL MODE
      let currentLives = lives;
      let nextScore = score;
      let nextMistakes = mistakesCount;

      if (isCorrect) {
        nextScore += 1;
        setScore(nextScore);
        const nextCombo = currentCombo + 1;
        setCurrentCombo(nextCombo);
        if (nextCombo > sessionMaxCombo) {
          setSessionMaxCombo(nextCombo);
        }
      } else {
        currentLives -= 1;
        nextMistakes += 1;
        setLives(currentLives);
        setMistakesCount(nextMistakes);
        setCurrentCombo(0);
      }

      setTimeout(() => {
        if (currentLives <= 0) {
          finishSurvivalGame(nextScore);
        } else {
          const nextQ = generateSingleQuestion(usedQuestionIds);
          setUsedQuestionIds(prev => new Set([...prev, nextQ.target.id]));
          setCurrentQuestion(nextQ);
          setSelectedOptionId(null);
          setIsAnswering(false);
        }
      }, 450);
    }
  };

  const finishSprintGame = (finalScore: number, finalMistakes: number) => {
    const finalElapsed = startTime ? Date.now() - startTime : elapsedMs;
    const finalPenalty = finalMistakes * 3000;
    const totalFinalTimeMs = finalElapsed + finalPenalty;

    setElapsedMs(finalElapsed);
    setGameState('FINISHED');

    let newBest = false;
    if (sprintBestTime === null || totalFinalTimeMs < sprintBestTime) {
      setSprintBestTime(totalFinalTimeMs);
      setSprintBestCorrect(finalScore);
      localStorage.setItem(SPRINT_BEST_TIME_KEY, totalFinalTimeMs.toString());
      localStorage.setItem(SPRINT_BEST_CORRECT_KEY, finalScore.toString());
      newBest = true;
      setIsNewRecord(true);
    } else if (sprintBestCorrect === null) {
      setSprintBestCorrect(finalScore);
      localStorage.setItem(SPRINT_BEST_CORRECT_KEY, finalScore.toString());
    }

    // Save max combo
    if (sessionMaxCombo > globalMaxCombo) {
      setGlobalMaxCombo(sessionMaxCombo);
      localStorage.setItem(MAX_COMBO_KEY, sessionMaxCombo.toString());
      setIsNewComboRecord(true);
    }

    // Save history
    const runInfo = { time: totalFinalTimeMs, correct: finalScore, timestamp: Date.now() };
    const updatedHistory = [runInfo, ...sprintHistory].slice(0, 3);
    setSprintHistory(updatedHistory);
    localStorage.setItem(SPRINT_HISTORY_KEY, JSON.stringify(updatedHistory));

    // Sync account record to GameContext / Supabase
    if (recordCosmicMysteryRun) {
      recordCosmicMysteryRun('SPRINT', { time: totalFinalTimeMs, correct: finalScore, maxCombo: sessionMaxCombo });
    }

    // XP: 1 per correct answer + 5 perfect bonus + 5 speed demon bonus (<30s)
    let xp = finalScore * 1;
    if (finalMistakes === 0) xp += 5;
    if (totalFinalTimeMs < 30000 && finalMistakes === 0) xp += 5;

    setEarnedXp(xp);
    if (addXp) addXp(xp);
    if (recordActivity) recordActivity();
  };

  const finishSurvivalGame = (finalScore: number) => {
    setGameState('FINISHED');

    let newBest = false;
    if (survivalHighScore === null || finalScore > survivalHighScore) {
      setSurvivalHighScore(finalScore);
      localStorage.setItem(SURVIVAL_HIGH_SCORE_KEY, finalScore.toString());
      newBest = true;
      setIsNewRecord(true);
    }

    // Save max combo
    if (sessionMaxCombo > globalMaxCombo) {
      setGlobalMaxCombo(sessionMaxCombo);
      localStorage.setItem(MAX_COMBO_KEY, sessionMaxCombo.toString());
      setIsNewComboRecord(true);
    }

    // Save history
    const runInfo = { score: finalScore, timestamp: Date.now() };
    const updatedHistory = [runInfo, ...survivalHistory].slice(0, 3);
    setSurvivalHistory(updatedHistory);
    localStorage.setItem(SURVIVAL_HISTORY_KEY, JSON.stringify(updatedHistory));

    // Sync account record to GameContext / Supabase
    if (recordCosmicMysteryRun) {
      recordCosmicMysteryRun('SURVIVAL', { score: finalScore, maxCombo: sessionMaxCombo });
    }

    // XP: 1 per correct answer + tier bonuses (e.g. +5 for 10+ score, +10 for 20+ score)
    let xp = finalScore * 1;
    if (finalScore >= 10) xp += 5;
    if (finalScore >= 20) xp += 10;

    setEarnedXp(xp);
    if (addXp) addXp(xp);
    if (recordActivity) recordActivity();
  };

  const totalTimeMs = elapsedMs + penaltyMs;

  return (
    <div className="space-module-page">
      {/* Navigation Header - Strict Sub-page header rule: back button + title only (NO streak/level widget) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button 
          onClick={() => {
            if (gameState === 'PLAYING') {
              setGameState('START');
            } else {
              navigate('/space?tab=play');
            }
          }} 
          title="Back"
          aria-label="Back"
          className="cosmic-back-btn"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="cosmic-header-icon">
            <Zap size={18} color="#38bdf8" />
          </div>
          <h1 className="space-page-title" style={{ margin: 0, color: '#f1f5f9', fontSize: '1.3rem', fontWeight: 900 }}>
            Cosmic Mystery
          </h1>
        </div>
      </div>

      {gameState === 'START' && (
        <div className="cosmic-start-container">
          <div className="cosmic-banner-card">
            <div className="cosmic-banner-icon">
              <Sparkles size={36} color="#38bdf8" />
            </div>
            <h2 className="cosmic-banner-title">Cosmic Mystery Cards</h2>
            <p className="cosmic-banner-desc">
              Identify celestial bodies from tricky 4-option cards! Choose your mode and set a new personal record.
            </p>

            {/* Click catcher full screen overlay for speech bubbles dismissal */}
            {activeInfoBubble && (
              <div 
                className="cosmic-bubble-catcher"
                onClick={() => setActiveInfoBubble(null)}
              />
            )}

            {/* Mode Selection Cards */}
            <div className="cosmic-mode-select-grid">
              {/* Sprint Mode Card */}
              <div 
                className={`cosmic-mode-card ${mode === 'SPRINT' ? 'active-mode' : ''}`}
                onClick={() => setMode('SPRINT')}
              >
                <button
                  className="mode-info-btn"
                  title="10-Card Sprint Rules"
                  aria-label="10-Card Sprint Rules"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfoBubble(prev => prev === 'SPRINT' ? null : 'SPRINT');
                  }}
                >
                  <span className="mode-info-icon-text">i</span>
                </button>

                {/* Inline Speech Bubble */}
                {activeInfoBubble === 'SPRINT' && (
                  <div className="cosmic-info-bubble" onClick={(e) => e.stopPropagation()}>
                    <div className="cosmic-bubble-arrow" />
                    <div className="cosmic-bubble-title">10-Card Sprint Rules</div>
                    <div className="cosmic-bubble-list">
                      <div className="cosmic-bubble-item">
                        <Timer size={14} color="#38bdf8" className="flex-shrink-0" />
                        <span>Race against the clock across 10 rounds</span>
                      </div>
                      <div className="cosmic-bubble-item">
                        <Trophy size={14} color="#ffb400" className="flex-shrink-0" />
                        <span>Wrong choices add +3s penalty time</span>
                      </div>
                      <div className="cosmic-bubble-item">
                        <Zap size={14} color="#22c55e" className="flex-shrink-0" />
                        <span>Earn XP for speed and perfect accuracy</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mode-card-header">
                  <div className="mode-icon-box sprint-icon">
                    <Timer size={20} color="#38bdf8" />
                  </div>
                  <div>
                    <h3 className="mode-title">10-Card Sprint</h3>
                    <span className="mode-sub">Speedrun 10 rounds</span>
                  </div>
                </div>
                <div className="mode-record-pill">
                  {sprintBestCorrect === SPRINT_ROUNDS ? (
                    <Crown size={14} color="#ffb400" fill="#ffb400" />
                  ) : (
                    <Award size={14} color="#ffb400" />
                  )}
                  <span>
                    Best Time: {sprintBestTime !== null 
                      ? `${formatTime(sprintBestTime)}${sprintBestCorrect !== null ? ` (${Math.round((sprintBestCorrect / SPRINT_ROUNDS) * 100)}%)` : ''}` 
                      : '--:--'}
                  </span>
                </div>

                {sprintHistory.length > 0 && (
                  <div className="mode-history-section" onClick={(e) => e.stopPropagation()}>
                    <div className="history-title">Recent Runs</div>
                    <div className="history-pills">
                      {sprintHistory.map((run, idx) => (
                        <div key={idx} className={`history-pill ${run.correct === SPRINT_ROUNDS ? 'flawless' : ''}`}>
                          {run.correct === SPRINT_ROUNDS ? (
                            <Crown size={10} color="#22c55e" fill="#22c55e" />
                          ) : (
                            <Timer size={10} color="#cbd5e1" />
                          )}
                          <span>{formatTime(run.time)} ({Math.round((run.correct / SPRINT_ROUNDS) * 100)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  className="cosmic-btn-primary" 
                  style={{ marginTop: 10, padding: '10px 14px', fontSize: '0.88rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    startNewGame('SPRINT');
                  }}
                >
                  Play 10-Card Sprint
                </button>
              </div>

              {/* Survival Mode Card */}
              <div 
                className={`cosmic-mode-card ${mode === 'SURVIVAL' ? 'active-mode' : ''}`}
                onClick={() => setMode('SURVIVAL')}
              >
                <button
                  className="mode-info-btn"
                  title="Endless Survival Rules"
                  aria-label="Endless Survival Rules"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfoBubble(prev => prev === 'SURVIVAL' ? null : 'SURVIVAL');
                  }}
                >
                  <span className="mode-info-icon-text">i</span>
                </button>

                {/* Inline Speech Bubble */}
                {activeInfoBubble === 'SURVIVAL' && (
                  <div className="cosmic-info-bubble" onClick={(e) => e.stopPropagation()}>
                    <div className="cosmic-bubble-arrow" />
                    <div className="cosmic-bubble-title">Endless Survival Rules</div>
                    <div className="cosmic-bubble-list">
                      <div className="cosmic-bubble-item">
                        <Heart size={14} color="#ef4444" fill="#ef4444" className="flex-shrink-0" />
                        <span>Start with 3 lives and answer endless cards</span>
                      </div>
                      <div className="cosmic-bubble-item">
                        <ShieldAlert size={14} color="#ef4444" className="flex-shrink-0" />
                        <span>Wrong choices deduct 1 life</span>
                      </div>
                      <div className="cosmic-bubble-item">
                        <Zap size={14} color="#22c55e" className="flex-shrink-0" />
                        <span>Earn bonus XP for high scores (10+ & 20+ pts)</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mode-card-header">
                  <div className="mode-icon-box survival-icon">
                    <Heart size={20} color="#ef4444" fill="#ef4444" />
                  </div>
                  <div>
                    <h3 className="mode-title">Endless Survival</h3>
                    <span className="mode-sub">3 Lives, endless cards</span>
                  </div>
                </div>
                <div className="mode-record-pill">
                  <Trophy size={14} color="#ffb400" />
                  <span>
                    High Score: {survivalHighScore !== null 
                      ? `${survivalHighScore} pts (${survivalHighScore + INITIAL_LIVES} cards, ${Math.round((survivalHighScore / (survivalHighScore + INITIAL_LIVES)) * 100)}% acc)` 
                      : '-- pts'}
                  </span>
                </div>
                {globalMaxCombo > 0 && (
                  <div className="mode-record-pill" style={{ marginTop: 4, background: '#161936', border: '1.5px solid #e8805a', color: '#ff6a00' }}>
                    <Flame size={14} color="#ff6a00" fill="#ff6a00" />
                    <span>Max Streak: {globalMaxCombo}</span>
                  </div>
                )}

                {survivalHistory.length > 0 && (
                  <div className="mode-history-section" onClick={(e) => e.stopPropagation()}>
                    <div className="history-title">Recent Runs</div>
                    <div className="history-pills">
                      {survivalHistory.map((run, idx) => {
                        const totalCards = run.score + INITIAL_LIVES;
                        const acc = Math.round((run.score / totalCards) * 100);
                        return (
                          <div key={idx} className="history-pill">
                            <Heart size={10} color="#ef4444" fill="#ef4444" />
                            <span>{run.score} pts ({totalCards} cards, {acc}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button 
                  className="cosmic-btn-primary"
                  style={{ marginTop: 10, padding: '10px 14px', fontSize: '0.88rem', background: '#e11d48', borderColor: '#fb7185', boxShadow: '0 4px 0 #9f1239' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    startNewGame('SURVIVAL');
                  }}
                >
                  Play Endless Survival
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === 'PLAYING' && currentQuestion && (
        <div className="cosmic-play-container">
          {/* Header Stats Bar */}
          <div className="cosmic-game-bar">
            {currentCombo > 1 && (
              <div className="cosmic-combo-badge" style={{ marginRight: 'auto' }}>
                <Flame size={16} color="#ff6a00" fill="#ff6a00" />
                <span>{currentCombo} Streak!</span>
              </div>
            )}
            {mode === 'SPRINT' ? (
              <>
                <div className="cosmic-round-badge">
                  Card {currentIndex + 1} / {SPRINT_ROUNDS}
                </div>

                <div className="cosmic-timer-badge">
                  <Timer size={16} color="#38bdf8" />
                  <span>{formatTime(totalTimeMs)}</span>
                  {penaltyMs > 0 && (
                    <span className="cosmic-penalty-text">+{penaltyMs / 1000}s</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="cosmic-round-badge" style={{ color: '#38bdf8' }}>
                  Score: <strong>{score} pts</strong>
                </div>

                <div className="cosmic-lives-badge">
                  {[...Array(INITIAL_LIVES)].map((_, i) => (
                    <Heart
                      key={i}
                      size={18}
                      color={i < lives ? '#ef4444' : '#64748b'}
                      fill={i < lives ? '#ef4444' : '#334155'}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mystery Clue Card */}
          <div className="cosmic-clue-card">
            <div className="cosmic-clue-header">
              <HelpCircle size={20} color="#38bdf8" />
              <span>Mystery Celestial Clue</span>
            </div>
            <p className="cosmic-clue-text">
              "{currentQuestion.clue}"
            </p>
            <div className="cosmic-clue-tag">
              Type: <strong>{currentQuestion.target.type}</strong>
            </div>
          </div>

          {/* 4 Tricky Options Grid */}
          <div className="cosmic-options-grid">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isTarget = opt.id === currentQuestion.target.id;

              let btnClass = 'cosmic-option-btn';
              if (isAnswering) {
                if (isSelected) {
                  btnClass += isTarget ? ' option-correct' : ' option-wrong';
                } else if (isTarget && selectedOptionId !== null) {
                  btnClass += ' option-correct-reveal';
                } else {
                  btnClass += ' option-dimmed';
                }
              }

              return (
                <button
                  key={opt.id}
                  className={btnClass}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={isAnswering}
                >
                  <span className="cosmic-option-name">{opt.name}</span>
                  <span className="cosmic-option-sub">{opt.astronomicalType}</span>
                  
                  {isAnswering && isSelected && isTarget && (
                    <CheckCircle2 size={20} color="#ffffff" className="cosmic-option-icon" />
                  )}
                  {isAnswering && isSelected && !isTarget && (
                    <XCircle size={20} color="#ffffff" className="cosmic-option-icon" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reusable Space Victory Screen */}
      <VictoryScreen
        isOpen={gameState === 'FINISHED'}
        theme="space"
        title={
          isNewRecord 
            ? "New Personal Best!" 
            : (mode === 'SPRINT' ? "Sprint Completed!" : "Survival Over!")
        }
        xpGained={earnedXp}
        streak={streak}
        hasPlayedToday={hasPlayedToday}
        onContinue={() => setGameState('START')}
        onPlayAgain={() => startNewGame(mode)}
        continueText="Back to Menu"
        hideShowScreen={true}
      >
        <div className="cosmic-victory-summary">
          {mode === 'SPRINT' ? (
            <>
              <div className="cosmic-summary-stat">
                <span className="stat-label">Total Time</span>
                <span className="stat-value">{formatTime(totalTimeMs)}</span>
              </div>
              <div className="cosmic-summary-stat">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">{score} / {SPRINT_ROUNDS}</span>
              </div>
              <div className="cosmic-summary-stat">
                <span className="stat-label" style={isNewComboRecord ? { color: '#ff6a00', fontWeight: 'bold' } : {}}>
                  {isNewComboRecord ? '🔥 New Max Streak!' : 'Max Streak'}
                </span>
                <span className="stat-value" style={isNewComboRecord ? { color: '#ff6a00', fontWeight: 'bold' } : {}}>
                  {sessionMaxCombo}
                </span>
              </div>
              <div className="cosmic-summary-stat">
                <span className="stat-label">Penalties</span>
                <span className="stat-value">+{penaltyMs / 1000}s</span>
              </div>
            </>
          ) : (
            <>
              <div className="cosmic-summary-stat">
                <span className="stat-label">Final Score</span>
                <span className="stat-value">{score} pts</span>
              </div>
              <div className="cosmic-summary-stat">
                <span className="stat-label">High Score</span>
                <span className="stat-value">{survivalHighScore ?? score} pts</span>
              </div>
              <div className="cosmic-summary-stat">
                <span className="stat-label" style={isNewComboRecord ? { color: '#ff6a00', fontWeight: 'bold' } : {}}>
                  {isNewComboRecord ? '🔥 New Max Streak!' : 'Max Streak'}
                </span>
                <span className="stat-value" style={isNewComboRecord ? { color: '#ff6a00', fontWeight: 'bold' } : {}}>
                  {sessionMaxCombo}
                </span>
              </div>
              <div className="cosmic-summary-stat">
                <span className="stat-label">Mistakes</span>
                <span className="stat-value">{INITIAL_LIVES - lives}</span>
              </div>
            </>
          )}
        </div>
      </VictoryScreen>
    </div>
  );
}
