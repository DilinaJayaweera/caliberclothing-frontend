import { api } from './api';

export const employeeService = {
  // Employee CRUD operations
  async getAllEmployees() {
    try {
      const response = await api.get('/employees');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch employees');
    }
  },

  async getActiveEmployees() {
    try {
      const response = await api.get('/employees/active');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch active employees');
    }
  },

  async getEmployeeById(id) {
    try {
      const response = await api.get(`/employees/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch employee');
    }
  },

  async createEmployee(employeeData) {
    try {
      const response = await api.post('/employees', employeeData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create employee');
    }
  },

  async updateEmployee(id, employeeData) {
    try {
      const response = await api.put(`/employees/${id}`, employeeData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update employee');
    }
  },

  async deleteEmployee(id) {
    try {
      await api.delete(`/employees/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete employee');
    }
  },

  async searchEmployees(searchTerm) {
    try {
      const response = await api.get(`/employees/search?searchTerm=${encodeURIComponent(searchTerm)}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to search employees');
    }
  },

  // Role and Status operations
  async getAllRoles() {
    try {
      const response = await api.get('/employees/roles');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch roles');
    }
  },

  async getAllStatuses() {
    try {
      const response = await api.get('/employees/statuses');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch statuses');
    }
  },

  // Utility functions
  generateEmployeeNo() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EMP${timestamp}${random}`;
  },

  validateEmployeeData(employeeData) {
    const errors = [];

    if (!employeeData.firstName || employeeData.firstName.trim() === '') {
      errors.push('First name is required');
    }

    if (!employeeData.lastName || employeeData.lastName.trim() === '') {
      errors.push('Last name is required');
    }

    if (!employeeData.dateOfBirth) {
      errors.push('Date of birth is required');
    }

    if (!employeeData.sex) {
      errors.push('Gender is required');
    }

    if (!employeeData.civilStatus) {
      errors.push('Civil status is required');
    }

    if (!employeeData.address || employeeData.address.trim() === '') {
      errors.push('Address is required');
    }

    if (!employeeData.mobileNumber || !/^\d{10}$/.test(employeeData.mobileNumber)) {
      errors.push('Valid 10-digit mobile number is required');
    }

    if (employeeData.telephoneNumber && !/^\d{10}$/.test(employeeData.telephoneNumber)) {
      errors.push('Telephone number must be 10 digits');
    }

    if (!employeeData.nicNo || !/^([0-9]{9}[x|X|v|V]|[0-9]{12})$/.test(employeeData.nicNo)) {
      errors.push('Valid NIC number is required');
    }

    return errors;
  },

  formatEmployeeData(formData, userRole, statusId) {
    return {
      employeeDTO: {
        employeeNo: formData.employeeNo || this.generateEmployeeNo(),
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        sex: formData.sex,
        civilStatus: formData.civilStatus,
        address: formData.address,
        mobileNumber: formData.mobileNumber,
        telephoneNumber: formData.telephoneNumber || null,
        nicNo: formData.nicNo,
        isActive: formData.isActive !== undefined ? formData.isActive : true
      },
      userDTO: {
        username: formData.username,
        password: formData.password,
        role: userRole
      },
      role: userRole,
      statusDTO: {
        id: statusId
      }
    };
  }
};