import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Flame, Star, ArrowLeft, Heart, Clock, Lightbulb, Zap, RefreshCw, Trophy, ArrowRight, X, HelpCircle, Info, Sun, Globe, Moon, Sparkles, Ruler, Compass, Delete, Eye } from 'lucide-react';
import { SPACE_OBJECTS_BY_SIZE, getMnemonicUpToIndex } from '../../data/space-objects';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import VictoryScreen from '../../components/VictoryScreen';
import HeartCrackIcon from '../../components/icons/HeartCrackIcon';
import './space.css';

const DIFFICULTIES = {
  easy: { name: 'Easy', count: 8, label: 'Top 8 (Sun → Mars)', xp: 10, maxLives: 3 },
  medium: { name: 'Medium', count: 15, label: 'Top 15 (Sun → Europa)', xp: 20, maxLives: 4 },
  hard: { name: 'Hard', count: 35, label: 'All 35 (Sun → Salacia)', xp: 30, maxLives: 5 }
};

function getTypeIcon(iconType, size = 16) {
  switch (iconType) {
    case 'star':
      return <Sun size={size} color="#ffb74d" />;
    case 'gas-giant':
    case 'ice-giant':
      return <Globe size={size} color="#38bdf8" />;
    case 'terrestrial':
      return <Globe size={size} color="#4ade80" />;
    case 'moon':
      return <Moon size={size} color="#e2e8f0" />;
    case 'dwarf':
      return <Sparkles size={size} color="#f43f5e" />;
    default:
      return <Globe size={size} color="#38bdf8" />;
  }
}

function SafeObjectImage({ src, alt, iconType, className, size = 26 }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  if (!src || imgError) {
    return <span className="illum-fallback-icon">{getTypeIcon(iconType, size)}</span>;
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setImgError(true)} 
    />
  );
}

export default function IlluminateSystem() {
  const navigate = useNavigate();
  const location = useLocation();
  const { level: userLevel, streak, hasPlayedToday, addXP, addXp, recordActivity, illuminateStats, recordIlluminateTime } = useGame();
  const { user } = useAuth();

  const personalBests = illuminateStats || {};
  
  const [level, setLevel] = useState(null);
  const [gameData, setGameData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isError, setIsError] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameOverMinimized, setIsGameOverMinimized] = useState(false);
  const [lives, setLives] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [userUsedHint, setUserUsedHint] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [showHintBubble, setShowHintBubble] = useState(false);
  const [currentObjectHint, setCurrentObjectHint] = useState(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [scoreData, setScoreData] = useState({ hintsUsed: 0, startTime: null, endTime: null });
  const [selectedCard, setSelectedCard] = useState(null);
  const [discoveryShown, setDiscoveryShown] = useState(false);
  const [discoveryTriggered, setDiscoveryTriggered] = useState(false);
  const inputRef = useRef(null);

  // Auto-start level if URL param or location state is provided
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paramLevel = location.state?.level || searchParams.get('level');
    if (paramLevel && DIFFICULTIES[paramLevel] && !level) {
      startGame(paramLevel);
    } else if (!paramLevel && !level) {
      navigate('/space/objects-by-size', { replace: true });
    }
  }, [location, level, navigate]);

  // Live Timer Effect
  useEffect(() => {
    let timer;
    if (level && !isComplete && !isGameOver) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [level, isComplete, isGameOver]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const scrollToCurrentPlanet = () => {
    setTimeout(() => {
      const el = document.getElementById(`planet-${currentIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  useEffect(() => {
    if (level && !isComplete && !isGameOver) {
      scrollToCurrentPlanet();
    }
  }, [currentIndex, level, isComplete, isGameOver]);

  // Discovery cue: show subtle pulse when first world (Sun) is revealed
  useEffect(() => {
    if (currentIndex === 1 && !discoveryTriggered) {
      setDiscoveryTriggered(true);
    }
  }, [currentIndex, discoveryTriggered]);

  useEffect(() => {
    if (!discoveryTriggered) return;
    setDiscoveryShown(true);
    const timer = setTimeout(() => setDiscoveryShown(false), 4500);
    return () => clearTimeout(timer);
  }, [discoveryTriggered]);

  const startGame = (diffLevel) => {
    setLevel(diffLevel);
    setGameData(SPACE_OBJECTS_BY_SIZE.slice(0, DIFFICULTIES[diffLevel].count));
    setCurrentIndex(0);
    setWrongAttempts(0);
    setInputValue('');
    setIsComplete(false);
    setIsGameOver(false);
    setIsGameOverMinimized(false);
    setLives(DIFFICULTIES[diffLevel].maxLives);
    setElapsedTime(0);
    setUserUsedHint(false);
    setHintsLeft(3);
    setShowHintBubble(false);
    setCurrentObjectHint(null);
    setIsNewRecord(false);
    setSelectedCard(null);
    setDiscoveryShown(false);
    setDiscoveryTriggered(false);
    setScoreData({ hintsUsed: 0, startTime: Date.now(), endTime: null });
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
      scrollToCurrentPlanet();
    }, 100);
  };

  const submitAnswer = (guess = inputValue) => {
    if (!guess.trim() || isComplete || isGameOver) return;

    const currentObject = gameData[currentIndex];
    const userGuess = guess.trim().toLowerCase();
    
    // Check if guess matches any accepted names
    const isCorrect = currentObject.acceptedNames.some(name => userGuess === name);

    if (isCorrect) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setInputValue('');
      setWrongAttempts(0);
      setIsError(false);
      setUserUsedHint(false);
      setShowHintBubble(false);
      setCurrentObjectHint(null);

      if (nextIndex >= gameData.length) {
        // Game complete
        setIsComplete(true);
        setScoreData(prev => ({ ...prev, endTime: Date.now() }));
        
        // Record streak activity & daily played date
        if (recordActivity) {
          recordActivity();
        }

        // Personal Best Record Check & Supabase Sync
        const isNew = recordIlluminateTime(level, elapsedTime);
        if (isNew) {
          setIsNewRecord(true);
        }

        let xpReward = DIFFICULTIES[level]?.xp || 10;
        if (level === 'hard' && scoreData.hintsUsed === 0) {
          xpReward += 10; // Bonus for perfect hard
        }
        if (addXP) {
          addXP(xpReward);
        } else if (addXp) {
          addXp(xpReward);
        }
      }
    } else {
      setIsError(true);
      setWrongAttempts(prev => prev + 1);
      setTimeout(() => setIsError(false), 500);

      // Deduct Life
      const remainingLives = lives - 1;
      setLives(remainingLives);

      if (remainingLives <= 0) {
        setIsGameOver(true);
        // Award partial XP for progress made
        if (currentIndex > 0) {
          addXp(Math.max(1, Math.floor(currentIndex * 0.5)));
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitAnswer(inputValue);
  };

  const handleVirtualKey = (char) => {
    if (isComplete || isGameOver) return;
    setInputValue(prev => prev + char);
  };

  const handleVirtualBackspace = () => {
    if (isComplete || isGameOver) return;
    setInputValue(prev => prev.slice(0, -1));
  };

  const handleUseHint = () => {
    if (isComplete || isGameOver) return;
    setShowHintBubble(prev => !prev);
  };

  const dismissDiscovery = () => {
    setDiscoveryShown(false);
  };

  const handleApplyNextLetter = () => {
    if (isComplete || isGameOver || hintsLeft <= 0) return;
    const currentObj = gameData[currentIndex];
    if (!currentObj) return;
    const targetName = currentObj.name.split(' ')[0].toUpperCase();

    const currentRevealed = currentObjectHint?.revealedLetters || '';
    if (currentRevealed.length >= targetName.length) return;

    const typed = inputValue.toUpperCase();

    let i = currentRevealed.length;
    while (i < typed.length && i < targetName.length && typed.charAt(i) === targetName.charAt(i)) {
      i++;
    }

    let nextLength;
    if (i < typed.length && i < targetName.length) {
      nextLength = i + 1;
    } else {
      nextLength = Math.min(targetName.length, Math.max(currentRevealed.length, typed.length) + 1);
    }

    if (nextLength <= currentRevealed.length) return;

    const nextLetters = targetName.substring(0, nextLength);

    setHintsLeft(prev => prev - 1);
    setUserUsedHint(true);
    setScoreData(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    setCurrentObjectHint(prev => ({
      ...prev,
      revealedLetters: nextLetters
    }));
  };

  const handleApplyMnemonic = () => {
    if (isComplete || isGameOver || hintsLeft <= 0 || currentObjectHint?.mnemonicText) return;
    const lineProgress = getMnemonicUpToIndex(currentIndex);

    setHintsLeft(prev => prev - 1);
    setUserUsedHint(true);
    setScoreData(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    setCurrentObjectHint(prev => ({
      ...prev,
      mnemonicText: lineProgress
    }));
  };

  useEffect(() => {
    if (!level || isComplete || isGameOver) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        setInputValue(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        submitAnswer(inputValue);
      } else if (e.key === ' ') {
        e.preventDefault();
        setInputValue(prev => prev + ' ');
      } else if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
        setInputValue(prev => prev + e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [level, isComplete, isGameOver, currentIndex, inputValue, gameData]);

  // Derived hint
  let currentHint = null;
  if (level && !isComplete && !isGameOver) {
    const targetName = gameData[currentIndex].name.split(' ')[0];
    if (userUsedHint || wrongAttempts >= 3) {
      currentHint = targetName.substring(0, 1) + '...';
    }
  }

  // Reset hint tracking when index changes
  useEffect(() => {
    setScoreData(prev => ({ ...prev, countedHintForCurrent: false }));
  }, [currentIndex]);

  const getGlowClass = (type) => {
    if (type.includes('Star')) return 'illum-glow-star';
    if (type.includes('Planet') && !type.includes('Dwarf')) return 'illum-glow-planet';
    if (type.includes('Moon')) return 'illum-glow-moon';
    return 'illum-glow-dwarf';
  };

  const getRelativeSize = (index) => {
    // Basic scaling: 1.2 to 0.4 based on index out of 35
    const minScale = 0.4;
    const maxScale = 1.2;
    const ratio = index / 35; 
    return maxScale - (ratio * (maxScale - minScale));
  };

  if (!level) {
    return (
      <div className="space-module-page ss-dark-theme">
        {/* Navigation Header */}
        <div className="space-nav-header" style={{ marginBottom: 16 }}>
          <div className="space-header-left">
            <button 
              onClick={() => navigate('/space/objects-by-size')} 
              title="Back"
              aria-label="Back"
              style={{
                background: '#161936',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 3px 0 #0b0d1e',
                borderRadius: 14,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                fontSize: '1.1rem', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#161936', borderRadius: 10,
                boxShadow: '0 2px 0 #0b0d1e'
              }}>
                <Lightbulb size={20} color="#ffb74d" />
              </div>
              <h1 className="space-page-title" style={{ margin: 0, color: '#ffffff', fontSize: '1.35rem', fontWeight: 900 }}>
                Illuminate the System
              </h1>
            </div>
          </div>
        </div>

        {/* Section Heading & Subtitle */}
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#ffffff', fontWeight: 800, marginTop: 12, marginBottom: 4 }}>Select Difficulty</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.88rem', lineHeight: '1.4', margin: '0 0 16px', fontWeight: 500 }}>
          Type the names of the objects in order from <strong style={{ color: '#00e5ff' }}>LARGEST</strong> to <strong style={{ color: '#ffb74d' }}>SMALLEST</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(DIFFICULTIES).map(([key, diff]) => (
            <div 
              key={key} 
              className="space-card-item"
              onClick={() => startGame(key)}
              style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                color: '#fff', background: '#161936', borderRadius: 16,
                padding: '12px 16px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 4px 0 #0b0d1e',
                border: '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}
            >
              <div className="space-card-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.2 }}>{diff.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {Array.from({ length: diff.maxLives }).map((_, i) => (
                      <Heart key={i} size={13} fill="#ff4d4d" color="#ff4d4d" />
                    ))}
                  </div>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', opacity: 0.9, fontWeight: 500, lineHeight: 1.2 }}>{diff.label}</p>
              </div>

              {/* Sleek Right Arrow Badge */}
              <div style={{
                position: 'relative', zIndex: 1,
                width: 32, height: 32,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.16)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <ArrowRight size={16} strokeWidth={2.5} color="#ffffff" />
              </div>
            </div>
          ))}
        </div>

        {/* System Records & Personal Bests Box */}
        <div style={{ marginTop: 24, padding: 16, background: '#161936', borderRadius: 18, border: '2px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 4px 0 #0b0d1e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1rem', color: '#ffffff', marginBottom: 12 }}>
            <Trophy size={20} color="#d97706" /> Best Time Records
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {Object.entries(DIFFICULTIES).map(([key, diff]) => {
              const pbTime = personalBests[key];
              return (
                <div 
                  key={key} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    padding: '10px 8px',
                    textAlign: 'center',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 800 }}>
                    {diff.name}
                  </div>
                  <div style={{ fontSize: '1.05rem', color: pbTime !== undefined ? '#00e5ff' : 'rgba(255, 255, 255, 0.4)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Zap size={14} color={pbTime !== undefined ? '#ffb300' : '#888'} />
                    {pbTime !== undefined ? formatTime(pbTime) : '--:--'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-module-page ss-dark-theme illum-game-container">
      {/* Header Container with Separated Back Button & Space Title Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexShrink: 0 }}>
        {/* Separated Back Button */}
        <button 
          onClick={() => navigate('/space/objects-by-size')} 
          title="Back to Objects by Size"
          aria-label="Back to Objects by Size"
          style={{
            background: '#161936',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 3px 0 #0b0d1e',
            borderRadius: 14,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>

        {/* Space Title Banner Rectangle */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #161936 0%, #0b0d1e 100%)',
          borderRadius: 16,
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 0 #0b0d1e',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <h1 style={{
            margin: 0, color: '#ffffff', fontSize: '1.2rem',
            fontFamily: 'var(--font-heading)', fontWeight: 900
          }}>
            Illuminate the System
          </h1>
        </div>
      </div>

      {/* Top Game Stats Bar (Timer, Progress, Lives, Hint Btn) */}
      <div className="illum-stats-bar">
        <div className="illum-stat-item">
          <CheckCircle size={16} color="#4caf50" />
          <span>{currentIndex}/{gameData.length}</span>
        </div>

        <div className="illum-stat-item">
          <Clock size={16} color="#00e5ff" />
          <span>{formatTime(elapsedTime)}</span>
        </div>

        <div className="illum-stat-item illum-hearts-item">
          {Array.from({ length: DIFFICULTIES[level].maxLives }).map((_, i) => (
            <Heart 
              key={i} 
              size={16} 
              fill={i < lives ? '#ff4d4d' : 'rgba(255,255,255,0.1)'} 
              color={i < lives ? '#ff4d4d' : '#555'} 
            />
          ))}
        </div>

        {/* Hint Button & Interactive Speech Bubble Container */}
        <div style={{ position: 'relative' }}>
          {/* Interactive Speech Bubble attached directly BELOW Hint button */}
          {showHintBubble && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              background: '#161936',
              border: '2px solid #2d3264',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.65)',
              borderRadius: 16,
              padding: '12px 14px',
              color: '#ffffff',
              zIndex: 100,
              width: 230,
              animation: 'fadeIn 0.15s ease-out'
            }}>
              {/* Pointer Arrow pointing UP to Hint button */}
              <div style={{
                position: 'absolute',
                top: -6,
                right: 22,
                width: 10,
                height: 10,
                background: '#161936',
                borderTop: '2px solid #2d3264',
                borderLeft: '2px solid #2d3264',
                transform: 'rotate(45deg)'
              }} />

              {/* Bubble Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 900, color: '#ffb74d' }}>
                  <Lightbulb size={14} color="#ffb74d" />
                  <span>Choose Clue ({hintsLeft} left)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHintBubble(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 6,
                    color: '#ffffff',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Active Clues List (if any unlocked for current object) */}
              {currentObjectHint && (currentObjectHint.revealedLetters || currentObjectHint.mnemonicText) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: hintsLeft > 0 ? 10 : 0 }}>
                  {currentObjectHint.revealedLetters && (
                    <div style={{
                      background: 'rgba(255,255,255,0.07)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      fontSize: '0.78rem',
                      color: '#e2e8f0',
                      border: '1px solid rgba(255,255,255,0.12)',
                      lineHeight: 1.35
                    }}>
                      Letter: "{currentObjectHint.revealedLetters}"
                    </div>
                  )}

                  {currentObjectHint.mnemonicText && (
                    <div style={{
                      background: 'rgba(255,255,255,0.07)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      fontSize: '0.78rem',
                      color: '#e2e8f0',
                      border: '1px solid rgba(255,255,255,0.12)',
                      lineHeight: 1.35
                    }}>
                      Mnemonic: "{currentObjectHint.mnemonicText}"
                    </div>
                  )}
                </div>
              )}

              {/* Available Action Buttons (if hints remaining) */}
              {hintsLeft > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Reveal Letter / Next Letter Button */}
                  {(() => {
                    const currentObj = gameData[currentIndex];
                    const targetName = currentObj ? currentObj.name.split(' ')[0] : '';
                    const revealedCount = currentObjectHint?.revealedLetters?.length || 0;
                    if (revealedCount < targetName.length) {
                      return (
                        <button
                          type="button"
                          onClick={handleApplyNextLetter}
                          style={{
                            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            border: '1.5px solid #38bdf8',
                            boxShadow: '0 2px 0 #0369a1',
                            borderRadius: 12,
                            padding: '9px 12px',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {revealedCount > 0 ? 'Reveal Next Letter' : 'Reveal Letter'}
                        </button>
                      );
                    }
                    return null;
                  })()}

                  {/* Mnemonic Button (if not yet unlocked for this object) */}
                  {!currentObjectHint?.mnemonicText && (
                    <button
                      type="button"
                      onClick={handleApplyMnemonic}
                      style={{
                        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                        border: '1.5px solid #fbbf24',
                        boxShadow: '0 2px 0 #78350f',
                        borderRadius: 12,
                        padding: '9px 12px',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      Mnemonic
                    </button>
                  )}
                </div>
              ) : (
                !currentObjectHint?.revealedLetters && !currentObjectHint?.mnemonicText && (
                  <div style={{ fontSize: '0.78rem', color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 4 }}>
                    No hints remaining for this game.
                  </div>
                )
              )}
            </div>
          )}

          <button 
            className={`illum-hint-btn ${hintsLeft <= 0 ? 'used' : ''}`}
            onClick={handleUseHint}
            disabled={isComplete || isGameOver}
          >
            <Lightbulb size={14} color={hintsLeft > 0 ? '#ffb74d' : '#888'} />
            <span>Hint ({hintsLeft})</span>
          </button>
        </div>
      </div>

      {/* Grid Box Container */}
      <div className="illum-grid-container">
        {discoveryShown && (
          <div className="illum-discovery-pulse" aria-hidden="true" />
        )}
        <div className="illum-grid">
          {gameData.map((obj, i) => {
            const isRevealed = i < currentIndex;
            const isCurrent = i === currentIndex;
            const glowClass = getGlowClass(obj.type);
            const scale = getRelativeSize(i);
            const isFirstRevealed = isRevealed && i === 0 && currentIndex === 1;

            return (
              <div 
                key={obj.id} 
                id={`planet-${i}`}
                className={`illum-circle-wrapper ${isCurrent ? 'illum-current' : ''} ${isRevealed ? 'revealed-item' : 'unrevealed-item'} ${isFirstRevealed ? 'illum-first-revealed' : ''}`}
                onClick={() => {
                  if (isRevealed) {
                    setSelectedCard({ obj, index: i });
                    dismissDiscovery();
                  }
                }}
                style={{ cursor: isRevealed ? 'pointer' : 'default' }}
                title={isRevealed ? `Tap for mini facts about this world` : ''}
              >
                <div 
                  className={`illum-circle ${isRevealed ? glowClass : 'illum-shadow'} ${isRevealed ? 'revealed' : ''}`}
                  style={{ transform: `scale(${scale})` }}
                >
                  {isRevealed ? (
                    <SafeObjectImage 
                      src={obj.img} 
                      alt={obj.name} 
                      iconType={obj.iconType} 
                      className="illum-img" 
                    />
                  ) : null}
                </div>
                {isRevealed ? (
                  <div className="illum-name">{obj.name.split(' ')[0]}</div>
                ) : (
                  <div className="illum-unrevealed-label">
                    {`#${i + 1}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple Inline Input Display Bar & Custom Keyboard */}
      {!isComplete && !isGameOver && (
        <>
          <div className="illum-input-area">
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                readOnly
                inputMode="none"
                placeholder="Type answer..."
                className={`illum-input ${isError ? 'illum-error' : ''}`}
              />
            </form>
          </div>

          {/* Custom On-Screen Touch Keyboard Box */}
          <div className="illum-custom-keyboard">
            <div className="illum-keyboard-row">
              {['Q','W','E','R','T','Y','U','I','O','P'].map(k => (
                <button key={k} type="button" className="illum-key" onClick={() => handleVirtualKey(k)}>{k}</button>
              ))}
            </div>
            <div className="illum-keyboard-row">
              {['A','S','D','F','G','H','J','K','L'].map(k => (
                <button key={k} type="button" className="illum-key" onClick={() => handleVirtualKey(k)}>{k}</button>
              ))}
            </div>
            <div className="illum-keyboard-row">
              {['Z','X','C','V','B','N','M'].map(k => (
                <button key={k} type="button" className="illum-key" onClick={() => handleVirtualKey(k)}>{k}</button>
              ))}
              <button type="button" className="illum-key illum-key-backspace" onClick={handleVirtualBackspace}>
                <Delete size={20} />
              </button>
            </div>
            <div className="illum-keyboard-row">
              <button type="button" className="illum-key illum-key-space" onClick={() => handleVirtualKey(' ')}>SPACE</button>
              <button type="button" className="illum-key illum-key-enter" onClick={() => submitAnswer(inputValue)}>SUBMIT ↵</button>
            </div>
          </div>
        </>
      )}

      {/* Interactive Mini Fact Card (Revealed Object Only) */}
      {selectedCard && (
        <div className="illum-popover-overlay" onClick={() => setSelectedCard(null)}>
          <div className="illum-popover-card" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="illum-popover-close-btn" 
              onClick={() => setSelectedCard(null)}
              title="Close card"
            >
              <X size={18} />
            </button>

            <div className="illum-fact-card-body">
              <div className="illum-fact-header">
                <div className="illum-fact-avatar">
                  <SafeObjectImage 
                    src={selectedCard.obj.img} 
                    alt={selectedCard.obj.name} 
                    iconType={selectedCard.obj.iconType} 
                    size={30}
                  />
                </div>
                <div className="illum-fact-title-box">
                  <h3 className="illum-fact-name">{selectedCard.obj.name}</h3>
                  <span className="illum-type-tag">
                    {getTypeIcon(selectedCard.obj.iconType, 13)}
                    <span>{selectedCard.obj.astronomicalType || selectedCard.obj.type}</span>
                  </span>
                </div>
              </div>

              <div className="illum-fact-details-grid">
                <div className="illum-fact-detail-item">
                  <span className="illum-fact-detail-label">
                    <Ruler size={14} color="#00e5ff" /> Diameter:
                  </span>
                  <span className="illum-fact-detail-val">{selectedCard.obj.diameter || 'Unknown'}</span>
                </div>
                <div className="illum-fact-detail-item">
                  <span className="illum-fact-detail-label">
                    <Compass size={14} color="#00e5ff" /> Position / Orbit:
                  </span>
                  <span className="illum-fact-detail-val">{selectedCard.obj.orbitalOrder || 'Solar System'}</span>
                </div>
                <div className="illum-fact-detail-item illum-fact-quote">
                  <span className="illum-fact-detail-label">
                    <Lightbulb size={14} color="#ffb74d" /> Fun Fact:
                  </span>
                  <p className="illum-fact-quote-text">{selectedCard.obj.funFact || 'An intriguing body in our solar system.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Victory Screen */}
      <VictoryScreen
        isOpen={isComplete}
        theme="space"
        title="System Illuminated!"
        subtitle={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', margin: '8px 0' }}>
            <div style={{ color: '#c6cbe4', fontSize: '1rem' }}>
              Time: <strong>{formatTime(elapsedTime)}</strong>
            </div>
            {isNewRecord && (
              <div style={{ color: '#d3bd7a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={16} /> NEW PERSONAL BEST!
              </div>
            )}
            <div style={{ color: '#a8b0d0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Lives Left:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {Array.from({ length: lives }).map((_, i) => (
                  <Heart key={i} size={14} fill="#d9a2a2" color="#d9a2a2" />
                ))}
              </div>
            </div>
          </div>
        }
        xpGained={(DIFFICULTIES[level]?.xp || 10) + (level === 'hard' && scoreData.hintsUsed === 0 ? 10 : 0)}
        onContinue={() => navigate('/space/objects-by-size')}
        onPlayAgain={() => startGame(level)}
        continueText="Back to Menu"
      />

      {/* Game Over Screen Overlay */}
      {isGameOver && !isGameOverMinimized && (
        <div className="illum-gameover-overlay" role="dialog" aria-modal="true" aria-label="Game Over">
          <div className="illum-gameover-card">
            <div className="illum-gameover-icon">
              <HeartCrackIcon size={26} color="#e8ecf8" strokeWidth={2.2} />
            </div>
            <h2 className="illum-gameover-title">Game Over</h2>
            <p className="illum-gameover-subtitle">You ran out of lives!</p>

            <div className="illum-gameover-stats">
              <div className="illum-gameover-stat">
                <span className="illum-gameover-stat-val">{currentIndex} / {gameData.length}</span>
                <span className="illum-gameover-stat-lbl">Objects Illuminated</span>
              </div>
              <div className="illum-gameover-stat">
                <span className="illum-gameover-stat-val">{formatTime(elapsedTime)}</span>
                <span className="illum-gameover-stat-lbl">Time</span>
              </div>
            </div>

            <div className="illum-gameover-actions">
              <button type="button" className="illum-gameover-btn-try" onClick={() => startGame(level)}>
                Try Again
              </button>
              <div className="illum-gameover-btn-row">
                <button type="button" className="illum-gameover-btn-view" onClick={() => setIsGameOverMinimized(true)}>
                  <Eye size={15} />
                  <span>View Screen</span>
                </button>
                <button type="button" className="illum-gameover-btn-menu" onClick={() => navigate('/space/objects-by-size')}>
                  Back to Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Minimized Dock (View Screen) */}
      {isGameOver && isGameOverMinimized && (
        <div className="illum-gameover-dock">
          <button type="button" className="illum-gameover-btn-restore" onClick={() => setIsGameOverMinimized(false)}>
            <Eye size={16} />
            <span>Show Results</span>
          </button>
          <button type="button" className="illum-gameover-btn-mini-try" onClick={() => startGame(level)}>
            Try Again
          </button>
          <button type="button" className="illum-gameover-btn-mini-menu" onClick={() => navigate('/space/objects-by-size')}>
            Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}
