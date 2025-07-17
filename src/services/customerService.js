import { api } from './api';

export const customerService = {
  // Customer CRUD operations
  async getAllCustomers() {
    try {
      const response = await api.get('/customer');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch customers');
    }
  },

  async getActiveCustomers() {
    try {
      const response = await api.get('/customer/active');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch active customers');
    }
  },

  async getCustomerById(id) {
    try {
      const response = await api.get(`/customer/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch customer');
    }
  },

  async getCustomerByEmail(email) {
    try {
      const response = await api.get(`/customer/email/${email}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch customer by email');
    }
  },

  async updateCustomer(id, customerData) {
    try {
      const response = await api.put(`/customer/${id}`, customerData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update customer');
    }
  },

  async deleteCustomer(id) {
    try {
      await api.delete(`/customer/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete customer');
    }
  },

  async searchCustomers(searchTerm) {
    try {
      const response = await api.get(`/customer/search?searchTerm=${encodeURIComponent(searchTerm)}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to search customers');
    }
  },

  async getCustomersByStatus(statusName) {
    try {
      const response = await api.get(`/customer/status/${statusName}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch customers by status');
    }
  },

  async getCustomersCreatedBetween(startDate, endDate) {
    try {
      const start = startDate.toISOString();
      const end = endDate.toISOString();
      const response = await api.get(`/customer/created-between?startDate=${start}&endDate=${end}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch customers by date range');
    }
  },

  async getTotalCustomersCount() {
    try {
      const response = await api.get('/customer/count');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch customer count');
    }
  },

  async getNewCustomersCount(since) {
    try {
      const sinceDate = since.toISOString();
      const response = await api.get(`/customer/count/new?since=${sinceDate}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch new customer count');
    }
  },

  async checkEmailExists(email) {
    try {
      const response = await api.get(`/customer/check-email?email=${encodeURIComponent(email)}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to check email existence');
    }
  },

  async checkNicExists(nicNo) {
    try {
      const response = await api.get(`/customer/check-nic?nicNo=${encodeURIComponent(nicNo)}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to check NIC existence');
    }
  },

  async getCustomersWithPagination(page = 0, size = 10, sortBy = 'id', sortDir = 'asc') {
    try {
      const response = await api.get(`/customer/paginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch customers with pagination');
    }
  },

  // Reference data
  async getProvinces() {
    try {
      // Since there's no specific endpoint, we'll create a mock for now
      // In real implementation, this should fetch from a provinces endpoint
      return [
        { id: 1, value: 'Western' },
        { id: 2, value: 'Central' },
        { id: 3, value: 'Southern' },
        { id: 4, value: 'Northern' },
        { id: 5, value: 'Eastern' },
        { id: 6, value: 'North Western' },
        { id: 7, value: 'North Central' },
        { id: 8, value: 'Uva' },
        { id: 9, value: 'Sabaragamuwa' }
      ];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch provinces');
    }
  },

  async getStatuses() {
    try {
      // Mock statuses - in real implementation, should fetch from API
      return [
        { id: 1, value: 'Active' },
        { id: 2, value: 'Inactive' },
        { id: 3, value: 'Suspended' }
      ];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch statuses');
    }
  },

  // Utility functions
  validateCustomerData(customerData) {
    const errors = [];

    if (!customerData.firstName || customerData.firstName.trim() === '') {
      errors.push('First name is required');
    }

    if (!customerData.lastName || customerData.lastName.trim() === '') {
      errors.push('Last name is required');
    }

    if (!customerData.dateOfBirth) {
      errors.push('Date of birth is required');
    }

    if (!customerData.sex) {
      errors.push('Gender is required');
    }

    if (!customerData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      errors.push('Valid email address is required');
    }

    if (!customerData.address || customerData.address.trim() === '') {
      errors.push('Address is required');
    }

    if (!customerData.country || customerData.country.trim() === '') {
      errors.push('Country is required');
    }

    if (!customerData.zipCode || !/^\d{5}$/.test(customerData.zipCode)) {
      errors.push('Valid 5-digit zip code is required');
    }

    if (!customerData.mobileNumber || !/^\d{10}$/.test(customerData.mobileNumber)) {
      errors.push('Valid 10-digit mobile number is required');
    }

    if (!customerData.nicNo || !/^([0-9]{9}[x|X|v|V]|[0-9]{12})$/.test(customerData.nicNo)) {
      errors.push('Valid NIC number is required');
    }

    if (!customerData.provinceId) {
      errors.push('Province is required');
    }

    return errors;
  },

  formatCustomerData(formData, statusId = 1, provinceId) {
    return {
      customerDTO: {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        sex: formData.sex,
        email: formData.email,
        address: formData.address,
        country: formData.country,
        zipCode: formData.zipCode,
        mobileNumber: formData.mobileNumber,
        nicNo: formData.nicNo,
        status: { id: statusId },
        province: { id: provinceId }
      },
      userDTO: {
        username: formData.username,
        password: formData.password,
        role: 'CUSTOMER'
      }
    };
  },

  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  formatCustomerDisplay(customer) {
    return {
      ...customer,
      displayName: customer.fullName || `${customer.firstName} ${customer.lastName}`,
      age: customer.dateOfBirth ? this.calculateAge(customer.dateOfBirth) : null,
      formattedPhone: customer.mobileNumber ? `+94 ${customer.mobileNumber.substring(1)}` : null
    };
  }
};