import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { ceoAPI } from '../../services/api';

const DeliveryProviderManagement = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNo: '',
    email: '',
    isActive: true
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await ceoAPI.getDeliveryProviders();
      setProviders(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching delivery providers:', error);
      setError('Failed to fetch delivery providers');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      contactNo: '',
      email: '',
      isActive: true
    });
  };

  const handleCreate = () => {
    resetForm();
    setModalMode('create');
    setSelectedProvider(null);
    setShowModal(true);
  };

  const handleEdit = (provider) => {
    setFormData({
      name: provider.name || '',
      address: provider.address || '',
      contactNo: provider.contactNo || '',
      email: provider.email || '',
      isActive: provider.isActive !== undefined ? provider.isActive : true
    });
    setModalMode('edit');
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const handleDelete = async (providerId) => {
    if (window.confirm('Are you sure you want to delete this delivery provider?')) {
      try {
        await ceoAPI.deleteDeliveryProvider(providerId);
        setSuccess('Delivery provider deleted successfully');
        fetchProviders();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting delivery provider:', error);
        setError('Failed to delete delivery provider');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Provider name is required');
    if (!formData.address.trim()) errors.push('Address is required');
    if (!formData.contactNo.trim()) errors.push('Contact number is required');
    if (!formData.email.trim()) errors.push('Email is required');
    
    // Contact number validation (10 digits)
    if (formData.contactNo && !/^\d{10}$/.test(formData.contactNo)) {
      errors.push('Contact number must be exactly 10 digits');
    }
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
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
      const providerData = {
        name: formData.name,
        address: formData.address,
        contactNo: formData.contactNo,
        email: formData.email,
        isActive: formData.isActive
      };

      if (modalMode === 'create') {
        await ceoAPI.createDeliveryProvider(providerData);
        setSuccess('Delivery provider created successfully');
      } else {
        await ceoAPI.updateDeliveryProvider(selectedProvider.id, providerData);
        setSuccess('Delivery provider updated successfully');
      }

      setShowModal(false);
      fetchProviders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving delivery provider:', error);
      setError(error.response?.data?.message || 'Failed to save delivery provider');
    }
  };

  // Filter providers based on search
  const filteredProviders = providers.filter(provider => {
    return !searchQuery || 
      provider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.contactNo?.includes(searchQuery);
  });

  const calculateStats = () => {
    return {
      total: providers.length,
      active: providers.filter(p => p.isActive).length,
      inactive: providers.filter(p => !p.isActive).length
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
              <h1 className="dashboard-title">Delivery Provider Management</h1>
              <div className="dashboard-actions">
                <Link to="/ceo/dashboard" className="btn btn-secondary">
                  ← Back to Dashboard
                </Link>
                <button onClick={handleCreate} className="btn btn-primary">
                  Add New Provider
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Statistics */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Providers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#28a745' }}>{stats.active}</div>
                <div className="stat-label">Active Providers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#dc3545' }}>{stats.inactive}</div>
                <div className="stat-label">Inactive Providers</div>
              </div>
            </div>

            {/* Search */}
            <div className="card">
              <div className="card-body">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ flex: '1' }}>
                    <input
                      type="text"
                      placeholder="Search providers by name, email, or contact number..."
                      className="form-control"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="btn btn-secondary"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading delivery providers...</p>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Delivery Providers ({filteredProviders.length})</h2>
                </div>
                <div className="card-body">
                  {filteredProviders.length === 0 ? (
                    <p>No delivery providers found.</p>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Provider Name</th>
                            <th>Contact Information</th>
                            <th>Address</th>
                            <th>Status</th>
                            <th>Registration Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProviders.map(provider => (
                            <tr key={provider.id}>
                              <td>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                  {provider.name}
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div>{provider.email}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {provider.contactNo}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.9rem', maxWidth: '200px' }}>
                                  {provider.address}
                                </div>
                              </td>
                              <td>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  backgroundColor: provider.isActive ? '#d4edda' : '#f8d7da',
                                  color: provider.isActive ? '#155724' : '#721c24'
                                }}>
                                  {provider.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <div>
                                  {provider.createdTimestamp ? 
                                    new Date(provider.createdTimestamp).toLocaleDateString() : 
                                    'N/A'
                                  }
                                </div>
                                {provider.updatedTimestamp && (
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    Updated: {new Date(provider.updatedTimestamp).toLocaleDateString()}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => handleEdit(provider)}
                                    className="btn btn-secondary btn-small"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(provider.id)}
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
                {modalMode === 'create' ? 'Add New Delivery Provider' : 'Edit Delivery Provider'}
              </h2>
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Provider Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Express Delivery Services"
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="contact@provider.com"
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
                    placeholder="1234567890"
                    pattern="[0-9]{10}"
                  />
                  <small className="text-muted">10 digits only</small>
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
                  placeholder="Complete address of the delivery provider"
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
                  Active Provider
                </label>
                <small className="text-muted">
                  Only active providers can be selected for deliveries
                </small>
              </div>

              <div className="d-flex gap-2" style={{ marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {modalMode === 'create' ? 'Add Provider' : 'Update Provider'}
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

export default DeliveryProviderManagement;