// src/components/StreakScreen.tsx
import React, { useEffect, useState } from 'react';
import { Flame, Sparkles, Check, Zap } from 'lucide-react';
import './streak.css';

const STREAK_SHOWN_KEY = 'learningjemz_streak_shown_date';

export function hasShownStreakToday(): boolean {
  try {
    const today = new Date().toDateString();
    return localStorage.getItem(STREAK_SHOWN_KEY) === today;
  } catch {
    return false;
  }
}

export function markStreakShownToday(): void {
  try {
    const today = new Date().toDateString();
    localStorage.setItem(STREAK_SHOWN_KEY, today);
  } catch {}
}

export interface StreakScreenProps {
  isOpen: boolean;
  streak: number;
  onContinue: () => void;
  forceShow?: boolean;
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function StreakScreen({
  isOpen,
  streak = 1,
  onContinue,
  forceShow = false,
}: StreakScreenProps) {
  const [ignited, setIgnited] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger entrance igniting animation sequence
      const timer = setTimeout(() => setIgnited(true), 150);
      return () => clearTimeout(timer);
    } else {
      setIgnited(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Check once-a-day requirement unless forceShow is true
  if (!forceShow && hasShownStreakToday()) {
    // Already shown today -> skip immediately
    onContinue();
    return null;
  }

  const handleContinue = () => {
    markStreakShownToday();
    onContinue();
  };

  const todayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon...

  return (
    <div className="streak-overlay" role="dialog" aria-modal="true" aria-label={`${streak} Day Streak!`}>
      {/* Background Ember Particles */}
      <div className="streak-particles">
        <span className="ember p1">🔥</span>
        <span className="ember p2">✨</span>
        <span className="ember p3">⚡</span>
        <span className="ember p4">✨</span>
        <span className="ember p5">🔥</span>
      </div>

      <div className={`streak-card ${ignited ? 'ignited' : ''}`}>
        {/* Top Flame Badge Container */}
        <div className="streak-badge-wrapper">
          <div className="streak-aura-ring ring-3" />
          <div className="streak-aura-ring ring-2" />
          <div className="streak-aura-ring ring-1" />
          
          <div className="streak-flame-circle">
            <Flame
              size={64}
              color="#ff3d00"
              fill="#ff6d00"
              className="streak-main-flame"
            />
            <Sparkles size={26} color="#ffd600" className="streak-sparkle-icon" />
          </div>
        </div>

        {/* Big Number & Title */}
        <div className="streak-count-title">
          <span className="streak-number">{streak}</span>
          <span className="streak-label">{streak === 1 ? 'DAY STREAK!' : 'DAYS STREAK!'}</span>
        </div>

        {/* Subtitle Slogan */}
        <p className="streak-subtitle">
          You're building a daily learning habit! Keep the flame burning tomorrow.
        </p>

        {/* 7-Day Week Calendar Streak Tracker */}
        <div className="streak-week-tracker">
          {DAYS_OF_WEEK.map((dayName, idx) => {
            const isToday = idx === todayIndex;
            const isPastActive = idx < todayIndex;
            const isActive = isPastActive || isToday;

            return (
              <div
                key={idx}
                className={`streak-day-item ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
              >
                <div className="streak-day-circle">
                  {isToday ? (
                    <Flame size={18} color="#ff3d00" fill="#ff6d00" />
                  ) : isPastActive ? (
                    <Check size={16} color="#ffffff" strokeWidth={3} />
                  ) : (
                    <span className="streak-day-dot" />
                  )}
                </div>
                <span className="streak-day-name">{dayName}</span>
              </div>
            );
          })}
        </div>

        {/* Big Duolingo-style Action Button */}
        <button className="streak-continue-btn" onClick={handleContinue}>
          <span>CONTINUE</span>
          <Zap size={20} fill="#ffffff" color="#ffffff" />
        </button>
      </div>
    </div>
  );
}
