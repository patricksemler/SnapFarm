// App Router Component
// Handles routing and navigation between different views

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home } from './Home';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';
import { AppLayout } from './AppLayout';

// Protected Route wrapper component - simplified, no loading check
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // No loading check - immediately redirect if no user
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes - always show home page */}
        <Route path="/" element={<Home />} />
        
        {/* Authentication routes */}
        <Route 
          path="/signin" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <SignIn />
          } 
        />
        <Route 
          path="/signup" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <SignUp />
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AppLayout view="dashboard" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/diagnose" 
          element={
            <ProtectedRoute>
              <AppLayout view="diagnose" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <AppLayout view="chat" />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};