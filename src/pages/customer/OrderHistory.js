import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { customerAPI } from '../../services/api';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortDir, setSortDir] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [sortBy, sortDir]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the customerAPI to get orders with parameters
      const params = {
        sortBy: sortBy,
        sortDir: sortDir,
        size: 50 // Get more orders to show history
      };
      
      const response = await customerAPI.getOrders(params);
      
      if (response.data) {
        setOrders(Array.isArray(response.data) ? response.data : []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again.');
      setOrders([]);
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
    const totalOrders = filteredOrders.length;
    const totalSpent = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    const statusCounts = filteredOrders.reduce((acc, order) => {
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
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your order history...</p>
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
          <div className="order-history">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Order History</h1>
              <div className="dashboard-actions">
                <Link to="/customer/dashboard" className="btn btn-secondary">
                  ← Back to Dashboard
                </Link>
                <div className="order-stats">
                  <span className="stat">Total Orders: {summary.totalOrders}</span>
                  <span className="stat">Total Spent: Rs.{summary.totalSpent.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Filter & Sort</h2>
              </div>
              <div className="card-body">
                <div className="controls">
                  <div className="filter-controls">
                    <label>Filter by Status:</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="form-control"
                      style={{ width: 'auto', display: 'inline-block', marginLeft: '0.5rem' }}
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
                    <label>Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="form-control"
                      style={{ width: 'auto', display: 'inline-block', margin: '0 0.5rem' }}
                    >
                      <option value="orderDate">Order Date</option>
                      <option value="totalPrice">Total Amount</option>
                      <option value="orderNo">Order Number</option>
                    </select>
                    
                    <select
                      value={sortDir}
                      onChange={(e) => setSortDir(e.target.value)}
                      className="form-control"
                      style={{ width: 'auto', display: 'inline-block' }}
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {filteredOrders.length > 0 ? (
              <div className="orders-content">
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Your Orders ({filteredOrders.length})</h2>
                  </div>
                  <div className="card-body">
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
                              <span className="value">Rs.{order.unitPrice?.toFixed(2)}</span>
                            </div>
                            
                            <div className="detail-row">
                              <span className="label">Total Amount:</span>
                              <span className="value total">Rs.{order.totalPrice?.toFixed(2)}</span>
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
                              className="btn btn-secondary btn-small"
                            >
                              View Details
                            </Link>
                            
                            <Link 
                              to={`/customer/order-status/${order.orderNo}`}
                              className="btn btn-primary btn-small"
                            >
                              Track Order
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="card" style={{ marginTop: '2rem' }}>
                  <div className="card-header">
                    <h2 className="card-title">Order Summary</h2>
                  </div>
                  <div className="card-body">
                    <div className="grid-3">
                      <div className="summary-card">
                        <h3>Order Statistics</h3>
                        <div className="stats-grid">
                          <div className="stat-item">
                            <span className="stat-label">Total Orders:</span>
                            <span className="stat-value">{summary.totalOrders}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Total Spent:</span>
                            <span className="stat-value">Rs.{summary.totalSpent.toFixed(2)}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Average Order:</span>
                            <span className="stat-value">Rs.{summary.averageOrder.toFixed(2)}</span>
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
                          {filteredOrders.slice(0, 3).map(order => (
                            <div key={order.id} className="recent-order-item">
                              <span className="recent-order-no">#{order.orderNo}</span>
                              <span className="recent-order-date">
                                {new Date(order.orderDate).toLocaleDateString()}
                              </span>
                              <span className="recent-order-amount">
                                Rs.{order.totalPrice?.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <div className="empty-orders" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="empty-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                    <h2>No orders found</h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>
                      {filterStatus ? 
                        `No orders found with status "${filterStatus}".` : 
                        "You haven't placed any orders yet."
                      }
                    </p>
                    <Link to="/products" className="btn btn-primary">
                      Start Shopping
                    </Link>
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

export default OrderHistory;