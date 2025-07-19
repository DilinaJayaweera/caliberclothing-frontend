import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { merchandiseManagerAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MerchandiseManagerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchLowStockItems();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await merchandiseManagerAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await merchandiseManagerAPI.getLowStockNotifications();
      setLowStockItems(response.data);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsReordered = async (productId) => {
    try {
      await merchandiseManagerAPI.markAsReordered(productId);
      alert('Product marked as reordered successfully!');
      fetchLowStockItems();
    } catch (error) {
      console.error('Error marking product as reordered:', error);
      alert('Error marking product as reordered');
    }
  };

  const quickActions = [
    { 
      title: 'Low Stock Notifications', 
      path: '/merchandise-manager/notifications', 
      description: 'View items that need reordering',
      icon: '⚠️',
      badge: lowStockItems.length > 0 ? lowStockItems.length : null
    },
    { 
      title: 'Inventory Management', 
      path: '/merchandise-manager/inventory', 
      description: 'Manage stock levels and quantities',
      icon: '📦'
    },
    { 
      title: 'Manage Suppliers', 
      path: '/merchandise-manager/suppliers', 
      description: 'Add, edit, and manage suppliers',
      icon: '🏭'
    },
    { 
      title: 'Supplier Payments', 
      path: '/merchandise-manager/supplier-payments', 
      description: 'Track and manage supplier payments',
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
              <h1 className="dashboard-title">Merchandise Manager Dashboard</h1>
              <p className="dashboard-subtitle">
                Welcome back, {user?.username}! Manage inventory, suppliers, and stock levels efficiently.
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {/* Statistics Cards */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-number" style={{ color: lowStockItems.length > 0 ? '#dc3545' : '#28a745' }}>
                  {lowStockItems.length}
                </div>
                <div className="stat-label">Low Stock Alerts</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">-</div>
                <div className="stat-label">Total Inventory Items</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">-</div>
                <div className="stat-label">Pending Payments</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Quick Actions</h2>
              </div>
              <div className="card-body">
                <div className="grid-2">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.path}
                      className="card"
                      style={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        position: 'relative'
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
                      {action.badge && (
                        <span style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {action.badge}
                        </span>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '2rem' }}>
                          {action.icon}
                        </div>
                        <div>
                          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                            {action.title}
                          </h3>
                          <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title" style={{ color: '#dc3545' }}>⚠️ Low Stock Alert</h3>
                  <Link to="/merchandise-manager/notifications" className="btn btn-danger btn-small">
                    View All Low Stock Items
                  </Link>
                </div>
                <div className="card-body">
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Current Stock</th>
                          <th>Reorder Level</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockItems.slice(0, 5).map(item => (
                          <tr key={item.id}>
                            <td>
                              <div style={{ fontWeight: 'bold' }}>
                                {item.product?.name || 'Unknown Product'}
                              </div>
                            </td>
                            <td>
                              <span style={{ 
                                color: '#dc3545',
                                fontWeight: 'bold'
                              }}>
                                {item.totalQuantityPurchasing || 0}
                              </span>
                            </td>
                            <td>
                              <span style={{ color: '#666' }}>
                                {item.reorderLevel || 'Not set'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => markAsReordered(item.product?.id)}
                                className="btn btn-secondary btn-small"
                              >
                                Mark as Reordered
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MerchandiseManagerDashboard;