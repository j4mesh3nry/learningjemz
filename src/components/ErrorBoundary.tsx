// src/components/ErrorBoundary.tsx
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Gem } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[LearningJemz ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = () => {
    // Clear cache & hard reload page
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#d4e8d5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            boxSizing: 'border-box',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '2.5px solid #b0cbaf',
              borderRadius: 24,
              padding: '32px 24px',
              maxWidth: 360,
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 6px 0 #b0cbaf',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Mascot Header Icon */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: '#16653e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2.5px solid #22c55e',
                boxShadow: '0 4px 0 #0e4329',
                marginBottom: 16,
                position: 'relative',
              }}
            >
              <Gem size={32} color="#ffffff" strokeWidth={2.5} />
              <div
                style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  background: '#ff4d4d',
                  borderRadius: '50%',
                  padding: 4,
                  border: '2px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={14} color="#ffffff" />
              </div>
            </div>

            {/* Error Message */}
            <h2
              style={{
                fontFamily: 'var(--font-heading, system-ui, sans-serif)',
                fontSize: '1.6rem',
                fontWeight: 900,
                color: '#0f3825',
                margin: '0 0 4px 0',
                lineHeight: 1.2
              }}
            >
              Oops!
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-heading, system-ui, sans-serif)',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#16653e',
                margin: '0 0 16px 0',
                lineHeight: 1.2
              }}
            >
              {this.props.fallbackTitle || 'Something went wrong'}
            </p>

            <p
              style={{
                fontSize: '0.9rem',
                color: '#4e7361',
                fontWeight: 600,
                lineHeight: 1.4,
                margin: '0 0 24px 0',
              }}
            >
              A new update might have deployed or a resource was temporarily interrupted. Tap refresh to load the app cleanly!
            </p>

            {/* Refresh Button */}
            <button
              onClick={this.handleReload}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 16,
                border: '2px solid #16653e',
                background: '#16653e',
                color: '#ffffff',
                fontFamily: 'var(--font-heading, system-ui, sans-serif)',
                fontSize: '1.05rem',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 0 #0e4329',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'transform 0.1s ease',
              }}
            >
              <RefreshCw size={18} color="#ffffff" />
              Refresh App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

