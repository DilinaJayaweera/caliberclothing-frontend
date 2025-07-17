import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import './MerchandiseManagerDashboard.css';

const MerchandiseManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchLowStockItems();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/merchandise-manager/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await fetch('/api/merchandise-manager/notifications/low-stock', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLowStockItems(data);
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsReordered = async (productId) => {
    try {
      const response = await fetch(`/api/merchandise-manager/notifications/mark-reordered/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        alert('Product marked as reordered successfully!');
        fetchLowStockItems();
      }
    } catch (error) {
      console.error('Error marking product as reordered:', error);
      alert('Error marking product as reordered');
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="merchandise-dashboard">
      <div className="dashboard-header">
        <h1>Merchandise Manager Dashboard</h1>
        <p>Welcome, {dashboardData?.username}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card urgent">
          <h3>Low Stock Alerts</h3>
          <div className="stat-number">{lowStockItems.length}</div>
          <p>Items need reordering</p>
        </div>
        <div className="stat-card">
          <h3>Total Inventory Items</h3>
          <div className="stat-number">-</div>
          <p>Active products</p>
        </div>
        <div className="stat-card">
          <h3>Active Suppliers</h3>
          <div className="stat-number">-</div>
          <p>Business partners</p>
        </div>
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <div className="stat-number">-</div>
          <p>To suppliers</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/merchandise-manager/low-stock-notifications" className="action-btn urgent">
              <span className="notification-badge">{lowStockItems.length}</span>
              View Low Stock Items
            </Link>
            <Link to="/merchandise-manager/inventory-management" className="action-btn">
              Manage Inventory
            </Link>
            <Link to="/merchandise-manager/supplier-management" className="action-btn">
              Manage Suppliers
            </Link>
            <Link to="/merchandise-manager/supplier-payment-management" className="action-btn">
              Supplier Payments
            </Link>
          </div>
        </div>

        <div className="recent-alerts">
          <h2>Recent Low Stock Alerts</h2>
          {lowStockItems.length > 0 ? (
            <div className="alerts-list">
              {lowStockItems.slice(0, 5).map(item => (
                <div key={item.id} className="alert-item">
                  <div className="alert-info">
                    <h4>{item.product?.name}</h4>
                    <p>Current Stock: {item.totalQuantityPurchasing}</p>
                    <p>Reorder Level: {item.reorderLevel}</p>
                  </div>
                  <button 
                    className="reorder-btn"
                    onClick={() => markAsReordered(item.product?.id)}
                  >
                    Mark as Reordered
                  </button>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <Link to="/merchandise-manager/low-stock-notifications" className="view-all-btn">
                  View All ({lowStockItems.length})
                </Link>
              )}
            </div>
          ) : (
            <div className="no-alerts">
              <p>No low stock alerts at the moment.</p>
            </div>
          )}
        </div>

        <div className="system-info">
          <h2>System Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <h4>Role</h4>
              <p>{dashboardData?.role}</p>
            </div>
            <div className="info-item">
              <h4>Dashboard Type</h4>
              <p>{dashboardData?.dashboardType}</p>
            </div>
            <div className="info-item">
              <h4>Permissions</h4>
              <ul>
                {dashboardData?.permissions?.map(permission => (
                  <li key={permission}>{permission.replace(/_/g, ' ')}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchandiseManagerDashboard;