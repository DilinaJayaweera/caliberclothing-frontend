import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const { changePassword, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');

    // Check password strength for new password
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength('');
      return;
    }

    let strength = 0;
    let strengthText = '';
    let strengthClass = '';

    // Check password criteria
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
      case 2:
        strengthText = 'Weak';
        strengthClass = 'strength-weak';
        break;
      case 3:
      case 4:
        strengthText = 'Medium';
        strengthClass = 'strength-medium';
        break;
      case 5:
        strengthText = 'Strong';
        strengthClass = 'strength-strong';
        break;
      default:
        strengthText = 'Weak';
        strengthClass = 'strength-weak';
    }

    setPasswordStrength({ text: strengthText, class: strengthClass, score: strength });
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

    if (formData.newPassword === formData.currentPassword) {
      return 'New password must be different from current password';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return 'New passwords do not match';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (result.success) {
        setSuccess('Password changed successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordStrength('');
        
        // Redirect after success
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(result.message || 'Failed to change password');
      }
    } catch (error) {
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container change-password-container">
        <div className="auth-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Change Password</h1>
          <p>Hello, {user?.username}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength="6"
              className="form-input"
            />
            
            {passwordStrength && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className={`strength-fill ${passwordStrength.class}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                <div className={`strength-text ${passwordStrength.class}`}>
                  Password strength: {passwordStrength.text}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li>At least 6 characters long</li>
              <li>Different from your current password</li>
              <li>For stronger security, include:</li>
              <ul>
                <li>Uppercase and lowercase letters</li>
                <li>Numbers</li>
                <li>Special characters (!@#$%^&*)</li>
              </ul>
            </ul>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary btn-full"
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;