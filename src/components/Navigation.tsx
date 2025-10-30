import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  const navItems = [
    { path: '/notes', label: 'Notes', icon: '📝' },
    { path: '/labels', label: 'Labels', icon: '🏷️' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="main-navigation" role="navigation" aria-label="Main navigation">
      <div className="nav-brand">
        <h1>📔 My Notes</h1>
      </div>
      
      <div className="nav-links">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="nav-actions">
        <ThemeToggle />
        
        <button
          onClick={() => navigate('/notes/new')}
          className="nav-action-btn primary"
          title="Create new note"
        >
          <span aria-hidden="true">➕</span>
          <span className="sr-only">Create new note</span>
        </button>
        
        <button
          onClick={logout}
          className="nav-action-btn secondary"
          title="Sign out"
        >
          <span aria-hidden="true">🚪</span>
          <span className="sr-only">Sign out</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;