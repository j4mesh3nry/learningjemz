import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';
import '../../index.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', opacity: 0.05, fontSize: '4rem' }}>🧠</div>
      <div style={{ position: 'absolute', bottom: '20%', right: '15%', opacity: 0.05, fontSize: '5rem' }}>🌍</div>
      <div style={{ position: 'absolute', top: '40%', right: '10%', opacity: 0.05, fontSize: '3rem' }}>📖</div>
      <div style={{ position: 'absolute', bottom: '10%', left: '20%', opacity: 0.05, fontSize: '4rem' }}>♟️</div>
      
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', zIndex: 10 }}>
        <h1 style={{ 
          fontFamily: 'var(--font-heading)', fontSize: '3.2rem', 
          color: '#1a1a1a', margin: 0, textShadow: '2px 2px 0px #4caf50', 
          letterSpacing: '-1px' 
        }}>
          LearningJemz
        </h1>
        <p style={{ color: 'var(--color-muted)', margin: '8px 0 0 0', fontSize: '1.1rem' }}>Welcome back!</p>
      </div>

      {/* Auth Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px', padding: '32px 24px',
        width: '100%', maxWidth: '400px',
        border: '1px solid #eaeaea',
        boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
        zIndex: 10
      }}>
        {/* H2 Removed for cleaner look */}
        
        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #ffcdd2' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Email Input */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
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
                background: '#fcfcfc', transition: 'border-color 0.2s', color: '#333'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = '#eaeaea'}
            />
          </div>

          {/* Password Input */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
              <Lock size={20} />
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password"
              disabled={loading}
              style={{
                width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px',
                border: '2px solid #eaeaea', fontSize: '1rem', outline: 'none',
                background: '#fcfcfc', transition: 'border-color 0.2s', color: '#333'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = '#eaeaea'}
            />
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
      </div>
    </div>
  );
}
