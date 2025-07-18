import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { customerAPI } from '../../services/api';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      fetchCartCount();
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const response = await customerAPI.getCartCount();
      if (response.data.success) {
        setCartCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
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

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          Caliber Clothing
        </Link>

        <div className="header-right">
          <nav>
            <ul className="nav-links">
              <li><Link to="/products">Products</Link></li>
              {user && user.role === 'CUSTOMER' && (
                <>
                  <li>
                    <Link to="/customer/cart">
                      Cart {cartCount > 0 && `(${cartCount})`}
                    </Link>
                  </li>
                  <li><Link to="/customer/wishlist">Wishlist</Link></li>
                </>
              )}
            </ul>
          </nav>

          <div className="auth-section">
            {user ? (
              <div className="user-menu">
                <button 
                  className="user-menu-toggle"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user.username} ▼
                </button>
                
                {showUserMenu && (
                  <div className="user-dropdown">
                    <Link 
                      to={getDashboardLink()} 
                      onClick={() => setShowUserMenu(false)}
                    >
                      Dashboard
                    </Link>
                    {user.role === 'CUSTOMER' && (
                      <>
                        <Link 
                          to="/customer/profile" 
                          onClick={() => setShowUserMenu(false)}
                        >
                          Profile
                        </Link>
                        <Link 
                          to="/customer/orders" 
                          onClick={() => setShowUserMenu(false)}
                        >
                          Order History
                        </Link>
                      </>
                    )}
                    <Link 
                      to="/change-password" 
                      onClick={() => setShowUserMenu(false)}
                    >
                      Change Password
                    </Link>
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        width: '100%', 
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        cursor: 'pointer'
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-secondary">Login</Link>
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