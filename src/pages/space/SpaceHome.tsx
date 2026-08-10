import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import SolarSystem3D from './SolarSystem3D';
import ObjectsBySizeMenu from './ObjectsBySizeMenu';
import IlluminateSystem from './IlluminateSystem';
import SizeGuide from './SizeGuide';
import { preloadSpaceObjectImages } from '../../data/space-objects';
import { Flame, Star, BookOpen, Gamepad2, ArrowLeft, Lock, ArrowRight, Orbit, Ruler, Sparkles, Target } from 'lucide-react';
import { Card } from '../../components/Card';
import './space.css';

function SpaceHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { level, streak, hasPlayedToday } = useGame();

  useEffect(() => {
    preloadSpaceObjectImages();
  }, []);

  const [tab, setTabState] = useState<'play' | 'learn'>(() => {
    if (location.state && (location.state as any).tab) {
      return (location.state as any).tab;
    }
    const qTab = searchParams.get('tab');
    if (qTab === 'learn' || qTab === 'play') return qTab;

    const saved = sessionStorage.getItem('space_active_tab');
    if (saved === 'learn' || saved === 'play') return saved;

    return 'play';
  });

  const setTab = (newTab: 'play' | 'learn') => {
    setTabState(newTab);
    sessionStorage.setItem('space_active_tab', newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };

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
              transition: 'transform 0.1s ease',
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
              <Orbit size={18} color="#38bdf8" />
            </div>
            <h1 className="space-page-title" style={{ margin: 0, color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 900 }}>
              Space
            </h1>
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 3,
          background: '#161936', padding: '5px 9px', borderRadius: 12,
          border: '2px solid #385e8a', boxShadow: '0 2px 0 #385e8a',
          minWidth: 76, boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <Flame 
              size={13} 
              color={hasPlayedToday ? '#ff4d4d' : '#888888'} 
              fill={hasPlayedToday ? '#ff4d4d' : '#bbbbbb'} 
            />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: hasPlayedToday ? '#ff4d4d' : '#94a3b8' }}>
              {streak ?? 0}
            </span>
          </div>
          <div style={{ height: 1, background: '#385e8a', margin: '1px 0' }} />
          <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, cursor: 'pointer' }}>
            <Star size={13} color="#ffb400" fill="#ffb400" />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#d97706' }}>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* Mode Selector: Play vs Learn */}
      <div style={{
        display: 'flex',
        background: '#161936',
        padding: '4px',
        borderRadius: 14,
        border: '2px solid #385e8a',
        boxShadow: '0 3px 0 #385e8a',
        marginBottom: 18
      }}>
        <button
          onClick={() => setTab('play')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'play' ? '#385e8a' : 'transparent',
            color: tab === 'play' ? '#ffffff' : '#cbd5e1',
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
          <Gamepad2 size={16} color={tab === 'play' ? '#ffffff' : '#cbd5e1'} />
          Play
        </button>
        <button
          onClick={() => setTab('learn')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'learn' ? '#385e8a' : 'transparent',
            color: tab === 'learn' ? '#ffffff' : '#cbd5e1',
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
          <BookOpen size={16} color={tab === 'learn' ? '#ffffff' : '#cbd5e1'} />
          Learn
        </button>
      </div>

      {tab === 'learn' ? (
        <>
          {/* Active Learning Modes */}
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.15rem',
            margin: '0 0 12px 0', color: '#f1f5f9', fontWeight: 800
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
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)', borderRadius: 12,
                flexShrink: 0
              }}>
                <Orbit size={24} color="#ffffff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>Solar Explorer</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.9, fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Explore 3D solar map</p>
              </div>
              <div style={{
                position: 'relative', zIndex: 1,
                width: 32, height: 32,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.16)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <ArrowRight size={16} strokeWidth={2.5} color="#ffffff" />
              </div>
            </Card>

            {/* Objects by Size Guide Card */}
            <Card
              className="space-card-item"
              onClick={() => navigate('/space/size-guide')}
              ariaLabel="Objects by Size Guide"
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
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)', borderRadius: 12,
                flexShrink: 0
              }}>
                <Ruler size={24} color="#ffffff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>Size Guide</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.9, fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Learn 35 objects by size</p>
              </div>
              <div style={{
                position: 'relative', zIndex: 1,
                width: 32, height: 32,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.16)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <ArrowRight size={16} strokeWidth={2.5} color="#ffffff" />
              </div>
            </Card>

            {/* Blurred Locked Card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: '#161936', borderRadius: 16,
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
                  width: 44, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#232752', borderRadius: 12, flexShrink: 0
                }}>
                  <Sparkles size={24} color="#38bdf8" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>Deep Nebula</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Stars & Galaxies Guide</p>
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
            margin: '0 0 12px 0', color: '#f1f5f9', fontWeight: 800
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
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)', borderRadius: 12,
                flexShrink: 0
              }}>
                <Ruler size={24} color="#ffffff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>Objects by Size</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.9, fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Compare cosmic sizes</p>
              </div>
              <div style={{
                position: 'relative', zIndex: 1,
                width: 32, height: 32,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.16)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <ArrowRight size={16} strokeWidth={2.5} color="#ffffff" />
              </div>
            </Card>

            {/* Blurred Locked Cards */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: '#161936', borderRadius: 16,
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
                  width: 44, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#232752', borderRadius: 12, flexShrink: 0
                }}>
                  <Target size={24} color="#38bdf8" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>Space Quiz</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Test cosmic knowledge</p>
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
      <Route path="size-guide" element={<SizeGuide />} />
    </Routes>
  );
}
