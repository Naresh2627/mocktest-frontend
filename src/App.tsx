import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotesProvider } from './contexts/NotesContext';
import { LabelsProvider } from './contexts/LabelsContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyEmail from './components/VerifyEmail';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import PublicNote from './components/PublicNote';
import LabelsManager from './components/LabelsManager';
import DebugInfo from './components/DebugInfo';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/notes" />;
};

function App() {
  return (
    <AuthProvider>
      <NotesProvider>
        <LabelsProvider>
          <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Navigate to="/notes" />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes"
                element={
                  <ProtectedRoute>
                    <NotesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes/new"
                element={
                  <ProtectedRoute>
                    <NoteEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes/:id/edit"
                element={
                  <ProtectedRoute>
                    <NoteEditor />
                  </ProtectedRoute>
                }
              />
              <Route path="/public/:shareId" element={<PublicNote />} />
              <Route
                path="/labels"
                element={
                  <ProtectedRoute>
                    <LabelsManager />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          {process.env.NODE_ENV !== 'production' && <DebugInfo />}
        </Router>
        </LabelsProvider>
      </NotesProvider>
    </AuthProvider>
  );
}

export default App;