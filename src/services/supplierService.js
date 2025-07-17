import { api } from './api';

export const supplierService = {
  // Supplier CRUD operations
  async getAllSuppliers() {
    try {
      const response = await api.get('/suppliers');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch suppliers');
    }
  },

  async getSupplierById(id) {
    try {
      const response = await api.get(`/suppliers/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch supplier');
    }
  },

  async getSupplierBySupplierNo(supplierNo) {
    try {
      const response = await api.get(`/suppliers/by-supplier-no/${supplierNo}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch supplier');
    }
  },

  async searchSuppliers(name) {
    try {
      const response = await api.get(`/suppliers/search?name=${encodeURIComponent(name)}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to search suppliers');
    }
  },

  async getSuppliersByCountry(country) {
    try {
      const response = await api.get(`/suppliers/country/${country}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch suppliers by country');
    }
  },

  async createSupplier(supplierData) {
    try {
      const response = await api.post('/suppliers', supplierData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create supplier');
    }
  },

  async updateSupplier(id, supplierData) {
    try {
      const response = await api.put(`/suppliers/${id}`, supplierData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update supplier');
    }
  },

  async deleteSupplier(id) {
    try {
      await api.delete(`/suppliers/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete supplier');
    }
  },

  // Supplier Payment operations
  async getAllSupplierPayments() {
    try {
      const response = await api.get('/supplier-payments');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch supplier payments');
    }
  },

  async getSupplierPaymentById(id) {
    try {
      const response = await api.get(`/supplier-payments/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch supplier payment');
    }
  },

  async createSupplierPayment(paymentData) {
    try {
      const response = await api.post('/supplier-payments', paymentData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create supplier payment');
    }
  },

  async updateSupplierPayment(id, paymentData) {
    try {
      const response = await api.put(`/supplier-payments/${id}`, paymentData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update supplier payment');
    }
  },

  async deleteSupplierPayment(id) {
    try {
      await api.delete(`/supplier-payments/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete supplier payment');
    }
  },

  async getSupplierPaymentsByDateRange(startDate, endDate) {
    try {
      const start = startDate.toISOString();
      const end = endDate.toISOString();
      const response = await api.get(`/supplier-payments/date-range?startDate=${start}&endDate=${end}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch supplier payments by date range');
    }
  },

  // Utility functions
  generateSupplierNo() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SUP${timestamp}${random}`;
  },

  validateSupplierData(supplierData) {
    const errors = [];

    if (!supplierData.supplierName || supplierData.supplierName.trim() === '') {
      errors.push('Supplier name is required');
    }

    if (!supplierData.country || supplierData.country.trim() === '') {
      errors.push('Country is required');
    }

    if (!supplierData.address || supplierData.address.trim() === '') {
      errors.push('Address is required');
    }

    if (!supplierData.contactNo || !/^\d{10}$/.test(supplierData.contactNo)) {
      errors.push('Valid 10-digit contact number is required');
    }

    return errors;
  },

  formatSupplierData(formData) {
    return {
      supplierNo: formData.supplierNo || this.generateSupplierNo(),
      supplierName: formData.supplierName,
      country: formData.country,
      address: formData.address,
      contactNo: formData.contactNo,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      createdTimestamp: new Date().toISOString(),
      updatedTimestamp: new Date().toISOString()
    };
  }
};