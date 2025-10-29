import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmail: React.FC = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const { verifyEmail, resendVerification } = useAuth();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      handleVerification();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleVerification = async () => {
    try {
      await verifyEmail(token!);
      setMessage('Email verified successfully! You can now log in.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResending(true);

    try {
      await resendVerification(email);
      setMessage('Verification email sent successfully! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading-spinner"></div>
          <h2>Verifying your email...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Email Verification</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        {!token && (
          <>
            <p>Need to verify your email? Enter your email address below to resend the verification link.</p>
            
            <form onSubmit={handleResendVerification}>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={resending}
                />
              </div>
              
              <button type="submit" disabled={resending} className="auth-button">
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </form>
          </>
        )}
        
        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;