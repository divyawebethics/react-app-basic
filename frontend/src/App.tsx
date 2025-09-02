import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContainer } from './components/AuthContainer';
import { ProfileContainer } from './components/ProfileContainer';
import { useAuth } from './hooks/useAuth';

export const App: React.FC = () => {
  const { user, checkAuth, logout } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    logout();
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<Navigate to={user ? "/profile" : "/login"} replace />} 
        />
        
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to="/profile" replace />
            ) : (
              <AuthContainer 
                isLoginMode={true}
                onSwitchToProfile={() => window.location.href = '/profile'}
              />
            )
          } 
        />
        
        <Route 
          path="/signup" 
          element={
            user ? (
              <Navigate to="/profile" replace />
            ) : (
              <AuthContainer 
                isLoginMode={true}
                onSwitchToProfile={() => window.location.href = '/profile'}
              />
            )
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            user ? (
              <ProfileContainer onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  );
};

export default App;