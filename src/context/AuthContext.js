import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

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
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setUser({
          username: response.username,
          role: response.role,
        });
        return { success: true, redirectUrl: getRedirectUrl(response.role) };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await authService.changePassword(passwordData);
      return response;
    } catch (error) {
      return { success: false, message: 'Password change failed. Please try again.' };
    }
  };

  const getRedirectUrl = (role) => {
    switch (role?.toUpperCase()) {
      case 'CEO':
        return '/ceo/dashboard';
      case 'PRODUCT_MANAGER':
        return '/product-manager/dashboard';
      case 'MERCHANDISE_MANAGER':
        return '/merchandise-manager/dashboard';
      case 'DISPATCH_OFFICER':
        return '/dispatch-officer/dashboard';
      case 'CUSTOMER':
        return '/'; // Customers go to products page
      default:
        return '/';
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    getRedirectUrl,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};