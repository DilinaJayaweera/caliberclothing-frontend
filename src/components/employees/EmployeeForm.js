import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService';

const EmployeeForm = ({ employee, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    employeeNo: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    sex: '',
    civilStatus: '',
    address: '',
    mobileNumber: '',
    telephoneNumber: '',
    nicNo: '',
    isActive: true,
    username: '',
    password: '',
    role: '',
    statusId: ''
  });

  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!employee;

  useEffect(() => {
    loadRoles();
    loadStatuses();
    
    if (isEditing) {
      populateFormData();
    } else {
      generateEmployeeNo();
    }
  }, [employee]);

  const loadRoles = async () => {
    try {
      const rolesData = await employeeService.getAllRoles();
      // Filter out CUSTOMER role as CEO shouldn't create customers
      const filteredRoles = rolesData.filter(role => role !== 'CUSTOMER');
      setRoles(filteredRoles);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadStatuses = async () => {
    try {
      const statusesData = await employeeService.getAllStatuses();
      setStatuses(statusesData);
      
      // Set default status to active if creating new employee
      if (!isEditing && statusesData.length > 0) {
        const activeStatus = statusesData.find(status => status.value === 'Active');
        if (activeStatus) {
          setFormData(prev => ({ ...prev, statusId: activeStatus.id }));
        }
      }
    } catch (error) {
      console.error('Error loading statuses:', error);
    }
  };

  const generateEmployeeNo = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const employeeNo = `EMP${timestamp}${random}`;
    setFormData(prev => ({ ...prev, employeeNo }));
  };

  const populateFormData = () => {
    if (employee) {
      setFormData({
        employeeNo: employee.employeeNo || '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        dateOfBirth: employee.dateOfBirth || '',
        sex: employee.sex || '',
        civilStatus: employee.civilStatus || '',
        address: employee.address || '',
        mobileNumber: employee.mobileNumber || '',
        telephoneNumber: employee.telephoneNumber || '',
        nicNo: employee.nicNo || '',
        isActive: employee.isActive !== undefined ? employee.isActive : true,
        username: employee.user?.username || '',
        password: '', // Don't populate password for security
        role: employee.user?.role || '',
        statusId: employee.status?.id || ''
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.dateOfBirth) errors.push('Date of birth is required');
    if (!formData.sex) errors.push('Gender is required');
    if (!formData.civilStatus) errors.push('Civil status is required');
    if (!formData.address.trim()) errors.push('Address is required');
    if (!formData.mobileNumber || !/^\d{10}$/.test(formData.mobileNumber)) {
      errors.push('Valid 10-digit mobile number is required');
    }
    if (formData.telephoneNumber && !/^\d{10}$/.test(formData.telephoneNumber)) {
      errors.push('Telephone number must be 10 digits');
    }
    if (!formData.nicNo || !/^([0-9]{9}[x|X|v|V]|[0-9]{12})$/.test(formData.nicNo)) {
      errors.push('Valid NIC number is required');
    }
    if (!formData.username.trim()) errors.push('Username is required');
    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      errors.push('Password must be at least 6 characters');
    }
    if (!formData.role) errors.push('Role is required');
    if (!formData.statusId) errors.push('Status is required');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const employeeData = {
        employeeDTO: {
          employeeNo: formData.employeeNo,
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
          isActive: formData.isActive
        },
        userDTO: {
          username: formData.username,
          ...(formData.password && { password: formData.password }),
          role: formData.role
        },
        role: formData.role,
        statusDTO: {
          id: parseInt(formData.statusId)
        }
      };

      if (isEditing) {
        await employeeService.updateEmployee(employee.id, employeeData);
      } else {
        await employeeService.createEmployee(employeeData);
      }

      onSave();
    } catch (error) {
      setError(error.message || `Failed to ${isEditing ? 'update' : 'create'} employee`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-form">
      <div className="modal-header">
        <h2>{isEditing ? 'Edit Employee' : 'Create New Employee'}</h2>
        <button onClick={onCancel} className="modal-close">×</button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Account Information */}
        <div className="form-section">
          <h3>Account Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employeeNo">Employee Number *</label>
              <input
                type="text"
                id="employeeNo"
                name="employeeNo"
                value={formData.employeeNo}
                onChange={handleChange}
                required
                readOnly={isEditing}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                readOnly={isEditing}
                className="form-input"
              />
            </div>
          </div>

          {!isEditing && (
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="form-input"
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="statusId">Status *</label>
              <select
                id="statusId"
                name="statusId"
                value={formData.statusId}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select Status</option>
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="form-section">
          <h3>Personal Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sex">Gender *</label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="civilStatus">Civil Status *</label>
              <select
                id="civilStatus"
                name="civilStatus"
                value={formData.civilStatus}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select Civil Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nicNo">NIC Number *</label>
            <input
              type="text"
              id="nicNo"
              name="nicNo"
              value={formData.nicNo}
              onChange={handleChange}
              required
              placeholder="123456789V or 123456789012"
              className="form-input"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3>Contact Information</h3>
          
          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="3"
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mobileNumber">Mobile Number *</label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                placeholder="0771234567"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telephoneNumber">Telephone Number</label>
              <input
                type="tel"
                id="telephoneNumber"
                name="telephoneNumber"
                value={formData.telephoneNumber}
                onChange={handleChange}
                placeholder="0112345678"
                className="form-input"
              />
            </div>
          </div>

          {isEditing && (
            <div className="form-group">
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                Active Employee
              </label>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : (isEditing ? 'Update Employee' : 'Create Employee')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;