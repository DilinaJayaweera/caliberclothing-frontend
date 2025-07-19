import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { ceoAPI } from '../../services/api';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  
  const [formData, setFormData] = useState({
    supplierNo: '',
    supplierName: '',
    country: '',
    address: '',
    contactNo: '',
    isActive: true
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await ceoAPI.getSuppliers();
      setSuppliers(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      supplierNo: '',
      supplierName: '',
      country: '',
      address: '',
      contactNo: '',
      isActive: true
    });
  };

  const generateSupplierNo = (name) => {
    if (!name) return '';
    const prefix = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `SUP${prefix}${timestamp}`;
  };

  const handleCreate = () => {
    resetForm();
    setModalMode('create');
    setSelectedSupplier(null);
    setShowModal(true);
  };

  const handleEdit = (supplier) => {
    setFormData({
      supplierNo: supplier.supplierNo || '',
      supplierName: supplier.supplierName || '',
      country: supplier.country || '',
      address: supplier.address || '',
      contactNo: supplier.contactNo || '',
      isActive: supplier.isActive !== undefined ? supplier.isActive : true
    });
    setModalMode('edit');
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const handleDelete = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await ceoAPI.deleteSupplier(supplierId);
        setSuccess('Supplier deleted successfully');
        fetchSuppliers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting supplier:', error);
        setError('Failed to delete supplier');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      
      // Auto-generate supplier number when name changes
      if (name === 'supplierName' && modalMode === 'create') {
        updated.supplierNo = generateSupplierNo(value);
      }
      
      return updated;
    });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.supplierName.trim()) errors.push('Supplier name is required');
    if (!formData.country.trim()) errors.push('Country is required');
    if (!formData.address.trim()) errors.push('Address is required');
    if (!formData.contactNo.trim()) errors.push('Contact number is required');
    
    // Contact number validation
    if (formData.contactNo && !/^\+?[\d\s-()]+$/.test(formData.contactNo)) {
      errors.push('Please enter a valid contact number');
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
      const supplierData = {
        supplierNo: formData.supplierNo,
        supplierName: formData.supplierName,
        country: formData.country,
        address: formData.address,
        contactNo: formData.contactNo,
        isActive: formData.isActive,
        createdTimestamp: modalMode === 'create' ? new Date().toISOString() : undefined,
        updatedTimestamp: new Date().toISOString()
      };

      if (modalMode === 'create') {
        await ceoAPI.createSupplier(supplierData);
        setSuccess('Supplier created successfully');
      } else {
        await ceoAPI.updateSupplier(selectedSupplier.id, supplierData);
        setSuccess('Supplier updated successfully');
      }

      setShowModal(false);
      fetchSuppliers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving supplier:', error);
      setError(error.response?.data?.message || 'Failed to save supplier');
    }
  };

  // Filter suppliers based on search and country
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = !searchQuery || 
      supplier.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.supplierNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactNo?.includes(searchQuery);
    
    const matchesCountry = !countryFilter || 
      supplier.country?.toLowerCase() === countryFilter.toLowerCase();
    
    return matchesSearch && matchesCountry;
  });

  const calculateStats = () => {
    const countries = [...new Set(suppliers.map(s => s.country))].filter(Boolean);
    return {
      total: suppliers.length,
      active: suppliers.filter(s => s.isActive).length,
      inactive: suppliers.filter(s => !s.isActive).length,
      countries: countries.length,
      countriesList: countries
    };
  };

  const stats = calculateStats();

  return (
    <div>
      <Header />
      
      <main className="content-container">
        <div className="container">
          <div className="dashboard">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Supplier Management</h1>
              <div className="dashboard-actions">
                <Link to="/ceo/dashboard" className="btn btn-secondary">
                  ← Back to Dashboard
                </Link>
                <button onClick={handleCreate} className="btn btn-primary">
                  Add New Supplier
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Statistics */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Suppliers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#28a745' }}>{stats.active}</div>
                <div className="stat-label">Active Suppliers</div>
              </div>
              {/* <div className="stat-card">
                <div className="stat-number" style={{ color: '#dc3545' }}>{stats.inactive}</div>
                <div className="stat-label">Inactive Suppliers</div>
              </div> */}
              <div className="stat-card">
                <div className="stat-number">{stats.countries}</div>
                <div className="stat-label">Countries</div>
              </div>
            </div>

            {/* Filters */}
            <div className="card">
              <div className="card-body">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <input
                      type="text"
                      placeholder="Search suppliers by name, supplier number, or contact..."
                      className="form-control"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div style={{ minWidth: '150px' }}>
                    <select
                      className="form-control"
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                    >
                      <option value="">All Countries</option>
                      {stats.countriesList.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(searchQuery || countryFilter) && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setCountryFilter('');
                      }}
                      className="btn btn-secondary"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Country Distribution */}
            {stats.countriesList.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Supplier Distribution by Country</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {stats.countriesList.map(country => {
                      const count = suppliers.filter(s => s.country === country).length;
                      const percentage = ((count / stats.total) * 100).toFixed(1);
                      return (
                        <div 
                          key={country}
                          style={{
                            padding: '1rem',
                            border: '2px solid #000',
                            borderRadius: '8px',
                            textAlign: 'center',
                            minWidth: '120px'
                          }}
                        >
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{count}</div>
                          <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{country}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading suppliers...</p>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Suppliers ({filteredSuppliers.length})</h2>
                </div>
                <div className="card-body">
                  {filteredSuppliers.length === 0 ? (
                    <p>No suppliers found.</p>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Supplier</th>
                            <th>Contact</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Registration</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSuppliers.map(supplier => (
                            <tr key={supplier.id}>
                              <td>
                                <div>
                                  <div style={{ fontWeight: 'bold' }}>
                                    {supplier.supplierName}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {supplier.supplierNo}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>{supplier.contactNo}</div>
                              </td>
                              <td>
                                <div>
                                  <div style={{ fontWeight: 'bold' }}>{supplier.country}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#666', maxWidth: '200px' }}>
                                    {supplier.address}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  backgroundColor: supplier.isActive ? '#d4edda' : '#f8d7da',
                                  color: supplier.isActive ? '#155724' : '#721c24'
                                }}>
                                  {supplier.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <div>
                                  {supplier.createdTimestamp ? 
                                    new Date(supplier.createdTimestamp).toLocaleDateString() : 
                                    'N/A'
                                  }
                                </div>
                                {supplier.updatedTimestamp && (
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    Updated: {new Date(supplier.updatedTimestamp).toLocaleDateString()}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => handleEdit(supplier)}
                                    className="btn btn-secondary btn-small"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(supplier.id)}
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
                {modalMode === 'create' ? 'Add New Supplier' : 'Edit Supplier'}
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
                  <label htmlFor="supplierName">Supplier Name *</label>
                  <input
                    type="text"
                    id="supplierName"
                    name="supplierName"
                    className="form-control"
                    value={formData.supplierName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., ABC Textiles Ltd"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="supplierNo">Supplier Number</label>
                  <input
                    type="text"
                    id="supplierNo"
                    name="supplierNo"
                    className="form-control"
                    value={formData.supplierNo}
                    readOnly
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                  <small className="text-muted">Auto-generated</small>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    className="form-control"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Sri Lanka, India, China"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactNo">Contact Number *</label>
                  <input
                    type="tel"
                    id="contactNo"
                    name="contactNo"
                    className="form-control"
                    value={formData.contactNo}
                    onChange={handleChange}
                    required
                    placeholder="+94 11 1234567"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <textarea
                  id="address"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  required
                  placeholder="Complete address of the supplier"
                ></textarea>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  Active Supplier
                </label>
                <small className="text-muted">
                  Only active suppliers can be selected for product sourcing
                </small>
              </div>

              <div className="d-flex gap-2" style={{ marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {modalMode === 'create' ? 'Add Supplier' : 'Update Supplier'}
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

export default SupplierManagement;