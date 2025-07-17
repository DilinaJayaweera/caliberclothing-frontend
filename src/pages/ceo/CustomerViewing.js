import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { ceoAPI } from '../../services/api';

const CustomerViewing = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await ceoAPI.getCustomers();
      setCustomers(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetails = async (customerId) => {
    try {
      const response = await ceoAPI.getCustomer(customerId);
      setSelectedCustomer(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setError('Failed to fetch customer details');
    }
  };

  // Filter customers based on search criteria
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchQuery || 
      customer.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.mobileNumber?.includes(searchQuery) ||
      customer.nicNo?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && customer.status?.value === 'Active') ||
      (statusFilter === 'inactive' && customer.status?.value !== 'Active');
    
    const matchesProvince = !provinceFilter || 
      customer.province?.value === provinceFilter;
    
    return matchesSearch && matchesStatus && matchesProvince;
  });

  const calculateCustomerStats = () => {
    const stats = {
      total: filteredCustomers.length,
      active: filteredCustomers.filter(c => c.status?.value === 'Active').length,
      inactive: filteredCustomers.filter(c => c.status?.value !== 'Active').length,
      provinces: [...new Set(filteredCustomers.map(c => c.province?.value))].filter(Boolean),
      recentRegistrations: filteredCustomers.filter(c => {
        const regDate = new Date(c.createdTimestamp);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return regDate > thirtyDaysAgo;
      }).length
    };
    return stats;
  };

  const customerStats = calculateCustomerStats();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div>
      <Header />
      
      <main className="content-container">
        <div className="container">
          <div className="dashboard">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Customer Overview</h1>
              <div className="dashboard-actions">
                <Link to="/ceo/dashboard" className="btn btn-secondary">
                  ← Back to Dashboard
                </Link>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Customer Stats */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-number">{customerStats.total}</div>
                <div className="stat-label">Total Customers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#28a745' }}>{customerStats.active}</div>
                <div className="stat-label">Active Customers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#dc3545' }}>{customerStats.inactive}</div>
                <div className="stat-label">Inactive Customers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{customerStats.recentRegistrations}</div>
                <div className="stat-label">New (30 days)</div>
              </div>
            </div>

            {/* Filters */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Filter Customers</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <input
                      type="text"
                      placeholder="Search by name, email, mobile, or NIC..."
                      className="form-control"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div style={{ minWidth: '120px' }}>
                    <select
                      className="form-control"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div style={{ minWidth: '150px' }}>
                    <select
                      className="form-control"
                      value={provinceFilter}
                      onChange={(e) => setProvinceFilter(e.target.value)}
                    >
                      <option value="">All Provinces</option>
                      {customerStats.provinces.map(province => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(searchQuery || statusFilter || provinceFilter) && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('');
                        setProvinceFilter('');
                      }}
                      className="btn btn-secondary"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Demographics */}
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Geographic Distribution</h3>
                </div>
                <div className="card-body">
                  {customerStats.provinces.length === 0 ? (
                    <p>No province data available</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {customerStats.provinces.map(province => {
                        const count = filteredCustomers.filter(c => c.province?.value === province).length;
                        const percentage = ((count / customerStats.total) * 100).toFixed(1);
                        return (
                          <div key={province} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{province}</span>
                            <span style={{ fontWeight: 'bold' }}>{count} ({percentage}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Registration Timeline</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Last 7 days:</span>
                      <strong>
                        {filteredCustomers.filter(c => {
                          const regDate = new Date(c.createdTimestamp);
                          const sevenDaysAgo = new Date();
                          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                          return regDate > sevenDaysAgo;
                        }).length}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Last 30 days:</span>
                      <strong>{customerStats.recentRegistrations}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Last 90 days:</span>
                      <strong>
                        {filteredCustomers.filter(c => {
                          const regDate = new Date(c.createdTimestamp);
                          const ninetyDaysAgo = new Date();
                          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                          return regDate > ninetyDaysAgo;
                        }).length}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading customers...</p>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Customers ({filteredCustomers.length})</h2>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                    Customer information (credentials not shown for security)
                  </p>
                </div>
                <div className="card-body">
                  {filteredCustomers.length === 0 ? (
                    <p>No customers found matching your criteria.</p>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Contact</th>
                            <th>Location</th>
                            <th>Registration</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCustomers.map(customer => (
                            <tr key={customer.id}>
                              <td>
                                <div>
                                  <div style={{ fontWeight: 'bold' }}>
                                    {customer.fullName}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {customer.sex} • Age: {calculateAge(customer.dateOfBirth)}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    NIC: {customer.nicNo}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div>{customer.email}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {customer.mobileNumber}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div>{customer.province?.value}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {customer.country}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {customer.zipCode}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>{formatDate(customer.createdTimestamp)}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  {customer.createdTimestamp && 
                                    `${Math.floor((Date.now() - new Date(customer.createdTimestamp)) / (1000 * 60 * 60 * 24))} days ago`
                                  }
                                </div>
                              </td>
                              <td>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  backgroundColor: customer.status?.value === 'Active' ? '#d4edda' : '#f8d7da',
                                  color: customer.status?.value === 'Active' ? '#155724' : '#721c24'
                                }}>
                                  {customer.status?.value || 'Unknown'}
                                </span>
                              </td>
                              <td>
                                <button
                                  onClick={() => viewCustomerDetails(customer.id)}
                                  className="btn btn-secondary btn-small"
                                >
                                  View Details
                                </button>
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

      {/* Customer Details Modal */}
      {showModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h2 className="modal-title">Customer Details - {selectedCustomer.fullName}</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Personal Information */}
              <div className="card" style={{ margin: '0 0 1rem 0' }}>
                <div className="card-header">
                  <h3 className="card-title">Personal Information</h3>
                </div>
                <div className="card-body">
                  <div className="grid-2">
                    <div>
                      <p><strong>Full Name:</strong> {selectedCustomer.fullName}</p>
                      <p><strong>First Name:</strong> {selectedCustomer.firstName}</p>
                      <p><strong>Last Name:</strong> {selectedCustomer.lastName}</p>
                      <p><strong>Date of Birth:</strong> {formatDate(selectedCustomer.dateOfBirth)}</p>
                      <p><strong>Age:</strong> {calculateAge(selectedCustomer.dateOfBirth)} years</p>
                    </div>
                    <div>
                      <p><strong>Gender:</strong> {selectedCustomer.sex}</p>
                      <p><strong>NIC Number:</strong> {selectedCustomer.nicNo}</p>
                      <p><strong>Status:</strong> 
                        <span style={{
                          marginLeft: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          backgroundColor: selectedCustomer.status?.value === 'Active' ? '#d4edda' : '#f8d7da',
                          color: selectedCustomer.status?.value === 'Active' ? '#155724' : '#721c24'
                        }}>
                          {selectedCustomer.status?.value || 'Unknown'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="card" style={{ margin: '0 0 1rem 0' }}>
                <div className="card-header">
                  <h3 className="card-title">Contact Information</h3>
                </div>
                <div className="card-body">
                  <div className="grid-2">
                    <div>
                      <p><strong>Email:</strong> {selectedCustomer.email}</p>
                      <p><strong>Mobile Number:</strong> {selectedCustomer.mobileNumber}</p>
                      <p><strong>Country:</strong> {selectedCustomer.country}</p>
                    </div>
                    <div>
                      <p><strong>Province:</strong> {selectedCustomer.province?.value}</p>
                      <p><strong>Zip Code:</strong> {selectedCustomer.zipCode}</p>
                      <p><strong>Address:</strong></p>
                      <div style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}>
                        {selectedCustomer.address}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="card" style={{ margin: '0 0 1rem 0' }}>
                <div className="card-header">
                  <h3 className="card-title">Account Information</h3>
                </div>
                <div className="card-body">
                  <div className="grid-2">
                    <div>
                      <p><strong>Registration Date:</strong> {formatDate(selectedCustomer.createdTimestamp)}</p>
                      <p><strong>Last Updated:</strong> {formatDate(selectedCustomer.updatedTimestamp)}</p>
                      <p><strong>Account Age:</strong> 
                        {selectedCustomer.createdTimestamp && 
                          ` ${Math.floor((Date.now() - new Date(selectedCustomer.createdTimestamp)) / (1000 * 60 * 60 * 24))} days`
                        }
                      </p>
                    </div>
                    <div>
                      <p><strong>Username:</strong> {selectedCustomer.user?.username || 'N/A'}</p>
                      <p><strong>Account Status:</strong> 
                        <span style={{
                          marginLeft: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          backgroundColor: selectedCustomer.user?.isActive ? '#d4edda' : '#f8d7da',
                          color: selectedCustomer.user?.isActive ? '#155724' : '#721c24'
                        }}>
                          {selectedCustomer.user?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                <strong>Note:</strong> For security reasons, customer login credentials and sensitive information are not displayed in this view.
              </div>
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button 
                onClick={() => setShowModal(false)} 
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default CustomerViewing;