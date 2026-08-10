import { useEffect, useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { shouldShowForcedDarkNotice, dismissForcedDarkNotice, hideForcedDarkNoticePermanently } from '../utils/forcedDarkDetect';

interface ForcedDarkToastProps {
  onClose?: () => void;
}

export default function ForcedDarkToast({ onClose }: ForcedDarkToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (shouldShowForcedDarkNotice()) {
        setVisible(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(96px + env(safe-area-inset-bottom, 12px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        maxWidth: 'calc(100% - 32px)',
        width: 420,
        background: '#ffffff',
        border: '2px solid #b0cbaf',
        borderRadius: 16,
        boxShadow: '0 6px 0 #b0cbaf, 0 12px 24px rgba(0,0,0,0.1)',
        padding: '16px 18px',
        fontFamily: 'Inter, sans-serif',
        animation: 'toastSlideUp 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div
          style={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#16653e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 0 #0e4329'
          }}
        >
          <HelpCircle size={20} color="#ffffff" strokeWidth={2.5} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: '0 0 8px 0',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#0f3825',
            fontFamily: 'Outfit, sans-serif',
            lineHeight: 1.35
          }}>
            Forced dark mode detected
          </p>
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '0.85rem',
            color: '#4e7361',
            lineHeight: 1.45
          }}>
            Your browser is applying a forced dark theme to LearningJemz. This app is designed
            for light mode — colors are inverted to dark green. To see the intended design,
            disable forced dark for this site in your browser settings.
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                hideForcedDarkNoticePermanently();
                setVisible(false);
                onClose?.();
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '2px solid #16653e',
                background: '#16653e',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                boxShadow: '0 3px 0 #0e4329',
                transition: 'transform 0.1s ease'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(2px)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Don't show again
            </button>
            <button
              onClick={() => {
                dismissForcedDarkNotice();
                setVisible(false);
                onClose?.();
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '2px solid #b0cbaf',
                background: '#ffffff',
                color: '#16653e',
                fontSize: '0.8rem',
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                boxShadow: '0 3px 0 #b0cbaf',
                transition: 'transform 0.1s ease'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(2px)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            dismissForcedDarkNotice();
            setVisible(false);
            onClose?.();
          }}
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: 8,
            border: '2px solid transparent',
            background: 'transparent',
            color: '#888',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s ease, color 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.color = '#4e7361'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; }}
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}