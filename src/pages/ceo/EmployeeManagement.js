import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { ceoAPI, commonAPI } from '../../services/api';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [formData, setFormData] = useState({
    employeeNo: '',
    fullName: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    sex: '',
    civilStatus: '',
    address: '',
    mobileNumber: '',
    telephoneNumber: '',
    nicNo: '',
    username: '',
    password: '',
    role: '',
    statusId: 1
  });

  const roles = [
    'PRODUCT_MANAGER',
    'MERCHANDISE_MANAGER', 
    'DISPATCH_OFFICER'
  ];

  useEffect(() => {
    fetchEmployees();
    fetchStatuses();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await ceoAPI.getEmployees();
      setEmployees(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await commonAPI.getStatuses();
      setStatuses(response.data);
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeNo: '',
      fullName: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      sex: '',
      civilStatus: '',
      address: '',
      mobileNumber: '',
      telephoneNumber: '',
      nicNo: '',
      username: '',
      password: '',
      role: '',
      statusId: 1
    });
  };

  const handleCreate = () => {
    resetForm();
    setModalMode('create');
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    setFormData({
      employeeNo: employee.employeeNo || '',
      fullName: employee.fullName || '',
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      dateOfBirth: employee.dateOfBirth || '',
      sex: employee.sex || '',
      civilStatus: employee.civilStatus || '',
      address: employee.address || '',
      mobileNumber: employee.mobileNumber || '',
      telephoneNumber: employee.telephoneNumber || '',
      nicNo: employee.nicNo || '',
      username: employee.user?.username || '',
      password: '', // Don't populate password for security
      role: employee.user?.role || '',
      statusId: employee.status?.id || 1
    });
    setModalMode('edit');
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await ceoAPI.deleteEmployee(employeeId);
        setSuccess('Employee deleted successfully');
        fetchEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting employee:', error);
        setError('Failed to delete employee');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate full name and employee number
    if (name === 'firstName' || name === 'lastName') {
      const firstName = name === 'firstName' ? value : formData.firstName;
      const lastName = name === 'lastName' ? value : formData.lastName;
      const fullName = `${firstName} ${lastName}`.trim();
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        fullName: fullName,
        employeeNo: modalMode === 'create' && fullName ? generateEmployeeNo(fullName) : prev.employeeNo
      }));
    }
  };

  const generateEmployeeNo = (fullName) => {
    const initials = fullName.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `EMP${initials}${timestamp}`;
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.dateOfBirth) errors.push('Date of birth is required');
    if (!formData.sex) errors.push('Gender is required');
    if (!formData.civilStatus) errors.push('Civil status is required');
    if (!formData.address.trim()) errors.push('Address is required');
    if (!formData.mobileNumber.trim()) errors.push('Mobile number is required');
    if (!formData.nicNo.trim()) errors.push('NIC number is required');
    if (!formData.username.trim()) errors.push('Username is required');
    if (modalMode === 'create' && !formData.password) errors.push('Password is required');
    if (!formData.role) errors.push('Role is required');

    // Mobile number validation
    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
      errors.push('Mobile number must be exactly 10 digits');
    }

    // Telephone number validation (optional)
    if (formData.telephoneNumber && !/^\d{10}$/.test(formData.telephoneNumber)) {
      errors.push('Telephone number must be exactly 10 digits');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    try {
      const employeeData = {
        employeeNo: formData.employeeNo,
        fullName: formData.fullName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        sex: formData.sex,
        civilStatus: formData.civilStatus,
        address: formData.address,
        mobileNumber: formData.mobileNumber,
        telephoneNumber: formData.telephoneNumber || null,
        nicNo: formData.nicNo
      };

      const userData = {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        isActive: true
      };

      const statusDTO = {
        id: formData.statusId
      };

      if (modalMode === 'create') {
        await ceoAPI.createEmployee({
          ...employeeData,
          user: userData,
          status: statusDTO,
          role: formData.role
        });
        setSuccess('Employee created successfully');
      } else {
        await ceoAPI.updateEmployee(selectedEmployee.id, {
          ...employeeData,
          user: modalMode === 'edit' && formData.password ? userData : { ...userData, password: undefined },
          status: statusDTO,
          role: formData.role
        });
        setSuccess('Employee updated successfully');
      }

      setShowModal(false);
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving employee:', error);
      setError(error.response?.data?.message || 'Failed to save employee');
    }
  };

  return (
    <div>
      <Header />
      
      <main className="content-container">
        <div className="container">
          <div className="dashboard">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Employee Management</h1>
              <div className="dashboard-actions">
                <Link to="/ceo/dashboard" className="btn btn-secondary">
                  ← Back to Dashboard
                </Link>
                <button onClick={handleCreate} className="btn btn-primary">
                  Add New Employee
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading employees...</p>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Employees ({employees.length})</h2>
                </div>
                <div className="card-body">
                  {employees.length === 0 ? (
                    <p>No employees found.</p>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Employee No</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Mobile</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map(employee => (
                            <tr key={employee.id}>
                              <td>{employee.employeeNo}</td>
                              <td>{employee.fullName}</td>
                              <td>{employee.user?.role}</td>
                              <td>{employee.mobileNumber}</td>
                              <td>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  backgroundColor: employee.isActive ? '#d4edda' : '#f8d7da',
                                  color: employee.isActive ? '#155724' : '#721c24'
                                }}>
                                  {employee.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => handleEdit(employee)}
                                    className="btn btn-secondary btn-small"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(employee.id)}
                                    className="btn btn-danger btn-small"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? 'Create New Employee' : 'Edit Employee'}
              </h2>
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="form-control"
                  value={formData.fullName}
                  readOnly
                  style={{ backgroundColor: '#f8f9fa' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="employeeNo">Employee Number</label>
                <input
                  type="text"
                  id="employeeNo"
                  name="employeeNo"
                  className="form-control"
                  value={formData.employeeNo}
                  readOnly
                  style={{ backgroundColor: '#f8f9fa' }}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    className="form-control"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sex">Gender *</label>
                  <select
                    id="sex"
                    name="sex"
                    className="form-control"
                    value={formData.sex}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="civilStatus">Civil Status *</label>
                <select
                  id="civilStatus"
                  name="civilStatus"
                  className="form-control"
                  value={formData.civilStatus}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Civil Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <textarea
                  id="address"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  required
                ></textarea>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="mobileNumber">Mobile Number *</label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    className="form-control"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="telephoneNumber">Telephone Number</label>
                  <input
                    type="tel"
                    id="telephoneNumber"
                    name="telephoneNumber"
                    className="form-control"
                    value={formData.telephoneNumber}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="nicNo">NIC Number *</label>
                <input
                  type="text"
                  id="nicNo"
                  name="nicNo"
                  className="form-control"
                  value={formData.nicNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="username">Username *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">
                    Password {modalMode === 'create' ? '*' : '(Leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    required={modalMode === 'create'}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    name="role"
                    className="form-control"
                    value={formData.role}
                    onChange={handleChange}
                    required
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
                    className="form-control"
                    value={formData.statusId}
                    onChange={handleChange}
                    required
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="d-flex gap-2" style={{ marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {modalMode === 'create' ? 'Create Employee' : 'Update Employee'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default EmployeeManagement;