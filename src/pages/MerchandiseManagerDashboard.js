import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ProductList from '../components/products/ProductList';
import SupplierList from '../components/suppliers/SupplierList';
import SupplierForm from '../components/suppliers/SupplierForm';
import SupplierPayments from '../components/suppliers/SupplierPayments';
import { productService } from '../services/productService';
import { supplierService } from '../services/supplierService';

const MerchandiseManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    lowStockProducts: 0,
    reorderedProducts: 0,
    totalSuppliers: 0,
    pendingDeliveries: 0
  });

  useEffect(() => {
    loadDashboardStats();
    loadNotifications();
    
    // Set up periodic check for low stock notifications
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [lowStock, suppliers] = await Promise.all([
        productService.getLowStockProducts(),
        supplierService.getAllSuppliers()
      ]);

      setDashboardStats(prev => ({
        ...prev,
        lowStockProducts: lowStock.length,
        totalSuppliers: suppliers.length
      }));
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const lowStockProducts = await productService.getLowStockProducts();
      const notifications = lowStockProducts.map(product => ({
        id: product.id,
        type: 'low_stock',
        message: `${product.name} is running low on stock (${product.quantityInStock} remaining)`,
        product: product,
        timestamp: new Date()
      }));
      setNotifications(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleReorderProduct = async (productId) => {
    try {
      // Mark product as reordered (this would need a backend endpoint)
      // await productService.markAsReordered(productId);
      
      // For now, just remove from notifications
      setNotifications(prev => prev.filter(n => n.product.id !== productId));
      
      // Show success message
      alert('Product marked as reordered successfully!');
    } catch (error) {
      console.error('Error marking product as reordered:', error);
      alert('Failed to mark product as reordered');
    }
  };

  const handleUpdateInventory = async (productId, newQuantity) => {
    try {
      await productService.updateProductStock(productId, newQuantity);
      loadDashboardStats();
      loadNotifications();
      alert('Inventory updated successfully!');
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory');
    }
  };

  const handleCreateSupplier = () => {
    setModalType('supplier');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setModalType('supplier');
    setSelectedItem(supplier);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedItem(null);
    loadDashboardStats();
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'suppliers', label: 'Suppliers', icon: '🏭' },
    { id: 'supplier-payments', label: 'Supplier Payments', icon: '💳' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-content">
            <h2>Merchandise Manager Dashboard</h2>
            
            <div className="stats-grid">
              <div className="stat-card alert">
                <div className="stat-icon">⚠️</div>
                <div className="stat-info">
                  <h3>{dashboardStats.lowStockProducts}</h3>
                  <p>Low Stock Items</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🏭</div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalSuppliers}</h3>
                  <p>Total Suppliers</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🔔</div>
                <div className="stat-info">
                  <h3>{notifications.length}</h3>
                  <p>Active Notifications</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button onClick={() => setActiveTab('notifications')} className="btn btn-primary">
                  View Notifications
                </button>
                <button onClick={() => setActiveTab('inventory')} className="btn btn-outline">
                  Manage Inventory
                </button>
                <button onClick={handleCreateSupplier} className="btn btn-outline">
                  Add Supplier
                </button>
              </div>
            </div>

            {/* Recent Notifications */}
            {notifications.length > 0 && (
              <div className="recent-notifications">
                <h3>Recent Notifications</h3>
                <div className="notification-list">
                  {notifications.slice(0, 5).map(notification => (
                    <div key={notification.id} className="notification-item alert">
                      <div className="notification-content">
                        <p>{notification.message}</p>
                        <small>{notification.timestamp.toLocaleString()}</small>
                      </div>
                      <div className="notification-actions">
                        <button 
                          onClick={() => handleReorderProduct(notification.product.id)}
                          className="btn btn-sm btn-primary"
                        >
                          Mark as Reordered
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'notifications':
        return (
          <div className="notifications-content">
            <div className="content-header">
              <h2>Stock Notifications</h2>
            </div>
            
            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔔</div>
                <h3>No notifications</h3>
                <p>All products are well stocked!</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map(notification => (
                  <div key={notification.id} className="notification-card">
                    <div className="notification-header">
                      <h4>{notification.product.name}</h4>
                      <span className="notification-time">
                        {notification.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <div className="notification-body">
                      <p>{notification.message}</p>
                      <div className="product-details">
                        <span>Current Stock: {notification.product.quantityInStock}</span>
                        <span>Product Code: {notification.product.productNo}</span>
                      </div>
                    </div>
                    <div className="notification-actions">
                      <button 
                        onClick={() => handleReorderProduct(notification.product.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Mark as Reordered
                      </button>
                      <button 
                        onClick={() => {
                          const newQuantity = prompt('Enter new quantity:', notification.product.quantityInStock);
                          if (newQuantity && !isNaN(newQuantity)) {
                            handleUpdateInventory(notification.product.id, parseInt(newQuantity));
                          }
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        Update Stock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'inventory':
        return (
          <div className="inventory-content">
            <div className="content-header">
              <h2>Inventory Management</h2>
            </div>
            <ProductList 
              canManage={false}
              showInventoryActions={true}
              onUpdateStock={handleUpdateInventory}
              onReorder={handleReorderProduct}
            />
          </div>
        );

      case 'suppliers':
        return (
          <div className="suppliers-content">
            <div className="content-header">
              <h2>Supplier Management</h2>
              <button onClick={handleCreateSupplier} className="btn btn-primary">
                Add Supplier
              </button>
            </div>
            <SupplierList 
              onEdit={handleEditSupplier}
              canManage={true}
            />
          </div>
        );

      case 'supplier-payments':
        return (
          <div className="supplier-payments-content">
            <div className="content-header">
              <h2>Supplier Payment Management</h2>
            </div>
            <SupplierPayments canManage={true} />
          </div>
        );

      default:
        return (
          <div className="default-content">
            <h2>Welcome to Merchandise Manager Dashboard</h2>
            <p>Select an option from the sidebar to get started.</p>
          </div>
        );
    }
  };

  const renderModal = () => {
    switch (modalType) {
      case 'supplier':
        return (
          <SupplierForm
            supplier={selectedItem}
            onSave={closeModal}
            onCancel={closeModal}
          />
        );
      default:
        return null;
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
            {renderModal()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchandiseManagerDashboard;