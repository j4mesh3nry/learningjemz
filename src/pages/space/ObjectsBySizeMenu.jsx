import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Target, Trophy, Zap, Heart, ChevronDown, ChevronUp, Lightbulb, Sparkles, Ruler } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import './space.css';

const DIFFICULTIES = {
  easy: { name: 'Easy', count: 8, label: 'Top 8 (Sun → Mars)', maxLives: 3, color: '#0284c7' },
  medium: { name: 'Medium', count: 15, label: 'Top 15 (Sun → Europa)', maxLives: 4, color: '#d97706' },
  hard: { name: 'Hard', count: 35, label: 'All 35 (Sun → Salacia)', maxLives: 5, color: '#e53935' }
};

export default function ObjectsBySizeMenu() {
  const navigate = useNavigate();
  const { illuminateStats } = useGame();
  const [showIlluminateLevels, setShowIlluminateLevels] = useState(false);
  const [showInfoBubble, setShowInfoBubble] = useState(false);

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
      {/* Header — same layout as SpaceHome space-nav-header */}
      <div className="space-nav-header">
        <div className="space-header-left">
          <button
            onClick={() => navigate('/space')}
            title="Back to Space"
            aria-label="Back to Space"
            style={{
              background: '#161936',
              border: '2px solid #385e8a',
              boxShadow: '0 3px 0 #385e8a',
              borderRadius: 14,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#161936', borderRadius: 10,
              boxShadow: '0 2px 0 #0b0d1e',
              border: '1.5px solid #385e8a'
            }}>
              <Ruler size={18} color="#38bdf8" />
            </div>
            <h1 className="space-page-title" style={{ margin: 0, color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 900 }}>
              Objects by Size
            </h1>
          </div>
        </div>
      </div>

      {/* Primary Description Card */}
      <div style={{
        background: '#161936',
        borderRadius: 16,
        border: '2px solid #385e8a',
        boxShadow: '0 4px 0 #0b0d1e',
        padding: '12px 16px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#232752', color: '#38bdf8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <Target size={20} />
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 700, lineHeight: 1.35 }}>
          Explore and memorize the 35 largest solar objects!
        </p>
      </div>

      {/* Active Game Modes Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Game 1: Illuminate the System Collapsible Card */}
        <div style={{
          position: 'relative',
          background: '#161936',
          borderRadius: 18,
          border: '2px solid #385e8a',
          boxShadow: '0 4px 0 #0b0d1e',
          overflow: 'visible',
          transition: 'all 0.15s ease'
        }}>
          {/* Main Card Header (Click to Expand / Toggle) */}
          <div
            onClick={(e) => {
              if (e.target.closest('.mode-info-btn') || e.target.closest('.cosmic-info-bubble')) {
                return;
              }
              setShowIlluminateLevels(prev => !prev);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', cursor: 'pointer',
              background: '#161936',
              borderRadius: 16
            }}
          >
            <div style={{
              fontSize: '1.5rem', width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#232752', borderRadius: 12,
              flexShrink: 0
            }}>
              <Lightbulb size={22} color="#38bdf8" />
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 40 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>
                Illuminate the System
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, lineHeight: 1.2 }}>
                Type names in size order
              </p>
            </div>

            <button
              type="button"
              className="mode-info-btn"
              title="Illuminate the System Rules & XP"
              aria-label="Illuminate the System Rules & XP"
              style={{ position: 'static', flexShrink: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowInfoBubble(prev => !prev);
              }}
            >
              <span className="mode-info-icon-text">i</span>
            </button>

            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: showIlluminateLevels ? '#385e8a' : '#232752',
              color: showIlluminateLevels ? '#ffffff' : '#38bdf8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}>
              {showIlluminateLevels ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {/* Inline Speech Bubble */}
          {showInfoBubble && (
            <div className="cosmic-info-bubble" style={{ top: 56, right: 12 }} onClick={(e) => e.stopPropagation()}>
              <div className="cosmic-bubble-arrow" />
              <div className="cosmic-bubble-title">Illuminate Rules</div>
              <div className="cosmic-bubble-list">
                <div className="cosmic-bubble-item">
                  <Target size={14} color="#38bdf8" className="flex-shrink-0" />
                  <span>Type 8, 15, or 35 solar objects from largest to smallest</span>
                </div>
                <div className="cosmic-bubble-item">
                  <Heart size={14} color="#ef4444" fill="#ef4444" className="flex-shrink-0" />
                  <span>Limited lives (3-5) depending on selected difficulty</span>
                </div>
                <div className="cosmic-bubble-item">
                  <Zap size={14} color="#22c55e" className="flex-shrink-0" />
                  <span>Earn +15 to +35 XP based on difficulty completed</span>
                </div>
              </div>
            </div>
          )}

          {/* Level Options Expandable Sub-bar */}
          {showIlluminateLevels && (
            <div style={{
              background: '#0f1226',
              borderTop: '2px solid #385e8a',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Select Difficulty:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(DIFFICULTIES).map(([key, diff]) => (
                  <div
                    key={key}
                    onClick={() => handleStartGame(key)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#161936',
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
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>
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
          background: '#161936', borderRadius: 18,
          border: '2px solid #385e8a', boxShadow: '0 4px 0 #0b0d1e',
          padding: '12px 16px', position: 'relative', overflow: 'hidden',
          cursor: 'not-allowed'
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 10, background: '#385e8a', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800,
            padding: '6px 12px', borderRadius: 12, border: '1.5px solid #1e3a8a', boxShadow: '0 3px 0 #1e3a8a',
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
              background: '#232752', borderRadius: 12, flexShrink: 0
            }}>
              <Ruler size={24} color="#38bdf8" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>Size Stack Challenge</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Drag and order planets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Organized Best Time Records Hub */}
      <div style={{
        marginTop: 20,
        background: '#161936',
        borderRadius: 20,
        border: '2px solid #385e8a',
        boxShadow: '0 4px 0 #0b0d1e',
        padding: '16px 18px'
      }}>
        {/* Main Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          paddingBottom: 10,
          borderBottom: '2px solid #385e8a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: '1rem', color: '#f1f5f9' }}>
            <Trophy size={20} color="#ffb400" /> Best Time Records
          </div>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800, background: '#232752', padding: '3px 10px', borderRadius: 8 }}>
            Objects by Size
          </span>
        </div>

        {/* Game 1: Illuminate the System Records */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.84rem', fontWeight: 800, color: '#f1f5f9',
            marginBottom: 8
          }}>
            <Lightbulb size={16} color="#38bdf8" /> Illuminate the System
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {Object.entries(DIFFICULTIES).map(([key, diff]) => {
              const pbTime = personalBests[key];
              const hasRecord = pbTime !== undefined && pbTime !== null && pbTime > 0;
              return (
                <div
                  key={key}
                  style={{
                    background: '#0f1226',
                    borderRadius: 14,
                    padding: '10px 8px',
                    textAlign: 'center',
                    border: `2px solid ${hasRecord ? diff.color : '#385e8a'}`,
                    boxShadow: hasRecord ? `0 2.5px 0 ${diff.color}` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#f1f5f9', fontWeight: 800 }}>
                    {diff.name}
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: hasRecord ? '#f1f5f9' : '#94a3b8',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}>
                    <Zap size={13} color={hasRecord ? '#ffb400' : '#475569'} fill={hasRecord ? '#ffb400' : 'none'} />
                    {formatTime(pbTime)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game 2: Size Stack Challenge Records (Future Placeholder) */}
        <div style={{
          background: '#0f1226',
          borderRadius: 14,
          border: '1.5px dashed #385e8a',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: 0.85
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8' }}>
            <Ruler size={16} color="#94a3b8" /> <span style={{ filter: 'blur(6px)', userSelect: 'none' }}>Size Stack Challenge</span>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', background: '#232752', padding: '2px 8px', borderRadius: 6 }}>
            Locked
          </span>
        </div>
      </div>
    </div>
  );
}
