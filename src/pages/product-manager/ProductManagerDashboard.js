import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { productManagerAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ProductManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    activeProducts: 0,
    categories: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, lowStockRes] = await Promise.all([
        productManagerAPI.getProducts(),
        productManagerAPI.getLowStockProducts(10)
      ]);

      setStats({
        totalProducts: productsRes.data.length,
        lowStockProducts: lowStockRes.data.length,
        activeProducts: productsRes.data.filter(p => p.isActive).length,
        categories: [...new Set(productsRes.data.map(p => p.productCategory?.id))].length
      });

      setLowStockProducts(lowStockRes.data.slice(0, 5)); // Show only first 5
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
      title: 'Product Management', 
      path: '/product-manager/products', 
      description: 'Add, edit, and manage products',
      icon: '📦'
    },
    { 
      title: 'Low Stock Alert', 
      path: '/product-manager/products?filter=lowstock', 
      description: 'View products with low inventory',
      icon: '⚠️',
      badge: stats.lowStockProducts > 0 ? stats.lowStockProducts : null
    },
    { 
      title: 'Add New Product', 
      path: '/product-manager/products?action=create', 
      description: 'Create a new product listing',
      icon: '➕'
    },
    { 
      title: 'Category Management', 
      path: '/product-manager/categories', 
      description: 'Manage product categories',
      icon: '📂'
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
              <h1 className="dashboard-title">Product Manager Dashboard</h1>
              <p className="dashboard-subtitle">
                Welcome back, {user?.username}! Manage your product catalog efficiently.
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
                <div className="stat-number">{stats.totalProducts}</div>
                <div className="stat-label">Total Products</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.activeProducts}</div>
                <div className="stat-label">Active Products</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: stats.lowStockProducts > 0 ? '#dc3545' : '#000' }}>
                  {stats.lowStockProducts}
                </div>
                <div className="stat-label">Low Stock Items</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.categories}</div>
                <div className="stat-label">Categories</div>
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
            {lowStockProducts.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title" style={{ color: '#dc3545' }}>⚠️ Low Stock Alert</h3>
                  <Link to="/product-manager/products?filter=lowstock" className="btn btn-danger btn-small">
                    View All Low Stock Items
                  </Link>
                </div>
                <div className="card-body">
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Product Code</th>
                          <th>Current Stock</th>
                          <th>Category</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockProducts.map(product => (
                          <tr key={product.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img
                                  src={product.productImage || '/placeholder-image.jpg'}
                                  alt={product.name}
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                  onError={(e) => e.target.src = '/placeholder-image.jpg'}
                                />
                                <div>
                                  <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    ${product.sellingPrice?.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>{product.productNo}</td>
                            <td>
                              <span style={{ 
                                color: product.quantityInStock <= 5 ? '#dc3545' : '#ffc107',
                                fontWeight: 'bold'
                              }}>
                                {product.quantityInStock}
                              </span>
                            </td>
                            <td>{product.productCategory?.name}</td>
                            <td>
                              <Link
                                to={`/product-manager/products/${product.id}/edit`}
                                className="btn btn-secondary btn-small"
                              >
                                Update Stock
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

            {/* Product Manager Responsibilities */}
            <div className="grid-2" style={{ marginTop: '2rem' }}>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Your Responsibilities</h3>
                </div>
                <div className="card-body">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Add new products to the catalog
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Update product information and pricing
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Monitor and manage stock levels
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Categorize products appropriately
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Remove discontinued products
                    </li>
                    <li style={{ padding: '0.5rem 0' }}>
                      ✓ Ensure product quality and descriptions
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Quick Tips</h3>
                </div>
                <div className="card-body">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      💡 Keep product descriptions detailed and accurate
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      📸 Use high-quality product images
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      🏷️ Set competitive pricing based on market research
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      📊 Monitor stock levels regularly
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      🔄 Update product information when needed
                    </li>
                    <li style={{ padding: '0.5rem 0' }}>
                      📋 Organize products in relevant categories
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-header">
                <h3 className="card-title">System Overview</h3>
              </div>
              <div className="card-body">
                <div className="grid-3">
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '2rem', color: '#28a745', marginBottom: '0.5rem' }}>
                      ✓
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {stats.activeProducts}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      Active Products
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '2rem', color: stats.lowStockProducts > 0 ? '#dc3545' : '#28a745', marginBottom: '0.5rem' }}>
                      {stats.lowStockProducts > 0 ? '⚠️' : '✓'}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {stats.lowStockProducts}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      Low Stock Items
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '2rem', color: '#17a2b8', marginBottom: '0.5rem' }}>
                      📂
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {stats.categories}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      Product Categories
                    </div>
                  </div>
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

export default ProductManagerDashboard;