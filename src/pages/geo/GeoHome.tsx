import React, { useState, lazy, Suspense } from 'react';
import { Card } from '../../components/Card';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProvinceQuiz from './ProvinceQuiz';
const MapExplorer = lazy(() => import('./MapExplorer'));
import { useGame } from '../../contexts/GameContext';
import { Flame, Star, BookOpen, Gamepad2 } from 'lucide-react';
import '../../pages/geo/geo.css';

function GeoDashboard() {
  const navigate = useNavigate();
  const { level, streak, provincesCorrect, hasPlayedToday } = useGame();
  const [tab, setTab] = useState<'learn' | 'play'>('play');

  return (
    <div className="geo-module-page">
      {/* Navigation Header */}
      <div className="geo-nav-header">
        <div className="geo-header-left">
          <button className="geo-back-btn" onClick={() => navigate('/')}
            title="Back to Home"
            aria-label="Back to Home"
          >
            ←
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              fontSize: '1.1rem', width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #004e92 0%, #0077b6 100%)', borderRadius: 8,
              boxShadow: '0 2px 6px rgba(0,119,182,0.3)'
            }}>
              🌍
            </div>
            <h1 className="geo-page-title" style={{ margin: 0, color: '#0066cc', fontSize: '1.4rem', fontWeight: 900 }}>Geography</h1>
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
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: hasPlayedToday ? '#e53935' : '#444444' }}>{streak ?? 0}</span>
          </div>
          <div style={{ height: 1, background: '#eee', margin: '1px 0' }} />
          <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, cursor: 'pointer' }} aria-label="Go to Profile" role="button">
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
            color: tab === 'play' ? '#0066cc' : '#6c757d',
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
          <Gamepad2 size={16} color={tab === 'play' ? '#0066cc' : '#6c757d'} />
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
            color: tab === 'learn' ? '#0066cc' : '#6c757d',
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
          <BookOpen size={16} color={tab === 'learn' ? '#0066cc' : '#6c757d'} />
          Learn
        </button>
      </div>

      {tab === 'learn' ? (
        <>
          {/* Active Learn Modes */}
          <h2 className="geo-section-heading">Interactive Maps & Discovery</h2>
          <div className="geo-card-list">
            <Card className="geo-card-item" onClick={() => navigate('explorer')} ariaLabel="Open Map Explorer">
              <div className="geo-card-icon">🗺️</div>
              <div className="geo-card-info">
                <h3 className="geo-card-title">Map Explorer</h3>
                <p className="geo-card-subtitle">Free roam interactive map of Philippine provinces</p>
              </div>
              <div className="geo-card-arrow">→</div>
            </Card>
          </div>

          {/* Locked Learn Modes */}
          <h2 className="geo-section-heading">Culture & Heritage (Locked)</h2>
          <div className="geo-card-list">
            <div className="geo-card-item locked" aria-disabled="true">
              <div className="geo-card-icon">📍</div>
              <div className="geo-card-info">
                <h3 className="geo-card-title">Landmark Finder</h3>
                <p className="geo-card-subtitle">Locate historical landmarks & natural wonders</p>
              </div>
              <div className="geo-lock-badge">🔒 Locked</div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Active Play & Earn Modes */}
          <h2 className="geo-section-heading">Earn XP & Streaks</h2>
          <div className="geo-card-list">
            <Card className="geo-card-item" onClick={() => navigate('quiz')} ariaLabel="Start Province Quiz">
              <div className="geo-card-icon">🎯</div>
              <div className="geo-card-info">
                <h3 className="geo-card-title">Province Quiz</h3>
                <p className="geo-card-subtitle">{provincesCorrect || 0}/81 provinces mastered</p>
              </div>
              <div className="geo-card-arrow">→</div>
            </Card>
          </div>

          {/* Locked Play Modes */}
          <h2 className="geo-section-heading">Geo Challenges (Locked)</h2>
          <div className="geo-card-list">
            <div className="geo-card-item locked" aria-disabled="true">
              <div className="geo-card-icon">🏛️</div>
              <div className="geo-card-info">
                <h3 className="geo-card-title">Capital Quiz</h3>
                <p className="geo-card-subtitle">Match provinces to their capitals</p>
              </div>
              <div className="geo-lock-badge">🔒 Locked</div>
            </div>

            <div className="geo-card-item locked" aria-disabled="true">
              <div className="geo-card-icon">🚩</div>
              <div className="geo-card-info">
                <h3 className="geo-card-title">Flag Guesser</h3>
                <p className="geo-card-subtitle">Identify regional & provincial flags</p>
              </div>
              <div className="geo-lock-badge">🔒 Locked</div>
            </div>

            <div className="geo-card-item locked" aria-disabled="true">
              <div className="geo-card-icon">👥</div>
              <div className="geo-card-info">
                <h3 className="geo-card-title">Population Sorter</h3>
                <p className="geo-card-subtitle">Rank provinces by population under time limit</p>
              </div>
              <div className="geo-lock-badge">🔒 Locked</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function GeoHome() {
  return (
    <Routes>
      <Route path="/" element={<GeoDashboard />} />
      <Route path="quiz" element={<ProvinceQuiz />} />
      <Route path="explorer" element={<Suspense fallback={<div>Loading...</div>}><MapExplorer /></Suspense>} />
    </Routes>
  );
}
