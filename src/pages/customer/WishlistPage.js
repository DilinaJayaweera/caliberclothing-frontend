import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { customerAPI } from '../../services/api';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getWishlist();
      if (response.data.success) {
        setWishlistItems(response.data.items || []);
      }
      setError('');
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      setError('Failed to fetch wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await customerAPI.removeFromWishlist(productId);
      if (response.data.success) {
        setMessage('Item removed from wishlist');
        setTimeout(() => setMessage(''), 2000);
        fetchWishlistItems(); // Refresh wishlist
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Failed to remove item from wishlist');
      setTimeout(() => setError(''), 3000);
    }
  };

  const moveToCart = async (productId, quantity = 1) => {
    try {
      const response = await customerAPI.moveWishlistItemToCart(productId, { quantity });
      if (response.data.success) {
        setMessage('Item moved to cart successfully!');
        setTimeout(() => setMessage(''), 2000);
        fetchWishlistItems(); // Refresh wishlist
      }
    } catch (error) {
      console.error('Error moving to cart:', error);
      setError(error.response?.data?.message || 'Failed to move item to cart');
      setTimeout(() => setError(''), 3000);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await customerAPI.addToCart(productId, quantity);
      if (response.data.success) {
        setMessage('Item added to cart successfully!');
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.response?.data?.message || 'Failed to add item to cart');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your wishlist...</p>
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
              <h1 className="dashboard-title">My Wishlist</h1>
              <div className="dashboard-actions">
                <Link to="/customer/dashboard" className="btn btn-secondary">
                  ← Back to Dashboard
                </Link>
                <Link to="/products" className="btn btn-primary">
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Messages */}
            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            {wishlistItems.length === 0 ? (
              <div className="card text-center" style={{ padding: '3rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Your wishlist is empty</h2>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                  Save items you love to your wishlist so you can easily find them later.
                </p>
                <Link to="/products" className="btn btn-primary">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div>
                {/* Wishlist Summary */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">
                      Wishlist Items ({wishlistItems.length})
                    </h2>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                      Items you've saved for later
                    </p>
                  </div>
                </div>

                {/* Wishlist Items Grid */}
                <div className="product-grid" style={{ marginTop: '2rem' }}>
                  {wishlistItems.map(item => (
                    <div key={item.id} className="product-card">
                      <div style={{ position: 'relative' }}>
                        <Link to={`/products/${item.product.id}`}>
                          <img
                            src={item.product.productImage || '/placeholder-image.jpg'}
                            alt={item.product.name}
                            className="product-image"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </Link>
                        
                        {/* Stock Status Badge */}
                        {item.product.quantityInStock <= 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#dc3545',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem'
                          }}>
                            Out of Stock
                          </div>
                        )}

                        {/* Wishlist Date */}
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem'
                        }}>
                          Added: {new Date(item.createdTimestamp).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="product-info">
                        <Link 
                          to={`/products/${item.product.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <h3 className="product-name">{item.product.name}</h3>
                        </Link>
                        
                        <p className="product-description">
                          {item.product.description?.substring(0, 100)}
                          {item.product.description?.length > 100 && '...'}
                        </p>
                        
                        <div className="product-price">
                          ${item.product.sellingPrice?.toFixed(2)}
                        </div>
                        
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                          {item.product.quantityInStock > 0 ? (
                            <span style={{ color: '#28a745' }}>
                              ✓ In Stock ({item.product.quantityInStock} available)
                            </span>
                          ) : (
                            <span style={{ color: '#dc3545' }}>
                              ✗ Out of Stock
                            </span>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {item.product.quantityInStock > 0 ? (
                            <>
                              <button
                                onClick={() => moveToCart(item.product.id, 1)}
                                className="btn btn-primary btn-small"
                              >
                                Move to Cart
                              </button>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => addToCart(item.product.id, 1)}
                                  className="btn btn-secondary btn-small"
                                  style={{ flex: 1 }}
                                >
                                  Add to Cart
                                </button>
                                <button
                                  onClick={() => removeFromWishlist(item.product.id)}
                                  className="btn btn-danger btn-small"
                                  style={{ flex: 1 }}
                                >
                                  Remove
                                </button>
                              </div>
                            </>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <Link 
                                to={`/products/${item.product.id}`}
                                className="btn btn-secondary btn-small"
                                style={{ flex: 1, textAlign: 'center' }}
                              >
                                View Details
                              </Link>
                              <button
                                onClick={() => removeFromWishlist(item.product.id)}
                                className="btn btn-danger btn-small"
                                style={{ flex: 1 }}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Wishlist Actions */}
                <div className="card" style={{ marginTop: '2rem' }}>
                  <div className="card-header">
                    <h3 className="card-title">Wishlist Actions</h3>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button
                        onClick={() => {
                          const availableItems = wishlistItems.filter(item => item.product.quantityInStock > 0);
                          if (availableItems.length === 0) {
                            setError('No items in your wishlist are currently in stock');
                            setTimeout(() => setError(''), 3000);
                            return;
                          }
                          
                          Promise.all(
                            availableItems.map(item => addToCart(item.product.id, 1))
                          ).then(() => {
                            setMessage(`${availableItems.length} items added to cart!`);
                            setTimeout(() => setMessage(''), 3000);
                          }).catch(() => {
                            setError('Some items could not be added to cart');
                            setTimeout(() => setError(''), 3000);
                          });
                        }}
                        className="btn btn-primary"
                        disabled={wishlistItems.filter(item => item.product.quantityInStock > 0).length === 0}
                      >
                        Add All Available to Cart
                      </button>
                      
                      <Link to="/products" className="btn btn-secondary">
                        Continue Shopping
                      </Link>
                      
                      <Link to="/customer/cart" className="btn btn-secondary">
                        View Cart
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Wishlist Tips */}
                <div className="card" style={{ marginTop: '2rem' }}>
                  <div className="card-header">
                    <h3 className="card-title">Wishlist Tips</h3>
                  </div>
                  <div className="card-body">
                    <div className="grid-2">
                      <div>
                        <h4>Managing Your Wishlist</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          <li style={{ padding: '0.25rem 0' }}>💡 Save items you're interested in for later</li>
                          <li style={{ padding: '0.25rem 0' }}>🔄 Move items directly to cart when ready to buy</li>
                          <li style={{ padding: '0.25rem 0' }}>📱 Your wishlist is saved to your account</li>
                          <li style={{ padding: '0.25rem 0' }}>🎯 Perfect for planning future purchases</li>
                        </ul>
                      </div>
                      <div>
                        <h4>Stock Notifications</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          <li style={{ padding: '0.25rem 0' }}>📦 We'll show you when items are back in stock</li>
                          <li style={{ padding: '0.25rem 0' }}>⚡ Act fast when your favorites become available</li>
                          <li style={{ padding: '0.25rem 0' }}>🏷️ Prices may change, so check before purchasing</li>
                          <li style={{ padding: '0.25rem 0' }}>❤️ Keep track of items you love</li>
                        </ul>
                      </div>
                    </div>
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

export default WishlistPage;