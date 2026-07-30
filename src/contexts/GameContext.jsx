/* src/contexts/GameContext.jsx */
import { createContext, useContext, useEffect, useState } from 'react';

const GameContext = createContext();

// Helper to load/save from localStorage
const STORAGE_KEY = 'learningjemz-game-state';
function loadState() {
  const defaultState = {
    xp: 0,
    level: 1,
    streak: 0,
    maxStreak: 0,
    lastVisit: null,
    chessWins: 0,
    puzzlesSolved: 0,
    provincesCorrect: 0,
    readingMinutes: 0,
    flashcardsMastered: 0,
    booksReading: 0,
    quizHighScore: 0
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function GameProvider({ children }) {
  const [state, setState] = useState(loadState());

  // Streak calculation on mount
  useEffect(() => {
    setState(prev => {
      const today = new Date().toDateString();
      let newStreak = prev.streak;
      
      if (prev.lastVisit) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (prev.lastVisit === yesterday.toDateString()) {
          newStreak = prev.streak + 1;
        } else if (prev.lastVisit !== today) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
      return { ...prev, streak: newStreak, maxStreak: Math.max(prev.maxStreak || 0, newStreak), lastVisit: today };
    });
  }, []);

  // Save whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const addXp = (amount) => {
    setState(prev => {
      const newTotal = prev.xp + amount;
      const newLevel = Math.floor(newTotal / 100) + 1;
      return { ...prev, xp: newTotal, level: newLevel };
    });
  };

  const winChessGame = () => {
    setState(prev => ({ ...prev, chessWins: prev.chessWins + 1 }));
    addXp(50);
  };

  const solvePuzzle = () => {
    setState(prev => ({ ...prev, puzzlesSolved: prev.puzzlesSolved + 1 }));
    addXp(10);
  };

  const answerProvinceCorrect = () => {
    setState(prev => ({ ...prev, provincesCorrect: prev.provincesCorrect + 1 }));
    addXp(5);
  };

  const masterFlashcard = () => {
    setState(prev => ({ ...prev, flashcardsMastered: prev.flashcardsMastered + 1 }));
    addXp(5);
  };

  const readForMinutes = (mins) => {
    setState(prev => ({ ...prev, readingMinutes: prev.readingMinutes + mins }));
    addXp(mins * 2);
  };

  const startReadingBook = () => {
    setState(prev => ({ ...prev, booksReading: prev.booksReading + 1 }));
  };

  const updateQuizHighScore = (score) => {
    setState(prev => ({ ...prev, quizHighScore: Math.max(prev.quizHighScore, score) }));
  };

  const value = { 
    ...state, 
    addXp,
    winChessGame,
    solvePuzzle,
    answerProvinceCorrect,
    masterFlashcard,
    readForMinutes,
    startReadingBook,
    updateQuizHighScore
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
