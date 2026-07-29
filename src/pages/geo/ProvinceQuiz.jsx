import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhilippineMap from './components/PhilippineMap';
import provinces from '../../data/philippines-provinces';
import { useGame } from '../../contexts/GameContext';
import { Heart, ArrowLeft } from 'lucide-react';
import './geo.css';

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
  const [mode, setMode] = useState('quiz'); // 'quiz' or 'learn'

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
  };

  const handleProvinceClick = (id) => {
    if (gameOver || correctFlash || wrongFlash) return;

    const currentProvince = queue[currentIndex];
    
    if (id === currentProvince.id) {
      // Correct
      setCorrectFlash(id);
      setTimeout(() => {
        setScore(s => s + 1);
        addXp(10);
        setCorrectFlash(null);
        if (currentIndex + 1 >= queue.length) {
          endGame();
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
          if (newLives <= 0) endGame();
          return newLives;
        });
        setWrongFlash(null);
      }, 1000);
    }
  };

  const endGame = () => {
    setGameOver(true);
    // update stats
    const saved = localStorage.getItem('learningjemz-geo-stats');
    let stats = saved ? JSON.parse(saved) : { mastered: 0, accuracy: 0, streak: 0 };
    stats.accuracy = Math.round((score / (score + (3 - lives))) * 100) || 0;
    stats.mastered = Math.max(stats.mastered, score);
    localStorage.setItem('learningjemz-geo-stats', JSON.stringify(stats));
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
        <div className="results-screen animate-fade-in">
          <h2>Quiz Complete!</h2>
          <p>Score: {score} / 81</p>
          <button className="geo-btn" onClick={startNewGame}>Play Again</button>
        </div>
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
