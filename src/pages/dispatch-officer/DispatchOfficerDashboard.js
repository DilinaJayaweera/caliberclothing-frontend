import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dispatchOfficerAPI } from '../../services/api';

const DispatchOfficerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchStatistics();
    fetchRecentOrders();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dispatchOfficerAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await dispatchOfficerAPI.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await dispatchOfficerAPI.getOrders();
      // Get the 5 most recent orders
      const recent = response.data.slice(0, 5);
      setRecentOrders(recent);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dispatch-dashboard">
      <div className="dashboard-header">
        <h1>Dispatch Officer Dashboard</h1>
        <p>Welcome, {dashboardData?.username}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-number">{statistics.totalOrders || 0}</div>
          <p>All time orders</p>
        </div>
        <div className="stat-card">
          <h3>Total Customers</h3>
          <div className="stat-number">{statistics.totalCustomers || 0}</div>
          <p>Registered customers</p>
        </div>
        <div className="stat-card">
          <h3>Delivery Providers</h3>
          <div className="stat-number">{statistics.activeDeliveryProviders || 0}</div>
          <p>Active providers</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending Orders</h3>
          <div className="stat-number">
            {recentOrders.filter(order => 
              order.orderStatus?.value === 'PENDING' || 
              order.orderStatus?.value === 'PROCESSING'
            ).length}
          </div>
          <p>Need attention</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/dispatch-officer/orders" className="action-btn">
              <span className="action-icon">📦</span>
              View All Orders
            </Link>
            <Link to="/dispatch-officer/customers" className="action-btn">
              <span className="action-icon">👥</span>
              View Customers
            </Link>
            <Link to="/dispatch-officer/delivery-providers" className="action-btn">
              <span className="action-icon">🚚</span>
              Delivery Providers
            </Link>
            <Link to="/dispatch-officer/order-status" className="action-btn">
              <span className="action-icon">📊</span>
              Manage Order Status
            </Link>
          </div>
        </div>
      </div>

      <div className="order-status-summary">
        <h2>Order Status Overview</h2>
        <div className="status-grid">
          <div className="status-item pending">
            <h4>Pending</h4>
            <span className="count">
              {recentOrders.filter(order => order.orderStatus?.value === 'PENDING').length}
            </span>
          </div>
          <div className="status-item processing">
            <h4>Processing</h4>
            <span className="count">
              {recentOrders.filter(order => order.orderStatus?.value === 'PROCESSING').length}
            </span>
          </div>
          <div className="status-item shipped">
            <h4>Shipped</h4>
            <span className="count">
              {recentOrders.filter(order => order.orderStatus?.value === 'SHIPPED').length}
            </span>
          </div>
          <div className="status-item delivered">
            <h4>Delivered</h4>
            <span className="count">
              {recentOrders.filter(order => order.orderStatus?.value === 'DELIVERED').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchOfficerDashboard;