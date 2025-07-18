import React, { useState, useEffect } from 'react';
import { dispatchOfficerAPI } from '../../services/api';

const DeliveryProviderViewing = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await dispatchOfficerAPI.getDeliveryProviders();
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching delivery providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveProviders = async () => {
    try {
      const response = await dispatchOfficerAPI.getActiveDeliveryProviders();
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching active delivery providers:', error);
    }
  };

  const handleViewProvider = (provider) => {
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const filteredProviders = providers.filter(provider =>
    provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.contactNo?.includes(searchTerm)
  );

  const getProviderStats = () => {
    const totalProviders = providers.length;
    const activeProviders = providers.filter(p => p.isActive).length;
    
    return {
      total: totalProviders,
      active: activeProviders,
      inactive: totalProviders - activeProviders
    };
  };

  const stats = getProviderStats();

  if (loading) {
    return <div className="loading">Loading delivery providers...</div>;
  }

  return (
    <div className="delivery-provider-viewing">
      <div className="header">
        <h1>Delivery Service Providers</h1>
        <div className="header-stats">
          <span className="stat">Total: {stats.total}</span>
          <span className="stat active">Active: {stats.active}</span>
          <span className="stat inactive">Inactive: {stats.inactive}</span>
        </div>
      </div>

      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, email, or contact number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <button 
            className="filter-btn"
            onClick={fetchProviders}
          >
            Show All
          </button>
          <button 
            className="filter-btn active"
            onClick={fetchActiveProviders}
          >
            Active Only
          </button>
        </div>
      </div>

      <div className="providers-grid">
        {filteredProviders.map(provider => (
          <div key={provider.id} className="provider-card">
            <div className="card-header">
              <h3>{provider.name}</h3>
              <span className={`status-badge ${provider.isActive ? 'active' : 'inactive'}`}>
                {provider.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="card-content">
              <div className="info-row">
                <span className="label">Contact Number:</span>
                <span className="value">{provider.contactNo}</span>
              </div>
              
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{provider.email}</span>
              </div>
              
              <div className="info-row address">
                <span className="label">Address:</span>
                <span className="value">{provider.address}</span>
              </div>
              
              <div className="info-row">
                <span className="label">Created:</span>
                <span className="value">
                  {new Date(provider.createdTimestamp).toLocaleDateString()}
                </span>
              </div>
              
              {provider.updatedTimestamp && (
                <div className="info-row">
                  <span className="label">Last Updated:</span>
                  <span className="value">
                    {new Date(provider.updatedTimestamp).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="card-actions">
              <button 
                className="view-btn"
                onClick={() => handleViewProvider(provider)}
              >
                View Details
              </button>
              <button className="contact-btn">
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="no-providers">
          No delivery providers found matching your search criteria.
        </div>
      )}

      <div className="provider-summary">
        <h2>Provider Summary</h2>
        <div className="summary-cards">
          <div className="summary-card">
            <h3>By Status</h3>
            <div className="status-breakdown">
              <div className="status-item active">
                <span className="count">{stats.active}</span>
                <span className="label">Active</span>
              </div>
              <div className="status-item inactive">
                <span className="count">{stats.inactive}</span>
                <span className="label">Inactive</span>
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <h3>Recent Additions</h3>
            <div className="recent-list">
              {providers
                .sort((a, b) => new Date(b.createdTimestamp) - new Date(a.createdTimestamp))
                .slice(0, 5)
                .map(provider => (
                  <div key={provider.id} className="recent-item">
                    <span className="provider-name">{provider.name}</span>
                    <span className="add-date">
                      {new Date(provider.createdTimestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          
          <div className="summary-card">
            <h3>Contact Overview</h3>
            <div className="contact-stats">
              <div className="contact-item">
                <span className="contact-label">Total Providers:</span>
                <span className="contact-value">{providers.length}</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">With Email:</span>
                <span className="contact-value">
                  {providers.filter(p => p.email).length}
                </span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Active Services:</span>
                <span className="contact-value">{stats.active}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedProvider && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Provider Details</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  setSelectedProvider(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="provider-details">
                <div className="detail-section">
                  <h3>Basic Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Provider Name:</label>
                      <span>{selectedProvider.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={selectedProvider.isActive ? 'active-text' : 'inactive-text'}>
                        {selectedProvider.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Contact Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Contact Number:</label>
                      <span>{selectedProvider.contactNo}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email Address:</label>
                      <span>{selectedProvider.email}</span>
                    </div>
                    <div className="detail-item full-width">
                      <label>Address:</label>
                      <span>{selectedProvider.address}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Timeline</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Created Date:</label>
                      <span>
                        {new Date(selectedProvider.createdTimestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Last Updated:</label>
                      <span>
                        {selectedProvider.updatedTimestamp ? 
                          new Date(selectedProvider.updatedTimestamp).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {selectedProvider.deletedTimestamp && (
                      <div className="detail-item">
                        <label>Deleted Date:</label>
                        <span>
                          {new Date(selectedProvider.deletedTimestamp).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Service Information</h3>
                  <div className="service-info">
                    <p>This delivery service provider can be assigned to handle order deliveries. 
                       Contact them directly for delivery arrangements and tracking information.</p>
                    
                    <div className="contact-actions">
                      <button className="contact-action-btn email">
                        Email Provider
                      </button>
                      <button className="contact-action-btn phone">
                        Call Provider
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryProviderViewing;