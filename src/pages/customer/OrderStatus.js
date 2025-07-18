import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './OrderStatus.css';

const OrderStatus = () => {
  const { orderNo } = useParams();
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderNo) {
      fetchOrderStatus();
    }
  }, [orderNo]);

  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`/api/customer/orders/status/${orderNo}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrderStatus(data.statusInfo);
        } else {
          setError(data.message || 'Order not found');
        }
      } else {
        setError('Order not found or access denied');
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
      setError('Failed to fetch order status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = (status) => {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status?.toLowerCase());
    return currentIndex >= 0 ? currentIndex + 1 : 0;
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading order status...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h2>Order Not Found</h2>
        <p>{error}</p>
        <a href="/customer/orders" className="back-btn">
          Back to Order History
        </a>
      </div>
    );
  }

  if (!orderStatus) {
    return (
      <div className="error-container">
        <div className="error-icon">📦</div>
        <h2>No Order Information</h2>
        <p>Unable to retrieve order status information.</p>
        <a href="/customer/orders" className="back-btn">
          Back to Order History
        </a>
      </div>
    );
  }

  const currentProgress = getStatusProgress(orderStatus.status);
  const statusColor = getStatusColor(orderStatus.status);

  return (
    <div className="order-status">
      <div className="header">
        <h1>Order Status</h1>
        <div className="order-info">
          <span className="order-number">Order #{orderStatus.orderNo}</span>
          <span className="order-date">
            Placed on {formatDate(orderStatus.orderDate)}
          </span>
        </div>
      </div>

      <div className="status-content">
        <div className="status-overview">
          <div className="current-status">
            <h2>Current Status</h2>
            <div className={`status-badge large ${statusColor}`}>
              {orderStatus.status}
            </div>
            <p className="status-description">
              {orderStatus.status === 'PENDING' && "Your order has been received and is being processed."}
              {orderStatus.status === 'PROCESSING' && "Your order is currently being prepared for shipment."}
              {orderStatus.status === 'SHIPPED' && "Your order has been shipped and is on its way to you."}
              {orderStatus.status === 'DELIVERED' && "Your order has been successfully delivered."}
              {orderStatus.status === 'CANCELLED' && "This order has been cancelled."}
            </p>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-details">
              <div className="detail-row">
                <span className="label">Order Number:</span>
                <span className="value">{orderStatus.orderNo}</span>
              </div>
              <div className="detail-row">
                <span className="label">Order Date:</span>
                <span className="value">{formatDate(orderStatus.orderDate)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Amount:</span>
                <span className="value total">${orderStatus.totalPrice?.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Shipping Address:</span>
                <span className="value">{orderStatus.shippingAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {orderStatus.status !== 'CANCELLED' && (
          <div className="progress-tracker">
            <h2>Order Progress</h2>
            <div className="progress-container">
              <div className="progress-steps">
                <div className={`step ${currentProgress >= 1 ? 'completed' : ''} ${currentProgress === 1 ? 'current' : ''}`}>
                  <div className="step-icon">📋</div>
                  <div className="step-info">
                    <h4>Order Placed</h4>
                    <p>Order received and confirmed</p>
                  </div>
                </div>

                <div className={`step ${currentProgress >= 2 ? 'completed' : ''} ${currentProgress === 2 ? 'current' : ''}`}>
                  <div className="step-icon">⚙️</div>
                  <div className="step-info">
                    <h4>Processing</h4>
                    <p>Preparing your order</p>
                  </div>
                </div>

                <div className={`step ${currentProgress >= 3 ? 'completed' : ''} ${currentProgress === 3 ? 'current' : ''}`}>
                  <div className="step-icon">🚚</div>
                  <div className="step-info">
                    <h4>Shipped</h4>
                    <p>Order is on its way</p>
                  </div>
                </div>

                <div className={`step ${currentProgress >= 4 ? 'completed' : ''} ${currentProgress === 4 ? 'current' : ''}`}>
                  <div className="step-icon">📦</div>
                  <div className="step-info">
                    <h4>Delivered</h4>
                    <p>Order successfully delivered</p>
                  </div>
                </div>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(currentProgress / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div className="estimated-delivery">
          <h2>Delivery Information</h2>
          <div className="delivery-info">
            {orderStatus.status === 'DELIVERED' ? (
              <div className="delivery-complete">
                <div className="delivery-icon">✅</div>
                <h3>Order Delivered!</h3>
                <p>Your order was successfully delivered.</p>
              </div>
            ) : orderStatus.status === 'CANCELLED' ? (
              <div className="delivery-cancelled">
                <div className="delivery-icon">❌</div>
                <h3>Order Cancelled</h3>
                <p>This order has been cancelled. If you have any questions, please contact customer support.</p>
              </div>
            ) : (
              <div className="delivery-pending">
                <div className="delivery-icon">🚛</div>
                <h3>Estimated Delivery</h3>
                <p>We'll provide tracking information once your order ships.</p>
                <p className="delivery-note">
                  You'll receive email updates about your order status.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="payment-info">
          <h2>Payment Information</h2>
          <div className="payment-details">
            <div className="payment-summary">
              <h4>Payment Summary</h4>
              <p>Please use the following bank details for payment:</p>
            </div>
            
            <div className="bank-details">
              <div className="bank-info">
                <h4>Bank Details</h4>
                <div className="bank-detail-row">
                  <span className="bank-label">Bank Name:</span>
                  <span className="bank-value">Caliber Bank</span>
                </div>
                <div className="bank-detail-row">
                  <span className="bank-label">Account Number:</span>
                  <span className="bank-value">1234567890</span>
                </div>
                <div className="bank-detail-row">
                  <span className="bank-label">Account Name:</span>
                  <span className="bank-value">Caliber Clothing Ltd</span>
                </div>
                <div className="bank-detail-row">
                  <span className="bank-label">Branch Code:</span>
                  <span className="bank-value">001</span>
                </div>
                <div className="bank-detail-row">
                  <span className="bank-label">Swift Code:</span>
                  <span className="bank-value">CALILKLX</span>
                </div>
              </div>
              
              <div className="payment-instructions">
                <h4>Payment Instructions</h4>
                <ul>
                  <li>Please include your order number ({orderStatus.orderNo}) in the payment reference</li>
                  <li>Upload payment receipt after making the payment</li>
                  <li>Orders will be processed after payment verification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <a href="/customer/orders" className="back-to-orders-btn">
            Back to Orders
          </a>
          <a href={`/customer/orders/${orderStatus.orderNo.replace('#', '')}/receipt`} className="view-receipt-btn">
            View Receipt
          </a>
          <a href="/contact" className="contact-support-btn">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;