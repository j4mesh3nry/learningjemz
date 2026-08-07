import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import Flashcards from './Flashcards';
import SpaceQuiz from './SpaceQuiz';
import SolarSystem3D from './SolarSystem3D';
import SizeStack from './SizeStack';
import ObjectsBySizeMenu from './ObjectsBySizeMenu';
import IlluminateSystem from './IlluminateSystem';
import { Flame, Star, BookOpen, Gamepad2, ArrowLeft, Lock } from 'lucide-react';
import { Card } from '../../components/Card';
import './space.css';

function SpaceHub() {
  const navigate = useNavigate();
  const { level, streak, hasPlayedToday } = useGame();
  const [tab, setTab] = useState<'play' | 'learn'>('play');

  return (
    <div className="space-module-page">
      {/* Navigation Header */}
      <div className="space-nav-header">
        <div className="space-header-left">
          <button 
            onClick={() => navigate('/')} 
            title="Back to Home"
            aria-label="Back to Home"
            style={{
              background: '#ffffff',
              border: '2px solid #b0cbaf',
              boxShadow: '0 3px 0 #b0cbaf',
              borderRadius: 14,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16653e',
              cursor: 'pointer',
              transition: 'transform 0.1s ease',
              flexShrink: 0
            }}
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              fontSize: '1.1rem', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#161936', borderRadius: 10,
              boxShadow: '0 2px 0 #0b0d1e'
            }}>
              🪐
            </div>
            <h1 className="space-page-title" style={{ margin: 0, color: '#0f3825', fontSize: '1.4rem', fontWeight: 900 }}>
              Space
            </h1>
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 3,
          background: '#ffffff', padding: '5px 9px', borderRadius: 12,
          border: '2px solid #b0cbaf', boxShadow: '0 2px 0 #b0cbaf',
          minWidth: 76, boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <Flame 
              size={13} 
              color={hasPlayedToday ? '#ff4d4d' : '#888888'} 
              fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} 
            />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: hasPlayedToday ? '#e53935' : '#4e7361' }}>
              {streak ?? 0}
            </span>
          </div>
          <div style={{ height: 1, background: '#b0cbaf', margin: '1px 0' }} />
          <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, cursor: 'pointer' }}>
            <Star size={13} color="#f57f17" fill="#ffb300" />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#d97706' }}>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* Mode Selector: Play vs Learn */}
      <div style={{
        display: 'flex',
        background: '#ffffff',
        padding: '4px',
        borderRadius: 14,
        border: '2px solid #b0cbaf',
        boxShadow: '0 3px 0 #b0cbaf',
        marginBottom: 18
      }}>
        <button
          onClick={() => setTab('play')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'play' ? '#16653e' : 'transparent',
            color: tab === 'play' ? '#ffffff' : '#4e7361',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Gamepad2 size={16} color={tab === 'play' ? '#ffffff' : '#4e7361'} />
          Play
        </button>
        <button
          onClick={() => setTab('learn')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'learn' ? '#16653e' : 'transparent',
            color: tab === 'learn' ? '#ffffff' : '#4e7361',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <BookOpen size={16} color={tab === 'learn' ? '#ffffff' : '#4e7361'} />
          Learn
        </button>
      </div>

      {tab === 'learn' ? (
        <>
          {/* Active Learning Modes */}
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.15rem',
            margin: '0 0 12px 0', color: '#0f3825', fontWeight: 800
          }}>
            Exploration & Discovery
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card
              className="space-card-item"
              onClick={() => navigate('/space/solar-system')}
              ariaLabel="Solar Explorer"
              style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14,
                textDecoration: 'none', color: '#fff',
                background: '#161936', borderRadius: 16,
                padding: '12px 16px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 4px 0 #0b0d1e',
                border: '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                fontSize: '1.6rem', width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)', borderRadius: 12,
                flexShrink: 0
              }}>
                🪐
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>Solar Explorer</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.9, fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Explore 3D solar map</p>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>→</div>
            </Card>

            {/* Blurred Locked Card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: '#ffffff', borderRadius: 16,
              border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf',
              padding: '12px 16px', position: 'relative', overflow: 'hidden',
              cursor: 'not-allowed'
            }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                zIndex: 10, background: '#16653e', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800,
                padding: '6px 12px', borderRadius: 12, border: '1.5px solid #0e4329', boxShadow: '0 3px 0 #0e4329',
                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
              }}>
                <Lock size={12} color="#ffffff" /> Locked
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                filter: 'blur(7px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none'
              }}>
                <div style={{
                  fontSize: '1.6rem', width: 44, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#e1f0e2', borderRadius: 12, flexShrink: 0
                }}>
                  ✨
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f3825', lineHeight: 1.2 }}>Deep Nebula</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#4e7361', fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Stars & Galaxies Guide</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Active Play & Earn Modes */}
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.15rem',
            margin: '0 0 12px 0', color: '#0f3825', fontWeight: 800
          }}>
            Earn XP & Streaks
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card
              className="space-card-item"
              onClick={() => navigate('/space/objects-by-size')}
              ariaLabel="Objects by Size"
              style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14,
                textDecoration: 'none', color: '#fff',
                background: '#161936', borderRadius: 16,
                padding: '12px 16px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 4px 0 #0b0d1e',
                border: '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                fontSize: '1.6rem', width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)', borderRadius: 12,
                flexShrink: 0
              }}>
                📏
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>Objects by Size</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.9, fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Compare cosmic sizes</p>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>→</div>
            </Card>

            {/* Blurred Locked Cards */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: '#ffffff', borderRadius: 16,
              border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf',
              padding: '12px 16px', position: 'relative', overflow: 'hidden',
              cursor: 'not-allowed'
            }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                zIndex: 10, background: '#16653e', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800,
                padding: '6px 12px', borderRadius: 12, border: '1.5px solid #0e4329', boxShadow: '0 3px 0 #0e4329',
                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
              }}>
                <Lock size={12} color="#ffffff" /> Locked
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                filter: 'blur(7px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none'
              }}>
                <div style={{
                  fontSize: '1.6rem', width: 44, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#e1f0e2', borderRadius: 12, flexShrink: 0
                }}>
                  🎯
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f3825', lineHeight: 1.2 }}>Space Quiz</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#4e7361', fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Test cosmic knowledge</p>
                </div>
              </div>
            </div>
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
      <Route path="solar-system" element={<SolarSystem3D />} />
      <Route path="illuminate" element={<IlluminateSystem />} />
      <Route path="objects-by-size" element={<ObjectsBySizeMenu />} />
      <Route path="size-stack" element={<SizeStack />} />
      <Route path="flashcards" element={<Flashcards />} />
      <Route path="quiz" element={<SpaceQuiz />} />
    </Routes>
  );
}
