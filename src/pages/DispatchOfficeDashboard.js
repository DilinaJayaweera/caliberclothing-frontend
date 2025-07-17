import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import OrderList from '../components/orders/OrderList';
import CustomerList from '../components/customers/CustomerList';
import DeliveryProviderList from '../components/delivery/DeliveryProviderList';
import { orderService } from '../services/orderService';
import { customerService } from '../services/customerService';
import { deliveryService } from '../services/deliveryService';

const DispatchOfficerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    loadDashboardStats();
    loadRecentOrders();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [orders, customers] = await Promise.all([
        orderService.getAllOrders(),
        customerService.getAllCustomers()
      ]);

      const orderCounts = orders.reduce((acc, order) => {
        const status = order.orderStatus?.value?.toUpperCase();
        switch (status) {
          case 'PENDING':
          case 'CONFIRMED':
          case 'PROCESSING':
            acc.pending++;
            break;
          case 'SHIPPED':
            acc.shipped++;
            break;
          case 'DELIVERED':
            acc.delivered++;
            break;
        }
        return acc;
      }, { pending: 0, shipped: 0, delivered: 0 });

      setDashboardStats({
        totalOrders: orders.length,
        pendingOrders: orderCounts.pending,
        shippedOrders: orderCounts.shipped,
        deliveredOrders: orderCounts.delivered,
        totalCustomers: customers.length
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const orders = await orderService.getAllOrders();
      // Sort by order date and take the most recent 5
      const recent = orders
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice(0, 5);
      setRecentOrders(recent);
    } catch (error) {
      console.error('Error loading recent orders:', error);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatusId) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatusId);
      loadDashboardStats();
      loadRecentOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'customers', label: 'Customer Details', icon: '👤' },
    { id: 'delivery-providers', label: 'Delivery Providers', icon: '🚚' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-content">
            <h2>Dispatch Officer Dashboard</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              
              <div className="stat-card alert">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{dashboardStats.pendingOrders}</h3>
                  <p>Pending Orders</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🚚</div>
                <div className="stat-info">
                  <h3>{dashboardStats.shippedOrders}</h3>
                  <p>Shipped Orders</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{dashboardStats.deliveredOrders}</h3>
                  <p>Delivered Orders</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">👤</div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalCustomers}</h3>
                  <p>Total Customers</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button onClick={() => setActiveTab('orders')} className="btn btn-primary">
                  Manage Orders
                </button>
                <button onClick={() => setActiveTab('customers')} className="btn btn-outline">
                  View Customers
                </button>
                <button onClick={() => setActiveTab('delivery-providers')} className="btn btn-outline">
                  Delivery Providers
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            {recentOrders.length > 0 && (
              <div className="recent-orders">
                <h3>Recent Orders</h3>
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order No</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order.id}>
                          <td><strong>{order.orderNo}</strong></td>
                          <td>{order.customer?.fullName || 'N/A'}</td>
                          <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                          <td>${order.totalPrice?.toFixed(2)}</td>
                          <td>
                            <span className={`status-badge status-${order.orderStatus?.value?.toLowerCase()}`}>
                              {order.orderStatus?.value}
                            </span>
                          </td>
                          <td>
                            <OrderStatusUpdateButton 
                              order={order}
                              onStatusUpdate={handleOrderStatusUpdate}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 'orders':
        return (
          <div className="orders-content">
            <div className="content-header">
              <h2>Order Management</h2>
            </div>
            <OrderList 
              canEdit={true}
              showAllDetails={true}
              onStatusUpdate={handleOrderStatusUpdate}
              role="DISPATCH_OFFICER"
            />
          </div>
        );

      case 'customers':
        return (
          <div className="customers-content">
            <div className="content-header">
              <h2>Customer Details</h2>
            </div>
            <CustomerList 
              showCredentials={false}
              readOnly={true}
            />
          </div>
        );

      case 'delivery-providers':
        return (
          <div className="delivery-providers-content">
            <div className="content-header">
              <h2>Delivery Service Providers</h2>
            </div>
            <DeliveryProviderList 
              canManage={false}
              readOnly={true}
            />
          </div>
        );

      default:
        return (
          <div className="default-content">
            <h2>Welcome to Dispatch Officer Dashboard</h2>
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
    </div>
  );
};

// Component for updating order status
const OrderStatusUpdateButton = ({ order, onStatusUpdate }) => {
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [orderStatuses, setOrderStatuses] = useState([]);

  useEffect(() => {
    loadOrderStatuses();
  }, []);

  const loadOrderStatuses = async () => {
    try {
      const statuses = await orderService.getAllOrderStatuses();
      setOrderStatuses(statuses);
    } catch (error) {
      console.error('Error loading order statuses:', error);
    }
  };

  const handleStatusUpdate = async (statusId) => {
    await onStatusUpdate(order.id, statusId);
    setShowStatusOptions(false);
  };

  if (!showStatusOptions) {
    return (
      <button 
        onClick={() => setShowStatusOptions(true)}
        className="btn btn-outline btn-sm"
      >
        Update Status
      </button>
    );
  }

  return (
    <div className="status-update-dropdown">
      <select 
        onChange={(e) => handleStatusUpdate(parseInt(e.target.value))}
        defaultValue=""
        className="form-input"
        style={{ minWidth: '120px', fontSize: '0.8rem' }}
      >
        <option value="">Select Status</option>
        {orderStatuses.map(status => (
          <option key={status.id} value={status.id}>
            {status.value}
          </option>
        ))}
      </select>
      <button 
        onClick={() => setShowStatusOptions(false)}
        className="btn btn-sm btn-outline"
      >
        Cancel
      </button>
    </div>
  );
};

export default DispatchOfficerDashboard;