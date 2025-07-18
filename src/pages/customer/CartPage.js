import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { customerAPI } from '../../services/api';
import './CustomerManagement.css';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    totalItems: 0,
    itemCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getCart();
      if (response.data.success) {
        setCartItems(response.data.items || []);
        setCartSummary(response.data.summary || {
          subtotal: 0,
          totalItems: 0,
          itemCount: 0
        });
      }
      setError('');
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await customerAPI.updateCartItem(productId, newQuantity);
      if (response.data.success) {
        setMessage('Cart updated successfully');
        setTimeout(() => setMessage(''), 2000);
        fetchCartItems(); // Refresh cart
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      setError(error.response?.data?.message || 'Failed to update cart item');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeItem = async (productId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      try {
        const response = await customerAPI.removeFromCart(productId);
        if (response.data.success) {
          setMessage('Item removed from cart');
          setTimeout(() => setMessage(''), 2000);
          fetchCartItems(); // Refresh cart
        }
      } catch (error) {
        console.error('Error removing cart item:', error);
        setError('Failed to remove item from cart');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const clearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        const response = await customerAPI.clearCart();
        if (response.data.success) {
          setMessage('Cart cleared successfully');
          setTimeout(() => setMessage(''), 2000);
          fetchCartItems(); // Refresh cart
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
        setError('Failed to clear cart');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const proceedToCheckout = () => {
    // For now, redirect to place order - in a real app you'd have a checkout process
    navigate('/customer/checkout');
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your cart...</p>
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
          <div className="dashboard">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Shopping Cart</h1>
              <div className="dashboard-actions">
                <Link to="/products" className="btn btn-secondary">
                  Continue Shopping
                </Link>
                {cartItems.length > 0 && (
                  <button onClick={clearCart} className="btn btn-danger">
                    Clear Cart
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            {cartItems.length === 0 ? (
              <div className="card text-center" style={{ padding: '3rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Your cart is empty</h2>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Link to="/products" className="btn btn-primary">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
                {/* Cart Items */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">
                      Cart Items ({cartSummary.itemCount})
                    </h2>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {cartItems.map(item => (
                        <div 
                          key={item.id} 
                          className="card"
                          style={{ padding: '1rem' }}
                        >
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {/* Product Image */}
                            <Link to={`/products/${item.product.id}`}>
                              <img
                                src={item.product.productImage || '/placeholder-image.jpg'}
                                alt={item.product.name}
                                style={{
                                  width: '80px',
                                  height: '80px',
                                  objectFit: 'cover',
                                  borderRadius: '4px'
                                }}
                                onError={(e) => e.target.src = '/placeholder-image.jpg'}
                              />
                            </Link>

                            {/* Product Details */}
                            <div style={{ flex: 1 }}>
                              <Link 
                                to={`/products/${item.product.id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                <h3 style={{ 
                                  fontSize: '1.1rem', 
                                  marginBottom: '0.5rem',
                                  ':hover': { textDecoration: 'underline' }
                                }}>
                                  {item.product.name}
                                </h3>
                              </Link>
                              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                Product Code: {item.product.productNo}
                              </p>
                              <p style={{ fontWeight: 'bold', color: '#000' }}>
                                ${item.unitPrice?.toFixed(2)} each
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="btn btn-secondary btn-small"
                                disabled={item.quantity <= 1 || updating[item.product.id]}
                                style={{ padding: '0.25rem 0.75rem' }}
                              >
                                -
                              </button>
                              <span style={{ 
                                minWidth: '60px', 
                                textAlign: 'center',
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                              }}>
                                {updating[item.product.id] ? '...' : item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="btn btn-secondary btn-small"
                                disabled={updating[item.product.id]}
                                style={{ padding: '0.25rem 0.75rem' }}
                              >
                                +
                              </button>
                            </div>

                            {/* Item Total */}
                            <div style={{ minWidth: '100px', textAlign: 'right' }}>
                              <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                ${item.totalPrice?.toFixed(2)}
                              </p>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="btn btn-danger btn-small"
                              style={{ padding: '0.5rem' }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cart Summary */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Order Summary</h2>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        padding: '0.5rem 0',
                        borderBottom: '1px solid #eee'
                      }}>
                        <span>Items ({cartSummary.totalItems}):</span>
                        <span>${cartSummary.subtotal?.toFixed(2)}</span>
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        padding: '0.5rem 0',
                        borderBottom: '1px solid #eee'
                      }}>
                        <span>Shipping:</span>
                        <span style={{ color: '#28a745' }}>
                          {cartSummary.subtotal >= 50 ? 'FREE' : '$5.99'}
                        </span>
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        padding: '1rem 0',
                        borderTop: '2px solid #000',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>
                        <span>Total:</span>
                        <span>
                          ${(cartSummary.subtotal + (cartSummary.subtotal >= 50 ? 0 : 5.99)).toFixed(2)}
                        </span>
                      </div>

                      {cartSummary.subtotal < 50 && (
                        <div className="alert alert-info" style={{ fontSize: '0.9rem' }}>
                          Add ${(50 - cartSummary.subtotal).toFixed(2)} more for free shipping!
                        </div>
                      )}

                      <button
                        onClick={proceedToCheckout}
                        className="btn btn-primary w-100"
                        style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}
                      >
                        Proceed to Checkout
                      </button>

                      <Link 
                        to="/products" 
                        className="btn btn-secondary w-100"
                        style={{ textAlign: 'center' }}
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Related Products or Recommendations */}
            {cartItems.length > 0 && (
              <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                  <h3 className="card-title">You might also like</h3>
                </div>
                <div className="card-body">
                  <p style={{ color: '#666', textAlign: 'center' }}>
                    Browse our <Link to="/products" style={{ color: '#000', textDecoration: 'underline' }}>complete product catalog</Link> for more great items!
                  </p>
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

export default CartPage;