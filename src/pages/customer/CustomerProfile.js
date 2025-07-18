import React, { useState, useEffect } from 'react';
import './CustomerManagement.css';

const CustomerProfile = () => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchCustomerProfile();
  }, []);

  const fetchCustomerProfile = async () => {
    try {
      const response = await fetch('/api/customer/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCustomer(data.data);
          setFormData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCustomer(data.data);
          setEditing(false);
          alert('Profile updated successfully!');
        } else {
          alert(data.message || 'Error updating profile');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(passwordData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowPasswordModal(false);
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          alert('Password changed successfully!');
        } else {
          alert(data.message || 'Error changing password');
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
  };

  const cancelEdit = () => {
    setFormData(customer);
    setEditing(false);
  };

  if (loading) {
    return <div className="loading">Loading your profile...</div>;
  }

  if (!customer) {
    return (
      <div className="error-container">
        <h2>Profile Not Found</h2>
        <p>Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="customer-profile">
      <div className="header">
        <h1>My Profile</h1>
        <div className="header-actions">
          {!editing ? (
            <>
              <button 
                className="edit-btn"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
              <button 
                className="password-btn"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </button>
            </>
          ) : (
            <>
              <button 
                className="save-btn"
                onClick={handleProfileUpdate}
              >
                Save Changes
              </button>
              <button 
                className="cancel-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-sections">
          <div className="section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span className="field-value">{customer.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label>First Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span className="field-value">{customer.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Last Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span className="field-value">{customer.lastName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                {editing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span className="field-value">
                    {customer.dateOfBirth ? 
                      new Date(customer.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Gender</label>
                {editing ? (
                  <select
                    name="sex"
                    value={formData.sex || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <span className="field-value">{customer.sex || 'Not specified'}</span>
                )}
              </div>

              <div className="form-group">
                <label>NIC Number</label>
                <span className="field-value readonly">{customer.nicNo}</span>
                {editing && <small className="field-note">NIC number cannot be changed</small>}
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Contact Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Email Address</label>
                <span className="field-value readonly">{customer.email}</span>
                {editing && <small className="field-note">Email cannot be changed</small>}
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                {editing ? (
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber || ''}
                    onChange={handleInputChange}
                    pattern="[0-9]{10}"
                    placeholder="0771234567"
                  />
                ) : (
                  <span className="field-value">{customer.mobileNumber}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                {editing ? (
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                ) : (
                  <span className="field-value">{customer.address}</span>
                )}
              </div>

              <div className="form-group">
                <label>Country</label>
                {editing ? (
                  <input
                    type="text"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span className="field-value">{customer.country}</span>
                )}
              </div>

              <div className="form-group">
                <label>Province</label>
                <span className="field-value">{customer.province?.value || 'Not specified'}</span>
              </div>

              <div className="form-group">
                <label>Zip Code</label>
                {editing ? (
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode || ''}
                    onChange={handleInputChange}
                    pattern="[0-9]{5}"
                    placeholder="12345"
                  />
                ) : (
                  <span className="field-value">{customer.zipCode}</span>
                )}
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Account Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Account Status</label>
                <span className={`field-value status ${customer.user?.isActive ? 'active' : 'inactive'}`}>
                  {customer.user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="form-group">
                <label>Member Since</label>
                <span className="field-value">
                  {new Date(customer.createdTimestamp).toLocaleDateString()}
                </span>
              </div>

              <div className="form-group">
                <label>Last Updated</label>
                <span className="field-value">
                  {customer.updatedTimestamp ? 
                    new Date(customer.updatedTimestamp).toLocaleDateString() : 
                    'Never updated'}
                </span>
              </div>

              <div className="form-group">
                <label>Customer Status</label>
                <span className="field-value">{customer.status?.value || 'Active'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <div className="action-section">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <a href="/customer/orders" className="action-btn">
                View Order History
              </a>
              <a href="/customer/wishlist" className="action-btn">
                My Wishlist
              </a>
              <a href="/customer/cart" className="action-btn">
                Shopping Cart
              </a>
            </div>
          </div>

          <div className="account-info">
            <h3>Account Security</h3>
            <div className="security-info">
              <div className="security-item">
                <span className="security-label">Password:</span>
                <span className="security-value">••••••••</span>
                <button 
                  className="security-btn"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change
                </button>
              </div>
              
              <div className="security-item">
                <span className="security-label">Two-Factor Auth:</span>
                <span className="security-value">Not enabled</span>
                <button className="security-btn" disabled>
                  Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Change Password</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handlePasswordUpdate} className="password-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
                <small className="field-note">Password must be at least 6 characters</small>
              </div>
              
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  Change Password
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;