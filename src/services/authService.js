import { api } from './api';

export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/user');
      return response;
    } catch (error) {
      throw new Error('Failed to get current user');
    }
  },

  async changePassword(passwordData) {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Password change failed');
    }
  },

  async registerCustomer(customerData) {
    try {
      const response = await api.post('/customer/register', customerData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Customer registration failed');
    }
  },
};