import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { customerAPI, orderAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CustomerCheckout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [cart, setCart] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [shippingAddress, setShippingAddress] = useState('');
  const [useProfileAddress, setUseProfileAddress] = useState(true);

  useEffect(() => {
    fetchCartAndProfile();
  }, []);

  const fetchCartAndProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch cart and current customer data simultaneously
      const [cartResponse, customerResponse] = await Promise.all([
        customerAPI.getCart(),
        customerAPI.getCurrentCustomer() // Use new endpoint that returns customer without credentials
      ]);
      
      // Ensure cart is an array
      const cartData = cartResponse.data;
      console.log('Cart API Response:', cartData, 'Type:', typeof cartData, 'Is Array:', Array.isArray(cartData));
      
      if (Array.isArray(cartData)) {
        setCart(cartData);
        
        // Only redirect if cart is actually empty
        if (cartData.length === 0) {
          setError('Your cart is empty. Redirecting to products...');
          setTimeout(() => {
            navigate('/products');
          }, 2000);
          return;
        }
      } else if (cartData && typeof cartData === 'object') {
        // If cart is an object with items property (some APIs return this format)
        if (cartData.items && Array.isArray(cartData.items)) {
          setCart(cartData.items);
          if (cartData.items.length === 0) {
            setError('Your cart is empty. Redirecting to products...');
            setTimeout(() => {
              navigate('/products');
            }, 2000);
            return;
          }
        } else {
          console.warn('Cart data is not in expected format:', cartData);
          setError('Unable to load cart. Redirecting to products...');
          setTimeout(() => {
            navigate('/products');
          }, 2000);
          return;
        }
      } else {
        console.warn('Cart data is not an array or object:', cartData);
        setError('Unable to load cart. Redirecting to products...');
        setTimeout(() => {
          navigate('/products');
        }, 2000);
        return;
      }
      
      setProfile(customerResponse.data);
      console.log('Customer data:', customerResponse.data);
      
      // Set default shipping address to profile address
      if (customerResponse.data?.address) {
        const fullAddress = `${customerResponse.data.fullName || ''}\n${customerResponse.data.address || ''}\n${customerResponse.data.country || ''}, ${customerResponse.data.province?.value || ''}\nZip: ${customerResponse.data.zipCode || ''}\nMobile: ${customerResponse.data.mobileNumber || ''}`;
        setShippingAddress(fullAddress);
      }
      
      setError('');
    } catch (error) {
      console.error('Error fetching cart and customer data:', error);
      setError('Failed to load checkout information. Please try again.');
      // Don't redirect on API error - let user retry
    } finally {
      setLoading(false);
    }
  };

  const calculateOrderSummary = () => {
    // Handle different cart data formats
    let cartItems = [];
    
    if (Array.isArray(cart)) {
      cartItems = cart;
    } else if (cart && cart.items && Array.isArray(cart.items)) {
      cartItems = cart.items;
    } else {
      return {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        totalItems: 0
      };
    }

    if (cartItems.length === 0) {
      return {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        totalItems: 0
      };
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product?.sellingPrice || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
    
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const tax = subtotal * 0.10; // 10% tax
    const shipping = subtotal >= 5000 ? 0 : 500; // Free shipping over Rs. 5,000
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      total,
      totalItems
    };
  };

  const handleAddressChange = (useProfile) => {
    setUseProfileAddress(useProfile);
    if (useProfile && profile?.address) {
      const fullAddress = `${profile.fullName || ''}\n${profile.address || ''}\n${profile.country || ''}, ${profile.province?.value || ''}\nZip: ${profile.zipCode || ''}\nMobile: ${profile.mobileNumber || ''}`;
      setShippingAddress(fullAddress);
    } else {
      setShippingAddress('');
    }
  };

  const validateOrder = async () => {
    const errors = [];
    
    if (!shippingAddress.trim()) {
      errors.push('Shipping address is required');
    }
    
    if (!paymentMethod) {
      errors.push('Please select a payment method');
    }
    
    // Get cart items based on format
    let cartItems = [];
    if (Array.isArray(cart)) {
      cartItems = cart;
    } else if (cart && cart.items && Array.isArray(cart.items)) {
      cartItems = cart.items;
    }
    
    if (cartItems.length === 0) {
      errors.push('Your cart is empty');
      return errors; // Return early if cart is empty
    }

    // Check stock availability using product's quantityInStock
    const stockIssues = cartItems.filter(item => {
      const availableStock = item.product?.quantityInStock || 0;
      const requestedQuantity = item.quantity || 0;
      return requestedQuantity > availableStock;
    });
    
    if (stockIssues.length > 0) {
      const issueDetails = stockIssues.map(item => 
        `${item.product.name} (requested: ${item.quantity}, available: ${item.product.quantityInStock || 0})`
      ).join(', ');
      errors.push(`Insufficient stock for: ${issueDetails}`);
    }

    return errors;
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp.slice(-6)}${random}`;
  };

  const handlePlaceOrder = async () => {
    setError('');
    setSuccess('');
    
    const validationErrors = await validateOrder();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    setPlacing(true);

    try {
      // Get cart items based on format
      let cartItems = [];
      if (Array.isArray(cart)) {
        cartItems = cart;
      } else if (cart && cart.items && Array.isArray(cart.items)) {
        cartItems = cart.items;
      }
      
      // Create orders for each cart item using the Order API
      const orderResults = [];
      
      for (const cartItem of cartItems) {
        try {
          // Create order data according to your Order entity structure
          const orderData = {
            orderNo: generateOrderNumber(),
            quantity: cartItem.quantity,
            unitPrice: cartItem.product.sellingPrice,
            totalPrice: cartItem.product.sellingPrice * cartItem.quantity,
            shippingAddress: shippingAddress,
            orderDate: new Date().toISOString(),
            customer: {
              id: profile?.id // Use customer ID from profile
            },
            orderStatus: {
              id: 1 // Set order status to 1 (presumably "Pending" or "New")
            },
            // Add product reference if your backend expects it
            productId: cartItem.product.id,
            // Add payment method info
            paymentMethod: paymentMethod
          };
          
          const orderResponse = await orderAPI.createOrder(orderData);
          orderResults.push(orderResponse);
          console.log(`Order placed for product ${cartItem.product.id}: ${cartItem.quantity} units`);
          
        } catch (orderError) {
          console.error(`Failed to place order for product ${cartItem.product.id}:`, orderError);
          throw orderError;
        }
      }

      // Clear the cart after all orders are successfully placed
      await customerAPI.clearCart();
      
      setSuccess(`🎉 Order placed successfully! ${orderResults.length} item(s) ordered. Order numbers: ${orderResults.map(r => r.data.orderNo).join(', ')}`);
      
      // Redirect to products page after 5 seconds
      setTimeout(() => {
        navigate('/products');
      }, 5000);
      
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const orderSummary = calculateOrderSummary();

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading checkout...</p>
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
          <div className="checkout-page">
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Checkout</h1>
              <nav style={{ fontSize: '0.9rem', color: '#666' }}>
                <span>Cart</span>
                <span style={{ margin: '0 0.5rem' }}>›</span>
                <span style={{ color: '#000', fontWeight: 'bold' }}>Checkout</span>
              </nav>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success" style={{ marginBottom: '2rem' }}>
                {success}
              </div>
            )}

            <div className="grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
              {/* Order Details & Shipping */}
              <div>
                {/* Order Summary */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                  <div className="card-header">
                    <h2 className="card-title">Order Summary</h2>
                  </div>
                  <div className="card-body">
                    {(() => {
                      // Get cart items based on format
                      let cartItems = [];
                      if (Array.isArray(cart)) {
                        cartItems = cart;
                      } else if (cart && cart.items && Array.isArray(cart.items)) {
                        cartItems = cart.items;
                      }

                      if (cartItems.length === 0) {
                        return (
                          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                            <p>No items in cart</p>
                          </div>
                        );
                      }

                      return cartItems.map((item, index) => (
                        <div 
                          key={index}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '1rem 0',
                            borderBottom: index < cartItems.length - 1 ? '1px solid #eee' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img
                              src={item.product?.productImage || '/placeholder-image.jpg'}
                              alt={item.product?.name || 'Product'}
                              style={{ 
                                width: '60px', 
                                height: '60px', 
                                objectFit: 'cover', 
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                              }}
                              onError={(e) => e.target.src = '/placeholder-image.jpg'}
                            />
                            <div>
                              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                {item.product?.name || 'Unknown Product'}
                              </div>
                              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                Qty: {item.quantity || 0} × Rs. {(item.product?.sellingPrice || 0).toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontWeight: 'bold' }}>
                            Rs. {((item.product?.sellingPrice || 0) * (item.quantity || 0)).toFixed(2)}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                  <div className="card-header">
                    <h2 className="card-title">Shipping Address</h2>
                  </div>
                  <div className="card-body">
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                          type="radio"
                          name="addressOption"
                          checked={useProfileAddress}
                          onChange={() => handleAddressChange(true)}
                        />
                        <span>Use my profile address</span>
                      </label>
                      
                      {profile?.address && (
                        <div style={{ 
                          backgroundColor: '#f8f9fa', 
                          padding: '1rem', 
                          borderRadius: '4px',
                          border: '1px solid #dee2e6',
                          fontSize: '0.9rem',
                          marginBottom: '1rem'
                        }}>
                          <strong>Profile Address:</strong><br />
                          {profile.fullName}<br />
                          {profile.address}<br />
                          {profile.country}, {profile.province?.value}<br />
                          Zip: {profile.zipCode}<br />
                          Mobile: {profile.mobileNumber}
                        </div>
                      )}
                      
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                          type="radio"
                          name="addressOption"
                          checked={!useProfileAddress}
                          onChange={() => handleAddressChange(false)}
                        />
                        <span>Use a different address</span>
                      </label>
                    </div>
                    
                    <div>
                      <label htmlFor="shippingAddress" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Shipping Address *
                      </label>
                      <textarea
                        id="shippingAddress"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Enter complete shipping address with name, address, city, postal code, and phone number..."
                        rows="6"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #000',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          resize: 'vertical'
                        }}
                        required
                      />
                      <small style={{ color: '#666', fontSize: '0.8rem' }}>
                        Please include your full name, complete address, city, postal code, and contact number
                      </small>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Payment Method</h2>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        padding: '1rem',
                        border: '2px solid #000',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Cash on Delivery"
                          checked={paymentMethod === 'Cash on Delivery'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div>
                          <div style={{ fontWeight: 'bold' }}>Cash on Delivery</div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            Pay when your order arrives
                          </div>
                        </div>
                      </label>
                      
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        padding: '1rem',
                        border: '2px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'not-allowed',
                        opacity: 0.5
                      }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Card Payment"
                          disabled
                        />
                        <div>
                          <div style={{ fontWeight: 'bold' }}>Card Payment</div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            Credit/Debit Card (Currently unavailable)
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Total & Place Order */}
              <div>
                <div className="card" style={{ position: 'sticky', top: '2rem' }}>
                  <div className="card-header">
                    <h2 className="card-title">Order Total</h2>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal ({orderSummary.totalItems} items):</span>
                        <span>Rs. {orderSummary.subtotal.toFixed(2)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tax (10%):</span>
                        <span>Rs. {orderSummary.tax.toFixed(2)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          Shipping:
                          {orderSummary.shipping === 0 && (
                            <span style={{ fontSize: '0.8rem', color: '#28a745', marginLeft: '0.5rem' }}>
                              FREE
                            </span>
                          )}
                        </span>
                        <span>Rs. {orderSummary.shipping.toFixed(2)}</span>
                      </div>
                      
                      <hr style={{ margin: '0.5rem 0' }} />
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>
                        <span>Total:</span>
                        <span>Rs. {orderSummary.total.toFixed(2)}</span>
                      </div>
                      
                      {orderSummary.subtotal < 5000 && (
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#666',
                          textAlign: 'center',
                          marginTop: '0.5rem'
                        }}>
                          Add Rs. {(5000 - orderSummary.subtotal).toFixed(2)} more for free shipping
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placing || (() => {
                        let cartItems = [];
                        if (Array.isArray(cart)) {
                          cartItems = cart;
                        } else if (cart && cart.items && Array.isArray(cart.items)) {
                          cartItems = cart.items;
                        }
                        return cartItems.length === 0;
                      })()}
                      style={{
                        width: '100%',
                        marginTop: '2rem',
                        padding: '1rem',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        backgroundColor: (placing || (() => {
                          let cartItems = [];
                          if (Array.isArray(cart)) {
                            cartItems = cart;
                          } else if (cart && cart.items && Array.isArray(cart.items)) {
                            cartItems = cart.items;
                          }
                          return cartItems.length === 0;
                        })()) ? '#ccc' : '#000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: (placing || (() => {
                          let cartItems = [];
                          if (Array.isArray(cart)) {
                            cartItems = cart;
                          } else if (cart && cart.items && Array.isArray(cart.items)) {
                            cartItems = cart.items;
                          }
                          return cartItems.length === 0;
                        })()) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {placing ? 'Placing Order...' : `Place Order - Rs. ${orderSummary.total.toFixed(2)}`}
                    </button>
                    
                    <div style={{ 
                      textAlign: 'center', 
                      fontSize: '0.8rem', 
                      color: '#666',
                      marginTop: '1rem'
                    }}>
                      By placing this order, you agree to our terms and conditions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CustomerCheckout;