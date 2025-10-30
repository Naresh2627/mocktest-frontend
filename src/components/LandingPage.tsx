import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to notes if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/notes');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: '📝',
      title: 'Rich Note Taking',
      description: 'Create, edit, and organize your notes with a powerful editor. Support for tags, drafts, and rich formatting.'
    },
    {
      icon: '🏷️',
      title: 'Smart Organization',
      description: 'Organize your notes with labels, categories, and tags. Find what you need instantly with advanced search.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your notes are encrypted and secure. Choose what to keep private and what to share publicly.'
    },
    {
      icon: '🌙',
      title: 'Dark & Light Themes',
      description: 'Beautiful interface that adapts to your preference. Automatic dark mode based on system settings.'
    },
    {
      icon: '📱',
      title: 'Responsive Design',
      description: 'Works perfectly on desktop, tablet, and mobile. Access your notes anywhere, anytime.'
    },
    {
      icon: '⚡',
      title: 'Fast & Reliable',
      description: 'Lightning-fast performance with auto-save, offline support, and real-time synchronization.'
    }
  ];

  return (
    <div className="landing-page">
      <ThemeToggle />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Your Digital 
              <span className="hero-highlight"> Notebook</span>
            </h1>
            <p className="hero-subtitle">
              Capture ideas, organize thoughts, and never lose track of what matters. 
              A modern, secure, and beautiful note-taking experience.
            </p>
            <div className="hero-actions">
              <button 
                onClick={() => navigate('/signup')}
                className="cta-button primary"
              >
                Get Started Free
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="cta-button secondary"
              >
                Sign In
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="note-preview">
              <div className="note-header">
                <div className="note-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="note-title-bar">My Notes</div>
              </div>
              <div className="note-content">
                <div className="note-item">
                  <div className="note-item-header">
                    <h3>📝 Meeting Notes</h3>
                    <span className="note-tag">Work</span>
                  </div>
                  <p>Discussed project timeline and deliverables...</p>
                </div>
                <div className="note-item">
                  <div className="note-item-header">
                    <h3>💡 App Ideas</h3>
                    <span className="note-tag">Personal</span>
                  </div>
                  <p>New feature concepts for the mobile app...</p>
                </div>
                <div className="note-item">
                  <div className="note-item-header">
                    <h3>📚 Reading List</h3>
                    <span className="note-tag">Books</span>
                  </div>
                  <p>Books to read this month...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Everything you need to stay organized</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Notes Created</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to get organized?</h2>
            <p className="cta-subtitle">
              Join thousands of users who trust us with their ideas and thoughts.
            </p>
            <div className="cta-actions">
              <button 
                onClick={() => navigate('/signup')}
                className="cta-button primary large"
              >
                Start Taking Notes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>📔 My Notes</h3>
              <p>Your digital notebook for life.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#security">Security</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#contact">Contact</a>
                <a href="#status">Status</a>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <a href="#privacy">Privacy</a>
                <a href="#terms">Terms</a>
                <a href="#cookies">Cookies</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 My Notes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;