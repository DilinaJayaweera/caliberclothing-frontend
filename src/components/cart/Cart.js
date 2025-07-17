import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import CartItem from './CartItem';
import { orderService } from '../../services/orderService';

const Cart = ({ isOpen, onClose }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderData, setOrderData] = useState({
    shippingAddress: '',
    paymentMethod: '',
    notes: ''
  });

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    setShowCheckout(true);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order for each cart item (simplified - in real app might batch)
      for (const item of cartItems) {
        const orderPayload = {
          orderNo: generateOrderNo(),
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          totalPrice: item.sellingPrice * item.quantity,
          shippingAddress: orderData.shippingAddress,
          orderDate: new Date().toISOString(),
          customer: { id: user.customerId }, // Assuming user has customerId
          employee: { employeeNo: 'EMP001' }, // Default employee
          orderStatus: { id: 1 }, // Pending status
          payment: { id: 1 }, // Default payment
          notes: orderData.notes
        };

        await orderService.createOrder(orderPayload);
      }

      alert('Order placed successfully!');
      clearCart();
      setShowCheckout(false);
      onClose();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateOrderNo = () => {
    return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay">
      <div className="cart-sidebar">
        <div className="cart-header">
          <h3>Shopping Cart</h3>
          <button onClick={onClose} className="cart-close">×</button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h4>Your cart is empty</h4>
              <p>Add some products to get started!</p>
            </div>
          ) : (
            <>
              {!showCheckout ? (
                <>
                  <div className="cart-items">
                    {cartItems.map(item => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>

                  <div className="cart-summary">
                    <div className="cart-total">
                      <h4>Total: ${getCartTotal().toFixed(2)}</h4>
                    </div>
                    <div className="cart-actions">
                      <button 
                        onClick={clearCart}
                        className="btn btn-outline btn-full"
                      >
                        Clear Cart
                      </button>
                      <button 
                        onClick={handleCheckout}
                        className="btn btn-primary btn-full"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="checkout-form">
                  <div className="checkout-header">
                    <button 
                      onClick={() => setShowCheckout(false)}
                      className="back-button"
                    >
                      ← Back to Cart
                    </button>
                    <h4>Checkout</h4>
                  </div>

                  <form onSubmit={handleOrderSubmit}>
                    <div className="form-group">
                      <label htmlFor="shippingAddress">Shipping Address *</label>
                      <textarea
                        id="shippingAddress"
                        value={orderData.shippingAddress}
                        onChange={(e) => setOrderData(prev => ({
                          ...prev,
                          shippingAddress: e.target.value
                        }))}
                        required
                        rows="3"
                        className="form-input"
                        placeholder="Enter your complete shipping address"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="paymentMethod">Payment Method *</label>
                      <select
                        id="paymentMethod"
                        value={orderData.paymentMethod}
                        onChange={(e) => setOrderData(prev => ({
                          ...prev,
                          paymentMethod: e.target.value
                        }))}
                        required
                        className="form-input"
                      >
                        <option value="">Select Payment Method</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash_on_delivery">Cash on Delivery</option>
                        <option value="credit_card">Credit Card</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="notes">Order Notes</label>
                      <textarea
                        id="notes"
                        value={orderData.notes}
                        onChange={(e) => setOrderData(prev => ({
                          ...prev,
                          notes: e.target.value
                        }))}
                        rows="2"
                        className="form-input"
                        placeholder="Any special instructions for your order"
                      />
                    </div>

                    <div className="order-summary">
                      <h4>Order Summary</h4>
                      <div className="summary-items">
                        {cartItems.map(item => (
                          <div key={item.id} className="summary-item">
                            <span>{item.name} × {item.quantity}</span>
                            <span>${(item.sellingPrice * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="summary-total">
                        <strong>Total: ${getCartTotal().toFixed(2)}</strong>
                      </div>
                    </div>

                    {orderData.paymentMethod === 'bank_transfer' && (
                      <div className="payment-details">
                        <h5>Bank Transfer Details</h5>
                        <div className="bank-info">
                          <p><strong>Bank:</strong> Caliber Bank</p>
                          <p><strong>Account Name:</strong> Caliber Clothing Ltd</p>
                          <p><strong>Account Number:</strong> 1234567890</p>
                          <p><strong>Branch:</strong> Main Branch</p>
                          <p><strong>Reference:</strong> Your Order Number</p>
                        </div>
                      </div>
                    )}

                    <div className="checkout-actions">
                      <button 
                        type="button"
                        onClick={() => setShowCheckout(false)}
                        className="btn btn-outline"
                      >
                        Back to Cart
                      </button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                      >
                        {loading ? 'Placing Order...' : 'Place Order'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;