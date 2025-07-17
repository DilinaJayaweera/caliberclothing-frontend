import React, { useState, useEffect } from 'react';
// import './LowStockNotifications.css';

const LowStockNotifications = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('stock');

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      const response = await fetch('/api/merchandise-manager/notifications/low-stock', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLowStockItems(data);
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsReordered = async (productId) => {
    try {
      const response = await fetch(`/api/merchandise-manager/notifications/mark-reordered/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        alert('Product marked as reordered successfully!');
        fetchLowStockItems();
      }
    } catch (error) {
      console.error('Error marking product as reordered:', error);
      alert('Error marking product as reordered');
    }
  };

  const getStockLevel = (current, reorder) => {
    const percentage = (current / reorder) * 100;
    if (percentage <= 25) return 'critical';
    if (percentage <= 50) return 'low';
    return 'warning';
  };

  const filteredItems = lowStockItems.filter(item => {
    if (filter === 'all') return true;
    const level = getStockLevel(item.totalQuantityPurchasing, item.reorderLevel);
    return level === filter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'stock':
        return a.totalQuantityPurchasing - b.totalQuantityPurchasing;
      case 'name':
        return (a.product?.name || '').localeCompare(b.product?.name || '');
      case 'reorder':
        return a.reorderLevel - b.reorderLevel;
      default:
        return 0;
    }
  });

  if (loading) {
    return <div className="loading">Loading low stock notifications...</div>;
  }

  return (
    <div className="low-stock-notifications">
      <div className="header">
        <h1>Low Stock Notifications</h1>
        <div className="header-info">
          <span className="total-count">{lowStockItems.length} items need attention</span>
        </div>
      </div>

      <div className="controls">
        <div className="filters">
          <label>Filter by Level:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Items</option>
            <option value="critical">Critical (≤25%)</option>
            <option value="low">Low (≤50%)</option>
            <option value="warning">Warning (≤100%)</option>
          </select>
        </div>
        
        <div className="sort">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="stock">Current Stock</option>
            <option value="name">Product Name</option>
            <option value="reorder">Reorder Level</option>
          </select>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item critical">
          <span className="color-box"></span>
          Critical (≤25% of reorder level)
        </div>
        <div className="legend-item low">
          <span className="color-box"></span>
          Low (≤50% of reorder level)
        </div>
        <div className="legend-item warning">
          <span className="color-box"></span>
          Warning (≤100% of reorder level)
        </div>
      </div>

      {sortedItems.length > 0 ? (
        <div className="notifications-grid">
          {sortedItems.map(item => {
            const stockLevel = getStockLevel(item.totalQuantityPurchasing, item.reorderLevel);
            const percentage = Math.round((item.totalQuantityPurchasing / item.reorderLevel) * 100);
            
            return (
              <div key={item.id} className={`notification-card ${stockLevel}`}>
                <div className="card-header">
                  <h3>{item.product?.name || 'Unknown Product'}</h3>
                  <span className={`status-badge ${stockLevel}`}>
                    {stockLevel.toUpperCase()}
                  </span>
                </div>
                
                <div className="card-content">
                  <div className="stock-info">
                    <div className="stock-row">
                      <span className="label">Current Stock:</span>
                      <span className="value">{item.totalQuantityPurchasing}</span>
                    </div>
                    <div className="stock-row">
                      <span className="label">Reorder Level:</span>
                      <span className="value">{item.reorderLevel}</span>
                    </div>
                    <div className="stock-row">
                      <span className="label">Stock Percentage:</span>
                      <span className={`value percentage ${stockLevel}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${stockLevel}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>

                  {item.product && (
                    <div className="product-details">
                      <div className="detail-row">
                        <span className="label">Product ID:</span>
                        <span className="value">#{item.product.id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Category:</span>
                        <span className="value">
                          {item.product.productCategory?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Supplier:</span>
                        <span className="value">
                          {item.product.supplierDetails?.supplierName || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button 
                    className="reorder-btn"
                    onClick={() => markAsReordered(item.product?.id)}
                  >
                    Mark as Reordered
                  </button>
                  <button className="details-btn">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-notifications">
          {filter === 'all' ? (
            <div>
              <h3>No Low Stock Items</h3>
              <p>All products are currently above their reorder levels.</p>
            </div>
          ) : (
            <div>
              <h3>No Items Found</h3>
              <p>No products match the selected filter criteria.</p>
            </div>
          )}
        </div>
      )}

      <div className="summary">
        <h3>Summary</h3>
        <div className="summary-stats">
          <div className="summary-item">
            <span className="summary-label">Total Low Stock Items:</span>
            <span className="summary-value">{lowStockItems.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Critical Items:</span>
            <span className="summary-value critical">
              {lowStockItems.filter(item => 
                getStockLevel(item.totalQuantityPurchasing, item.reorderLevel) === 'critical'
              ).length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Low Stock Items:</span>
            <span className="summary-value low">
              {lowStockItems.filter(item => 
                getStockLevel(item.totalQuantityPurchasing, item.reorderLevel) === 'low'
              ).length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Warning Items:</span>
            <span className="summary-value warning">
              {lowStockItems.filter(item => 
                getStockLevel(item.totalQuantityPurchasing, item.reorderLevel) === 'warning'
              ).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowStockNotifications;