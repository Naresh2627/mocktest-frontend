import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Dashboard</h1>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/notes')} 
            className="notes-btn"
          >
            📝 My Notes
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="user-info-card">
          <h2>User Information</h2>
          <div className="user-details">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p>
              <strong>Email Verified:</strong> 
              <span className={user?.email_verified ? 'verified' : 'unverified'}>
                {user?.email_verified ? ' ✅ Verified' : ' ❌ Not Verified'}
              </span>
            </p>
          </div>
        </div>
        
        <div className="features-card">
          <h2>Authentication Features</h2>
          <ul>
            <li>✅ Email/Password Authentication</li>
            <li>✅ Google SSO Integration</li>
            <li>✅ JWT Session Management</li>
            <li>✅ Email Verification</li>
            <li>✅ Password Reset</li>
            <li>✅ Protected Routes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;