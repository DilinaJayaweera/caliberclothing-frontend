import React, { useState, useEffect } from 'react';
import { dispatchOfficerAPI } from '../../services/api';

const CustomerViewing = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await dispatchOfficerAPI.getCustomers();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      fetchCustomers();
      return;
    }

    try {
      const response = await dispatchOfficerAPI.searchCustomers(searchTerm);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  const fetchCustomerOrders = async (customerId) => {
    try {
      const response = await dispatchOfficerAPI.getOrdersByCustomer(customerId);
      setCustomerOrders(response.data);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    }
  };

  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    await fetchCustomerOrders(customer.id);
    setShowModal(true);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobileNumber?.includes(searchTerm)
  );

  const getCustomerStats = () => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.user?.isActive).length;
    
    return {
      total: totalCustomers,
      active: activeCustomers,
      inactive: totalCustomers - activeCustomers
    };
  };

  const stats = getCustomerStats();

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="customer-viewing">
      <div className="header">
        <h1>Customer Management</h1>
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
            placeholder="Search by name, email, or phone number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              searchCustomers(e.target.value);
            }}
            className="search-input"
          />
        </div>
      </div>

      <div className="customers-grid">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="customer-card">
            <div className="card-header">
              <h3>{customer.fullName}</h3>
              <span className={`status-badge ${customer.user?.isActive ? 'active' : 'inactive'}`}>
                {customer.user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="card-content">
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{customer.email}</span>
              </div>
              
              <div className="info-row">
                <span className="label">Phone:</span>
                <span className="value">{customer.mobileNumber}</span>
              </div>
              
              <div className="info-row">
                <span className="label">Address:</span>
                <span className="value">{customer.address}</span>
              </div>
              
              <div className="info-row">
                <span className="label">Country:</span>
                <span className="value">{customer.country}</span>
              </div>
              
              <div className="info-row">
                <span className="label">Province:</span>
                <span className="value">{customer.province?.value || 'N/A'}</span>
              </div>
              
              <div className="info-row">
                <span className="label">Registered:</span>
                <span className="value">
                  {new Date(customer.createdTimestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="card-actions">
              <button 
                className="view-btn"
                onClick={() => handleViewCustomer(customer)}
              >
                View Details
              </button>
              <button className="orders-btn">
                View Orders
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="no-customers">
          No customers found matching your search criteria.
        </div>
      )}

      <div className="customer-summary">
        <h2>Customer Summary</h2>
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
            <h3>Recent Registrations</h3>
            <div className="recent-list">
              {customers
                .sort((a, b) => new Date(b.createdTimestamp) - new Date(a.createdTimestamp))
                .slice(0, 5)
                .map(customer => (
                  <div key={customer.id} className="recent-item">
                    <span className="customer-name">{customer.fullName}</span>
                    <span className="reg-date">
                      {new Date(customer.createdTimestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          
          <div className="summary-card">
            <h3>By Country</h3>
            <div className="country-list">
              {[...new Set(customers.map(c => c.country))].map(country => (
                <div key={country} className="country-item">
                  <span className="country-name">{country}</span>
                  <span className="country-count">
                    {customers.filter(c => c.country === country).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  setSelectedCustomer(null);
                  setCustomerOrders([]);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="customer-details">
                <div className="detail-section">
                  <h3>Personal Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Full Name:</label>
                      <span>{selectedCustomer.fullName}</span>
                    </div>
                    <div className="detail-item">
                      <label>First Name:</label>
                      <span>{selectedCustomer.firstName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Last Name:</label>
                      <span>{selectedCustomer.lastName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Date of Birth:</label>
                      <span>
                        {selectedCustomer.dateOfBirth ? 
                          new Date(selectedCustomer.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Gender:</label>
                      <span>{selectedCustomer.sex}</span>
                    </div>
                    <div className="detail-item">
                      <label>NIC Number:</label>
                      <span>{selectedCustomer.nicNo}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Contact Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Mobile Number:</label>
                      <span>{selectedCustomer.mobileNumber}</span>
                    </div>
                    <div className="detail-item">
                      <label>Address:</label>
                      <span>{selectedCustomer.address}</span>
                    </div>
                    <div className="detail-item">
                      <label>Country:</label>
                      <span>{selectedCustomer.country}</span>
                    </div>
                    <div className="detail-item">
                      <label>Province:</label>
                      <span>{selectedCustomer.province?.value || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Zip Code:</label>
                      <span>{selectedCustomer.zipCode}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Account Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Username:</label>
                      <span>{selectedCustomer.user?.username}</span>
                    </div>
                    <div className="detail-item">
                      <label>Account Status:</label>
                      <span className={selectedCustomer.user?.isActive ? 'active-text' : 'inactive-text'}>
                        {selectedCustomer.user?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span>{selectedCustomer.status?.value || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Registered Date:</label>
                      <span>
                        {new Date(selectedCustomer.createdTimestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Last Updated:</label>
                      <span>
                        {selectedCustomer.updatedTimestamp ? 
                          new Date(selectedCustomer.updatedTimestamp).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Order History ({customerOrders.length} orders)</h3>
                  {customerOrders.length > 0 ? (
                    <div className="orders-list">
                      {customerOrders.slice(0, 5).map(order => (
                        <div key={order.id} className="order-item">
                          <div className="order-info">
                            <span className="order-no">#{order.orderNo}</span>
                            <span className="order-date">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </span>
                            <span className="order-amount">Rs.{order.totalPrice?.toFixed(2)}</span>
                            <span className={`order-status ${order.orderStatus?.value?.toLowerCase()}`}>
                              {order.orderStatus?.value}
                            </span>
                          </div>
                        </div>
                      ))}
                      {customerOrders.length > 5 && (
                        <p className="more-orders">
                          And {customerOrders.length - 5} more orders...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="no-orders-text">No orders found for this customer.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerViewing;