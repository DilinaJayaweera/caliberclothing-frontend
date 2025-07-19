import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { merchandiseManagerAPI, commonAPI } from '../../services/api';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    reorderLevel: '',
    totalQuantityPurchasing: ''
  });

  const [addFormData, setAddFormData] = useState({
    productId: '',
    reorderLevel: '',
    totalQuantityPurchasing: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await merchandiseManagerAPI.getInventory();
      setInventory(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // Get all products to show which ones don't have inventory entries
      const response = await commonAPI.getProducts ? 
        await commonAPI.getProducts() : 
        await merchandiseManagerAPI.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      await merchandiseManagerAPI.updateInventoryQuantity(id, quantity);
      fetchInventory();
      setSuccess('Quantity updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Error updating quantity');
      setTimeout(() => setError(''), 3000);
    }
  };

  const updateReorderLevel = async (id, reorderLevel) => {
    try {
      await merchandiseManagerAPI.updateReorderLevel(id, reorderLevel);
      fetchInventory();
      setSuccess('Reorder level updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating reorder level:', error);
      setError('Error updating reorder level');
      setTimeout(() => setError(''), 3000);
    }
  };

  const addStock = async (productId, quantity) => {
    try {
      await merchandiseManagerAPI.addStock(productId, quantity);
      fetchInventory();
      setSuccess('Stock added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding stock:', error);
      setError('Error adding stock');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      reorderLevel: item.reorderLevel?.toString() || '',
      totalQuantityPurchasing: item.totalQuantityPurchasing?.toString() || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await Promise.all([
        updateReorderLevel(editingItem.id, parseInt(formData.reorderLevel)),
        updateQuantity(editingItem.id, parseInt(formData.totalQuantityPurchasing))
      ]);
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    
    try {
      // Create new inventory entry - you might need to add this endpoint
      const inventoryData = {
        product: { id: parseInt(addFormData.productId) },
        reorderLevel: parseInt(addFormData.reorderLevel),
        totalQuantityPurchasing: parseInt(addFormData.totalQuantityPurchasing)
      };

      // Note: You may need to add createInventory method to your API
      // For now, this will need to be implemented in your backend
      await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${localStorage.getItem('basicAuth')}`
        },
        body: JSON.stringify(inventoryData)
      });

      setSuccess('Product added to inventory successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowAddModal(false);
      resetAddForm();
      fetchInventory();
    } catch (error) {
      console.error('Error adding product to inventory:', error);
      setError('Error adding product to inventory');
      setTimeout(() => setError(''), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      reorderLevel: '',
      totalQuantityPurchasing: ''
    });
    setEditingItem(null);
  };

  const resetAddForm = () => {
    setAddFormData({
      productId: '',
      reorderLevel: '',
      totalQuantityPurchasing: ''
    });
  };

  const getStockStatus = (current, reorder) => {
    if (current <= reorder * 0.25) return 'critical';
    if (current <= reorder * 0.5) return 'low';
    if (current <= reorder) return 'warning';
    return 'good';
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.product?.productNo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterBy === 'all') return true;
    const status = getStockStatus(item.totalQuantityPurchasing, item.reorderLevel);
    return status === filterBy;
  });

  const calculateStats = () => {
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(item => 
      getStockStatus(item.totalQuantityPurchasing, item.reorderLevel) !== 'good'
    ).length;
    const criticalItems = inventory.filter(item => 
      getStockStatus(item.totalQuantityPurchasing, item.reorderLevel) === 'critical'
    ).length;
    const totalValue = inventory.reduce((sum, item) => 
      sum + (item.totalQuantityPurchasing * (item.product?.sellingPrice || 0)), 0
    );

    return { totalItems, lowStockItems, criticalItems, totalValue };
  };

  const stats = calculateStats();

  // Get products that don't have inventory entries
  const productsWithoutInventory = products.filter(product => 
    !inventory.some(inv => inv.product?.id === product.id)
  );

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading inventory...</p>
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
              <h1 className="dashboard-title">Inventory Management</h1>
              <div className="dashboard-actions">
                <Link to="/merchandise-manager/dashboard" className="btn btn-secondary">
                  ← Back to Dashboard
                </Link>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                  Add Product to Inventory
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Statistics */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-number">{stats.totalItems}</div>
                <div className="stat-label">Total Items</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: stats.criticalItems > 0 ? '#dc3545' : '#28a745' }}>
                  {stats.criticalItems}
                </div>
                <div className="stat-label">Critical Stock</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: stats.lowStockItems > 0 ? '#ffc107' : '#28a745' }}>
                  {stats.lowStockItems}
                </div>
                <div className="stat-label">Low Stock Items</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">Rs.{stats.totalValue.toFixed(2)}</div>
                <div className="stat-label">Total Inventory Value</div>
              </div>
            </div>

            {/* Filters */}
            <div className="card">
              <div className="card-body">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <input
                      type="text"
                      placeholder="Search by product name or number..."
                      className="form-control"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div style={{ minWidth: '150px' }}>
                    <select
                      className="form-control"
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                    >
                      <option value="all">All Items</option>
                      <option value="critical">Critical Stock</option>
                      <option value="low">Low Stock</option>
                      <option value="warning">Warning Level</option>
                      <option value="good">Good Stock</option>
                    </select>
                  </div>
                  {(searchTerm || filterBy !== 'all') && (
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setFilterBy('all');
                      }}
                      className="btn btn-secondary"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Inventory Items ({filteredInventory.length})</h2>
              </div>
              <div className="card-body">
                {filteredInventory.length === 0 ? (
                  <p>No inventory items found matching your criteria.</p>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Current Stock</th>
                          <th>Reorder Level</th>
                          <th>Status</th>
                          <th>Value</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInventory.map(item => {
                          const status = getStockStatus(item.totalQuantityPurchasing, item.reorderLevel);
                          const percentage = Math.round((item.totalQuantityPurchasing / item.reorderLevel) * 100);
                          const itemValue = item.totalQuantityPurchasing * (item.product?.sellingPrice || 0);

                          return (
                            <tr key={item.id}>
                              <td>
                                <div>
                                  <div style={{ fontWeight: 'bold' }}>
                                    {item.product?.name || 'Unknown Product'}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    #{item.product?.productNo}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {item.product?.productCategory?.name}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ 
                                    fontSize: '1.2rem', 
                                    fontWeight: 'bold',
                                    color: status === 'critical' ? '#dc3545' : 
                                           status === 'low' ? '#ffc107' : 
                                           status === 'warning' ? '#fd7e14' : '#28a745'
                                  }}>
                                    {item.totalQuantityPurchasing}
                                  </span>
                                  <div style={{
                                    width: '60px',
                                    height: '8px',
                                    backgroundColor: '#e9ecef',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                  }}>
                                    <div style={{
                                      width: `${Math.min(percentage, 100)}%`,
                                      height: '100%',
                                      backgroundColor: status === 'critical' ? '#dc3545' : 
                                                     status === 'low' ? '#ffc107' : 
                                                     status === 'warning' ? '#fd7e14' : '#28a745',
                                      transition: 'width 0.3s ease'
                                    }}></div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span style={{ fontSize: '1rem', fontWeight: '500' }}>
                                  {item.reorderLevel}
                                </span>
                              </td>
                              <td>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  backgroundColor: status === 'critical' ? '#f8d7da' : 
                                                 status === 'low' ? '#fff3cd' : 
                                                 status === 'warning' ? '#ffe69c' : '#d4edda',
                                  color: status === 'critical' ? '#721c24' : 
                                         status === 'low' ? '#856404' : 
                                         status === 'warning' ? '#8a6d00' : '#155724'
                                }}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)} ({percentage}%)
                                </span>
                              </td>
                              <td>
                                <span style={{ fontWeight: '600' }}>
                                  Rs.{itemValue.toFixed(2)}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <button 
                                    className="btn btn-secondary btn-small"
                                    onClick={() => handleEdit(item)}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    className="btn btn-primary btn-small"
                                    onClick={() => {
                                      const quantity = prompt('Enter quantity to add:');
                                      if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
                                        addStock(item.product.id, parseInt(quantity));
                                      }
                                    }}
                                  >
                                    Add Stock
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Status Overview */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Stock Status Overview</h3>
              </div>
              <div className="card-body">
                <div className="grid-4">
                  {['good', 'warning', 'low', 'critical'].map(status => {
                    const count = inventory.filter(item => 
                      getStockStatus(item.totalQuantityPurchasing, item.reorderLevel) === status
                    ).length;
                    const color = status === 'critical' ? '#dc3545' : 
                                 status === 'low' ? '#ffc107' : 
                                 status === 'warning' ? '#fd7e14' : '#28a745';
                    
                    return (
                      <div key={status} style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ 
                          fontSize: '2rem', 
                          color: color, 
                          marginBottom: '0.5rem' 
                        }}>
                          {count}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          {status.charAt(0).toUpperCase() + status.slice(1)} Stock
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Inventory Item</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '1.5rem' }}>
                <div className="form-group">
                  <label>Product</label>
                  <input
                    type="text"
                    value={editingItem?.product?.name || ''}
                    disabled
                    className="form-control"
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
                
                <div className="form-group">
                  <label>Current Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.totalQuantityPurchasing}
                    onChange={(e) => setFormData({
                      ...formData,
                      totalQuantityPurchasing: e.target.value
                    })}
                    min="0"
                    className="form-control"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({
                      ...formData,
                      reorderLevel: e.target.value
                    })}
                    min="1"
                    className="form-control"
                    required
                  />
                </div>

                <div className="d-flex gap-2" style={{ marginTop: '2rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Update Inventory
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add to Inventory Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h2 className="modal-title">Add Product to Inventory</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddInventory}>
              <div style={{ padding: '1.5rem' }}>
                <div className="form-group">
                  <label>Select Product</label>
                  <select
                    value={addFormData.productId}
                    onChange={(e) => setAddFormData({
                      ...addFormData,
                      productId: e.target.value
                    })}
                    className="form-control"
                    required
                  >
                    <option value="">Choose a product...</option>
                    {productsWithoutInventory.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.productNo})
                      </option>
                    ))}
                  </select>
                  {productsWithoutInventory.length === 0 && (
                    <small style={{ color: '#666' }}>
                      All products already have inventory entries
                    </small>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={addFormData.totalQuantityPurchasing}
                    onChange={(e) => setAddFormData({
                      ...addFormData,
                      totalQuantityPurchasing: e.target.value
                    })}
                    min="0"
                    className="form-control"
                    placeholder="Enter initial stock quantity"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    value={addFormData.reorderLevel}
                    onChange={(e) => setAddFormData({
                      ...addFormData,
                      reorderLevel: e.target.value
                    })}
                    min="1"
                    className="form-control"
                    placeholder="Enter reorder level"
                    required
                  />
                </div>

                <div className="d-flex gap-2" style={{ marginTop: '2rem' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                    disabled={productsWithoutInventory.length === 0}
                  >
                    Add to Inventory
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setShowAddModal(false);
                      resetAddForm();
                    }}
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

export default InventoryManagement;