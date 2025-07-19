import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { productManagerAPI } from '../../services/api';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await productManagerAPI.getCategories();
      setCategories(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
  };

  const handleCreate = () => {
    resetForm();
    setModalMode('create');
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name || '',
      description: category.description || ''
    });
    setModalMode('edit');
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await productManagerAPI.deleteCategory(categoryId);
        setSuccess('Category deleted successfully');
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Failed to delete category. It may be in use by products.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Category name is required');
    if (formData.name.trim().length < 2) errors.push('Category name must be at least 2 characters');
    
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
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim()
      };

      if (modalMode === 'create') {
        await productManagerAPI.createCategory(categoryData);
        setSuccess('Category created successfully');
      } else {
        await productManagerAPI.updateCategory(selectedCategory.id, categoryData);
        setSuccess('Category updated successfully');
      }

      setShowModal(false);
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.response?.data?.message || 'Failed to save category');
    }
  };

  const filteredCategories = categories.filter(category => {
    return !searchQuery || 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div>
      <Header />
      
      <main className="content-container">
        <div className="container">
          <div className="dashboard">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Category Management</h1>
              <div className="dashboard-actions">
                <Link to="/product-manager/dashboard" className="btn btn-secondary">
                  ← Back to Dashboard
                </Link>
                <button onClick={handleCreate} className="btn btn-primary">
                  Add New Category
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Search Filter */}
            <div className="card">
              <div className="card-body">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <input
                      type="text"
                      placeholder="Search categories..."
                      className="form-control"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="btn btn-secondary"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading categories...</p>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Categories ({filteredCategories.length})</h2>
                </div>
                <div className="card-body">
                  {filteredCategories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                      {searchQuery ? 'No categories found matching your search.' : 'No categories found. Create your first category!'}
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Category Name</th>
                            <th>Description</th>
                            <th>Products Count</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCategories.map(category => (
                            <tr key={category.id}>
                              <td>
                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                  {category.name}
                                </div>
                              </td>
                              <td>
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                  {category.description || 'No description'}
                                </div>
                              </td>
                              <td>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  backgroundColor: '#e3f2fd',
                                  color: '#1976d2',
                                  fontSize: '0.875rem',
                                  fontWeight: '500'
                                }}>
                                  {category.productCount || 0} products
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => handleEdit(category)}
                                    className="btn btn-secondary btn-small"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(category.id)}
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

            {/* Category Statistics */}
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-header">
                <h3 className="card-title">Category Overview</h3>
              </div>
              <div className="card-body">
                <div className="grid-3">
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '2rem', color: '#1976d2', marginBottom: '0.5rem' }}>
                      📂
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {categories.length}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      Total Categories
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '2rem', color: '#388e3c', marginBottom: '0.5rem' }}>
                      📦
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      Total Products
                    </div>
                  </div>
                  
                  {/* <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '2rem', color: '#f57c00', marginBottom: '0.5rem' }}>
                      📊
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {categories.length > 0 ? Math.round(categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0) / categories.length) : 0}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      Avg Products/Category
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? 'Create New Category' : 'Edit Category'}
              </h2>
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '1.5rem' }}>
                <div className="form-group">
                  <label htmlFor="name">Category Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter category name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter category description (optional)"
                  ></textarea>
                </div>

                <div className="d-flex gap-2" style={{ marginTop: '2rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {modalMode === 'create' ? 'Create Category' : 'Update Category'}
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
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default CategoryManagement;