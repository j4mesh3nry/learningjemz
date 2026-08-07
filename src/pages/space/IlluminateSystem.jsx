import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Flame, Star, ArrowLeft } from 'lucide-react';
import { SPACE_OBJECTS_BY_SIZE } from '../../data/space-objects';
import { useGame } from '../../contexts/GameContext';
import './space.css';

const DIFFICULTIES = {
  easy: { name: 'Easy', count: 8, label: 'Top 8 (Sun → Mars)', xp: 5 },
  medium: { name: 'Medium', count: 15, label: 'Top 15 (Sun → Europa)', xp: 10 },
  hard: { name: 'Hard', count: 35, label: 'All 35 (Sun → Salacia)', xp: 20 }
};

export default function IlluminateSystem() {
  const navigate = useNavigate();
  const { level: userLevel, streak, hasPlayedToday, addXp } = useGame();
  
  const [level, setLevel] = useState(null);
  const [gameData, setGameData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isError, setIsError] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [scoreData, setScoreData] = useState({ hintsUsed: 0, startTime: null, endTime: null });
  const inputRef = useRef(null);

  const scrollToCurrentPlanet = () => {
    setTimeout(() => {
      const el = document.getElementById(`planet-${currentIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  useEffect(() => {
    if (level && !isComplete) {
      scrollToCurrentPlanet();
    }
  }, [currentIndex, level, isComplete]);

  const startGame = (diffLevel) => {
    setLevel(diffLevel);
    setGameData(SPACE_OBJECTS_BY_SIZE.slice(0, DIFFICULTIES[diffLevel].count));
    setCurrentIndex(0);
    setWrongAttempts(0);
    setInputValue('');
    setIsComplete(false);
    setScoreData({ hintsUsed: 0, startTime: Date.now(), endTime: null });
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
      scrollToCurrentPlanet();
    }, 100);
  };

  const submitAnswer = (guess = inputValue) => {
    if (!guess.trim() || isComplete) return;

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

      if (nextIndex >= gameData.length) {
        // Game complete
        setIsComplete(true);
        setScoreData(prev => ({ ...prev, endTime: Date.now() }));
        
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
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitAnswer(inputValue);
  };

  const handleVirtualKey = (char) => {
    if (isComplete) return;
    setInputValue(prev => prev + char);
  };

  const handleVirtualBackspace = () => {
    if (isComplete) return;
    setInputValue(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (!level || isComplete) return;

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
  }, [level, isComplete, currentIndex, inputValue, gameData]);

  // Derived hint
  let currentHint = null;
  if (level && !isComplete) {
    const targetName = gameData[currentIndex].name.split(' ')[0]; // use primary name for hint
    if (wrongAttempts >= 5) {
      currentHint = targetName.substring(0, 3) + '...';
      if (!scoreData.countedHintForCurrent) {
        setScoreData(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1, countedHintForCurrent: true }));
      }
    } else if (wrongAttempts >= 3) {
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
                <h3 className="space-card-title">{diff.name}</h3>
                <p className="space-card-subtitle">{diff.label}</p>
              </div>
              <div className="space-card-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-module-page ss-dark-theme illum-game-container">
      <div className="space-nav-header ss-header" style={{ flexShrink: 0 }}>
        <button className="space-back-btn" onClick={() => setLevel(null)}>←</button>
        <h1 className="space-page-title">Illuminate the System</h1>
      </div>

      <div style={{ padding: '0 1rem', display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={18} color="#4caf50" /> {currentIndex}/{gameData.length}
        </span>
        {currentHint && <span style={{color: '#ff9800'}}>Hint: {currentHint}</span>}
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

      {/* Simple Inline Input Display Bar (Directly below Grid Box) */}
      {!isComplete && (
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
              <button type="button" className="illum-key illum-key-backspace" onClick={handleVirtualBackspace}>⌫</button>
            </div>
            <div className="illum-keyboard-row">
              <button type="button" className="illum-key illum-key-space" onClick={() => handleVirtualKey(' ')}>SPACE</button>
              <button type="button" className="illum-key illum-key-enter" onClick={() => submitAnswer(inputValue)}>SUBMIT ↵</button>
            </div>
          </div>
        </>
      )}

      {/* Victory Screen */}
      {isComplete && (
        <div className="ss-victory-overlay">
          <div className="ss-victory-card">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', background: 'linear-gradient(45deg, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              System Illuminated!
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#e0e0e0' }}>
              Time: {Math.floor((scoreData.endTime - scoreData.startTime) / 1000)}s
            </p>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#e0e0e0' }}>
              Hints used: {scoreData.hintsUsed}
            </p>
            <button className="ss-btn-primary" onClick={() => setLevel(null)} style={{width: '100%', marginBottom: '1rem'}}>
              Play Again
            </button>
            <button className="ss-btn-secondary" onClick={() => navigate('/space/objects-by-size')} style={{width: '100%'}}>
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
