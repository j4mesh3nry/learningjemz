import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import ChessPlay from './ChessPlay';
import { Flame, Star, BookOpen, Gamepad2, ArrowLeft, Lock } from 'lucide-react';
import { Card } from '../../components/Card';
import './chess.css';

function ChessMenu() {
  const navigate = useNavigate();
  const { level, streak, puzzlesSolved, hasPlayedToday } = useGame();
  const [tab, setTab] = useState<'learn' | 'play'>('play');

  return (
    <div className="chess-module-page">
      {/* Navigation Header */}
      <div className="chess-nav-header">
        <div className="chess-header-left">
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
              background: '#16653e', borderRadius: 10,
              boxShadow: '0 2px 0 #0e4329'
            }}>
              ♟️
            </div>
            <h1 className="chess-page-title" style={{ margin: 0, color: '#0f3825', fontSize: '1.4rem', fontWeight: 900 }}>
              Chess
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
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: hasPlayedToday ? '#e53935' : '#4e7361' }}>{streak ?? 0}</span>
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
        marginBottom: 20
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Blurred Locked Card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: '#ffffff', borderRadius: 20,
            border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf',
            padding: '18px', position: 'relative', overflow: 'hidden',
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
              display: 'flex', alignItems: 'center', gap: 16, width: '100%',
              filter: 'blur(7px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none'
            }}>
              <div style={{
                fontSize: '1.8rem', width: 48, height: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#e1f0e2', borderRadius: 14, flexShrink: 0
              }}>
                📚
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f3825' }}>Chess Tactics & Lessons</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#4e7361', fontWeight: 500 }}>Interactive Puzzles & Guides</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Active Play & Earn Modes */}
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.15rem',
            margin: '0 0 14px 0', color: '#0f3825', fontWeight: 800
          }}>
            Earn XP & Streaks
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card 
              className="chess-card-item" 
              onClick={() => navigate('play')} 
              ariaLabel="Play with Bot"
              style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16,
                textDecoration: 'none', color: '#fff',
                background: '#16653e', borderRadius: 20,
                padding: '18px 18px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 5px 0 #0e4329',
                border: '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                fontSize: '2rem', width: 50, height: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)', borderRadius: 14,
                flexShrink: 0
              }}>
                🤖
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Play with Bot</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', opacity: 0.9, fontWeight: 500 }}>Practice against AI bots & earn XP</p>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>→</div>
            </Card>

            {/* Blurred Locked Cards */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: '#ffffff', borderRadius: 20,
              border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf',
              padding: '18px', position: 'relative', overflow: 'hidden',
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
                display: 'flex', alignItems: 'center', gap: 16, width: '100%',
                filter: 'blur(7px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none'
              }}>
                <div style={{
                  fontSize: '1.8rem', width: 48, height: 48,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#e1f0e2', borderRadius: 14, flexShrink: 0
                }}>
                  ⚔️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f3825' }}>Speed Chess Blitz</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#4e7361', fontWeight: 500 }}>Timed Rapid Challenges</p>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: '#ffffff', borderRadius: 20,
              border: '2px solid #b0cbaf', boxShadow: '0 4px 0 #b0cbaf',
              padding: '18px', position: 'relative', overflow: 'hidden',
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
                display: 'flex', alignItems: 'center', gap: 16, width: '100%',
                filter: 'blur(7px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none'
              }}>
                <div style={{
                  fontSize: '1.8rem', width: 48, height: 48,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#e1f0e2', borderRadius: 14, flexShrink: 0
                }}>
                  🏆
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f3825' }}>Grandmaster Tournament</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#4e7361', fontWeight: 500 }}>Global Ranked Matches</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ChessHome() {
  return (
    <Routes>
      <Route path="/" element={<ChessMenu />} />
      <Route path="play" element={<ChessPlay />} />
    </Routes>
  );
}
