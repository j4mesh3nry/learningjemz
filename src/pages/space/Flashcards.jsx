import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext.jsx';
import { flashcards } from '../../data/space-data.js';
import { ArrowLeft, Check, X } from 'lucide-react';
import './space.css';

export default function Flashcards() {
  const navigate = useNavigate();
  const { addXp } = useGame();
  
  const [filter, setFilter] = useState('all');
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ known: 0, unknown: 0 });
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let filtered = flashcards;
    if (filter !== 'all') {
      filtered = flashcards.filter(c => c.category === filter);
    }
    // Shuffle
    filtered = [...filtered].sort(() => Math.random() - 0.5);
    setCards(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setSessionStats({ known: 0, unknown: 0 });
  }, [filter]);

  const handleNext = (known) => {
    if (known) {
      addXp(10);
      setSessionStats(prev => ({ ...prev, known: prev.known + 1 }));
    } else {
      setSessionStats(prev => ({ ...prev, unknown: prev.unknown + 1 }));
    }
    
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
        // Update stats
        const savedStats = JSON.parse(localStorage.getItem('learningjemz-space-stats') || '{"cardsMastered":0,"quizHighScore":0,"planetsExplored":0}');
        savedStats.cardsMastered += (sessionStats.known + (known ? 1 : 0));
        localStorage.setItem('learningjemz-space-stats', JSON.stringify(savedStats));
      }
    }, 300);
  };

  if (isFinished) {
    return (
      <div className="space-module flashcards-mode">
        <div className="space-nav">
          <button onClick={() => navigate('/space')} className="back-btn"><ArrowLeft /> Back to Space</button>
        </div>
        <div className="results-screen">
          <h2>Session Complete!</h2>
          <div className="results-stats">
            <div className="result-stat">
              <span className="result-label">Cards Known</span>
              <span className="result-value text-green">{sessionStats.known}</span>
            </div>
            <div className="result-stat">
              <span className="result-label">XP Earned</span>
              <span className="result-value text-gold">+{sessionStats.known * 10} XP</span>
            </div>
          </div>
          <button className="space-btn" onClick={() => setFilter(filter)}>Review Again</button>
        </div>
      </div>
    );
  }

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  return (
    <div className="space-module flashcards-mode">
      <div className="space-nav">
        <button onClick={() => navigate('/space')} className="back-btn"><ArrowLeft /> Back</button>
        <div className="category-tabs">
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
      </div>

      <div className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
          <div className="flashcard-front">
            <div className="card-image">{currentCard.image}</div>
            <h2>{currentCard.front}</h2>
            <p className="tap-hint">Tap to flip</p>
          </div>
          <div className="flashcard-back">
            <h2>{currentCard.front}</h2>
            <p className="card-fact">{currentCard.back}</p>
          </div>
        </div>
      </div>

      <div className="flashcard-actions">
        <button className="action-btn unknown" onClick={() => handleNext(false)}>
          <X size={32} />
          <span>Need Review</span>
        </button>
        <button className="action-btn known" onClick={() => handleNext(true)}>
          <Check size={32} />
          <span>Got It!</span>
        </button>
      </div>

      <div className="progress-dots">
        {cards.map((_, idx) => (
          <div 
            key={idx} 
            className={`dot ${idx === currentIndex ? 'active' : ''} ${idx < currentIndex ? 'completed' : ''}`} 
          />
        ))}
      </div>
    </div>
  );
}
