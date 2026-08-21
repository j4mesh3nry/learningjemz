// src/pages/Settings.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { RotateCcw, Trash2, ArrowLeft, ShieldAlert } from 'lucide-react';
import '../index.css';

const Settings = () => {
  const navigate = useNavigate();
  const { resetProgress } = useGame();
  const auth = useAuth() || {};
  const deleteAccount = auth.deleteAccount;

  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    if (resetProgress) {
      await resetProgress();
    }
    setShowResetModal(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleDelete = async () => {
    if (deleteAccount) {
      await deleteAccount();
    }
    setShowDeleteModal(false);
  };

  return (
    <div className="container" style={{ paddingTop: '1.2rem', paddingBottom: '100px', maxWidth: 560, margin: '0 auto' }}>
      {/* Header with Back Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.8rem'
      }}>
        <button
          onClick={() => navigate('/profile')}
          aria-label="Go back to Me page"
          style={{
            background: 'var(--game-surface-card, #05130e)',
            border: '1.5px solid var(--game-border-default, #102d1f)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 14,
            color: 'var(--game-accent-emerald, #34d399)',
            boxShadow: '0 3px 0 #020705',
            transition: 'transform 0.1s ease',
            flexShrink: 0
          }}
        >
          <ArrowLeft size={20} strokeWidth={2.4} />
        </button>

        <h1 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--game-text-primary, #ffffff)' }}>
          Settings
        </h1>

        <div style={{ width: 40 }} />
      </div>

      {resetSuccess && (
        <div style={{
          background: 'rgba(52, 211, 153, 0.12)',
          border: '1.5px solid var(--game-accent-emerald, #34d399)',
          color: '#34d399',
          padding: '12px 16px',
          borderRadius: 14,
          textAlign: 'center',
          marginBottom: 16,
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          Account progress reset to 0!
        </div>
      )}

      {/* Account Settings Section */}
      <div style={{
        background: 'var(--game-surface-card, #05130e)',
        border: '1.5px solid var(--game-border-default, #102d1f)',
        borderRadius: 20,
        padding: '20px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <ShieldAlert size={16} color="var(--game-accent-emerald, #34d399)" strokeWidth={2.2} />
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--game-text-muted, #6b8f7b)'
          }}>
            Account & Data
          </span>
        </div>

        {/* Reset Progress Button */}
        <button
          onClick={() => setShowResetModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderRadius: 16,
            background: 'rgba(251, 191, 36, 0.06)',
            border: '1.5px solid rgba(251, 191, 36, 0.3)',
            color: '#fbbf24',
            cursor: 'pointer',
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'rgba(251, 191, 36, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <RotateCcw size={18} color="#fbbf24" strokeWidth={2.2} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Reset Account Progress
              </span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginTop: 1 }}>
                Reset XP, level, and streaks to 0
              </span>
            </div>
          </div>
        </button>

        {/* Delete Account Button */}
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderRadius: 16,
            background: 'rgba(255, 90, 90, 0.06)',
            border: '1.5px solid rgba(255, 90, 90, 0.3)',
            color: '#ff5a5a',
            cursor: 'pointer',
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'rgba(255, 90, 90, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Trash2 size={18} color="#ff5a5a" strokeWidth={2.2} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Delete Account
              </span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginTop: 1 }}>
                Permanently remove your account and all records
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Reset Progress Modal */}
      {showResetModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          zIndex: 2000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: 'var(--game-surface-card, #05130e)',
            border: '1.5px solid var(--game-border-default, #102d1f)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
            padding: 24, borderRadius: 20, maxWidth: 360, width: '100%', textAlign: 'center'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 10px 0', color: '#fbbf24', fontSize: '1.2rem', fontWeight: 800 }}>
              Reset Account Progress?
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--game-text-secondary, #cbe0d4)', marginBottom: 20, lineHeight: 1.5 }}>
              This will reset your Streak, XP, Level, and game records to 0. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowResetModal(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #1a452f',
                  background: '#102d1f', color: '#ffffff', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                  background: '#fbbf24', color: '#030d09', fontWeight: 800, cursor: 'pointer'
                }}
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          zIndex: 2000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: 'var(--game-surface-card, #05130e)',
            border: '1.5px solid var(--game-border-default, #102d1f)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
            padding: 24, borderRadius: 20, maxWidth: 360, width: '100%', textAlign: 'center'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 10px 0', color: '#ff5a5a', fontSize: '1.2rem', fontWeight: 800 }}>
              Delete Account?
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--game-text-secondary, #cbe0d4)', marginBottom: 20, lineHeight: 1.5 }}>
              This will permanently delete your account data, achievements, and progress. You will be signed out immediately.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #1a452f',
                  background: '#102d1f', color: '#ffffff', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                  background: '#ff5a5a', color: '#ffffff', fontWeight: 800, cursor: 'pointer'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
