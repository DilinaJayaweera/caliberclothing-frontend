import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, updateBasicAuth } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Only check for basic auth since that's what you're using
      const basicAuth = localStorage.getItem('basicAuth');
      const userData = localStorage.getItem('user');
      
      if (basicAuth && userData) {
        // Just set the user from localStorage - the API interceptor will handle the auth header
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('basicAuth');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      
      if (response.data.success) {
        const userData = {
          username: response.data.username,
          role: response.data.role,
          redirectUrl: response.data.redirectUrl
        };
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Clear any stored auth data on login failure
      localStorage.removeItem('basicAuth');
      localStorage.removeItem('user');
      throw error.message || 'Login failed';
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('basicAuth');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const register = async (registrationData) => {
    try {
      const response = await authAPI.register(registrationData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error.response?.data?.message || error.message || 'Registration failed';
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      
      if (response.data.success) {
        // Update the stored Basic Auth credentials with the new password
        if (user && passwordData.newPassword) {
          updateBasicAuth(user.username, passwordData.newPassword);
        }
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Password change error:', error);
      throw error.response?.data?.message || error.message || 'Password change failed';
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    changePassword,
    loading,
    isAuthenticated: !!user,
    isRole: (role) => user?.role === role,
    hasRole: (roles) => roles.includes(user?.role)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};