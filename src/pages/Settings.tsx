// src/pages/Settings.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { RotateCcw, Trash2, ArrowLeft } from 'lucide-react';

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
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '100px', maxWidth: 640, margin: '0 auto' }}>
      {/* Header with Back Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => navigate('/profile')}
          aria-label="Go back to Me page"
          style={{
            background: '#ffffff',
            border: '1px solid #eaeaea',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 42,
            height: 42,
            borderRadius: 14,
            color: '#333',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <ArrowLeft size={22} />
        </button>

        <h2 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.4rem' }}>Settings</h2>

        <div style={{ width: 42 }} />
      </div>

      {resetSuccess && (
        <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#2e7d32', padding: 12, borderRadius: 12, textAlign: 'center', marginBottom: 16, fontWeight: 600 }}>
          Account progress reset to 0!
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button
          onClick={() => setShowResetModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: 16,
            borderRadius: 16,
            background: '#fff',
            border: '2px solid #ff9800',
            color: '#e65100',
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255,152,0,0.1)'
          }}
        >
          <RotateCcw size={18} />
          <span>Reset Account Progress</span>
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: 16,
            borderRadius: 16,
            background: '#fff',
            border: '2px solid #ff4d4d',
            color: '#ff4d4d',
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255,77,77,0.1)'
          }}
        >
          <Trash2 size={18} />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Reset Progress Modal */}
      {showResetModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 20, maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 12px 0', color: '#333' }}>Reset Account Progress?</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 20, lineHeight: 1.4 }}>
              This will reset your Streak, XP, Level, and game records to 0. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowResetModal(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#eee', color: '#444', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#ff9800', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
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
          background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 20, maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 12px 0', color: '#d32f2f' }}>Delete Account?</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 20, lineHeight: 1.4 }}>
              This will permanently delete your account data, achievements, and progress. You will be signed out immediately.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#eee', color: '#444', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#ff4d4d', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
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
