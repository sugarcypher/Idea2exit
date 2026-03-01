import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail) && detail[0]?.msg) {
          errorMessage = detail[0].msg.replace('Value error, ', '');
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} data-testid="login-page">
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#12121a',
        borderRadius: '12px',
        border: '1px solid #2a2a3a',
        padding: '32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            IdeaForge
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>From Idea to Funded Business</p>
        </div>
        
        <div style={{ 
          backgroundColor: '#1a1a2e', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '20px',
          fontSize: '13px',
          color: '#aaa'
        }}>
          <p style={{ marginBottom: '8px', fontWeight: '500', color: '#ccc' }}>What you can do:</p>
          <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.6' }}>
            <li>Generate business plans & pitch decks</li>
            <li>Find investors & crowdfunding strategies</li>
            <li>Build landing pages with AI</li>
            <li>Create logos & brand identity</li>
          </ul>
        </div>
        
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#f87171',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#ccc', fontSize: '14px', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              data-testid="login-email-input"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1a1a2e',
                border: '1px solid #2a2a3a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ccc', fontSize: '14px', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              data-testid="login-password-input"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1a1a2e',
                border: '1px solid #2a2a3a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit-btn"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#8b5cf6',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '14px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#8b5cf6' }} data-testid="register-link">Create one</Link>
        </p>
        
        <p style={{ textAlign: 'center', marginTop: '12px', color: '#666', fontSize: '12px' }}>
          <Link to="/terms" style={{ color: '#666' }}>Terms</Link>
          {' · '}
          <Link to="/privacy" style={{ color: '#666' }}>Privacy</Link>
        </p>
      </div>
    </div>
  );
}
