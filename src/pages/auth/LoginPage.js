import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData.username, formData.password);
      
      // Redirect based on user role
      if (response.role === 'CUSTOMER') {
        navigate('/products');
      } else {
        navigate(response.redirectUrl || from);
      }
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
          <div className="form-container">
            <h1 className="text-center mb-4">Login to Your Account</h1>
            
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
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
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="text-center mt-3">
              <p>
                Don't have an account? 
                <Link to="/register" style={{ marginLeft: '0.5rem', color: '#000', textDecoration: 'underline' }}>
                  Register
                </Link>
              </p>
            </div>

            {/* <div className="text-center mt-4" style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h3>Demo Login Credentials</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <strong>CEO</strong><br />
                  Username: ceo<br />
                  Password: password123
                </div>
                <div>
                  <strong>Product Manager</strong><br />
                  Username: pm<br />
                  Password: password123
                </div>
                <div>
                  <strong>Merchandise Manager</strong><br />
                  Username: mm<br />
                  Password: password123
                </div>
                <div>
                  <strong>Dispatch Officer</strong><br />
                  Username: do<br />
                  Password: password123
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoginPage;