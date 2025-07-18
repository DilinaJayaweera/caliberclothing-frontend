import React, { useState, useEffect } from 'react';
import { dispatchOfficerAPI } from '../../services/api';

const OrderViewing = () => {
  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatusId, setNewStatusId] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchOrderStatuses();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await dispatchOfficerAPI.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStatuses = async () => {
    try {
      const response = await dispatchOfficerAPI.getOrderStatuses();
      setOrderStatuses(response.data);
    } catch (error) {
      console.error('Error fetching order statuses:', error);
    }
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatusId) return;

    try {
      await dispatchOfficerAPI.updateOrderStatus(selectedOrder.id, parseInt(newStatusId));
      fetchOrders();
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatusId('');
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const filterOrdersByDate = async () => {
    if (!dateFilter.startDate || !dateFilter.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    try {
      const startDate = `${dateFilter.startDate}T00:00:00`;
      const endDate = `${dateFilter.endDate}T23:59:59`;
      const response = await dispatchOfficerAPI.getOrdersByDateRange(startDate, endDate);
      setOrders(response.data);
    } catch (error) {
      console.error('Error filtering orders by date:', error);
    }
  };

  const filterOrdersByStatus = async (statusId) => {
    if (!statusId) {
      fetchOrders();
      return;
    }

    try {
      const response = await dispatchOfficerAPI.getOrdersByStatus(statusId);
      setOrders(response.data);
    } catch (error) {
      console.error('Error filtering orders by status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setNewStatusId(order.orderStatus?.id?.toString() || '');
    setShowStatusModal(true);
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

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="order-viewing">
      <div className="header">
        <h1>Order Management</h1>
        <div className="header-stats">
          <span className="stat">Total Orders: {orders.length}</span>
        </div>
      </div>

      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by order number, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              filterOrdersByStatus(e.target.value);
            }}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            {orderStatuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.value}
              </option>
            ))}
          </select>
        </div>

        <div className="date-filter">
          <input
            type="date"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
            className="date-input"
          />
          <span>to</span>
          <input
            type="date"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
            className="date-input"
          />
          <button className="filter-btn" onClick={filterOrdersByDate}>
            Filter
          </button>
          <button 
            className="clear-btn" 
            onClick={() => {
              setDateFilter({startDate: '', endDate: ''});
              setStatusFilter('');
              fetchOrders();
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="orders-table">
        <div className="table-header">
          <div className="header-cell">Order No</div>
          <div className="header-cell">Customer</div>
          <div className="header-cell">Date</div>
          <div className="header-cell">Amount</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>

        <div className="table-body">
          {filteredOrders.map(order => (
            <div key={order.id} className="table-row">
              <div className="cell order-cell">
                <span className="order-no">#{order.orderNo}</span>
              </div>

              <div className="cell customer-cell">
                <div className="customer-info">
                  <span className="customer-name">{order.customer?.fullName || 'N/A'}</span>
                  <span className="customer-email">{order.customer?.email || 'N/A'}</span>
                </div>
              </div>

              <div className="cell date-cell">
                <span className="order-date">
                  {new Date(order.orderDate).toLocaleDateString()}
                </span>
                <span className="order-time">
                  {new Date(order.orderDate).toLocaleTimeString()}
                </span>
              </div>

              <div className="cell amount-cell">
                <span className="amount">Rs.{order.totalPrice?.toFixed(2) || '0.00'}</span>
                <span className="quantity">Qty: {order.quantity || 0}</span>
              </div>

              <div className="cell status-cell">
                <span className={`status-badge ${getStatusColor(order.orderStatus?.value)}`}>
                  {order.orderStatus?.value || 'Unknown'}
                </span>
              </div>

              <div className="cell actions-cell">
                <button 
                  className="status-btn"
                  onClick={() => handleStatusChange(order)}
                >
                  Update Status
                </button>
                <button className="view-btn">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="no-orders">
          No orders found matching your criteria.
        </div>
      )}

      <div className="order-summary">
        <h2>Order Summary</h2>
        <div className="summary-grid">
          {orderStatuses.map(status => {
            const count = orders.filter(order => order.orderStatus?.id === status.id).length;
            return (
              <div key={status.id} className={`summary-item ${getStatusColor(status.value)}`}>
                <h4>{status.value}</h4>
                <span className="count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {showStatusModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Update Order Status</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                  setNewStatusId('');
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="order-info">
                <h3>Order #{selectedOrder.orderNo}</h3>
                <p>Customer: {selectedOrder.customer?.fullName}</p>
                <p>Current Status: {selectedOrder.orderStatus?.value}</p>
              </div>
              
              <div className="status-select">
                <label>New Status:</label>
                <select
                  value={newStatusId}
                  onChange={(e) => setNewStatusId(e.target.value)}
                  className="status-dropdown"
                >
                  {orderStatuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  className="update-btn"
                  onClick={updateOrderStatus}
                  disabled={!newStatusId}
                >
                  Update Status
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                    setNewStatusId('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderViewing;