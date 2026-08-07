import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Flame, Star, ArrowLeft, Heart, Clock, Lightbulb, Zap, RefreshCw, Trophy } from 'lucide-react';
import { SPACE_OBJECTS_BY_SIZE } from '../../data/space-objects';
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
  const { level: userLevel, streak, hasPlayedToday, addXp } = useGame();
  const { user } = useAuth();

  const statsKey = user?.id ? `illuminate_stats_${user.id}` : 'illuminate_stats_guest';
  
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
  const [personalBests, setPersonalBests] = useState({});
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [scoreData, setScoreData] = useState({ hintsUsed: 0, startTime: null, endTime: null });
  const inputRef = useRef(null);

  // Load Personal Bests for the current user account
  useEffect(() => {
    try {
      const saved = localStorage.getItem(statsKey);
      if (saved) setPersonalBests(JSON.parse(saved));
      else setPersonalBests({});
    } catch (e) {}
  }, [statsKey]);

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

      if (nextIndex >= gameData.length) {
        // Game complete
        setIsComplete(true);
        setScoreData(prev => ({ ...prev, endTime: Date.now() }));
        
        // Personal Best Record Check
        const prevBest = personalBests[level];
        if (!prevBest || elapsedTime < prevBest) {
          setIsNewRecord(true);
          const updated = { ...personalBests, [level]: elapsedTime };
          setPersonalBests(updated);
          try {
            localStorage.setItem(statsKey, JSON.stringify(updated));
          } catch (e) {}
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
    if (isComplete || isGameOver || userUsedHint || hintsLeft <= 0) return;
    setUserUsedHint(true);
    setHintsLeft(prev => prev - 1);
    setScoreData(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
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
        <div className="space-nav-header">
          <div className="space-header-left">
            <button className="space-back-btn" onClick={() => navigate('/space/objects-by-size')} title="Back">
              <ArrowLeft size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                fontSize: '1.1rem', width: 30, height: 30,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 100%)', borderRadius: 8,
                boxShadow: '0 2px 6px rgba(26,26,62,0.3)'
              }}>
                💡
              </div>
              <h1 className="space-page-title" style={{ margin: 0, color: '#111324', fontSize: '1.3rem', fontWeight: 900 }}>
                Illuminate the System
              </h1>
            </div>
          </div>
        </div>

        {/* Section Heading & Subtitle */}
        <h2 className="space-section-heading" style={{ marginTop: 16, marginBottom: 4 }}>Select Difficulty</h2>
        <p style={{ color: '#4a4e69', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 20px', fontWeight: 500 }}>
          Type the names of the objects in order from <strong>LARGEST</strong> to <strong>SMALLEST</strong>.
        </p>
        
        <div className="space-card-list">
          {Object.entries(DIFFICULTIES).map(([key, diff]) => (
            <div 
              key={key} 
              className="space-card-item"
              onClick={() => startGame(key)}
            >
              <div className="space-card-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 className="space-card-title">{diff.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {Array.from({ length: diff.maxLives }).map((_, i) => (
                      <Heart key={i} size={13} fill="#ff4d4d" color="#ff4d4d" />
                    ))}
                  </div>
                </div>
                <p className="space-card-subtitle">{diff.label}</p>
              </div>
              <div className="space-card-arrow">→</div>
            </div>
          ))}
        </div>

        {/* System Records & Personal Bests Box (Matching Chess Stats UI) */}
        <div style={{ marginTop: 28, padding: 18, background: '#ffffff', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eeeeee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1rem', color: '#111324', marginBottom: 14 }}>
            <Trophy size={20} color="#ffb300" /> Best Time Records
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {Object.entries(DIFFICULTIES).map(([key, diff]) => {
              const pbTime = personalBests[key];
              return (
                <div 
                  key={key} 
                  style={{
                    background: '#f8f9fa',
                    borderRadius: 12,
                    padding: '10px 8px',
                    textAlign: 'center',
                    border: '1px solid #e9ecef',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 700 }}>
                    {diff.name}
                  </div>
                  <div style={{ fontSize: '1.05rem', color: pbTime !== undefined ? '#1c7c54' : '#adb5bd', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 3 }}>
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
      {/* Header Bar */}
      <div className="space-nav-header ss-header" style={{ flexShrink: 0 }}>
        <button className="space-back-btn" onClick={() => setLevel(null)}>←</button>
        <h1 className="space-page-title">Illuminate the System</h1>
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

        <button 
          className={`illum-hint-btn ${userUsedHint || hintsLeft <= 0 ? 'used' : ''}`}
          onClick={handleUseHint}
          disabled={userUsedHint || hintsLeft <= 0 || isComplete || isGameOver}
        >
          <Lightbulb size={14} color={hintsLeft > 0 && !userUsedHint ? '#ffb74d' : '#888'} />
          <span>{userUsedHint ? 'Hint Active' : `Hint (${hintsLeft})`}</span>
        </button>
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
