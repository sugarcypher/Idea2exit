import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!acceptedTerms || !acceptedPrivacy) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }
    
    setLoading(true);
    
    try {
      await register(email, password, fullName, acceptedTerms, acceptedPrivacy);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      
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
    }} data-testid="register-page">
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
          <p style={{ color: '#888', fontSize: '14px' }}>Create your account</p>
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
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
              data-testid="register-name-input"
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
              data-testid="register-email-input"
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
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#ccc', fontSize: '14px', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              data-testid="register-password-input"
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
            <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
              Min 8 chars, uppercase, lowercase, number, special char
            </p>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                data-testid="accept-terms-checkbox"
                style={{ marginTop: '3px' }}
              />
              <span style={{ color: '#888', fontSize: '13px' }}>
                I agree to the{' '}
                <Link to="/terms" style={{ color: '#8b5cf6' }} target="_blank">Terms of Service</Link>
              </span>
            </label>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                data-testid="accept-privacy-checkbox"
                style={{ marginTop: '3px' }}
              />
              <span style={{ color: '#888', fontSize: '13px' }}>
                I agree to the{' '}
                <Link to="/privacy" style={{ color: '#8b5cf6' }} target="_blank">Privacy Policy</Link>
              </span>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            data-testid="register-submit-btn"
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#8b5cf6' }} data-testid="login-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
