import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Target, Trophy, Zap, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import './space.css';

const DIFFICULTIES = {
  easy: { name: 'Easy', count: 8, label: 'Top 8 (Sun → Mars)', maxLives: 3, color: '#16653e' },
  medium: { name: 'Medium', count: 15, label: 'Top 15 (Sun → Europa)', maxLives: 4, color: '#d97706' },
  hard: { name: 'Hard', count: 35, label: 'All 35 (Sun → Salacia)', maxLives: 5, color: '#e53935' }
};

export default function ObjectsBySizeMenu() {
  const navigate = useNavigate();
  const { illuminateStats } = useGame();
  const [showIlluminateLevels, setShowIlluminateLevels] = useState(false);

  const personalBests = illuminateStats || {};

  const formatTime = (secs) => {
    if (secs === undefined || secs === null || secs === 0) return '--:--';
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleStartGame = (diffKey) => {
    navigate(`/space/illuminate?level=${diffKey}`);
  };

  return (
    <div className="space-module-page">
      {/* Header Container with Separated Back Button & Long Green Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {/* Separated Back Button */}
        <button 
          onClick={() => navigate('/space')} 
          title="Back to Space"
          aria-label="Back to Space"
          style={{
            background: '#ffffff',
            border: '2px solid #b0cbaf',
            boxShadow: '0 3px 0 #b0cbaf',
            borderRadius: 14,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16653e',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>

        {/* Long Green Banner Rectangle */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #16653e 0%, #0d462b 100%)',
          borderRadius: 16,
          border: '2px solid #0f3825',
          boxShadow: '0 4px 0 #092c1d',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <h1 style={{
            margin: 0, color: '#ffffff', fontSize: '1.25rem',
            fontFamily: 'var(--font-heading)', fontWeight: 900
          }}>
            Objects by Size
          </h1>
        </div>
      </div>

      {/* Simple Subtitle Container Pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#ffffff',
        border: '2px solid #b0cbaf',
        boxShadow: '0 2.5px 0 #b0cbaf',
        borderRadius: 12,
        padding: '6px 14px',
        marginBottom: 16,
        fontSize: '0.82rem',
        color: '#0f3825',
        fontWeight: 700,
        width: 'fit-content'
      }}>
        <Target size={14} color="#16653e" /> Explore and memorize the 35 largest solar objects!
      </div>

      {/* Mode List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Illuminate the System Card with Accordion Level Selection */}
        <div style={{
          background: '#ffffff',
          borderRadius: 18,
          border: '2px solid #b0cbaf',
          boxShadow: '0 4px 0 #b0cbaf',
          overflow: 'hidden',
          transition: 'all 0.15s ease'
        }}>
          {/* Main Card Header (Click to Expand / Toggle) */}
          <div 
            onClick={() => setShowIlluminateLevels(prev => !prev)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', cursor: 'pointer',
              background: '#ffffff'
            }}
          >
            <div style={{
              fontSize: '1.5rem', width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#e1f0e2', borderRadius: 12,
              flexShrink: 0
            }}>
              💡
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f3825', lineHeight: 1.2 }}>
                Illuminate the System
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#4e7361', fontWeight: 600, lineHeight: 1.2 }}>
                Type the names in order
              </p>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: showIlluminateLevels ? '#16653e' : '#e1f0e2',
              color: showIlluminateLevels ? '#ffffff' : '#16653e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}>
              {showIlluminateLevels ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {/* Level Options Expandable Sub-bar */}
          {showIlluminateLevels && (
            <div style={{
              background: '#f8fdf8',
              borderTop: '2px solid #b0cbaf',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4e7361', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Select Difficulty:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(DIFFICULTIES).map(([key, diff]) => (
                  <div
                    key={key}
                    onClick={() => handleStartGame(key)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#ffffff',
                      border: `2px solid ${diff.color}`,
                      boxShadow: `0 3px 0 ${diff.color}`,
                      borderRadius: 14,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 900, fontSize: '0.95rem', color: diff.color }}>{diff.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {Array.from({ length: diff.maxLives }).map((_, i) => (
                            <Heart key={i} size={12} fill="#ff4d4d" color="#ff4d4d" />
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#4e7361', fontWeight: 600, marginTop: 2 }}>
                        {diff.label}
                      </div>
                    </div>
                    <button style={{
                      background: diff.color, color: '#ffffff',
                      border: 'none', borderRadius: 10,
                      fontWeight: 800, fontSize: '0.78rem',
                      padding: '6px 14px', cursor: 'pointer',
                      boxShadow: '0 2px 0 rgba(0,0,0,0.2)'
                    }}>
                      Play →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Blurred Locked Card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: '#ffffff', borderRadius: 18,
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
              📏
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f3825', lineHeight: 1.2 }}>Size Stack Challenge</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#4e7361', fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Drag and order planets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Best Time Records Widget - Labeled for Illuminate the System */}
      <div style={{ marginTop: 24, padding: 16, background: '#ffffff', borderRadius: 18, border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '0.92rem', color: '#0f3825', marginBottom: 12 }}>
          <Trophy size={18} color="#d97706" /> Best Time Records — Illuminate the System
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {Object.entries(DIFFICULTIES).map(([key, diff]) => {
            const pbTime = personalBests[key];
            return (
              <div 
                key={key} 
                style={{
                  background: '#e1f0e2',
                  borderRadius: 14,
                  padding: '10px 8px',
                  textAlign: 'center',
                  border: '1.5px solid #b0cbaf',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#0f3825', fontWeight: 800 }}>
                  {diff.name}
                </div>
                <div style={{ fontSize: '1.05rem', color: pbTime !== undefined && pbTime !== null ? '#16653e' : '#4e7361', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Zap size={14} color={pbTime !== undefined && pbTime !== null ? '#ffb300' : '#adb5bd'} />
                  {formatTime(pbTime)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
