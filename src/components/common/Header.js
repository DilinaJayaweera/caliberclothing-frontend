import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = ({ onCartClick }) => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDashboard = () => {
    if (user?.role) {
      switch (user.role.toUpperCase()) {
        case 'CEO':
          navigate('/ceo/dashboard');
          break;
        case 'PRODUCT_MANAGER':
          navigate('/product-manager/dashboard');
          break;
        case 'MERCHANDISE_MANAGER':
          navigate('/merchandise-manager/dashboard');
          break;
        case 'DISPATCH_OFFICER':
          navigate('/dispatch-officer/dashboard');
          break;
        case 'CUSTOMER':
          navigate('/');
          break;
        default:
          navigate('/');
      }
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo">
            <Link to="/">
              <h1>Caliber Clothing</h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            
            {user && (
              <>
                {user.role === 'CUSTOMER' && (
                  <>
                    <button 
                      onClick={onCartClick} 
                      className="nav-link cart-button"
                    >
                      Cart ({getCartItemsCount()})
                    </button>
                  </>
                )}
                
                {user.role !== 'CUSTOMER' && (
                  <button 
                    onClick={handleDashboard}
                    className="nav-link"
                  >
                    Dashboard
                  </button>
                )}
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="user-actions">
            {user ? (
              <div className="user-menu">
                <span className="user-info">
                  Welcome, {user.username}
                  <span className="user-role">({user.role})</span>
                </span>
                
                <div className="user-dropdown">
                  <Link to="/change-password" className="dropdown-item">
                    Change Password
                  </Link>
                  
                  {user.role !== 'CUSTOMER' && (
                    <button 
                      onClick={handleDashboard}
                      className="dropdown-item"
                    >
                      Dashboard
                    </button>
                  )}
                  
                  <button 
                    onClick={handleLogout}
                    className="dropdown-item logout-btn"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;