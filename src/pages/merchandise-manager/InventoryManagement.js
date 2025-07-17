import React, { useState, useEffect } from 'react';
// import './InventoryManagement.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    reorderLevel: '',
    totalQuantityPurchasing: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/merchandise-manager/inventory', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      const response = await fetch(`/api/merchandise-manager/inventory/${id}/quantity?quantity=${quantity}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchInventory();
        alert('Quantity updated successfully!');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating quantity');
    }
  };

  const updateReorderLevel = async (id, reorderLevel) => {
    try {
      const response = await fetch(`/api/merchandise-manager/inventory/${id}/reorder-level?reorderLevel=${reorderLevel}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchInventory();
        alert('Reorder level updated successfully!');
      }
    } catch (error) {
      console.error('Error updating reorder level:', error);
      alert('Error updating reorder level');
    }
  };

  const addStock = async (productId, quantity) => {
    try {
      const response = await fetch(`/api/merchandise-manager/inventory/add-stock/${productId}?quantity=${quantity}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchInventory();
        alert('Stock added successfully!');
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Error adding stock');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      reorderLevel: item.reorderLevel.toString(),
      totalQuantityPurchasing: item.totalQuantityPurchasing.toString()
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      // Update reorder level
      await updateReorderLevel(editingItem.id, parseInt(formData.reorderLevel));
      // Update quantity
      await updateQuantity(editingItem.id, parseInt(formData.totalQuantityPurchasing));
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      reorderLevel: '',
      totalQuantityPurchasing: ''
    });
    setEditingItem(null);
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

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div className="inventory-management">
      <div className="header">
        <h1>Inventory Management</h1>
        <div className="header-stats">
          <span className="stat">
            Total Items: {inventory.length}
          </span>
          <span className="stat critical">
            Low Stock: {inventory.filter(item => 
              getStockStatus(item.totalQuantityPurchasing, item.reorderLevel) !== 'good'
            ).length}
          </span>
        </div>
      </div>

      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by product name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Items</option>
            <option value="critical">Critical Stock</option>
            <option value="low">Low Stock</option>
            <option value="warning">Warning Level</option>
            <option value="good">Good Stock</option>
          </select>
        </div>
      </div>

      <div className="inventory-table">
        <div className="table-header">
          <div className="header-cell">Product</div>
          <div className="header-cell">Current Stock</div>
          <div className="header-cell">Reorder Level</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>

        <div className="table-body">
          {filteredInventory.map(item => {
            const status = getStockStatus(item.totalQuantityPurchasing, item.reorderLevel);
            const percentage = Math.round((item.totalQuantityPurchasing / item.reorderLevel) * 100);

            return (
              <div key={item.id} className={`table-row ${status}`}>
                <div className="cell product-cell">
                  <div className="product-info">
                    <h4>{item.product?.name || 'Unknown Product'}</h4>
                    <p>#{item.product?.productNo}</p>
                    <p className="category">{item.product?.productCategory?.name}</p>
                  </div>
                </div>

                <div className="cell stock-cell">
                  <div className="stock-info">
                    <span className="stock-number">{item.totalQuantityPurchasing}</span>
                    <div className="stock-bar">
                      <div 
                        className={`stock-fill ${status}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="cell reorder-cell">
                  <span className="reorder-number">{item.reorderLevel}</span>
                </div>

                <div className="cell status-cell">
                  <span className={`status-badge ${status}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  <span className="percentage">{percentage}%</span>
                </div>

                <div className="cell actions-cell">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button 
                    className="add-stock-btn"
                    onClick={() => {
                      const quantity = prompt('Enter quantity to add:');
                      if (quantity && !isNaN(quantity) && quantity > 0) {
                        addStock(item.product.id, parseInt(quantity));
                      }
                    }}
                  >
                    Add Stock
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredInventory.length === 0 && (
        <div className="no-items">
          No inventory items found matching your criteria.
        </div>
      )}

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Stock Status Overview</h3>
          <div className="status-grid">
            <div className="status-item good">
              <span className="count">
                {inventory.filter(item => 
                  getStockStatus(item.totalQuantityPurchasing, item.reorderLevel) === 'good'
                ).length}
              </span>
              <span className="label">Good Stock</span>
            </div>
            <div className="status-item warning">
              <span className="count">
                {inventory.filter(item => 
                  getStockStatus(item.totalQuantityPurchasing, item.reorderLevel) === 'warning'
                ).length}
              </span>
              <span className="label">Warning</span>
            </div>
            <div className="status-item low">
              <span className="count">
                {inventory.filter(item => 
                  getStockStatus(item.totalQuantityPurchasing, item.reorderLevel) === 'low'
                ).length}
              </span>
              <span className="label">Low Stock</span>
            </div>
            <div className="status-item critical">
              <span className="count">
                {inventory.filter(item => 
                  getStockStatus(item.totalQuantityPurchasing, item.reorderLevel) === 'critical'
                ).length}
              </span>
              <span className="label">Critical</span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Inventory Item</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="inventory-form">
              <div className="form-group">
                <label>Product</label>
                <input
                  type="text"
                  value={editingItem?.product?.name || ''}
                  disabled
                  className="disabled-input"
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
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Update Inventory
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;