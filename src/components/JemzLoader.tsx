// src/components/JemzLoader.tsx
import React from 'react';
import { Gem } from 'lucide-react';

interface JemzLoaderProps {
  message?: string;
  subtext?: string;
  fullScreen?: boolean;
  darkTheme?: boolean;
}

export function JemzLoader({
  message = "Loading...",
  subtext = "Please wait a moment",
  fullScreen = true,
  darkTheme = false
}: JemzLoaderProps) {
  return (
    <div style={{
      position: fullScreen ? 'fixed' : 'relative',
      top: 0, left: 0, right: 0, bottom: 0,
      width: '100%',
      height: fullScreen ? '100vh' : '100%',
      minHeight: fullScreen ? '100vh' : '220px',
      zIndex: fullScreen ? 9999 : 10,
      background: darkTheme
        ? 'radial-gradient(ellipse at 50% 50%, #0a0a2e 0%, #050510 70%, #020208 100%)'
        : 'var(--color-bg-page, #d4e8d5)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 24,
      boxSizing: 'border-box',
      textAlign: 'center',
      animation: 'jemzFadeIn 0.25s ease-out'
    }}>
      {/* Animated Gem Logo Badge */}
      <div style={{
        position: 'relative',
        width: 72,
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Pulsing Backlight Halo */}
        <div style={{
          position: 'absolute',
          inset: -10,
          background: darkTheme
            ? 'radial-gradient(circle, rgba(22, 101, 62, 0.7) 0%, rgba(22, 101, 62, 0) 70%)'
            : 'radial-gradient(circle, rgba(22, 101, 62, 0.35) 0%, rgba(22, 101, 62, 0) 70%)',
          borderRadius: '50%',
          animation: 'jemzPulseGlow 1.8s infinite ease-in-out'
        }} />

        {/* Tactile Gem Icon Tile */}
        <div style={{
          width: 60,
          height: 60,
          background: 'linear-gradient(135deg, #16653e 0%, #0d462b 100%)',
          borderRadius: 18,
          border: '2.5px solid #2e7d32',
          boxShadow: '0 6px 16px rgba(22, 101, 62, 0.4), 0 4px 0 #092c1d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'jemzBounce 2s infinite ease-in-out',
          position: 'relative',
          zIndex: 2
        }}>
          <Gem size={30} color="#ffffff" strokeWidth={2.5} />
        </div>
      </div>

      {/* Message and Subtext */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-heading, sans-serif)',
          fontSize: '1.15rem',
          fontWeight: 800,
          margin: 0,
          color: darkTheme ? '#ffffff' : '#0f3825',
          letterSpacing: '-0.2px'
        }}>
          {message}
        </h3>
        {subtext && (
          <p style={{
            fontSize: '0.82rem',
            color: darkTheme ? 'rgba(255,255,255,0.65)' : '#4e7361',
            marginTop: 4,
            marginBottom: 0,
            fontWeight: 600
          }}>
            {subtext}
          </p>
        )}
      </div>

      {/* Spinning Ring Spinner */}
      <div style={{
        width: 26,
        height: 26,
        border: darkTheme ? '3px solid rgba(255, 255, 255, 0.15)' : '3px solid #b0cbaf',
        borderTop: '3px solid #16653e',
        borderRadius: '50%',
        animation: 'jemzSpin 0.9s linear infinite'
      }} />

      {/* Keyframe Animations */}
      <style>{`
        @keyframes jemzFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes jemzPulseGlow {
          0%, 100% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.25); opacity: 1; }
        }
        @keyframes jemzBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes jemzSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default JemzLoader;
