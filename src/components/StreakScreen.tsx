// src/components/StreakScreen.tsx
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import './streak.css';

export function getStreakStorageKey(userId?: string): string {
  return userId ? `learningjemz_streak_shown_${userId}` : 'learningjemz_streak_shown_guest';
}

export function hasShownStreakToday(userId?: string): boolean {
  try {
    const today = new Date().toDateString();
    const key = getStreakStorageKey(userId);
    return localStorage.getItem(key) === today;
  } catch {
    return false;
  }
}

export function markStreakShownToday(userId?: string): void {
  try {
    const today = new Date().toDateString();
    const key = getStreakStorageKey(userId);
    localStorage.setItem(key, today);
  } catch {}
}

export interface StreakScreenProps {
  isOpen: boolean;
  streak: number;
  onContinue: () => void;
  forceShow?: boolean;
  userId?: string;
}

const DAYS_HEADER = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function StreakScreen({
  isOpen,
  streak = 1,
  onContinue,
  forceShow = false,
  userId,
}: StreakScreenProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimated(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Enforce once-per-day rule unless forceShow is true
  if (!forceShow && hasShownStreakToday(userId)) {
    onContinue();
    return null;
  }

  const handleContinue = () => {
    markStreakShownToday(userId);
    onContinue();
  };

  const todayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon...

  return (
    <div className="duo-streak-screen" role="dialog" aria-modal="true" aria-label={`${streak} day streak`}>
      <div className={`duo-streak-content ${animated ? 'animated' : ''}`}>
        {/* Cool Flaming Mascot with Sunglasses */}
        <div className="duo-mascot-container">
          <div className="duo-flame-aura" />
          <div className="duo-mascot-flame">
            <div className="duo-flame-inner">
              <span className="duo-mascot-face" role="img" aria-label="Cool flame">😎</span>
            </div>
          </div>
        </div>

        {/* Big Number & Lowercase Title */}
        <div className="duo-streak-typography">
          <div className="duo-streak-number">{streak}</div>
          <div className="duo-streak-label">day streak</div>
        </div>

        {/* 7-Day Pill Calendar Tracker (Exact Duolingo Screenshot match) */}
        <div className="duo-calendar-wrapper">
          <div className="duo-days-header">
            {DAYS_HEADER.map((dayName, idx) => (
              <span
                key={idx}
                className={`duo-day-name ${idx === todayIndex ? 'today' : ''}`}
              >
                {dayName}
              </span>
            ))}
          </div>

          <div className="duo-pill-bar">
            {DAYS_HEADER.map((_, idx) => {
              const isPastOrToday = idx <= todayIndex;
              const isToday = idx === todayIndex;

              return (
                <div
                  key={idx}
                  className={`duo-pill-slot ${isPastOrToday ? 'active' : ''} ${isToday ? 'today' : ''}`}
                >
                  {isPastOrToday ? (
                    <Check size={18} color="#e65100" strokeWidth={3.5} />
                  ) : (
                    <span className="duo-pending-circle" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Full-Width Action Button */}
        <div className="duo-actions-footer">
          <button className="duo-continue-btn" onClick={handleContinue}>
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
