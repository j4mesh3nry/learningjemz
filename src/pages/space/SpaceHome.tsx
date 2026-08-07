import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import Flashcards from './Flashcards';
import SpaceQuiz from './SpaceQuiz';
import SolarSystem3D from './SolarSystem3D';
import SizeStack from './SizeStack';
import ObjectsBySizeMenu from './ObjectsBySizeMenu';
import IlluminateSystem from './IlluminateSystem';
import { Flame, Star, BookOpen, Gamepad2 } from 'lucide-react';
import { Card } from '../../components/Card';
import './space.css';

function SpaceHub() {
  const navigate = useNavigate();
  const { level, streak, hasPlayedToday } = useGame();
  const [tab, setTab] = useState<'learn' | 'play'>('play');

  return (
    <div className="space-module-page">
      {/* Navigation Header */}
      <div className="space-nav-header">
        <div className="space-header-left">
          <button className="space-back-btn" onClick={() => navigate('/')} title="Back to Home">
            ←
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              fontSize: '1.1rem', width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 100%)', borderRadius: 8,
              boxShadow: '0 2px 6px rgba(26,26,62,0.3)'
            }}>
              🪐
            </div>
            <h1 className="space-page-title" style={{ margin: 0, color: '#111324', fontSize: '1.4rem', fontWeight: 900 }}>
              Space
            </h1>
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 3,
          background: '#fafafa', padding: '5px 9px', borderRadius: 12,
          border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          minWidth: 76, boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <Flame 
              size={13} 
              color={hasPlayedToday ? '#ff4d4d' : '#888888'} 
              fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} 
            />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: hasPlayedToday ? '#e53935' : '#444444' }}>
              {streak ?? 0}
            </span>
          </div>
          <div style={{ height: 1, background: '#eee', margin: '1px 0' }} />
          <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, cursor: 'pointer' }}>
            <Star size={13} color="#f57f17" fill="#ffb300" />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#f57f17' }}>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* Mode Selector: Play vs Learn */}
      <div style={{
        display: 'flex',
        background: '#f1f3f5',
        padding: '4px',
        borderRadius: 14,
        marginBottom: 20
      }}>
        <button
          onClick={() => setTab('play')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'play' ? '#ffffff' : 'transparent',
            color: tab === 'play' ? '#1c7c54' : '#6c757d',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: tab === 'play' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Gamepad2 size={16} color={tab === 'play' ? '#1c7c54' : '#6c757d'} />
          Play
        </button>
        <button
          onClick={() => setTab('learn')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'learn' ? '#ffffff' : 'transparent',
            color: tab === 'learn' ? '#1c7c54' : '#6c757d',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: tab === 'learn' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <BookOpen size={16} color={tab === 'learn' ? '#1c7c54' : '#6c757d'} />
          Learn
        </button>
      </div>

      {tab === 'learn' ? (
        <>
          {/* Active Learning Modes */}
          <h2 className="space-section-heading">Exploration & Discovery</h2>
          <div className="space-card-list">
            <Card
              className="space-card-item"
              onClick={() => navigate('/space/solar-system')}
              ariaLabel="Solar Explorer"
            >
              <div className="space-card-icon">🪐</div>
              <div className="space-card-info">
                <h3 className="space-card-title">Solar Explorer</h3>
                <p className="space-card-subtitle">Interactive 3D solar system map</p>
              </div>
              <div className="space-card-arrow">→</div>
            </Card>

            <Card
              className="space-card-item"
              onClick={() => navigate('/space/illuminate')}
              ariaLabel="Sun & Shadow Sim"
            >
              <div className="space-card-icon">☀️</div>
              <div className="space-card-info">
                <h3 className="space-card-title">Sun & Shadow Sim</h3>
                <p className="space-card-subtitle">Explore day, night & planetary light</p>
              </div>
              <div className="space-card-arrow">→</div>
            </Card>
          </div>

          {/* Locked Learning Modes */}
          <h2 className="space-section-heading">Deep Space (Locked)</h2>
          <div className="space-card-list">
            <Card className="space-card-item locked" ariaLabel="Constellation Guide (Locked)" onClick={() => {}}>
              <div className="space-card-icon">🌌</div>
              <div className="space-card-info">
                <h3 className="space-card-title">Constellation Guide</h3>
                <p className="space-card-subtitle">Identify star patterns</p>
              </div>
              <div className="space-lock-badge">🔒 Locked</div>
            </Card>
            <Card className="space-card-item locked" ariaLabel="Telescope View (Locked)" onClick={() => {}}>
              <div className="space-card-icon">🔭</div>
              <div className="space-card-info">
                <h3 className="space-card-title">Telescope View</h3>
                <p className="space-card-subtitle">Distant galaxy imagery</p>
              </div>
              <div className="space-lock-badge">🔒 Locked</div>
            </Card>
            <Card className="space-card-item locked" ariaLabel="Galaxy Mapper (Locked)" onClick={() => {}}>
              <div className="space-card-icon">🗺️</div>
              <div className="space-card-info">
                <h3 className="space-card-title">Galaxy Mapper</h3>
                <p className="space-card-subtitle">Milky Way structure map</p>
              </div>
              <div className="space-lock-badge">🔒 Locked</div>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Active Play & Earn Modes */}
          <h2 className="space-section-heading">Earn XP & Streaks</h2>
          <div className="space-card-list">
            <Card
              className="space-card-item"
              onClick={() => navigate('/space/objects-by-size')}
              ariaLabel="Objects by Size"
            >
              <div className="space-card-icon">📏</div>
              <div className="space-card-info">
                <h3 className="space-card-title">Objects by Size</h3>
                <p className="space-card-subtitle">Master the 35 largest cosmic objects</p>
              </div>
              <div className="space-card-arrow">→</div>
            </Card>

            <Card
              className="space-card-item"
              onClick={() => navigate('/space/size-stack')}
              ariaLabel="Size Stack Challenge"
            >
              <div className="space-card-icon">🥞</div>
              <div className="space-card-info">
                <h3 className="space-card-title">Size Stack Challenge</h3>
                <p className="space-card-subtitle">Stack celestial bodies by scale</p>
              </div>
              <div className="space-card-arrow">→</div>
            </Card>

            <Card
              className="space-card-item"
              onClick={() => navigate('/space/quiz')}
              ariaLabel="Space Quiz"
            >
              <div className="space-card-icon">❓</div>
              <div className="space-card-info">
                <h3 className="space-card-title">Space Quiz</h3>
                <p className="space-card-subtitle">Test cosmic knowledge & earn XP</p>
              </div>
              <div className="space-card-arrow">→</div>
            </Card>

            <Card
              className="space-card-item"
              onClick={() => navigate('/space/flashcards')}
              ariaLabel="Cosmic Cards"
            >
              <div className="space-card-icon">🎴</div>
              <div className="space-card-info">
                <h3 className="space-card-title">Cosmic Cards</h3>
                <p className="space-card-subtitle">Speed flashcards memory test</p>
              </div>
              <div className="space-card-arrow">→</div>
            </Card>
          </div>

          {/* Locked Play Modes */}
          <h2 className="space-section-heading">Cosmic Challenges (Locked)</h2>
          <div className="space-card-list">
            <Card className="space-card-item locked" ariaLabel="Mars Rover Sim (Locked)" onClick={() => {}}>
              <div className="space-card-icon">🚀</div>
              <div className="space-card-info">
                <h3 className="space-card-title">Mars Rover Sim</h3>
                <p className="space-card-subtitle">Drive virtual rovers under time limit</p>
              </div>
              <div className="space-lock-badge">🔒 Locked</div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default function SpaceHome() {
  return (
    <Routes>
      <Route path="/" element={<SpaceHub />} />
      <Route path="flashcards" element={<Flashcards />} />
      <Route path="quiz" element={<SpaceQuiz />} />
      <Route path="solar-system" element={<SolarSystem3D />} />
      <Route path="objects-by-size" element={<ObjectsBySizeMenu />} />
      <Route path="size-stack" element={<SizeStack />} />
      <Route path="illuminate" element={<IlluminateSystem />} />
    </Routes>
  );
}
