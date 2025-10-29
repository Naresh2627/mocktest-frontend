import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const AuthCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('No authentication token received');
          return;
        }

        // Store the token
        localStorage.setItem('authToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch user profile to verify token
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const response = await axios.get(`${apiUrl}/oauth/profile`);
        
        if (response.data.user) {
          // Redirect to notes
          navigate('/notes');
        } else {
          setError('Failed to get user information');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError('Authentication failed');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login?error=auth_failed');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading-spinner"></div>
          <h2>Completing authentication...</h2>
          <p>Please wait while we log you in.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="error-message">{error}</div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;