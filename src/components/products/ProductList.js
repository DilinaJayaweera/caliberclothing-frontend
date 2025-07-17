import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productService } from '../../services/productService';

const ProductList = ({ 
  onEdit, 
  canManage = false, 
  showAllDetails = false, 
  lowStockOnly = false,
  showInventoryActions = false,
  onUpdateStock,
  onReorder
}) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [lowStockOnly]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let productsData;
      
      if (lowStockOnly) {
        productsData = await productService.getLowStockProducts();
      } else {
        productsData = await productService.getAllProducts();
      }
      
      setProducts(productsData);
    } catch (error) {
      setError('Failed to load products');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await productService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productNo?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || 
                             product.productCategory?.id === parseInt(selectedCategory);

      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
          break;
        case 'price':
          valueA = a.sellingPrice || 0;
          valueB = b.sellingPrice || 0;
          break;
        case 'stock':
          valueA = a.quantityInStock || 0;
          valueB = b.quantityInStock || 0;
          break;
        case 'category':
          valueA = a.productCategory?.name?.toLowerCase() || '';
          valueB = b.productCategory?.name?.toLowerCase() || '';
          break;
        default:
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        loadProducts();
      } catch (error) {
        setError('Failed to delete product');
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleUpdateStock = async (productId, newQuantity) => {
    try {
      await productService.updateProductStock(productId, newQuantity);
      loadProducts();
      if (onUpdateStock) {
        onUpdateStock(productId, newQuantity);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        Loading products...
      </div>
    );
  }

  return (
    <div className="product-list">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <label>Search Products</label>
            <input
              type="text"
              placeholder="Search by name, description, or product number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
              <option value="category">Category</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-select"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No products found</h3>
          <p>
            {products.length === 0 
              ? "No products have been added yet."
              : "No products match your search criteria."
            }
          </p>
        </div>
      ) : (
        <>
          {canManage && !showInventoryActions ? (
            // Table view for management
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product No</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Cost Price</th>
                    <th>Selling Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td><strong>{product.productNo}</strong></td>
                      <td>
                        <div>
                          <strong>{product.name}</strong>
                          <br />
                          <small>{product.description}</small>
                        </div>
                      </td>
                      <td>{product.productCategory?.name || 'N/A'}</td>
                      <td>${product.costPrice?.toFixed(2)}</td>
                      <td>${product.sellingPrice?.toFixed(2)}</td>
                      <td>
                        <span className={`stock-indicator ${
                          product.quantityInStock <= 0 ? 'out-of-stock' : 
                          product.quantityInStock <= 10 ? 'low-stock' : 'in-stock'
                        }`}>
                          {product.quantityInStock}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${product.isActive ? 'status-active' : 'status-inactive'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => onEdit(product)}
                            className="btn btn-outline btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : showInventoryActions ? (
            // Inventory management view
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Reorder Level</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div>
                          <strong>{product.name}</strong>
                          <br />
                          <small>{product.productNo}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`stock-indicator ${
                          product.quantityInStock <= 0 ? 'out-of-stock' : 
                          product.quantityInStock <= 10 ? 'low-stock' : 'in-stock'
                        }`}>
                          {product.quantityInStock}
                        </span>
                      </td>
                      <td>{product.reorderLevel || 'Not set'}</td>
                      <td>
                        {product.quantityInStock <= (product.reorderLevel || 10) ? (
                          <span className="status-badge alert">Low Stock</span>
                        ) : (
                          <span className="status-badge status-active">Good</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => {
                              const newQuantity = prompt('Enter new quantity:', product.quantityInStock);
                              if (newQuantity && !isNaN(newQuantity)) {
                                handleUpdateStock(product.id, parseInt(newQuantity));
                              }
                            }}
                            className="btn btn-outline btn-sm"
                          >
                            Update Stock
                          </button>
                          {product.quantityInStock <= (product.reorderLevel || 10) && (
                            <button
                              onClick={() => onReorder && onReorder(product.id)}
                              className="btn btn-primary btn-sm"
                            >
                              Mark Reordered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Card view for customers
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  showActions={true}
                  onEdit={canManage ? onEdit : undefined}
                  onDelete={canManage ? handleDeleteProduct : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Summary */}
      {filteredProducts.length > 0 && (
        <div className="list-summary">
          <p>
            Showing {filteredProducts.length} of {products.length} products
            {lowStockOnly && ` (Low stock items only)`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductList;