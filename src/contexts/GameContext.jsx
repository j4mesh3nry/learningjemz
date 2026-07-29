/* src/contexts/GameContext.jsx */
import { createContext, useContext, useEffect, useState } from 'react';

const GameContext = createContext();

// Helper to load/save from localStorage
const STORAGE_KEY = 'learningjemz-game-state';
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { xp: 0, level: 1, streak: 0, lastVisit: null };
  } catch {
    return { xp: 0, level: 1, streak: 0, lastVisit: null };
  }
}
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function GameProvider({ children }) {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [lastVisit, setLastVisit] = useState(null);

  // Load on mount
  useEffect(() => {
    const init = loadState();
    setXp(init.xp);
    setLevel(init.level);
    setStreak(init.streak);
    setLastVisit(init.lastVisit);
    // streak calculation
    const today = new Date().toDateString();
    if (init.lastVisit) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (init.lastVisit === yesterday.toDateString()) {
        setStreak(prev => prev + 1);
      } else if (init.lastVisit !== today) {
        setStreak(1);
      }
    } else {
      setStreak(1);
    }
    setLastVisit(today);
  }, []);

  // Save whenever any metric changes
  useEffect(() => {
    saveState({ xp, level, streak, lastVisit });
  }, [xp, level, streak, lastVisit]);

  const addXp = (amount) => {
    setXp(prev => {
      const newTotal = prev + amount;
      const newLevel = Math.floor(newTotal / 100) + 1;
      setLevel(newLevel);
      return newTotal;
    });
  };

  const value = { xp, level, streak, addXp };
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
