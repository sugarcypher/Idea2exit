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

  const features = [
    { icon: '📄', text: 'Auto-generate business plans, pitch decks & white papers' },
    { icon: '🚀', text: 'AI agent swarm handles research to launch' },
    { icon: '💰', text: 'Find investors & crowdfunding strategies' },
    { icon: '🌐', text: 'Build landing pages with one click' },
    { icon: '🎨', text: 'Generate logos & complete brand identity' },
    { icon: '📊', text: 'Financial projections & market analysis' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0f',
      display: 'flex'
    }} data-testid="login-page">
      
      {/* Left side - Branding */}
      <div style={{
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 64px',
        position: 'relative',
        overflow: 'hidden'
      }} className="hidden-mobile">
        {/* Background gradient */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ⚡
            </div>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#fff',
              letterSpacing: '-0.5px'
            }}>
              IdeaForge
            </span>
          </div>
          
          {/* Headline */}
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: '24px'
          }}>
            From Idea to<br />
            <span style={{ color: '#8b5cf6' }}>Funded Business</span>
          </h1>
          
          {/* Subheadline */}
          <p style={{
            fontSize: '18px',
            color: '#888',
            lineHeight: 1.6,
            maxWidth: '480px',
            marginBottom: '40px'
          }}>
            The AI-powered platform that transforms your vision into a launch-ready business. 
            Generate documents, find investors, build your brand, and plan your market entry - all in one place.
          </p>
          
          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {features.map((feature, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {feature.icon}
                </div>
                <span style={{ color: '#aaa', fontSize: '14px' }}>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#12121a',
          borderRadius: '16px',
          border: '1px solid #2a2a3a',
          padding: '40px'
        }}>
          {/* Mobile logo */}
          <div style={{ 
            display: 'none', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '24px' 
          }} className="show-mobile">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              ⚡
            </div>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>IdeaForge</span>
          </div>
          
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#fff', 
            marginBottom: '8px' 
          }}>
            Welcome back
          </h2>
          <p style={{ 
            color: '#888', 
            fontSize: '14px', 
            marginBottom: '28px' 
          }}>
            Sign in to continue building your business
          </p>
          
          {/* Error message */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#f87171',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                color: '#ccc', 
                fontSize: '14px', 
                fontWeight: '500',
                marginBottom: '8px' 
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                data-testid="login-email-input"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #2a2a3a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#2a2a3a'}
              />
            </div>
            
            <div style={{ marginBottom: '28px' }}>
              <label style={{ 
                display: 'block', 
                color: '#ccc', 
                fontSize: '14px', 
                fontWeight: '500',
                marginBottom: '8px' 
              }}>
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
                  padding: '12px 16px',
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #2a2a3a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#2a2a3a'}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit-btn"
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#8b5cf6',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s, transform 0.1s',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
              }}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#7c3aed')}
              onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In
                  <span style={{ marginLeft: '4px' }}>→</span>
                </>
              )}
            </button>
          </form>
          
          <p style={{ 
            textAlign: 'center', 
            marginTop: '24px', 
            color: '#888', 
            fontSize: '14px' 
          }}>
            Don't have an account?{' '}
            <Link 
              to="/register" 
              style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: '500' }}
              data-testid="register-link"
            >
              Create one
            </Link>
          </p>
          
          <p style={{ 
            textAlign: 'center', 
            marginTop: '16px', 
            color: '#666', 
            fontSize: '12px' 
          }}>
            <Link to="/terms" style={{ color: '#666', textDecoration: 'none' }}>Terms</Link>
            {' · '}
            <Link to="/privacy" style={{ color: '#666', textDecoration: 'none' }}>Privacy</Link>
          </p>
        </div>
      </div>
      
      <style>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
