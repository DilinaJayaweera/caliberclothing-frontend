import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { commonAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const CustomerRegistration = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // User data
    username: '',
    password: '',
    confirmPassword: '',
    
    // Customer data
    fullName: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    sex: '',
    email: '',
    address: '',
    country: '',
    zipCode: '',
    mobileNumber: '',
    nicNo: '',
    provinceId: '',
    statusId: 1 // Default active status
  });
  
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await commonAPI.getProvinces();
      setProvinces(response.data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Auto-generate full name
    if (name === 'firstName' || name === 'lastName') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        fullName: name === 'firstName' 
          ? `${value} ${prev.lastName}`.trim()
          : `${prev.firstName} ${value}`.trim()
      }));
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.username.trim()) errors.push('Username is required');
    if (!formData.password) errors.push('Password is required');
    if (formData.password.length < 6) errors.push('Password must be at least 6 characters');
    if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
    
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.dateOfBirth) errors.push('Date of birth is required');
    if (!formData.sex) errors.push('Gender is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.address.trim()) errors.push('Address is required');
    if (!formData.country.trim()) errors.push('Country is required');
    if (!formData.zipCode.trim()) errors.push('Zip code is required');
    if (!formData.mobileNumber.trim()) errors.push('Mobile number is required');
    if (!formData.nicNo.trim()) errors.push('NIC number is required');
    if (!formData.provinceId) errors.push('Province is required');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    // Mobile number validation (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (formData.mobileNumber && !mobileRegex.test(formData.mobileNumber)) {
      errors.push('Mobile number must be exactly 10 digits');
    }

    // Zip code validation (5 digits)
    const zipRegex = /^\d{5}$/;
    if (formData.zipCode && !zipRegex.test(formData.zipCode)) {
      errors.push('Zip code must be exactly 5 digits');
    }

    // Age validation (must be at least 13 years old)
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 13) {
        errors.push('You must be at least 13 years old to register');
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      setSuccess('Registration successful! You can now login with your credentials.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      
      <main className="content-container">
        <div className="container">
          <div className="form-container" style={{ maxWidth: '600px' }}>
            <h1 className="text-center mb-4">Create Customer Account</h1>
            
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
              {/* Login Credentials */}
              <div className="card mb-3">
                <div className="card-header">
                  <h3>Login Information</h3>
                </div>
                <div className="card-body">
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
                    <label htmlFor="password">Password *</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      minLength="6"
                      required
                    />
                    <small className="text-muted">Minimum 6 characters</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password *</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-control"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="card mb-3">
                <div className="card-header">
                  <h3>Personal Information</h3>
                </div>
                <div className="card-body">
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
                    <small className="text-muted">Auto-generated from first and last name</small>
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
                        max={new Date().toISOString().split('T')[0]}
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
                        <option value="Other">Other</option>
                      </select>
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
                      placeholder="e.g., 123456789V or 123456789012"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="card mb-3">
                <div className="card-header">
                  <h3>Contact Information</h3>
                </div>
                <div className="card-body">
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
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mobileNumber">Mobile Number *</label>
                    <input
                      type="tel"
                      id="mobileNumber"
                      name="mobileNumber"
                      className="form-control"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="1234567890"
                      pattern="[0-9]{10}"
                      required
                    />
                    <small className="text-muted">10 digits only</small>
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
                    ></textarea>
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
                        placeholder="e.g., Sri Lanka"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="zipCode">Zip Code *</label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        className="form-control"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="12345"
                        pattern="[0-9]{5}"
                        required
                      />
                      <small className="text-muted">5 digits only</small>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="provinceId">Province *</label>
                    <select
                      id="provinceId"
                      name="provinceId"
                      className="form-control"
                      value={formData.provinceId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Province</option>
                      {provinces.map(province => (
                        <option key={province.id} value={province.id}>
                          {province.value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="text-center mt-3">
              <p>
                Already have an account? 
                <Link to="/login" style={{ marginLeft: '0.5rem', color: '#000', textDecoration: 'underline' }}>
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CustomerRegistration;