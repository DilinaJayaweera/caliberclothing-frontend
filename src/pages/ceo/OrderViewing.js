import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { ceoAPI } from '../../services/api';

const OrderViewing = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ceoAPI.getOrders();
      setOrders(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await ceoAPI.getOrder(orderId);
      setSelectedOrder(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to fetch order details');
    }
  };

  // Filter orders based on search criteria
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      order.orderStatus?.value === statusFilter;
    
    const matchesDate = !dateFilter || 
      new Date(order.orderDate).toDateString() === new Date(dateFilter).toDateString();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { bg: '#fff3cd', color: '#856404' };
      case 'processing': return { bg: '#d1ecf1', color: '#0c5460' };
      case 'shipped': return { bg: '#d4edda', color: '#155724' };
      case 'delivered': return { bg: '#d4edda', color: '#155724' };
      case 'cancelled': return { bg: '#f8d7da', color: '#721c24' };
      default: return { bg: '#e9ecef', color: '#495057' };
    }
  };

  const calculateOrderSummary = () => {
    const summary = {
      total: filteredOrders.length,
      totalValue: filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
      statusCounts: {}
    };

    filteredOrders.forEach(order => {
      const status = order.orderStatus?.value || 'Unknown';
      summary.statusCounts[status] = (summary.statusCounts[status] || 0) + 1;
    });

    return summary;
  };

  const orderSummary = calculateOrderSummary();

  return (
    <div>
      <Header />
      
      <main className="content-container">
        <div className="container">
          <div className="dashboard">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Order Management</h1>
              <div className="dashboard-actions">
                <Link to="/ceo/dashboard" className="btn btn-secondary">
                  ← Back to Dashboard
                </Link>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Order Summary Stats */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-number">{orderSummary.total}</div>
                <div className="stat-label">Total Orders</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">${orderSummary.totalValue.toFixed(2)}</div>
                <div className="stat-label">Total Value</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{orderSummary.statusCounts['Pending'] || 0}</div>
                <div className="stat-label">Pending Orders</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{orderSummary.statusCounts['Delivered'] || 0}</div>
                <div className="stat-label">Delivered Orders</div>
              </div>
            </div>

            {/* Filters */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Filter Orders</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <input
                      type="text"
                      placeholder="Search by order number, customer name, or email..."
                      className="form-control"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div style={{ minWidth: '150px' }}>
                    <select
                      className="form-control"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div style={{ minWidth: '150px' }}>
                    <input
                      type="date"
                      className="form-control"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                  {(searchQuery || statusFilter || dateFilter) && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('');
                        setDateFilter('');
                      }}
                      className="btn btn-secondary"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Status Summary */}
            {Object.keys(orderSummary.statusCounts).length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Order Status Distribution</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {Object.entries(orderSummary.statusCounts).map(([status, count]) => {
                      const colors = getStatusColor(status);
                      return (
                        <div 
                          key={status}
                          style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            backgroundColor: colors.bg,
                            color: colors.color,
                            textAlign: 'center',
                            minWidth: '120px'
                          }}
                        >
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{count}</div>
                          <div style={{ fontSize: '0.9rem' }}>{status}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading orders...</p>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Orders ({filteredOrders.length})</h2>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                    View-only access to order information
                  </p>
                </div>
                <div className="card-body">
                  {filteredOrders.length === 0 ? (
                    <p>No orders found matching your criteria.</p>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Order No</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map(order => {
                            const statusColors = getStatusColor(order.orderStatus?.value);
                            return (
                              <tr key={order.id}>
                                <td>
                                  <strong>{order.orderNo}</strong>
                                </td>
                                <td>
                                  <div>
                                    <div style={{ fontWeight: 'bold' }}>
                                      {order.customer?.fullName}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                      {order.customer?.email}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div>{new Date(order.orderDate).toLocaleDateString()}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {new Date(order.orderDate).toLocaleTimeString()}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: 'bold' }}>
                                    ${order.totalPrice?.toFixed(2)}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    Qty: {order.quantity}
                                  </div>
                                </td>
                                <td>
                                  <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    backgroundColor: statusColors.bg,
                                    color: statusColors.color
                                  }}>
                                    {order.orderStatus?.value || 'Unknown'}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ fontSize: '0.8rem' }}>
                                    <div>{order.payment?.paymentMethod?.value || 'N/A'}</div>
                                    <div style={{ color: '#666' }}>
                                      {order.payment?.paymentStatus?.value || 'Pending'}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <button
                                    onClick={() => viewOrderDetails(order.id)}
                                    className="btn btn-secondary btn-small"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h2 className="modal-title">Order Details - {selectedOrder.orderNo}</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Order Summary */}
              <div className="card" style={{ margin: '0 0 1rem 0' }}>
                <div className="card-header">
                  <h3 className="card-title">Order Summary</h3>
                </div>
                <div className="card-body">
                  <div className="grid-2">
                    <div>
                      <p><strong>Order Number:</strong> {selectedOrder.orderNo}</p>
                      <p><strong>Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                      <p><strong>Total Amount:</strong> ${selectedOrder.totalPrice?.toFixed(2)}</p>
                      <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                    </div>
                    <div>
                      <p>
                        <strong>Status:</strong> 
                        <span style={{
                          marginLeft: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          ...getStatusColor(selectedOrder.orderStatus?.value)
                        }}>
                          {selectedOrder.orderStatus?.value || 'Unknown'}
                        </span>
                      </p>
                      <p><strong>Unit Price:</strong> ${selectedOrder.unitPrice?.toFixed(2)}</p>
                      <p><strong>Shipping Address:</strong></p>
                      <div style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}>
                        {selectedOrder.shippingAddress}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="card" style={{ margin: '0 0 1rem 0' }}>
                <div className="card-header">
                  <h3 className="card-title">Customer Information</h3>
                </div>
                <div className="card-body">
                  <div className="grid-2">
                    <div>
                      <p><strong>Name:</strong> {selectedOrder.customer?.fullName}</p>
                      <p><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                      <p><strong>Mobile:</strong> {selectedOrder.customer?.mobileNumber}</p>
                    </div>
                    <div>
                      <p><strong>Address:</strong> {selectedOrder.customer?.address}</p>
                      <p><strong>Country:</strong> {selectedOrder.customer?.country}</p>
                      <p><strong>Province:</strong> {selectedOrder.customer?.province?.value}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {selectedOrder.payment && (
                <div className="card" style={{ margin: '0 0 1rem 0' }}>
                  <div className="card-header">
                    <h3 className="card-title">Payment Information</h3>
                  </div>
                  <div className="card-body">
                    <div className="grid-2">
                      <div>
                        <p><strong>Payment No:</strong> {selectedOrder.payment.paymentNo}</p>
                        <p><strong>Payment Method:</strong> {selectedOrder.payment.paymentMethod?.value}</p>
                        <p><strong>Amount Paid:</strong> ${selectedOrder.payment.amountPaid}</p>
                      </div>
                      <div>
                        <p><strong>Payment Date:</strong> {selectedOrder.payment.paymentDate ? new Date(selectedOrder.payment.paymentDate).toLocaleString() : 'N/A'}</p>
                        <p><strong>Status:</strong> {selectedOrder.payment.paymentStatus?.value}</p>
                        <p><strong>Reference:</strong> {selectedOrder.payment.paymentReference}</p>
                      </div>
                    </div>
                    {selectedOrder.payment.remarks && (
                      <div style={{ marginTop: '1rem' }}>
                        <p><strong>Remarks:</strong></p>
                        <div style={{ 
                          backgroundColor: '#f8f9fa', 
                          padding: '0.5rem', 
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}>
                          {selectedOrder.payment.remarks}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Employee Information */}
              {selectedOrder.employee && (
                <div className="card" style={{ margin: '0 0 1rem 0' }}>
                  <div className="card-header">
                    <h3 className="card-title">Processed By</h3>
                  </div>
                  <div className="card-body">
                    <p><strong>Employee:</strong> {selectedOrder.employee.fullName}</p>
                    <p><strong>Employee No:</strong> {selectedOrder.employee.employeeNo}</p>
                    <p><strong>Role:</strong> {selectedOrder.employee.user?.role}</p>
                  </div>
                </div>
              )}

              {/* Discount Information */}
              {selectedOrder.discount && (
                <div className="card" style={{ margin: '0 0 1rem 0' }}>
                  <div className="card-header">
                    <h3 className="card-title">Discount Applied</h3>
                  </div>
                  <div className="card-body">
                    <p><strong>Discount Code:</strong> {selectedOrder.discount.discountCode}</p>
                    <p><strong>Description:</strong> {selectedOrder.discount.description}</p>
                    <p><strong>Discount Value:</strong> ${selectedOrder.discount.discountValue?.toFixed(2)}</p>
                    <p><strong>Type:</strong> {selectedOrder.discount.discountType?.value}</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button 
                onClick={() => setShowModal(false)} 
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default OrderViewing;