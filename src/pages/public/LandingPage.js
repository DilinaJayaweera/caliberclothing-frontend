import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { publicAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { customerAPI } from '../../services/api';

const LandingPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else if (searchQuery) {
      searchProducts(searchQuery);
    } else {
      fetchProducts();
    }
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await publicAPI.getProducts();
      setProducts(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await publicAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      const response = await publicAPI.getProductsByCategory(categoryId);
      setProducts(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching products by category:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query) => {
    if (!query.trim()) {
      fetchProducts();
      return;
    }

    try {
      setLoading(true);
      const response = await publicAPI.searchProducts(query);
      setProducts(response.data);
      setError('');
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchProducts(searchQuery);
  };

  const handleAddToCart = async (productId) => {
    if (!user || user.role !== 'CUSTOMER') {
      setMessage('Please login as a customer to add items to cart');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const response = await customerAPI.addToCart(productId, 1);
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

  const handleAddToWishlist = async (productId) => {
    if (!user || user.role !== 'CUSTOMER') {
      setMessage('Please login as a customer to add items to wishlist');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const response = await customerAPI.addToWishlist(productId);
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

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    fetchProducts();
  };

  return (
    <div>
      <Header />
      
      <main className="content-container">
        {/* Hero Section */}
        <section className="hero" style={{ textAlign: 'center', padding: '3rem 0', backgroundColor: '#f8f9fa' }}>
          <div className="container">
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to Caliber Clothing</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>
              Discover premium fashion and quality clothing for every occasion
            </p>
            <Link to="/products" className="btn btn-primary" style={{ fontSize: '1.1rem' }}>
              Shop Now
            </Link>
          </div>
        </section>

        {/* Message Display */}
        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {/* Filters Section */}
        <section className="filters" style={{ padding: '2rem 0', borderBottom: '1px solid #eee' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search */}
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flex: '1', minWidth: '300px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: '1' }}
                />
                <button type="submit" className="btn btn-primary">Search</button>
              </form>

              {/* Category Filter */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label htmlFor="category">Category:</label>
                <select
                  id="category"
                  className="form-control"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ minWidth: '150px' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || searchQuery) && (
                <button onClick={clearFilters} className="btn btn-secondary">
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="products" style={{ padding: '2rem 0' }}>
          <div className="container">
            <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Our Products</h2>
            
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : error ? (
              <div className="alert alert-error">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="alert alert-info">
                No products found. {selectedCategory || searchQuery ? 'Try adjusting your filters.' : ''}
              </div>
            ) : (
              <div className="product-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <div style={{ position: 'relative' }}>
                      <img
                        src={product.productImage || '/placeholder-image.jpg'}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                      {product.quantityInStock <= 0 && (
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
                    </div>
                    
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">
                        {product.description?.substring(0, 100)}
                        {product.description?.length > 100 && '...'}
                      </p>
                      <div className="product-price">
                        Rs.{product.sellingPrice?.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        In Stock: {product.quantityInStock}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                        <Link 
                          to={`/products/${product.id}`} 
                          className="btn btn-secondary btn-small"
                        >
                          View Details
                        </Link>
                        
                        {user && user.role === 'CUSTOMER' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleAddToCart(product.id)}
                              className="btn btn-primary btn-small"
                              disabled={product.quantityInStock <= 0}
                              style={{ flex: 1 }}
                            >
                              Add to Cart
                            </button>
                            <button
                              onClick={() => handleAddToWishlist(product.id)}
                              className="btn btn-secondary btn-small"
                              style={{ flex: 1 }}
                            >
                              Wishlist
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="features" style={{ padding: '3rem 0', backgroundColor: '#f8f9fa' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Why Choose Caliber Clothing?</h2>
            <div className="grid-3">
              <div className="card text-center">
                <h3>Premium Quality</h3>
                <p>We source only the finest materials to ensure our clothing meets the highest standards of quality and comfort.</p>
              </div>
              <div className="card text-center">
                <h3>Fast Delivery</h3>
                <p>Quick and reliable shipping to get your favorite pieces to you as soon as possible.</p>
              </div>
              <div className="card text-center">
                <h3>Customer Service</h3>
                <p>Our dedicated support team is here to help you with any questions or concerns.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;