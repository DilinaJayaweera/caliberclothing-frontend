import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { customerAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './CustomerManagement.css';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getDashboard();
      setDashboardData(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { 
      title: 'Browse Products', 
      path: '/products', 
      description: 'Explore our latest collection',
      icon: '🛍️'
    },
    { 
      title: 'My Cart', 
      path: '/customer/cart', 
      description: 'View and manage your cart items',
      icon: '🛒'
    },
    { 
      title: 'Wishlist', 
      path: '/customer/wishlist', 
      description: 'View your saved items',
      icon: '♡'
    },
    { 
      title: 'Order History', 
      path: '/customer/orders', 
      description: 'Track your past orders',
      icon: '📦'
    },
    { 
      title: 'My Profile', 
      path: '/customer/profile', 
      description: 'Update your personal information',
      icon: '👤'
    },
    { 
      title: 'Payment Info', 
      path: '/customer/payment-info', 
      description: 'View payment details',
      icon: '💳'
    }
  ];

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <main className="content-container">
        <div className="container">
          <div className="dashboard">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Welcome back, {user?.username}!</h1>
              <p className="dashboard-subtitle">
                Manage your orders, profile, and explore our latest products.
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {/* Statistics Cards */}
            {dashboardData?.statistics && (
              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-number">{dashboardData.statistics.cartItems || 0}</div>
                  <div className="stat-label">Items in Cart</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{dashboardData.statistics.wishlistItems || 0}</div>
                  <div className="stat-label">Wishlist Items</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{dashboardData.statistics.totalOrders || 0}</div>
                  <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{dashboardData.statistics.recentOrders?.length || 0}</div>
                  <div className="stat-label">Recent Orders</div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Quick Actions</h2>
              </div>
              <div className="card-body">
                <div className="grid-3">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.path}
                      className="card"
                      style={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        textAlign: 'center'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {action.icon}
                      </div>
                      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                        {action.title}
                      </h3>
                      <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                        {action.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            {dashboardData?.statistics?.recentOrders && dashboardData.statistics.recentOrders.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Recent Orders</h3>
                  <Link to="/customer/orders" className="btn btn-secondary btn-small">
                    View All Orders
                  </Link>
                </div>
                <div className="card-body">
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Order No</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.statistics.recentOrders.map(order => (
                          <tr key={order.id}>
                            <td>{order.orderNo}</td>
                            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                            <td>${order.totalPrice?.toFixed(2)}</td>
                            <td>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                backgroundColor: '#d4edda',
                                color: '#155724'
                              }}>
                                {order.orderStatus?.value || 'Pending'}
                              </span>
                            </td>
                            <td>
                              <Link 
                                to={`/customer/orders/${order.id}`}
                                className="btn btn-secondary btn-small"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Tips */}
            <div className="grid-2" style={{ marginTop: '2rem' }}>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Shopping Tips</h3>
                </div>
                <div className="card-body">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      💡 Add items to your wishlist to save them for later
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      🚚 Free shipping on orders over $50
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      🔄 Easy returns within 30 days
                    </li>
                    <li style={{ padding: '0.5rem 0' }}>
                      📱 Track your orders in real-time
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Account Security</h3>
                </div>
                <div className="card-body">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      🔐 Keep your password secure and unique
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      📧 Verify your email address is current
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      📞 Update your phone number for order notifications
                    </li>
                    <li style={{ padding: '0.5rem 0' }}>
                      <Link to="/change-password" style={{ color: '#000', textDecoration: 'underline' }}>
                        🔄 Change your password
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CustomerDashboard;