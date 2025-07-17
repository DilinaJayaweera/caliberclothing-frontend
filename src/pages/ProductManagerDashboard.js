import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import { productService } from '../services/productService';

const ProductManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    categories: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [products, lowStock, categories] = await Promise.all([
        productService.getAllProducts(),
        productService.getLowStockProducts(),
        productService.getCategories()
      ]);

      setDashboardStats({
        totalProducts: products.length,
        lowStockProducts: lowStock.length,
        categories: categories.length
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    loadDashboardStats();
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'low-stock', label: 'Low Stock', icon: '⚠️' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-content">
            <h2>Product Manager Dashboard</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalProducts}</h3>
                  <p>Total Products</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📂</div>
                <div className="stat-info">
                  <h3>{dashboardStats.categories}</h3>
                  <p>Categories</p>
                </div>
              </div>
              
              <div className="stat-card alert">
                <div className="stat-icon">⚠️</div>
                <div className="stat-info">
                  <h3>{dashboardStats.lowStockProducts}</h3>
                  <p>Low Stock Items</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button onClick={handleCreateProduct} className="btn btn-primary">
                  Add New Product
                </button>
                <button onClick={() => setActiveTab('low-stock')} className="btn btn-outline">
                  View Low Stock Items
                </button>
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="products-content">
            <div className="content-header">
              <h2>Product Management</h2>
              <button onClick={handleCreateProduct} className="btn btn-primary">
                Add Product
              </button>
            </div>
            <ProductList 
              onEdit={handleEditProduct}
              canManage={true}
              showAllDetails={true}
            />
          </div>
        );

      case 'low-stock':
        return (
          <div className="low-stock-content">
            <div className="content-header">
              <h2>Low Stock Products</h2>
            </div>
            <ProductList 
              onEdit={handleEditProduct}
              canManage={true}
              showAllDetails={true}
              lowStockOnly={true}
            />
          </div>
        );

      default:
        return (
          <div className="default-content">
            <h2>Welcome to Product Manager Dashboard</h2>
            <p>Select an option from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-page">
      <Header />
      
      <div className="dashboard-layout">
        <Sidebar 
          menuItems={menuItems}
          activeItem={activeTab}
          onItemClick={setActiveTab}
        />
        
        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProductForm
              product={selectedProduct}
              onSave={closeModal}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagerDashboard;