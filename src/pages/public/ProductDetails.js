import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { publicAPI, customerAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await publicAPI.getProduct(id);
      setProduct(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching product:', error);
      if (error.response?.status === 404) {
        setError('Product not found');
      } else {
        setError('Failed to fetch product details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user || user.role !== 'CUSTOMER') {
      setMessage('Please login as a customer to add items to cart');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (quantity > product.quantityInStock) {
      setMessage(`Only ${product.quantityInStock} items available in stock`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const response = await customerAPI.addToCart(product.id, quantity);
      if (response.data.success) {
        setMessage('Product added to cart successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage('Failed to add product to cart');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user || user.role !== 'CUSTOMER') {
      setMessage('Please login as a customer to add items to wishlist');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const response = await customerAPI.addToWishlist(product.id);
      if (response.data.success) {
        setMessage('Product added to wishlist successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      setMessage(error.response?.data?.message || 'Failed to add product to wishlist');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleBuyNow = () => {
    if (!user || user.role !== 'CUSTOMER') {
      navigate('/login');
      return;
    }

    // Add to cart and redirect to cart page
    handleAddToCart();
    setTimeout(() => {
      navigate('/customer/cart');
    }, 1000);
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <main className="content-container">
          <div className="container">
            <div className="alert alert-error">
              {error}
            </div>
            <Link to="/products" className="btn btn-secondary">
              ← Back to Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Header />
        <main className="content-container">
          <div className="container">
            <div className="alert alert-error">
              Product not found
            </div>
            <Link to="/products" className="btn btn-secondary">
              ← Back to Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <main className="content-container">
        <div className="container">
          {/* Breadcrumb */}
          <nav style={{ marginBottom: '2rem' }}>
            <Link to="/products" style={{ color: '#666', textDecoration: 'none' }}>
              Products
            </Link>
            <span style={{ margin: '0 0.5rem', color: '#666' }}>›</span>
            <span style={{ color: '#000' }}>{product.name}</span>
          </nav>

          {/* Message Display */}
          {message && (
            <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}

          {/* Product Details */}
          <div className="grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
            {/* Product Image */}
            <div>
              <img
                src={product.productImage || '/placeholder-image.jpg'}
                alt={product.name}
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  height: 'auto',
                  border: '2px solid #000',
                  borderRadius: '8px'
                }}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>

            {/* Product Information */}
            <div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                {product.name}
              </h1>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: '#000' 
                }}>
                  ${product.sellingPrice?.toFixed(2)}
                </span>
                {product.costPrice && (
                  <span style={{ 
                    fontSize: '1.2rem', 
                    color: '#666', 
                    textDecoration: 'line-through',
                    marginLeft: '1rem'
                  }}>
                    ${product.costPrice?.toFixed(2)}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '1.1rem', color: '#666' }}>
                  <strong>Product Code:</strong> {product.productNo}
                </p>
                <p style={{ fontSize: '1.1rem', color: '#666' }}>
                  <strong>Category:</strong> {product.productCategory?.name}
                </p>
                <p style={{ fontSize: '1.1rem', color: '#666' }}>
                  <strong>Supplier:</strong> {product.supplierDetails?.supplierName}
                </p>
              </div>

              {/* Stock Status */}
              <div style={{ marginBottom: '1.5rem' }}>
                {product.quantityInStock > 0 ? (
                  <div>
                    <span style={{ 
                      color: '#28a745', 
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}>
                      ✓ In Stock ({product.quantityInStock} available)
                    </span>
                  </div>
                ) : (
                  <div>
                    <span style={{ 
                      color: '#dc3545', 
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}>
                      ✗ Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Description</h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.6', 
                  color: '#444',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px'
                }}>
                  {product.description || 'No description available for this product.'}
                </p>
              </div>

              {/* Quantity Selector and Actions */}
              {product.quantityInStock > 0 && user && user.role === 'CUSTOMER' && (
                <div style={{ marginBottom: '2rem' }}>
                  <label htmlFor="quantity" style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 'bold'
                  }}>
                    Quantity:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '1.2rem' }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={product.quantityInStock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantityInStock, parseInt(e.target.value) || 1)))}
                      style={{
                        width: '80px',
                        textAlign: 'center',
                        padding: '0.5rem',
                        border: '2px solid #000',
                        borderRadius: '4px',
                        fontSize: '1.1rem'
                      }}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.quantityInStock, quantity + 1))}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '1.2rem' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {user && user.role === 'CUSTOMER' ? (
                  product.quantityInStock > 0 ? (
                    <>
                      <button
                        onClick={handleBuyNow}
                        className="btn btn-primary"
                        style={{ flex: '1', minWidth: '200px', padding: '1rem' }}
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={handleAddToCart}
                        className="btn btn-secondary"
                        style={{ flex: '1', minWidth: '200px', padding: '1rem' }}
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={handleAddToWishlist}
                        className="btn btn-secondary"
                        style={{ padding: '1rem' }}
                      >
                        ♡ Wishlist
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddToWishlist}
                      className="btn btn-secondary"
                      style={{ flex: '1', minWidth: '200px', padding: '1rem' }}
                    >
                      ♡ Add to Wishlist
                    </button>
                  )
                ) : (
                  <div style={{ width: '100%' }}>
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                      Please login as a customer to purchase this product.
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ marginRight: '1rem' }}>
                      Login
                    </Link>
                    <Link to="/register" className="btn btn-secondary">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Product Information */}
          <div style={{ marginTop: '3rem' }}>
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Product Specifications</h3>
                </div>
                <div className="card-body">
                  <table style={{ width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                          Product Code:
                        </td>
                        <td style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                          {product.productNo}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                          Category:
                        </td>
                        <td style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                          {product.productCategory?.name}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                          Supplier:
                        </td>
                        <td style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                          {product.supplierDetails?.supplierName}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                          Availability:
                        </td>
                        <td style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                          {product.quantityInStock > 0 ? `${product.quantityInStock} in stock` : 'Out of stock'}
                        </td>
                      </tr>
                      {product.profitPercentage && (
                        <tr>
                          <td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>
                            Profit Margin:
                          </td>
                          <td style={{ padding: '0.5rem 0' }}>
                            {product.profitPercentage}%
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Shipping & Returns</h3>
                </div>
                <div className="card-body">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Free shipping on orders over $50
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ 30-day return policy
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Quality guarantee
                    </li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      ✓ Secure payment processing
                    </li>
                    <li style={{ padding: '0.5rem 0' }}>
                      ✓ Customer support available
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Products */}
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Link to="/products" className="btn btn-secondary">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetails;