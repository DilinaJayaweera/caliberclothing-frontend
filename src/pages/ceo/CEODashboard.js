import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { ceoAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CEODashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState({
    employees: 0,
    products: 0,
    orders: 0,
    customers: 0,
    suppliers: 0,
    deliveryProviders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchStats();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await ceoAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    }
  };

  const fetchStats = async () => {
    try {
      const [
        employeesRes,
        productsRes,
        ordersRes,
        customersRes,
        suppliersRes,
        deliveryProvidersRes
      ] = await Promise.all([
        ceoAPI.getEmployees(),
        ceoAPI.getProducts(),
        ceoAPI.getOrders(),
        ceoAPI.getCustomers(),
        ceoAPI.getSuppliers(),
        ceoAPI.getDeliveryProviders()
      ]);

      setStats({
        employees: employeesRes.data.length,
        products: productsRes.data.length,
        orders: ordersRes.data.length,
        customers: customersRes.data.length,
        suppliers: suppliersRes.data.length,
        deliveryProviders: deliveryProvidersRes.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: 'Employee Management', path: '/ceo/employees', description: 'Manage employees and their roles' },
    { title: 'Product Management', path: '/ceo/products', description: 'Add, edit, and manage products' },
    { title: 'View Orders', path: '/ceo/orders', description: 'View all customer orders' },
    { title: 'Customer Overview', path: '/ceo/customers', description: 'View customer information' },
    { title: 'Supplier Management', path: '/ceo/suppliers', description: 'Manage supplier relationships' },
    { title: 'Delivery Providers', path: '/ceo/delivery-providers', description: 'Manage delivery service providers' },
    { title: 'Supplier Payments', path: '/ceo/supplier-payments', description: 'Manage supplier payment details' },
    { title: 'Reports & Analytics', path: '/ceo/reports', description: 'Generate business reports and analytics' }
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
              <h1 className="dashboard-title">CEO Dashboard</h1>
              <p className="dashboard-subtitle">
                Welcome back, {user?.username}! Here's an overview of your business.
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
                <div className="stat-number">{stats.employees}</div>
                <div className="stat-label">Employees</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.products}</div>
                <div className="stat-label">Products</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.orders}</div>
                <div className="stat-label">Orders</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.customers}</div>
                <div className="stat-label">Customers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.suppliers}</div>
                <div className="stat-label">Suppliers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.deliveryProviders}</div>
                <div className="stat-label">Delivery Providers</div>
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
                        transition: 'transform 0.3s, box-shadow 0.3s'
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

            {/* Recent Activities */}
            <div className="grid-2" style={{ marginTop: '2rem' }}>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">System Overview</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      <span>Total System Users:</span>
                      <strong>{stats.employees + stats.customers}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      <span>Active Products:</span>
                      <strong>{stats.products}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      <span>Total Orders:</span>
                      <strong>{stats.orders}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                      <span>Business Partners:</span>
                      <strong>{stats.suppliers + stats.deliveryProviders}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">CEO Responsibilities</h3>
                </div>
                <div className="card-body">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Employee Management & Role Assignment
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Product Catalog Management
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Order Monitoring & Oversight
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Customer Data Analysis
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Supplier Relationship Management
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Delivery Service Management
                    </li>
                    <li style={{ padding: '0.5rem 0' }}>
                      ✓ Business Reports & Analytics
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Reports */}
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-header">
                <h3 className="card-title">Quick Reports</h3>
              </div>
              <div className="card-body">
                <div className="grid-3">
                  <Link to="/ceo/reports?type=sales&period=month" className="btn btn-secondary">
                    Monthly Sales Report
                  </Link>
                  <Link to="/ceo/reports?type=customer-growth&period=month" className="btn btn-secondary">
                    Customer Growth
                  </Link>
                  <Link to="/ceo/reports?type=inventory-status" className="btn btn-secondary">
                    Inventory Status
                  </Link>
                  <Link to="/ceo/reports?type=most-sold-products&period=month" className="btn btn-secondary">
                    Top Products
                  </Link>
                  <Link to="/ceo/reports?type=supplier-performance&period=month" className="btn btn-secondary">
                    Supplier Performance
                  </Link>
                  <Link to="/ceo/reports?type=order-status-distribution&period=month" className="btn btn-secondary">
                    Order Status Overview
                  </Link>
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

export default CEODashboard;