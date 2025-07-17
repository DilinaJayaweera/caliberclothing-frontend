import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const ChangePassword = () => {
  const { changePassword, user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      return 'Current password is required';
    }
    if (!formData.newPassword) {
      return 'New password is required';
    }
    if (formData.newPassword.length < 6) {
      return 'New password must be at least 6 characters long';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return 'New password and confirm password do not match';
    }
    if (formData.currentPassword === formData.newPassword) {
      return 'New password must be different from current password';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      
      setSuccess('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        const dashboardUrl = getDashboardUrl(user?.role);
        navigate(dashboardUrl);
      }, 2000);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardUrl = (role) => {
    switch (role) {
      case 'CEO':
        return '/ceo/dashboard';
      case 'PRODUCT_MANAGER':
        return '/product-manager/dashboard';
      case 'MERCHANDISE_MANAGER':
        return '/merchandise-manager/dashboard';
      case 'DISPATCH_OFFICER':
        return '/dispatch-officer/dashboard';
      case 'CUSTOMER':
        return '/customer/dashboard';
      default:
        return '/';
    }
  };

  const handleCancel = () => {
    const dashboardUrl = getDashboardUrl(user?.role);
    navigate(dashboardUrl);
  };

  return (
    <div>
      <Header />
      
      <main className="content-container">
        <div className="container">
          <div className="form-container">
            <h1 className="text-center mb-4">Change Password</h1>
            
            <div className="alert alert-info">
              <p><strong>Password Requirements:</strong></p>
              <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
                <li>Minimum 6 characters long</li>
                <li>Must be different from your current password</li>
                <li>Should contain a mix of letters and numbers for better security</li>
              </ul>
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password *</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  className="form-control"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className="form-control"
                  value={formData.newPassword}
                  onChange={handleChange}
                  minLength="6"
                  required
                  disabled={loading}
                />
                <small className="text-muted">Minimum 6 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-4" style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h4>Security Tips:</h4>
              <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
                <li>Use a unique password that you don't use elsewhere</li>
                <li>Consider using a password manager</li>
                <li>Change your password regularly</li>
                <li>Never share your password with anyone</li>
                <li>Log out from shared or public computers</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChangePassword;