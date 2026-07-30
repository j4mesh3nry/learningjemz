import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext.jsx';
import Flashcards from './Flashcards.jsx';
import SpaceQuiz from './SpaceQuiz.jsx';
import SolarSystem from './SolarSystem.jsx';
import './space.css';
import { BookOpen, HelpCircle, Compass, ChevronRight } from 'lucide-react';

const SpaceHub = () => {
  const navigate = useNavigate();
  const { xp, level, streak, flashcardsMastered, quizHighScore } = useGame();

  return (
    <div className="space-module">
      <div className="starfield">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`
          }}></div>
        ))}
      </div>
      
      <div className="space-header" style={{ position: 'relative', padding: '1rem 0 2rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}>←</button>
        <h1 style={{ fontSize: '1.8rem', margin: 0, background: 'none', WebkitTextFillColor: '#fff' }}>🪐 Space Explorer</h1>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-around',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
        position: 'relative',
        zIndex: 1,
        marginBottom: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem' }}>🔥</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{streak}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Streak</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem' }}>🎓</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Lv.{level}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Level</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem' }}>✨</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{xp}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>XP</div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ color: '#fff', margin: '0', fontSize: '1.2rem', fontWeight: 600 }}>Cosmic Missions</h2>

        <div 
          onClick={() => navigate('/space/flashcards')}
          style={{
            background: 'linear-gradient(135deg, #9c27b0, #6a1b9a)',
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(156, 39, 176, 0.3)',
            transition: 'transform 0.2s',
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
              <BookOpen size={32} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Cosmic Cards</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{flashcardsMastered} Mastered</div>
            </div>
          </div>
          <ChevronRight size={28} />
        </div>

        <div 
          onClick={() => navigate('/space/quiz')}
          style={{
            background: 'linear-gradient(135deg, #ff5722, #d84315)',
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(255, 87, 34, 0.3)',
            transition: 'transform 0.2s',
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
              <HelpCircle size={32} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Space Quiz</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>High Score: {quizHighScore}%</div>
            </div>
          </div>
          <ChevronRight size={28} />
        </div>

        <div 
          onClick={() => navigate('/space/solar-system')}
          style={{
            background: 'linear-gradient(135deg, #00bcd4, #00838f)',
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(0, 188, 212, 0.3)',
            transition: 'transform 0.2s',
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
              <Compass size={32} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Solar Explorer</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Interactive Map</div>
            </div>
          </div>
          <ChevronRight size={28} />
        </div>

        {/* Dummy options for scrolling */}
        <div style={{ background: 'linear-gradient(135deg, #3f51b5, #283593)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.7, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><Compass size={32} color="#fff" /></div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Constellation Guide</div><div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Coming Soon</div></div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #4caf50, #2e7d32)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.7, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><BookOpen size={32} color="#fff" /></div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Telescope View</div><div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Coming Soon</div></div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #e91e63, #c2185b)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.7, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><Compass size={32} color="#fff" /></div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Galaxy Mapper</div><div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Coming Soon</div></div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #ff9800, #ef6c00)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.7, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><HelpCircle size={32} color="#fff" /></div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Mars Rover Sim</div><div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Coming Soon</div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SpaceHome() {
  return (
    <Routes>
      <Route path="/" element={<SpaceHub />} />
      <Route path="flashcards" element={<Flashcards />} />
      <Route path="quiz" element={<SpaceQuiz />} />
      <Route path="solar-system" element={<SolarSystem />} />
    </Routes>
  );
}
