import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import CertificatePage from './pages/CertificatePage';
import { getAuthToken } from './api';

/**
 * Main App component handling routing and authentication
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());

  // Listen for authentication changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!getAuthToken());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Protected route wrapper
  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Game Routes */}
        <Route path="/home" element={<ProtectedRoute element={<HomePage />} />} />
        <Route path="/game/:level" element={<ProtectedRoute element={<GamePage />} />} />
        <Route path="/certificate" element={<ProtectedRoute element={<CertificatePage />} />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/home' : '/login'} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
