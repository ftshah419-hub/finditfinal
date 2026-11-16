import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setAuthToken } from '../services/api';

const AuthContext = createContext(null);
const SESSION_HINT_KEY = 'findit_has_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check authentication status on application mount
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      // Avoid firing unneeded 401 network requests on guest visits if user never logged in
      const hasSessionHint = sessionStorage.getItem(SESSION_HINT_KEY) === 'true' ||
                             localStorage.getItem(SESSION_HINT_KEY) === 'true';

      if (!hasSessionHint) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authApi.getMe();
        if (isMounted && response?.data?.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // Session expired, invalid, or revoked
        if (isMounted) {
          setUser(null);
          setAuthToken(null);
          sessionStorage.removeItem(SESSION_HINT_KEY);
          localStorage.removeItem(SESSION_HINT_KEY);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    setAuthError(null);
    try {
      const response = await authApi.login(credentials);
      if (response?.data?.user) {
        setUser(response.data.user);
        // Set non-sensitive session hint (boolean only; no credentials or secrets stored)
        sessionStorage.setItem(SESSION_HINT_KEY, 'true');
        if (credentials.rememberMe) {
          localStorage.setItem(SESSION_HINT_KEY, 'true');
        } else {
          localStorage.removeItem(SESSION_HINT_KEY);
        }
        return response.data.user;
      }
      throw new Error('Invalid user payload received from server');
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const response = await authApi.register(userData);
      if (response?.data?.user) {
        setUser(response.data.user);
        // Set non-sensitive session hint
        sessionStorage.setItem(SESSION_HINT_KEY, 'true');
        return response.data.user;
      }
      throw new Error('Invalid user payload received from server');
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API notification:', err);
    } finally {
      setUser(null);
      setAuthToken(null);
      sessionStorage.removeItem(SESSION_HINT_KEY);
      localStorage.removeItem(SESSION_HINT_KEY);
    }
  };

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
