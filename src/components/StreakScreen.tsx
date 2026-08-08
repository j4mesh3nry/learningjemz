// src/components/StreakScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Flame, Gem, Sparkles, Calendar as CalendarIcon, X } from 'lucide-react';
import { getLocalDateString, getCurrentWeekDates } from '../utils/dateUtils';
import { useGame } from '../contexts/GameContext';
import './streak.css';

export function getStreakStorageKey(userId?: string): string {
  return userId ? `learningjemz_streak_shown_${userId}` : 'learningjemz_streak_shown_guest';
}

export function getPlayedDatesStorageKey(userId?: string): string {
  return userId ? `learningjemz_played_dates_${userId}` : 'learningjemz_played_dates_guest';
}

export function hasShownStreakToday(userId?: string): boolean {
  try {
    const today = getLocalDateString(new Date());
    const key = getStreakStorageKey(userId);
    return localStorage.getItem(key) === today;
  } catch {
    return false;
  }
}

export function markStreakShownToday(userId?: string): void {
  try {
    const today = getLocalDateString(new Date());
    const key = getStreakStorageKey(userId);
    localStorage.setItem(key, today);
    recordPlayedDateToday(userId);
  } catch {}
}

export function resetStreakShownForUser(userId?: string): void {
  try {
    localStorage.removeItem(getStreakStorageKey(userId));
    localStorage.removeItem(getPlayedDatesStorageKey(userId));
  } catch {}
}

export function getPlayedDates(userId?: string): string[] {
  try {
    const key = getPlayedDatesStorageKey(userId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordPlayedDateToday(userId?: string): void {
  try {
    const today = getLocalDateString(new Date());
    const dates = getPlayedDates(userId);
    if (!dates.includes(today)) {
      dates.push(today);
      const key = getPlayedDatesStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(dates));
    }
  } catch {}
}

export interface StreakScreenProps {
  isOpen: boolean;
  streak: number;
  previousStreak?: number;
  onContinue: () => void;
  forceShow?: boolean;
  userId?: string;
}

const DAYS_HEADER = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function StreakScreen({
  isOpen,
  streak = 1,
  previousStreak,
  onContinue,
  forceShow = false,
  userId,
}: StreakScreenProps) {
  const gameContext = useGame();
  const contextPlayedDates = gameContext?.playedDates || [];

  const targetStreak = Math.max(1, streak);
  const initialStreak = previousStreak !== undefined 
    ? Math.max(0, previousStreak) 
    : Math.max(0, targetStreak - 1);

  const [currentDisplayStreak, setCurrentDisplayStreak] = useState(initialStreak);
  const [plusOneState, setPlusOneState] = useState<'hidden' | 'fade-in' | 'fade-out'>('hidden');
  const [isIgnited, setIsIgnited] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [playedDates, setPlayedDates] = useState<string[]>([]);
  const hasHandledContinueRef = useRef(false);

  const isAlreadyShown = !forceShow && hasShownStreakToday(userId);

  useEffect(() => {
    if (isOpen) {
      if (isAlreadyShown && !hasHandledContinueRef.current) {
        hasHandledContinueRef.current = true;
        onContinue();
        return;
      }
      recordPlayedDateToday(userId);
      const localDates = getPlayedDates(userId);
      const combined = Array.from(new Set([...contextPlayedDates, ...localDates]));
      setPlayedDates(combined);

      // Reset animation state
      setCurrentDisplayStreak(initialStreak);
      setPlusOneState('hidden');
      setIsIgnited(false);

      // Phase 1: Fade in +1 badge next to initial streak count
      const t1 = setTimeout(() => {
        setPlusOneState('fade-in');
      }, 350);

      // Phase 2: Fade out +1 badge & transition count to target streak
      const t2 = setTimeout(() => {
        setPlusOneState('fade-out');
        setCurrentDisplayStreak(targetStreak);
        setIsIgnited(true);
      }, 950);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      hasHandledContinueRef.current = false;
      setPlusOneState('hidden');
      setIsIgnited(false);
      setShowCalendar(false);
    }
  }, [isOpen, isAlreadyShown, userId, onContinue, initialStreak, targetStreak, contextPlayedDates]);

  if (!isOpen || isAlreadyShown) return null;

  const handleContinue = () => {
    hasHandledContinueRef.current = true;
    markStreakShownToday(userId);
    onContinue();
  };

  const todayDate = new Date();
  const todayIndex = todayDate.getDay(); // 0 = Sun, 1 = Mon...
  const todayDateStr = getLocalDateString(todayDate);

  // Compute dates for current week (Sun-Sat) using local date formatting
  const currentWeekDates = getCurrentWeekDates(todayDate);

  // Calendar view month computation
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = todayDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="jemz-streak-screen" role="dialog" aria-modal="true" aria-label={`${streak} day streak`}>
      <div className="jemz-streak-content">
        {/* LearningJemz Brand Gem & Flame Emblem Header */}
        <div className="jemz-mascot-wrapper">
          <div className="jemz-logo-badge">
            <Gem size={42} color="#ffffff" strokeWidth={2.5} />
            <Sparkles className="sparkle-badge" size={20} color="#ffd600" />
          </div>
          <div className={`jemz-flame-badge ${isIgnited ? 'ignited' : ''}`}>
            <Flame size={32} color="#ff3d00" fill="#ff6d00" />
          </div>
        </div>

        {/* Big Number, Transitioning +1 Badge & Label */}
        <div className="jemz-streak-typography">
          <div className="jemz-streak-number-row">
            <span key={currentDisplayStreak} className={`jemz-streak-number ${isIgnited ? 'ignite-pop' : ''}`}>
              {currentDisplayStreak}
            </span>
            {plusOneState !== 'hidden' && (
              <span className={`jemz-plus-one-badge ${plusOneState}`}>
                +1
              </span>
            )}
          </div>

          <div className="jemz-streak-label">
            {currentDisplayStreak === 1 ? 'DAY STREAK!' : 'DAYS STREAK!'}
          </div>

          <p className="jemz-streak-subtitle">
            You're building your daily habit! Keep learning every day.
          </p>
        </div>

        {/* 7-Day Week Tracker Bar (ONLY days played have fire icons!) */}
        <div className="jemz-week-card">
          <div className="jemz-days-header">
            {DAYS_HEADER.map((dayName, idx) => (
              <span
                key={idx}
                className={`jemz-day-name ${idx === todayIndex ? 'today' : ''}`}
              >
                {dayName}
              </span>
            ))}
          </div>

          <div className="jemz-pill-bar">
            {currentWeekDates.map((dateStr, idx) => {
              const isToday = idx === todayIndex;
              const hasPlayed = playedDates.includes(dateStr) || isToday;

              return (
                <div
                  key={idx}
                  className={`jemz-pill-slot ${hasPlayed ? 'played' : 'unplayed'} ${isToday ? 'today' : ''} ${isToday && isIgnited ? 'ignite-slot' : ''}`}
                >
                  {hasPlayed ? (
                    <Flame
                      size={20}
                      color={isToday ? "#ffffff" : "#ff6d00"}
                      fill={isToday ? "#ffd600" : "#ff6d00"}
                    />
                  ) : (
                    <span className="jemz-unplayed-dot" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons (Continue & View Calendar) */}
        <div className="jemz-actions-footer">
          <button className="jemz-continue-btn" onClick={handleContinue}>
            CONTINUE
          </button>
          
          <button
            className="jemz-calendar-btn"
            onClick={() => setShowCalendar(true)}
          >
            <CalendarIcon size={18} />
            <span>View Streak Calendar</span>
          </button>
        </div>
      </div>

      {/* Streak Calendar Drawer Modal */}
      {showCalendar && (
        <div className="jemz-calendar-modal-overlay">
          <div className="jemz-calendar-modal">
            <div className="jemz-calendar-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={20} color="#10b981" />
                <h3 className="jemz-calendar-title">{monthName} {year}</h3>
              </div>
              <button className="jemz-close-btn" onClick={() => setShowCalendar(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Monthly Calendar Grid */}
            <div className="jemz-month-grid">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="jemz-month-day-head">{d}</div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="jemz-month-day empty" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateObj = new Date(year, month, dayNum);
                const dateString = getLocalDateString(dateObj);
                const isPlayed = playedDates.includes(dateString);

                return (
                  <div
                    key={dayNum}
                    className={`jemz-month-day ${isPlayed ? 'played' : ''}`}
                  >
                    <span>{dayNum}</span>
                    {isPlayed && <Flame size={12} color="#e65100" fill="#ff6d00" className="cal-flame" />}
                  </div>
                );
              })}
            </div>

            <button className="jemz-close-cal-btn" onClick={() => setShowCalendar(false)}>
              Close Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
