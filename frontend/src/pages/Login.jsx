import API_URL from '../config.js';
import React, { useState } from 'react';
import '../styles/Auth.css';

export default function Login({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const body = isSignup 
        ? { email, password, name }
        : { email, password };

      // For now, show demo
      if (email && password && (!isSignup || name)) {
        setSuccess(`${isSignup ? 'Account created' : 'Login successful'}! Redirecting...`);
        
        setTimeout(() => {
          onLoginSuccess({
            token: 'demo-token-' + Math.random(),
            user: {
              email,
              name: name || email.split('@')[0]
            }
          });
        }, 1000);
      } else {
        setError('Please fill in all fields');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>🤖 ReconAI</h1>
        
        <div className="auth-tabs">
          <button
            className={`tab ${!isSignup ? 'active' : ''}`}
            onClick={() => setIsSignup(false)}
          >
            Login
          </button>
          <button
            className={`tab ${isSignup ? 'active' : ''}`}
            onClick={() => setIsSignup(true)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
            />
            {isSignup && (
              <p className="password-hint">
                Min 8 characters, 1 uppercase, 1 number
              </p>
            )}
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}
          {success && <div className="success-message">✅ {success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-submit"
          >
            {loading ? 'Loading...' : isSignup ? 'Create Account' : 'Login'}
          </button>
        </form>

        <div className="demo-note">
          <p>💡 Demo: Use any email/password to test</p>
        </div>
      </div>
    </div>
  );
}
