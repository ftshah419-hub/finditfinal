import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Public Website Pages (Person 2)
import Home from './features/public/pages/Home';
import BrowseItems from './features/public/pages/BrowseItems';
import About from './features/public/pages/About';
import Contact from './features/public/pages/Contact';
import Help from './features/public/pages/Help';

// Root redirect handler based on authentication state
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FC]">
        <div className="w-8 h-8 border-4 border-[#2457E8]/20 border-t-[#2457E8] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />;
};

export const App = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <Routes>
          {/* Public Website Routes (Person 2) */}
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowseItems />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<Help />} />

          {/* Public Authentication Routes (Person 1) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected User Dashboard (Person 2) */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Dashboard (Person 3) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-All Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
