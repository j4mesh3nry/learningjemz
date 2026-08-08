import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Flame, Star, ArrowLeft, Heart, Clock, Lightbulb, Zap, RefreshCw, Trophy } from 'lucide-react';
import { SPACE_OBJECTS_BY_SIZE, getMnemonicUpToIndex } from '../../data/space-objects';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import VictoryScreen from '../../components/VictoryScreen';
import './space.css';

const DIFFICULTIES = {
  easy: { name: 'Easy', count: 8, label: 'Top 8 (Sun → Mars)', xp: 5, maxLives: 3 },
  medium: { name: 'Medium', count: 15, label: 'Top 15 (Sun → Europa)', xp: 10, maxLives: 4 },
  hard: { name: 'Hard', count: 35, label: 'All 35 (Sun → Salacia)', xp: 20, maxLives: 5 }
};

export default function IlluminateSystem() {
  const navigate = useNavigate();
  const location = useLocation();
  const { level: userLevel, streak, hasPlayedToday, addXp, illuminateStats, recordIlluminateTime } = useGame();
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
  const [lives, setLives] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [userUsedHint, setUserUsedHint] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [showHintModal, setShowHintModal] = useState(false);
  const [activeHintBubble, setActiveHintBubble] = useState(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [scoreData, setScoreData] = useState({ hintsUsed: 0, startTime: null, endTime: null });
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

  const startGame = (diffLevel) => {
    setLevel(diffLevel);
    setGameData(SPACE_OBJECTS_BY_SIZE.slice(0, DIFFICULTIES[diffLevel].count));
    setCurrentIndex(0);
    setWrongAttempts(0);
    setInputValue('');
    setIsComplete(false);
    setIsGameOver(false);
    setLives(DIFFICULTIES[diffLevel].maxLives);
    setElapsedTime(0);
    setUserUsedHint(false);
    setHintsLeft(3);
    setShowHintModal(false);
    setActiveHintBubble(null);
    setIsNewRecord(false);
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
      setActiveHintBubble(null);
      setShowHintModal(false);

      if (nextIndex >= gameData.length) {
        // Game complete
        setIsComplete(true);
        setScoreData(prev => ({ ...prev, endTime: Date.now() }));
        
        // Personal Best Record Check & Supabase Sync
        const isNew = recordIlluminateTime(level, elapsedTime);
        if (isNew) {
          setIsNewRecord(true);
        }

        let xpReward = DIFFICULTIES[level].xp;
        if (level === 'hard' && scoreData.hintsUsed === 0) {
          xpReward += 10; // Bonus for perfect hard
        }
        addXp(xpReward);
      }
    } else {
      setIsError(true);
      setWrongAttempts(prev => prev + 1);
      setTimeout(() => setIsError(false), 500);
      setInputValue(''); // Clear on wrong

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
    if (activeHintBubble) {
      setShowHintModal(true);
      return;
    }
    if (hintsLeft <= 0) return;
    setShowHintModal(true);
  };

  const handleSelectHintType = (type) => {
    if (isComplete || isGameOver) return;
    const obj = gameData[currentIndex];
    if (!obj) return;

    if (!activeHintBubble && hintsLeft > 0) {
      setHintsLeft(prev => prev - 1);
      setUserUsedHint(true);
      setScoreData(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    }

    const mainName = obj.name.split(' ')[0];
    const firstLetter = mainName[0].toUpperCase();

    if (type === 'letter') {
      setInputValue(firstLetter);
      setActiveHintBubble({
        type: 'letter',
        text: `Starts with "${firstLetter}" (${mainName.length} letters)`
      });
    } else if (type === 'mnemonic') {
      const lineProgress = getMnemonicUpToIndex(currentIndex);
      setActiveHintBubble({
        type: 'mnemonic',
        text: lineProgress
      });
    }
    setShowHintModal(false);
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
      <div className="space-module-page">
        {/* Navigation Header */}
        <div className="space-nav-header" style={{ marginBottom: 16 }}>
          <div className="space-header-left">
            <button 
              onClick={() => navigate('/space/objects-by-size')} 
              title="Back"
              aria-label="Back"
              style={{
                background: '#ffffff',
                border: '2px solid #b0cbaf',
                boxShadow: '0 3px 0 #b0cbaf',
                borderRadius: 14,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16653e',
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
                💡
              </div>
              <h1 className="space-page-title" style={{ margin: 0, color: '#0f3825', fontSize: '1.35rem', fontWeight: 900 }}>
                Illuminate the System
              </h1>
            </div>
          </div>
        </div>

        {/* Section Heading & Subtitle */}
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#0f3825', fontWeight: 800, marginTop: 12, marginBottom: 4 }}>Select Difficulty</h2>
        <p style={{ color: '#4e7361', fontSize: '0.88rem', lineHeight: '1.4', margin: '0 0 16px', fontWeight: 600 }}>
          Type the names of the objects in order from <strong>LARGEST</strong> to <strong>SMALLEST</strong>.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(DIFFICULTIES).map(([key, diff]) => (
            <div 
              key={key} 
              className="space-card-item"
              onClick={() => startGame(key)}
              style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                color: '#fff', background: '#16653e', borderRadius: 16,
                padding: '12px 16px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 4px 0 #0e4329',
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
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>→</div>
            </div>
          ))}
        </div>

        {/* System Records & Personal Bests Box */}
        <div style={{ marginTop: 24, padding: 16, background: '#ffffff', borderRadius: 18, border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1rem', color: '#0f3825', marginBottom: 12 }}>
            <Trophy size={20} color="#d97706" /> Best Time Records
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {Object.entries(DIFFICULTIES).map(([key, diff]) => {
              const pbTime = personalBests[key];
              return (
                <div 
                  key={key} 
                  style={{
                    background: '#e1f0e2',
                    borderRadius: 12,
                    padding: '10px 8px',
                    textAlign: 'center',
                    border: '1.5px solid #b0cbaf',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: '#0f3825', fontWeight: 800 }}>
                    {diff.name}
                  </div>
                  <div style={{ fontSize: '1.05rem', color: pbTime !== undefined ? '#16653e' : '#4e7361', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Zap size={14} color={pbTime !== undefined ? '#ffb300' : '#adb5bd'} />
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
      {/* Header Container with Separated Back Button & Long Green Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexShrink: 0 }}>
        {/* Separated Back Button */}
        <button 
          onClick={() => navigate('/space/objects-by-size')} 
          title="Back to Objects by Size"
          aria-label="Back to Objects by Size"
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

        {/* Hint Button & Speech Bubble Wrapper */}
        <div style={{ position: 'relative' }}>
          {/* Speech Bubble Clue attached directly above Hint button */}
          {activeHintBubble && (
            <div style={{
              position: 'absolute',
              bottom: 'calc(100% + 10px)',
              right: 0,
              background: '#161936',
              border: '2px solid #2e7d32',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
              borderRadius: 14,
              padding: '8px 12px',
              color: '#ffffff',
              zIndex: 100,
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 170,
              maxWidth: 260
            }}>
              {/* Pointer Arrow pointing down to Hint button */}
              <div style={{
                position: 'absolute',
                bottom: -6,
                right: 22,
                width: 10,
                height: 10,
                background: '#161936',
                borderRight: '2px solid #2e7d32',
                borderBottom: '2px solid #2e7d32',
                transform: 'rotate(45deg)'
              }} />

              <div style={{ flex: 1 }}>
                {activeHintBubble.type === 'letter' ? (
                  <div>
                    <span style={{ color: '#38bdf8', fontWeight: 800 }}>Letter Clue: </span>
                    <span>{activeHintBubble.text}</span>
                  </div>
                ) : (
                  <div>
                    <span style={{ color: '#fbbf24', fontWeight: 800 }}>Mnemonic Line: </span>
                    <div style={{ fontSize: '0.76rem', color: '#e2e8f0', marginTop: 2, lineHeight: 1.35 }}>
                      "{activeHintBubble.text}"
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveHintBubble(null)}
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
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                ✕
              </button>
            </div>
          )}

          <button 
            className={`illum-hint-btn ${hintsLeft <= 0 && !activeHintBubble ? 'used' : ''}`}
            onClick={handleUseHint}
            disabled={(hintsLeft <= 0 && !activeHintBubble) || isComplete || isGameOver}
          >
            <Lightbulb size={14} color={activeHintBubble ? '#fbbf24' : hintsLeft > 0 ? '#ffb74d' : '#888'} />
            <span>{activeHintBubble ? 'View Hint' : `Hint (${hintsLeft})`}</span>
          </button>
        </div>
      </div>

      {/* Grid Box Container */}
      <div className="illum-grid-container">
        <div className="illum-grid">
          {gameData.map((obj, i) => {
            const isRevealed = i < currentIndex;
            const isCurrent = i === currentIndex;
            const glowClass = getGlowClass(obj.type);
            const scale = getRelativeSize(i);

            return (
              <div 
                key={obj.id} 
                id={`planet-${i}`}
                className={`illum-circle-wrapper ${isCurrent ? 'illum-current' : ''}`}
              >
                <div 
                  className={`illum-circle ${isRevealed ? glowClass : 'illum-shadow'} ${isRevealed ? 'revealed' : ''}`}
                  style={{ transform: `scale(${scale})` }}
                >
                  {isRevealed && (
                    obj.img ? (
                      <img src={obj.img} alt={obj.name} className="illum-img" />
                    ) : (
                      <span className="illum-fallback">{obj.fallback}</span>
                    )
                  )}
                </div>
                {isRevealed && <div className="illum-name">{obj.name.split(' ')[0]}</div>}
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
                placeholder={currentHint ? `Hint: ${currentHint}` : "Type answer..."}
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
              <button type="button" className="illum-key illum-key-backspace" onClick={handleVirtualBackspace}>⌫</button>
            </div>
            <div className="illum-keyboard-row">
              <button type="button" className="illum-key illum-key-space" onClick={() => handleVirtualKey(' ')}>SPACE</button>
              <button type="button" className="illum-key illum-key-enter" onClick={() => submitAnswer(inputValue)}>SUBMIT ↵</button>
            </div>
          </div>
        </>
      )}

      {/* Choose Hint Type Modal Popup */}
      {showHintModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: '#161936',
            border: '2px solid #2e7d32',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            borderRadius: 24,
            padding: '24px 20px',
            maxWidth: 340,
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: 6 }}>💡</div>
            <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.25rem', fontWeight: 900 }}>
              Choose Hint Type
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', marginTop: 4, marginBottom: 18 }}>
              Select a hint clue for this object ({hintsLeft} left):
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                type="button"
                onClick={() => handleSelectHintType('letter')}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: '2px solid #38bdf8',
                  boxShadow: '0 3px 0 #0369a1',
                  borderRadius: 16,
                  padding: '14px 16px',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div style={{
                  fontSize: '0.8rem', fontWeight: 900, background: 'rgba(255,255,255,0.2)',
                  padding: '4px 6px', borderRadius: 6, flexShrink: 0
                }}>abc</div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>Letter Clue</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 500 }}>Fills starting letter & length</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectHintType('mnemonic')}
                style={{
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  border: '2px solid #fbbf24',
                  boxShadow: '0 3px 0 #78350f',
                  borderRadius: 16,
                  padding: '14px 16px',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>🧠</span>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>Mnemonic Word Clue</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 500 }}>Reveals sentence progress up to this object</div>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowHintModal(false)}
              style={{
                marginTop: 18,
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reusable Victory Screen */}
      <VictoryScreen
        isOpen={isComplete}
        title="System Illuminated!"
        subtitle={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', margin: '8px 0' }}>
            <div style={{ color: '#e0e0e0', fontSize: '1rem' }}>
              Time: <strong>{formatTime(elapsedTime)}</strong>
            </div>
            {isNewRecord && (
              <div style={{ color: '#00e5ff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={16} /> NEW PERSONAL BEST!
              </div>
            )}
            <div style={{ color: '#ff4d4d', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Lives Left:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {Array.from({ length: lives }).map((_, i) => (
                  <Heart key={i} size={14} fill="#ff4d4d" color="#ff4d4d" />
                ))}
              </div>
            </div>
          </div>
        }
        xpGained={DIFFICULTIES[level]?.xp || 10}
        streak={streak}
        hasPlayedToday={hasPlayedToday}
        onContinue={() => setLevel(null)}
        onPlayAgain={() => startGame(level)}
        continueText="Back to Menu"
      />

      {/* Game Over Screen Overlay */}
      {isGameOver && (
        <div className="ss-victory-overlay">
          <div className="ss-victory-card" style={{ border: '2px solid rgba(239, 83, 80, 0.4)' }}>
            <div style={{
              width: 60, height: 60, margin: '0 auto 0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(239, 83, 80, 0.15)', border: '2px solid rgba(239, 83, 80, 0.4)',
              borderRadius: '50%', boxShadow: '0 0 20px rgba(239, 83, 80, 0.3)'
            }}>
              <Heart size={30} color="#ef5350" fill="transparent" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#ff4d4d', fontWeight: 900 }}>
              Game Over
            </h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#e0e0e0' }}>
              You ran out of lives!
            </p>
            <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', color: '#b0bec5' }}>
              Illuminated <strong>{currentIndex} of {gameData.length}</strong> objects in {formatTime(elapsedTime)}.
            </p>

            <button className="ss-btn-primary" onClick={() => startGame(level)} style={{ width: '100%', marginBottom: '0.75rem', background: 'linear-gradient(135deg, #1c7c54 0%, #155d3e 100%)' }}>
              Try Again
            </button>
            <button className="ss-btn-secondary" onClick={() => setLevel(null)} style={{ width: '100%' }}>
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
