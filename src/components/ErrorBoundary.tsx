import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
          background: 'var(--color-bg-page, #d4e8d5)',
          color: '#0f3825'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: 24,
            border: '2px solid #b0cbaf',
            boxShadow: '0 4px 0 #b0cbaf',
            maxWidth: 380,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              background: '#ffebee',
              borderRadius: 50,
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={32} color="#e53935" />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              {this.props.fallbackTitle || 'Something went wrong'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#4e7361', margin: 0 }}>
              An unexpected error occurred in this view. Please try refreshing.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#16653e',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 3px 0 #0e4329',
                marginTop: 6
              }}
            >
              <RotateCw size={16} /> Reload Component
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
