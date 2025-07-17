import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortDir, setSortDir] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, sortBy, sortDir]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/customer/orders?page=${currentPage}&size=10&sortBy=${sortBy}&sortDir=${sortDir}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'shipped':
        return 'shipped';
      case 'delivered':
        return 'delivered';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'unknown';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!filterStatus) return true;
    return order.orderStatus?.value?.toLowerCase() === filterStatus.toLowerCase();
  });

  const getOrdersSummary = () => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    const statusCounts = orders.reduce((acc, order) => {
      const status = order.orderStatus?.value || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalOrders,
      totalSpent,
      averageOrder,
      statusCounts
    };
  };

  const summary = getOrdersSummary();

  if (loading) {
    return <div className="loading">Loading your order history...</div>;
  }

  return (
    <div className="order-history">
      <div className="header">
        <h1>Order History</h1>
        <div className="order-stats">
          <span className="stat">Total Orders: {summary.totalOrders}</span>
          <span className="stat">Total Spent: ${summary.totalSpent.toFixed(2)}</span>
        </div>
      </div>

      <div className="controls">
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="sort-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="orderDate">Order Date</option>
            <option value="totalPrice">Total Amount</option>
            <option value="orderNo">Order Number</option>
          </select>
          
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value)}
            className="sort-select"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="orders-content">
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.orderNo}</h3>
                    <span className="order-date">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${getStatusColor(order.orderStatus?.value)}`}>
                      {order.orderStatus?.value || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="label">Order Date:</span>
                    <span className="value">
                      {new Date(order.orderDate).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Quantity:</span>
                    <span className="value">{order.quantity} items</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Unit Price:</span>
                    <span className="value">${order.unitPrice?.toFixed(2)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Total Amount:</span>
                    <span className="value total">${order.totalPrice?.toFixed(2)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Shipping Address:</span>
                    <span className="value">{order.shippingAddress}</span>
                  </div>

                  {order.payment && (
                    <div className="detail-row">
                      <span className="label">Payment:</span>
                      <span className="value">
                        {order.payment.paymentMethod?.value || 'N/A'} - 
                        {order.payment.paymentStatus?.value || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  <Link 
                    to={`/customer/orders/${order.id}`}
                    className="view-details-btn"
                  >
                    View Details
                  </Link>
                  
                  <Link 
                    to={`/customer/orders/${order.id}/receipt`}
                    className="view-receipt-btn"
                  >
                    View Receipt
                  </Link>
                  
                  <Link 
                    to={`/customer/order-status/${order.orderNo}`}
                    className="track-order-btn"
                  >
                    Track Order
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-section">
            <h2>Order Summary</h2>
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Order Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Orders:</span>
                    <span className="stat-value">{summary.totalOrders}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Spent:</span>
                    <span className="stat-value">${summary.totalSpent.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Average Order:</span>
                    <span className="stat-value">${summary.averageOrder.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <h3>Order Status Breakdown</h3>
                <div className="status-breakdown">
                  {Object.entries(summary.statusCounts).map(([status, count]) => (
                    <div key={status} className={`status-item ${getStatusColor(status)}`}>
                      <span className="status-name">{status}</span>
                      <span className="status-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="summary-card">
                <h3>Recent Activity</h3>
                <div className="recent-orders">
                  {orders.slice(0, 3).map(order => (
                    <div key={order.id} className="recent-order-item">
                      <span className="recent-order-no">#{order.orderNo}</span>
                      <span className="recent-order-date">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                      <span className="recent-order-amount">
                        ${order.totalPrice?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-orders">
          <div className="empty-icon">📦</div>
          <h2>No orders found</h2>
          <p>
            {filterStatus ? 
              `No orders found with status "${filterStatus}".` : 
              "You haven't placed any orders yet."
            }
          </p>
          <Link to="/products" className="shop-now-btn">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;