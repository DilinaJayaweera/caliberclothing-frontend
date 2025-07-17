import React, { useState, useEffect } from 'react';
// import './SupplierManagement.css';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    supplierNo: '',
    supplierName: '',
    country: '',
    address: '',
    contactNo: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/merchandise-manager/suppliers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const supplierData = {
      ...formData,
      isActive: true,
      createdTimestamp: editingSupplier ? editingSupplier.createdTimestamp : new Date().toISOString(),
      updatedTimestamp: new Date().toISOString()
    };

    try {
      const url = editingSupplier 
        ? `/api/merchandise-manager/suppliers/${editingSupplier.id}`
        : '/api/merchandise-manager/suppliers';
      
      const method = editingSupplier ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(supplierData)
      });

      if (response.ok) {
        fetchSuppliers();
        resetForm();
        setShowModal(false);
        alert(editingSupplier ? 'Supplier updated successfully!' : 'Supplier created successfully!');
      } else {
        alert('Error saving supplier');
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Error saving supplier');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      supplierNo: supplier.supplierNo || '',
      supplierName: supplier.supplierName || '',
      country: supplier.country || '',
      address: supplier.address || '',
      contactNo: supplier.contactNo || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      supplierNo: '',
      supplierName: '',
      country: '',
      address: '',
      contactNo: ''
    });
    setEditingSupplier(null);
  };

  const searchSuppliers = async (searchName) => {
    if (!searchName.trim()) {
      fetchSuppliers();
      return;
    }

    try {
      const response = await fetch(`/api/merchandise-manager/suppliers/search?name=${encodeURIComponent(searchName)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error searching suppliers:', error);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.supplierNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading suppliers...</div>;
  }

  return (
    <div className="supplier-management">
      <div className="header">
        <h1>Supplier Management</h1>
        <button 
          className="add-btn"
          onClick={() => setShowModal(true)}
        >
          Add New Supplier
        </button>
      </div>

      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.trim()) {
                searchSuppliers(e.target.value);
              } else {
                fetchSuppliers();
              }
            }}
            className="search-input"
          />
        </div>
        
        <div className="stats">
          <span className="stat">
            Total Suppliers: {suppliers.length}
          </span>
          <span className="stat active">
            Active: {suppliers.filter(s => s.isActive).length}
          </span>
        </div>
      </div>

      <div className="suppliers-grid">
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} className="supplier-card">
            <div className="card-header">
              <h3>{supplier.supplierName}</h3>
              <span className={`status-badge ${supplier.isActive ? 'active' : 'inactive'}`}>
                {supplier.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="card-content">
              <div className="info-row">
                <span className="label">Supplier No:</span>
                <span className="value">#{supplier.supplierNo}</span>
              </div>
              
              <div className="info-row">
                <span className="label">Country:</span>
                <span className="value">{supplier.country}</span>
              </div>
              
              <div className="info-row">
                <span className="label">Contact:</span>
                <span className="value">{supplier.contactNo}</span>
              </div>
              
              <div className="info-row address">
                <span className="label">Address:</span>
                <span className="value">{supplier.address}</span>
              </div>
              
              <div className="info-row">
                <span className="label">Created:</span>
                <span className="value">
                  {new Date(supplier.createdTimestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="card-actions">
              <button 
                className="edit-btn"
                onClick={() => handleEdit(supplier)}
              >
                Edit
              </button>
              <button className="view-btn">
                View Products
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="no-suppliers">
          No suppliers found matching your search criteria.
        </div>
      )}

      <div className="summary-section">
        <h2>Supplier Summary</h2>
        <div className="summary-cards">
          <div className="summary-card">
            <h3>By Country</h3>
            <div className="country-list">
              {[...new Set(suppliers.map(s => s.country))].map(country => (
                <div key={country} className="country-item">
                  <span className="country-name">{country}</span>
                  <span className="country-count">
                    {suppliers.filter(s => s.country === country).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="summary-card">
            <h3>Recent Activity</h3>
            <div className="recent-list">
              {suppliers
                .sort((a, b) => new Date(b.updatedTimestamp) - new Date(a.updatedTimestamp))
                .slice(0, 5)
                .map(supplier => (
                  <div key={supplier.id} className="recent-item">
                    <span className="supplier-name">{supplier.supplierName}</span>
                    <span className="update-date">
                      {new Date(supplier.updatedTimestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
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
            <form onSubmit={handleSubmit} className="supplier-form">
              <div className="form-group">
                <label>Supplier Number</label>
                <input
                  type="text"
                  name="supplierNo"
                  value={formData.supplierNo}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter supplier number"
                />
              </div>
              
              <div className="form-group">
                <label>Supplier Name</label>
                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter supplier name"
                />
              </div>
              
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter country"
                />
              </div>
              
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter contact number"
                />
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Enter full address"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
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

export default SupplierManagement;