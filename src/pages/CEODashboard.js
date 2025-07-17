import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import EmployeeList from '../components/employees/EmployeeList';
import EmployeeForm from '../components/employees/EmployeeForm';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import CustomerList from '../components/customers/CustomerList';
import OrderList from '../components/orders/OrderList';
import DeliveryProviderList from '../components/delivery/DeliveryProviderList';
import DeliveryProviderForm from '../components/delivery/DeliveryProviderForm';
import SupplierList from '../components/suppliers/SupplierList';
import SupplierForm from '../components/suppliers/SupplierForm';
import SupplierPayments from '../components/suppliers/SupplierPayments';
import ReportGenerator from '../components/reports/ReportGenerator';
import { employeeService } from '../services/employeeService';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';
import { orderService } from '../services/orderService';

const CEODashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStockProducts: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [employees, products, customers, orders, lowStock] = await Promise.all([
        employeeService.getAllEmployees(),
        productService.getAllProducts(),
        customerService.getAllCustomers(),
        orderService.getAllOrders(),
        productService.getLowStockProducts()
      ]);

      setDashboardStats({
        totalEmployees: employees.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
        totalOrders: orders.length,
        lowStockProducts: lowStock.length
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleCreateEmployee = () => {
    setModalType('employee');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setModalType('employee');
    setSelectedItem(employee);
    setShowModal(true);
  };

  const handleCreateProduct = () => {
    setModalType('product');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setModalType('product');
    setSelectedItem(product);
    setShowModal(true);
  };

  const handleCreateDeliveryProvider = () => {
    setModalType('deliveryProvider');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEditDeliveryProvider = (provider) => {
    setModalType('deliveryProvider');
    setSelectedItem(provider);
    setShowModal(true);
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
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'employees', label: 'Employees', icon: '👥' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'customers', label: 'Customers', icon: '👤' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'delivery', label: 'Delivery Providers', icon: '🚚' },
    { id: 'suppliers', label: 'Suppliers', icon: '🏭' },
    { id: 'supplier-payments', label: 'Supplier Payments', icon: '💳' },
    { id: 'reports', label: 'Reports', icon: '📈' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-content">
            <h2>CEO Dashboard Overview</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalEmployees}</h3>
                  <p>Total Employees</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalProducts}</h3>
                  <p>Total Products</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">👤</div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalCustomers}</h3>
                  <p>Total Customers</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              
              <div className="stat-card alert">
                <div className="stat-icon">⚠️</div>
                <div className="stat-info">
                  <h3>{dashboardStats.lowStockProducts}</h3>
                  <p>Low Stock Products</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button onClick={handleCreateEmployee} className="btn btn-primary">
                  Add Employee
                </button>
                <button onClick={handleCreateProduct} className="btn btn-primary">
                  Add Product
                </button>
                <button onClick={handleCreateSupplier} className="btn btn-primary">
                  Add Supplier
                </button>
                <button onClick={handleCreateDeliveryProvider} className="btn btn-primary">
                  Add Delivery Provider
                </button>
              </div>
            </div>
          </div>
        );

      case 'employees':
        return (
          <div className="employees-content">
            <div className="content-header">
              <h2>Employee Management</h2>
              <button onClick={handleCreateEmployee} className="btn btn-primary">
                Add Employee
              </button>
            </div>
            <EmployeeList 
              onEdit={handleEditEmployee}
              canManage={true}
            />
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

      case 'customers':
        return (
          <div className="customers-content">
            <div className="content-header">
              <h2>Customer Management</h2>
            </div>
            <CustomerList showCredentials={false} />
          </div>
        );

      case 'orders':
        return (
          <div className="orders-content">
            <div className="content-header">
              <h2>Order Management</h2>
            </div>
            <OrderList 
              canEdit={false}
              showAllDetails={true}
            />
          </div>
        );

      case 'delivery':
        return (
          <div className="delivery-content">
            <div className="content-header">
              <h2>Delivery Provider Management</h2>
              <button onClick={handleCreateDeliveryProvider} className="btn btn-primary">
                Add Delivery Provider
              </button>
            </div>
            <DeliveryProviderList 
              onEdit={handleEditDeliveryProvider}
              canManage={true}
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

      case 'reports':
        return (
          <div className="reports-content">
            <div className="content-header">
              <h2>Reports & Analytics</h2>
            </div>
            <ReportGenerator />
          </div>
        );

      default:
        return (
          <div className="default-content">
            <h2>Welcome to CEO Dashboard</h2>
            <p>Select an option from the sidebar to get started.</p>
          </div>
        );
    }
  };

  const renderModal = () => {
    switch (modalType) {
      case 'employee':
        return (
          <EmployeeForm
            employee={selectedItem}
            onSave={() => {
              closeModal();
              loadDashboardStats();
            }}
            onCancel={closeModal}
          />
        );

      case 'product':
        return (
          <ProductForm
            product={selectedItem}
            onSave={() => {
              closeModal();
              loadDashboardStats();
            }}
            onCancel={closeModal}
          />
        );

      case 'deliveryProvider':
        return (
          <DeliveryProviderForm
            provider={selectedItem}
            onSave={() => {
              closeModal();
            }}
            onCancel={closeModal}
          />
        );

      case 'supplier':
        return (
          <SupplierForm
            supplier={selectedItem}
            onSave={() => {
              closeModal();
            }}
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

export default CEODashboard;