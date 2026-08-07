import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhilippineMap from './components/PhilippineMap';
import provinces from '../../data/philippines-provinces';
import { useGame } from '../../contexts/GameContext';
import { Heart, ArrowLeft } from 'lucide-react';
import './geo.css';
import VictoryScreen from '../../components/VictoryScreen';

export default function ProvinceQuiz() {
  const navigate = useNavigate();
  const { addXp } = useGame();
  
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const [correctFlash, setCorrectFlash] = useState(null);
  const [wrongFlash, setWrongFlash] = useState(null);
  const [streakIncreased, setStreakIncreased] = useState(false);
  const [mode, setMode] = useState('quiz'); // 'quiz' or 'learn'
  
  // Victory screen states
  const [sessionXp, setSessionXp] = useState(0);
  const [igniting, setIgniting] = useState(false);
  const [displayedStreak, setDisplayedStreak] = useState(0);
  const { streak, recordActivity } = useGame();

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const shuffled = [...provinces].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setCurrentIndex(0);
    setLives(3);
    setScore(0);
    setGameOver(false);
    setCorrectFlash(null);
    setWrongFlash(null);
    setSessionXp(0);
    setIgniting(false);
    setStreakIncreased(false);
  };

  const handleProvinceClick = (id) => {
    if (gameOver || correctFlash || wrongFlash) return;

    const currentProvince = queue[currentIndex];
    
    if (id === currentProvince.id) {
      // Correct
      setCorrectFlash(id);
      setTimeout(() => {
        setScore(s => s + 1);
        addXp(2); // Reduced from 10 to match design doc (+2 XP per province)
        setSessionXp(xp => xp + 2);
        setCorrectFlash(null);
        if (currentIndex + 1 >= queue.length) {
          endGame(score + 1, lives);
        } else {
          setCurrentIndex(i => i + 1);
        }
      }, 1000);
    } else {
      // Wrong
      setWrongFlash(id);
      setTimeout(() => {
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) endGame(score, newLives);
          return newLives;
        });
        setWrongFlash(null);
      }, 1000);
    }
  };

  const endGame = (finalScore, finalLives) => {
    setGameOver(true);
    // update stats
    const saved = localStorage.getItem('learningjemz-geo-stats');
    let stats = saved ? JSON.parse(saved) : { mastered: 0, accuracy: 0, streak: 0 };
    stats.accuracy = Math.round((finalScore / (finalScore + (3 - finalLives))) * 100) || 0;
    stats.mastered = Math.max(stats.mastered, finalScore);
    localStorage.setItem('learningjemz-geo-stats', JSON.stringify(stats));
    
    // Gamification
    const oldStreak = streak;
    setDisplayedStreak(oldStreak);
    const didIncrease = recordActivity();
    setStreakIncreased(didIncrease);
    
    if (didIncrease) {
      setTimeout(() => {
        setIgniting(true);
        setDisplayedStreak(oldStreak + 1);
      }, 800);
    }
  };

  if (queue.length === 0) return <div>Loading...</div>;

  return (
    <div className="province-quiz">
      <div className="quiz-top-bar">
        <button onClick={() => navigate('/geo')} className="back-btn"><ArrowLeft size={20} /></button>
        <div className="lives">
          {[...Array(3)].map((_, i) => (
            <Heart key={i} fill={i < lives ? '#e74c3c' : 'transparent'} color="#e74c3c" />
          ))}
        </div>
        <div className="score">{score} / 81</div>
      </div>

      {!gameOver && (
        <div className="prompt-banner">
          Click on: <strong>{queue[currentIndex].name}</strong>
        </div>
      )}

      {gameOver ? (
        <>
          <VictoryScreen
            isOpen={true}
            title="Quiz Complete!"
            xpGained={sessionXp}
            streak={displayedStreak}
            igniting={igniting}
            streakIncreased={streakIncreased}
            onContinue={startNewGame}
          >
            <p style={{ margin: 0 }}>You got {score} / 81 provinces correct!</p>
          </VictoryScreen>
          <div className="map-wrapper" style={{ filter: 'blur(4px)' }}>
            <PhilippineMap
              onProvinceClick={() => {}}
              correctProvince={null}
              wrongProvince={null}
              showNames={mode === 'learn'}
            />
          </div>
        </>
      ) : (
        <div className="map-wrapper">
          <PhilippineMap
            onProvinceClick={handleProvinceClick}
            correctProvince={correctFlash}
            wrongProvince={wrongFlash}
            showNames={mode === 'learn'}
          />
        </div>
      )}
      
      {!gameOver && (
        <div className="mode-toggle">
          <button onClick={() => setMode('quiz')} className={mode === 'quiz' ? 'active' : ''}>Quiz</button>
          <button onClick={() => setMode('learn')} className={mode === 'learn' ? 'active' : ''}>Learn (Show Names)</button>
        </div>
      )}
    </div>
  );
}
