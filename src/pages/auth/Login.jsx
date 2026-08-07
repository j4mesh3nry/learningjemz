import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Gem, Mail, Lock, LogIn, Eye, EyeOff, ArrowLeft, Send } from 'lucide-react';
import '../../index.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login, resetPassword, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to login');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }

    try {
      setResetLoading(true);
      await resetPassword(resetEmail);
      setResetSuccess('Password reset link sent! Check your email inbox.');
    } catch (err) {
      setResetError(err.message || 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--color-primary-dark), #0a230c)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', opacity: 0.1, fontSize: '4rem' }}>⭐</div>
      <div style={{ position: 'absolute', bottom: '20%', right: '15%', opacity: 0.1, fontSize: '5rem' }}>🚀</div>
      <div style={{ position: 'absolute', top: '40%', right: '10%', opacity: 0.1, fontSize: '3rem' }}>🧠</div>
      
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1c7c54, #4caf50)',
            borderRadius: '16px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}>
            <Gem size={32} color="#ffffff" strokeWidth={2.5} />
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: '#ffffff',
            margin: 0,
            textShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            Learning<span style={{ color: '#4caf50' }}>Jemz</span>
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', margin: '12px 0 0 0', fontSize: '1.1rem' }}>
          Your learning adventure awaits!
        </p>
      </div>

      {/* Glassmorphic Auth Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px', padding: '32px 24px',
        width: '100%', maxWidth: '400px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        zIndex: 10
      }}>
        {!showForgotModal ? (
          <>
            <h2 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', margin: '0 0 24px 0', fontSize: '1.8rem', color: '#222' }}>
              Welcome Back
            </h2>

            {successMessage && (
              <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #c8e6c9', fontWeight: 600 }}>
                {successMessage}
              </div>
            )}
            
            {error && (
              <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #ffcdd2' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Email Input */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', display: 'flex', alignItems: 'center' }}>
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Email Address"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px',
                    border: '2px solid #eaeaea', fontSize: '1rem', outline: 'none',
                    background: '#fcfcfc', transition: 'border-color 0.2s', color: '#333',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = '#eaeaea'}
                />
              </div>

              {/* Password Input with Visible Password Eye Toggle */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', display: 'flex', alignItems: 'center' }}>
                  <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Password"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '16px 48px 16px 48px', borderRadius: '16px',
                    border: '2px solid #eaeaea', fontSize: '1rem', outline: 'none',
                    background: '#fcfcfc', transition: 'border-color 0.2s', color: '#333',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = '#eaeaea'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#888',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div style={{ textAlign: 'right', marginTop: '-4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowForgotModal(true);
                    setResetError('');
                    setResetSuccess('');
                  }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--color-primary)',
                    fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', padding: 0
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                style={{
                  marginTop: '8px', width: '100%', padding: '18px', borderRadius: '16px',
                  background: 'var(--color-primary)', color: '#fff', fontSize: '1.1rem',
                  fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-heading)',
                  boxShadow: '0 8px 20px rgba(76,175,80,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Logging in...' : <><LogIn size={20} /> Log In</>}
              </button>
            </form>

            <p style={{ textAlign: 'center', margin: '24px 0 0 0', color: '#666', fontSize: '0.95rem' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
                Sign up
              </Link>
            </p>
          </>
        ) : (
          /* Forgot Password View */
          <div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                background: 'none', border: 'none', color: '#666', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem',
                fontWeight: 600, marginBottom: '16px', padding: 0
              }}
            >
              <ArrowLeft size={18} /> Back to Log In
            </button>

            <h2 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', margin: '0 0 8px 0', fontSize: '1.6rem', color: '#222' }}>
              Reset Password
            </h2>
            <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {resetError && (
              <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #ffcdd2' }}>
                {resetError}
              </div>
            )}
            {resetSuccess && (
              <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #c8e6c9', fontWeight: 600 }}>
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', display: 'flex', alignItems: 'center' }}>
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  value={resetEmail} 
                  onChange={(e) => setResetEmail(e.target.value)} 
                  placeholder="Enter your email"
                  disabled={resetLoading}
                  style={{
                    width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px',
                    border: '2px solid #eaeaea', fontSize: '1rem', outline: 'none',
                    background: '#fcfcfc', transition: 'border-color 0.2s', color: '#333',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = '#eaeaea'}
                />
              </div>

              <button 
                type="submit" 
                disabled={resetLoading} 
                style={{
                  marginTop: '8px', width: '100%', padding: '18px', borderRadius: '16px',
                  background: 'var(--color-primary)', color: '#fff', fontSize: '1.1rem',
                  fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-heading)',
                  boxShadow: '0 8px 20px rgba(76,175,80,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: resetLoading ? 0.7 : 1
                }}
              >
                {resetLoading ? 'Sending...' : <><Send size={20} /> Send Reset Link</>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
