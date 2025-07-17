import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { supplierService } from '../../services/supplierService';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    productNo: '',
    name: '',
    description: '',
    productImage: '',
    costPrice: '',
    sellingPrice: '',
    quantityInStock: '',
    profitPercentage: '',
    categoryId: '',
    supplierId: '',
    isActive: true
  });

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!product;

  useEffect(() => {
    loadCategories();
    loadSuppliers();
    
    if (isEditing) {
      populateFormData();
    } else {
      generateProductNo();
    }
  }, [product]);

  const loadCategories = async () => {
    try {
      const categoriesData = await productService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const suppliersData = await supplierService.getAllSuppliers();
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const generateProductNo = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const productNo = `PRD${timestamp}${random}`;
    setFormData(prev => ({ ...prev, productNo }));
  };

  const populateFormData = () => {
    if (product) {
      setFormData({
        productNo: product.productNo || '',
        name: product.name || '',
        description: product.description || '',
        productImage: product.productImage || '',
        costPrice: product.costPrice || '',
        sellingPrice: product.sellingPrice || '',
        quantityInStock: product.quantityInStock || '',
        profitPercentage: product.profitPercentage || '',
        categoryId: product.productCategory?.id || '',
        supplierId: product.supplierDetails?.id || '',
        isActive: product.isActive !== undefined ? product.isActive : true
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');

    // Auto-calculate profit percentage when cost or selling price changes
    if (name === 'costPrice' || name === 'sellingPrice') {
      calculateProfitPercentage(name, value);
    }
  };

  const calculateProfitPercentage = (changedField, changedValue) => {
    const costPrice = changedField === 'costPrice' ? parseFloat(changedValue) || 0 : parseFloat(formData.costPrice) || 0;
    const sellingPrice = changedField === 'sellingPrice' ? parseFloat(changedValue) || 0 : parseFloat(formData.sellingPrice) || 0;
    
    if (costPrice > 0 && sellingPrice > 0) {
      const profit = sellingPrice - costPrice;
      const profitPercentage = (profit / costPrice) * 100;
      setFormData(prev => ({
        ...prev,
        profitPercentage: profitPercentage.toFixed(2)
      }));
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) errors.push('Product name is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      errors.push('Valid cost price is required');
    }
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      errors.push('Valid selling price is required');
    }
    if (parseFloat(formData.sellingPrice) <= parseFloat(formData.costPrice)) {
      errors.push('Selling price must be greater than cost price');
    }
    if (!formData.quantityInStock || parseInt(formData.quantityInStock) < 0) {
      errors.push('Valid quantity is required');
    }
    if (!formData.categoryId) errors.push('Category is required');
    if (!formData.supplierId) errors.push('Supplier is required');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const productData = {
        productNo: formData.productNo,
        name: formData.name,
        description: formData.description,
        productImage: formData.productImage || null,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        quantityInStock: parseInt(formData.quantityInStock),
        profitPercentage: parseFloat(formData.profitPercentage),
        isActive: formData.isActive,
        createdTimestamp: isEditing ? undefined : new Date().toISOString(),
        updatedTimestamp: isEditing ? new Date().toISOString() : undefined,
        productCategory: { id: parseInt(formData.categoryId) },
        supplierDetails: { id: parseInt(formData.supplierId) }
      };

      if (isEditing) {
        await productService.updateProduct(product.id, productData);
      } else {
        await productService.createProduct(productData);
      }

      onSave();
    } catch (error) {
      setError(error.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-form">
      <div className="modal-header">
        <h2>{isEditing ? 'Edit Product' : 'Create New Product'}</h2>
        <button onClick={onCancel} className="modal-close">×</button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="productNo">Product Number *</label>
              <input
                type="text"
                id="productNo"
                name="productNo"
                value={formData.productNo}
                onChange={handleChange}
                required
                readOnly={isEditing}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="productImage">Product Image URL</label>
            <input
              type="url"
              id="productImage"
              name="productImage"
              value={formData.productImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="form-input"
            />
          </div>
        </div>

        {/* Pricing Information */}
        <div className="form-section">
          <h3>Pricing Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="costPrice">Cost Price *</label>
              <input
                type="number"
                id="costPrice"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sellingPrice">Selling Price *</label>
              <input
                type="number"
                id="sellingPrice"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profitPercentage">Profit Percentage</label>
              <input
                type="number"
                id="profitPercentage"
                name="profitPercentage"
                value={formData.profitPercentage}
                readOnly
                step="0.01"
                className="form-input"
                style={{ backgroundColor: '#f8f9fa' }}
              />
              <small>Automatically calculated</small>
            </div>
          </div>
        </div>

        {/* Inventory Information */}
        <div className="form-section">
          <h3>Inventory Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantityInStock">Quantity in Stock *</label>
              <input
                type="number"
                id="quantityInStock"
                name="quantityInStock"
                value={formData.quantityInStock}
                onChange={handleChange}
                required
                min="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">Category *</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="supplierId">Supplier *</label>
              <select
                id="supplierId"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.supplierName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isEditing && (
            <div className="form-group">
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                Active Product
              </label>
            </div>
          )}
        </div>

        {/* Preview */}
        {formData.productImage && (
          <div className="form-section">
            <h3>Image Preview</h3>
            <div className="image-preview">
              <img 
                src={formData.productImage} 
                alt="Product preview"
                style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;