import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { BookOpen, Check, Lock, ChevronRight } from 'lucide-react';
import './chess.css';

const LESSONS = [
  { id: 1, title: 'How Pieces Move', xp: 30 },
  { id: 2, title: 'Check & Checkmate', xp: 30 },
  { id: 3, title: 'Basic Openings', xp: 30 },
  { id: 4, title: 'Tactics: Forks & Pins', xp: 30 },
  { id: 5, title: 'Endgame Basics', xp: 30 },
];

export default function ChessLessons() {
  const [completed, setCompleted] = useState(() => {
    return JSON.parse(localStorage.getItem('chess_lessons') || '[]');
  });
  const [activeLesson, setActiveLesson] = useState(null);
  const { addXp } = useGame();

  const handleLessonComplete = () => {
    if (activeLesson && !completed.includes(activeLesson.id)) {
      const newCompleted = [...completed, activeLesson.id];
      setCompleted(newCompleted);
      localStorage.setItem('chess_lessons', JSON.stringify(newCompleted));
      addXp(activeLesson.xp);
    }
    setActiveLesson(null);
  };

  if (activeLesson) {
    return (
      <div style={{ padding: '1rem', background: '#2a2a2a', borderRadius: '8px', flex: 1 }}>
        <h2 style={{ marginTop: 0 }}>{activeLesson.title}</h2>
        <div style={{ 
          background: '#1e3a2f', 
          aspectRatio: 1, 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '1rem 0'
        }}>
          <BookOpen size={48} color="#aaa" />
        </div>
        <p>Interactive mini board and text explanation would go here for {activeLesson.title}.</p>
        
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '2rem' }}>
          <button className="btn" onClick={handleLessonComplete}>
            Complete Lesson <ChevronRight size={16} style={{ verticalAlign: 'middle' }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-tree">
      {LESSONS.map((lesson, index) => {
        const isCompleted = completed.includes(lesson.id);
        const isUnlocked = isCompleted || index === 0 || completed.includes(LESSONS[index - 1].id);
        
        let statusClass = 'locked';
        let Icon = Lock;
        
        if (isCompleted) {
          statusClass = 'completed';
          Icon = Check;
        } else if (isUnlocked) {
          statusClass = 'in-progress';
          Icon = BookOpen;
        }

        return (
          <div key={lesson.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              className={`lesson-card ${statusClass}`}
              onClick={() => isUnlocked && setActiveLesson(lesson)}
            >
              <Icon size={32} color={isCompleted ? '#fff' : isUnlocked ? '#fff' : '#666'} />
            </div>
            <div style={{ marginTop: '0.5rem', fontWeight: 'bold', textAlign: 'center' }}>
              {lesson.title}
            </div>
          </div>
        );
      })}
    </div>
  );
}
