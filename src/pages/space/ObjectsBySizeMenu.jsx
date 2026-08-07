import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { ArrowLeft, Lock } from 'lucide-react';
import './space.css';

export default function ObjectsBySizeMenu() {
  const navigate = useNavigate();

  return (
    <div className="space-module-page">
      {/* Navigation Header */}
      <div className="space-nav-header" style={{ marginBottom: 16 }}>
        <div className="space-header-left">
          <button 
            onClick={() => navigate('/space')} 
            title="Back to Space"
            aria-label="Back to Space"
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
            <h1 className="space-page-title" style={{ margin: 0, color: '#0f3825', fontSize: '1.35rem', fontWeight: 900 }}>
              Objects by Size
            </h1>
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: '0', marginBottom: '16px' }}>
        <p style={{ color: '#4e7361', fontSize: '0.9rem', lineHeight: '1.4', margin: 0, fontWeight: 600 }}>
          Explore and memorize the 35 largest solar objects!
        </p>
      </div>

      {/* Mode List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Active Mode */}
        <Card
          className="space-card-item"
          onClick={() => navigate('/space/illuminate')}
          ariaLabel="Illuminate the System"
          style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14,
            textDecoration: 'none', color: '#fff',
            background: '#16653e', borderRadius: 16,
            padding: '12px 16px', position: 'relative', overflow: 'hidden',
            boxShadow: '0 4px 0 #0e4329',
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
            💡
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>Illuminate the System</h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.9, fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Type the names in order</p>
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
              📏
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f3825', lineHeight: 1.2 }}>Size Stack Challenge</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#4e7361', fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Drag and order planets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
