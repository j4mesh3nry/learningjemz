import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProvinceQuiz from './ProvinceQuiz';
import MapExplorer from './MapExplorer';
import { useGame } from '../../contexts/GameContext';
import { Target, Search, Landmark, ChevronRight } from 'lucide-react';
import './geo.css';

function GeoDashboard() {
  const navigate = useNavigate();
  const { xp, level, streak, provincesCorrect } = useGame();

  return (
    <div style={{
      background: 'linear-gradient(135deg, #112240, #0a192f)',
      minHeight: '100vh',
      color: '#fff',
      padding: '1.5rem',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: '0 8px 0 0' }}>←</button>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>🌍 Geography Hub</h1>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ color: '#fff', margin: '0', fontSize: '1.2rem', fontWeight: 600 }}>Expeditions</h2>

        <div 
          onClick={() => navigate('quiz')}
          style={{
            background: 'linear-gradient(135deg, #e91e63, #c2185b)',
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(233, 30, 99, 0.3)',
            transition: 'transform 0.2s',
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
              <Target size={32} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Province Quiz</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{provincesCorrect}/81 Mastered</div>
            </div>
          </div>
          <ChevronRight size={28} />
        </div>

        <div 
          onClick={() => navigate('explorer')}
          style={{
            background: 'linear-gradient(135deg, #3f51b5, #303f9f)',
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(63, 81, 181, 0.3)',
            transition: 'transform 0.2s',
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
              <Search size={32} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Map Explorer</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Free Roam Mode</div>
            </div>
          </div>
          <ChevronRight size={28} />
        </div>
        
        <div 
          style={{
            background: 'linear-gradient(135deg, #78909c, #546e7a)',
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: 0.7,
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
              <Landmark size={32} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Capital Quiz</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Coming Soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeoHome() {
  return (
    <Routes>
      <Route path="/" element={<GeoDashboard />} />
      <Route path="quiz" element={<ProvinceQuiz />} />
      <Route path="explorer" element={<MapExplorer />} />
    </Routes>
  );
}
