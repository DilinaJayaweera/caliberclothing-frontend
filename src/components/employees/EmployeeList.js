import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService';

const EmployeeList = ({ onEdit, canManage = false }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    loadEmployees();
    loadRoles();
    loadStatuses();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, selectedRole, selectedStatus]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const employeesData = await employeeService.getAllEmployees();
      setEmployees(employeesData);
    } catch (error) {
      setError('Failed to load employees');
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const rolesData = await employeeService.getAllRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadStatuses = async () => {
    try {
      const statusesData = await employeeService.getAllStatuses();
      setStatuses(statusesData);
    } catch (error) {
      console.error('Error loading statuses:', error);
    }
  };

  const filterEmployees = () => {
    let filtered = employees.filter(employee => {
      const matchesSearch = 
        employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.nicNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.mobileNumber?.includes(searchTerm);

      const matchesRole = selectedRole === 'all' || employee.user?.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || employee.status?.value === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });

    setFilteredEmployees(filtered);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeService.deleteEmployee(employeeId);
        loadEmployees(); // Reload the list
      } catch (error) {
        setError('Failed to delete employee');
        console.error('Error deleting employee:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-badge status-active';
      case 'inactive':
        return 'status-badge status-inactive';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        Loading employees...
      </div>
    );
  }

  return (
    <div className="employee-list">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <label>Search Employees</label>
            <input
              type="text"
              placeholder="Search by name, employee number, NIC, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status.id} value={status.value}>
                  {status.value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="data-table-container">
        {filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No employees found</h3>
            <p>
              {employees.length === 0 
                ? "No employees have been added yet."
                : "No employees match your search criteria."
              }
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee No</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Mobile Number</th>
                <th>NIC Number</th>
                <th>Status</th>
                <th>Date Joined</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr key={employee.id}>
                  <td>
                    <strong>{employee.employeeNo}</strong>
                  </td>
                  <td>
                    <div>
                      <strong>{employee.fullName}</strong>
                      <br />
                      <small className="text-muted">
                        {employee.firstName} {employee.lastName}
                      </small>
                    </div>
                  </td>
                  <td>
                    <span className="role-badge">
                      {employee.user?.role?.replace('_', ' ') || 'N/A'}
                    </span>
                  </td>
                  <td>{employee.mobileNumber}</td>
                  <td>{employee.nicNo}</td>
                  <td>
                    <span className={getStatusBadgeClass(employee.status?.value)}>
                      {employee.status?.value || 'Unknown'}
                    </span>
                  </td>
                  <td>{formatDate(employee.createdTimestamp)}</td>
                  {canManage && (
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => onEdit(employee)}
                          className="btn btn-outline btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      {filteredEmployees.length > 0 && (
        <div className="list-summary">
          <p>
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;