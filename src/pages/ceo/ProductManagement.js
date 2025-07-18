import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { ceoAPI, commonAPI } from '../../services/api';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [formData, setFormData] = useState({
    productNo: '',
    name: '',
    description: '',
    productImage: '',
    costPrice: '',
    sellingPrice: '',
    quantityInStock: '',
    profitPercentage: '',
    supplierDetailsId: '',
    productCategoryId: '',
    isActive: true
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await ceoAPI.getProducts();
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
      const response = await commonAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await commonAPI.getSuppliers();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      productNo: '',
      name: '',
      description: '',
      productImage: '',
      costPrice: '',
      sellingPrice: '',
      quantityInStock: '',
      profitPercentage: '',
      supplierDetailsId: '',
      productCategoryId: '',
      isActive: true
    });
  };

  const generateProductNo = (name) => {
    if (!name) return '';
    const prefix = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}${timestamp}`;
  };

  const calculateProfitPercentage = (costPrice, sellingPrice) => {
    if (costPrice && sellingPrice && parseFloat(costPrice) > 0) {
      const profit = parseFloat(sellingPrice) - parseFloat(costPrice);
      const profitPercentage = (profit / parseFloat(costPrice)) * 100;
      return profitPercentage.toFixed(2);
    }
    return '';
  };

  const handleCreate = () => {
    resetForm();
    setModalMode('create');
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setFormData({
      productNo: product.productNo || '',
      name: product.name || '',
      description: product.description || '',
      productImage: product.productImage || '',
      costPrice: product.costPrice?.toString() || '',
      sellingPrice: product.sellingPrice?.toString() || '',
      quantityInStock: product.quantityInStock?.toString() || '',
      profitPercentage: product.profitPercentage?.toString() || '',
      supplierDetailsId: product.supplierDetails?.id || '',
      productCategoryId: product.productCategory?.id || '',
      isActive: product.isActive !== undefined ? product.isActive : true
    });
    setModalMode('edit');
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await ceoAPI.deleteProduct(productId);
        setSuccess('Product deleted successfully');
        fetchProducts();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      if (name === 'name' && modalMode === 'create') {
        updated.productNo = generateProductNo(value);
      }
      
      if (name === 'costPrice' || name === 'sellingPrice') {
        const costPrice = name === 'costPrice' ? value : prev.costPrice;
        const sellingPrice = name === 'sellingPrice' ? value : prev.sellingPrice;
        updated.profitPercentage = calculateProfitPercentage(costPrice, sellingPrice);
      }
      
      return updated;
    });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Product name is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) errors.push('Valid cost price is required');
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) errors.push('Valid selling price is required');
    if (!formData.quantityInStock || parseInt(formData.quantityInStock) < 0) errors.push('Valid quantity is required');
    if (!formData.supplierDetailsId) errors.push('Supplier is required');
    if (!formData.productCategoryId) errors.push('Category is required');
    
    if (parseFloat(formData.sellingPrice) <= parseFloat(formData.costPrice)) {
      errors.push('Selling price must be greater than cost price');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    try {
      const productData = {
        productNo: formData.productNo,
        name: formData.name,
        description: formData.description,
        productImage: formData.productImage || '/placeholder-image.jpg',
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        quantityInStock: parseInt(formData.quantityInStock),
        profitPercentage: parseFloat(formData.profitPercentage),
        isActive: formData.isActive,
        supplierDetails: { id: parseInt(formData.supplierDetailsId) },
        productCategory: { id: parseInt(formData.productCategoryId) }
      };

      if (modalMode === 'create') {
        // For create, include timestamps as before
        productData.createdTimestamp = new Date().toISOString();
        productData.updatedTimestamp = new Date().toISOString();
        
        await ceoAPI.createProduct(productData);
        setSuccess('Product created successfully');
      } else {
        // For update, do NOT include timestamps - let backend handle them
        await ceoAPI.updateProduct(selectedProduct.id, productData);
        setSuccess('Product updated successfully');
      }

      setShowModal(false);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.message || 'Failed to save product');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || 
      product.productCategory?.id.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <Header />
      
      <main className="content-container">
        <div className="container">
          <div className="dashboard">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Product Management</h1>
              <div className="dashboard-actions">
                <Link to="/ceo/dashboard" className="btn btn-secondary">
                  ← Back to Dashboard
                </Link>
                <button onClick={handleCreate} className="btn btn-primary">
                  Add New Product
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Filters */}
            <div className="card">
              <div className="card-body">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="form-control"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div style={{ minWidth: '150px' }}>
                    <select
                      className="form-control"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(searchQuery || categoryFilter) && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setCategoryFilter('');
                      }}
                      className="btn btn-secondary"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Products ({filteredProducts.length})</h2>
                </div>
                <div className="card-body">
                  {filteredProducts.length === 0 ? (
                    <p>No products found.</p>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Product No</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map(product => (
                            <tr key={product.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <img
                                    src={product.productImage || '/placeholder-image.jpg'}
                                    alt={product.name}
                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                    onError={(e) => e.target.src = '/placeholder-image.jpg'}
                                  />
                                  <div>
                                    <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                      {product.supplierDetails?.supplierName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>{product.productNo}</td>
                              <td>{product.productCategory?.name}</td>
                              <td>
                                <div>Rs.{product.sellingPrice?.toFixed(2)}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  Cost: Rs.{product.costPrice?.toFixed(2)}
                                </div>
                              </td>
                              <td>
                                <span style={{
                                  color: product.quantityInStock <= 10 ? '#dc3545' : '#000'
                                }}>
                                  {product.quantityInStock}
                                </span>
                              </td>
                              <td>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  backgroundColor: product.isActive ? '#d4edda' : '#f8d7da',
                                  color: product.isActive ? '#155724' : '#721c24'
                                }}>
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="btn btn-secondary btn-small"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product.id)}
                                    className="btn btn-danger btn-small"
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
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '900px', width: '95%' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? 'Create New Product' : 'Edit Product'}
              </h2>
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="name">Product Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="productNo">Product Number</label>
                  <input
                    type="text"
                    id="productNo"
                    name="productNo"
                    className="form-control"
                    value={formData.productNo}
                    readOnly
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  required
                ></textarea>
              </div>

              {/* Simple Image Path Input */}
              <div className="form-group">
                <label htmlFor="productImage">Product Image Path</label>
                <input
                  type="text"
                  id="productImage"
                  name="productImage"
                  className="form-control"
                  value={formData.productImage}
                  onChange={handleChange}
                  placeholder="e.g., /images/product-name.jpg or C:/images/product.jpg"
                />
                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                  Enter the path to your image file on this computer
                </small>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="costPrice">Cost Price *</label>
                  <input
                    type="number"
                    id="costPrice"
                    name="costPrice"
                    className="form-control"
                    value={formData.costPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sellingPrice">Selling Price *</label>
                  <input
                    type="number"
                    id="sellingPrice"
                    name="sellingPrice"
                    className="form-control"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="quantityInStock">Quantity in Stock *</label>
                  <input
                    type="number"
                    id="quantityInStock"
                    name="quantityInStock"
                    className="form-control"
                    value={formData.quantityInStock}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profitPercentage">Profit Percentage</label>
                  <input
                    type="number"
                    id="profitPercentage"
                    name="profitPercentage"
                    className="form-control"
                    value={formData.profitPercentage}
                    readOnly
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="supplierDetailsId">Supplier *</label>
                  <select
                    id="supplierDetailsId"
                    name="supplierDetailsId"
                    className="form-control"
                    value={formData.supplierDetailsId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.supplierName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="productCategoryId">Category *</label>
                  <select
                    id="productCategoryId"
                    name="productCategoryId"
                    className="form-control"
                    value={formData.productCategoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  Active Product
                </label>
              </div>

              <div className="d-flex gap-2" style={{ marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {modalMode === 'create' ? 'Create Product' : 'Update Product'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default ProductManagement;