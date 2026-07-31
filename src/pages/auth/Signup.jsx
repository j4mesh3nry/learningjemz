import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Gem, Mail, Lock, UserPlus } from 'lucide-react';
import '../../index.css';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const data = await signup(email, password, name);
      
      if (data?.user && !data?.session) {
        setSuccess('Success! Please check your email for the confirmation link.');
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to create account');
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
      <div style={{ position: 'absolute', top: '15%', right: '10%', opacity: 0.1, fontSize: '4rem' }}>⭐</div>
      <div style={{ position: 'absolute', bottom: '15%', left: '15%', opacity: 0.1, fontSize: '5rem' }}>🏆</div>
      <div style={{ position: 'absolute', top: '50%', left: '8%', opacity: 0.1, fontSize: '3rem' }}>🎯</div>
      
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', zIndex: 10 }}>
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
        <h2 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', margin: '0 0 24px 0', fontSize: '1.6rem', color: '#222' }}>
          Create Account
        </h2>
        
        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #ffcdd2' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #c8e6c9' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
              <UserPlus size={20} />
            </div>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Choose a Display Name"
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

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
              <Lock size={20} />
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Create Password"
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

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
              <Lock size={20} />
            </div>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Confirm Password"
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
            {loading ? 'Creating...' : <><UserPlus size={20} /> Sign Up</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', margin: '24px 0 0 0', color: '#666', fontSize: '0.95rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
