import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext.jsx';
import { quizQuestions } from '../../data/space-data.js';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import './space.css';
import VictoryScreen from '../../components/VictoryScreen';

export default function SpaceQuiz() {
  const navigate = useNavigate();
  const { addXp } = useGame();
  
  const [filter, setFilter] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timer, setTimer] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  
  // Victory screen states
  const [sessionXp, setSessionXp] = useState(0);
  const [igniting, setIgniting] = useState(false);
  const [displayedStreak, setDisplayedStreak] = useState(0);
  const { streak, recordActivity, hasPlayedToday } = useGame();

  useEffect(() => {
    startQuiz();
  }, [filter]);

  useEffect(() => {
    let interval;
    if (timerActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && timerActive) {
      handleAnswer(-1); // Time out
    }
    return () => clearInterval(interval);
  }, [timer, timerActive]);

  const startQuiz = () => {
    let filtered = quizQuestions;
    if (filter !== 'all') {
      filtered = quizQuestions.filter(q => q.category === filter);
    }
    filtered = [...filtered].sort(() => Math.random() - 0.5).slice(0, 10); // Take 10 random
    
    // Shuffle options for each question
    const processedQuestions = filtered.map(q => {
      const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, originalIndex: i }));
      const shuffledOptions = optionsWithIndex.sort(() => Math.random() - 0.5);
      const newCorrectIndex = shuffledOptions.findIndex(opt => opt.originalIndex === q.correctIndex);
      return {
        ...q,
        options: shuffledOptions.map(o => o.text),
        correctIndex: newCorrectIndex
      };
    });

    setQuestions(processedQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsFinished(false);
    setTimer(15);
    setTimerActive(true);
    setSessionXp(0);
    setIgniting(false);
  };

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setTimerActive(false);

    const isCorrect = index === questions[currentIndex].correctIndex;
    if (isCorrect) {
      setScore(s => s + 1);
      addXp(10);
      setSessionXp(xp => xp + 10);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
        setSelectedAnswer(null);
        setTimer(15);
        setTimerActive(true);
      } else {
        finishQuiz(score + (isCorrect ? 1 : 0));
      }
    }, 1500);
  };

  const finishQuiz = (finalScore) => {
    setIsFinished(true);
    setTimerActive(false);
    
    const savedStats = JSON.parse(localStorage.getItem('learningjemz-space-stats') || '{"cardsMastered":0,"quizHighScore":0,"planetsExplored":0}');
    if (finalScore > savedStats.quizHighScore) {
      savedStats.quizHighScore = finalScore;
      localStorage.setItem('learningjemz-space-stats', JSON.stringify(savedStats));
    }
    
    // Gamification
    const oldStreak = streak;
    setDisplayedStreak(oldStreak);
    const streakIncreased = recordActivity();
    if (streakIncreased) {
      setTimeout(() => {
        setIgniting(true);
        setDisplayedStreak(oldStreak + 1);
      }, 800);
    }
  };

  if (isFinished) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="space-module quiz-mode">
        <VictoryScreen
          isOpen={true}
          title="Quiz Complete!"
          xpGained={sessionXp}
          streak={displayedStreak}
          igniting={igniting}
          hasPlayedToday={hasPlayedToday}
          onContinue={startQuiz}
        >
          <div className="results-stats" style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', color: '#ffb400', fontWeight: 'bold' }}>{score} / {questions.length}</div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#ccc' }}>Score</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', color: '#4caf50', fontWeight: 'bold' }}>{accuracy}%</div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#ccc' }}>Accuracy</div>
            </div>
          </div>
        </VictoryScreen>
        
        <div className="space-nav" style={{ filter: 'blur(4px)' }}>
          <button onClick={() => navigate('/space')} className="back-btn"><ArrowLeft /> Back to Space</button>
        </div>
        <div className="quiz-card" style={{ filter: 'blur(4px)', minHeight: 400 }}>
          {/* Background blur filler */}
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  return (
    <div className="space-module quiz-mode">
      <div className="space-nav">
        <button onClick={() => navigate('/space')} className="back-btn"><ArrowLeft /> Exit</button>
        <span className="quiz-counter">Q{currentIndex + 1} of {questions.length}</span>
      </div>

      <div className="quiz-filters">
        {['all', 'planets', 'moons', 'stars'].map(cat => (
          <button 
            key={cat} 
            className={`cat-tab ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="timer-bar-container">
        <div className={`timer-bar ${timer <= 5 ? 'danger' : ''}`} style={{ width: `${(timer / 15) * 100}%` }}></div>
      </div>

      <div className="quiz-card">
        <h2 className="quiz-question">{currentQ.question}</h2>
        <div className="quiz-options">
          {currentQ.options.map((opt, idx) => {
            let className = "quiz-option";
            if (selectedAnswer !== null) {
              if (idx === currentQ.correctIndex) className += " correct";
              else if (idx === selectedAnswer) className += " wrong";
            }
            return (
              <button 
                key={idx} 
                className={className} 
                onClick={() => handleAnswer(idx)}
                disabled={selectedAnswer !== null}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
