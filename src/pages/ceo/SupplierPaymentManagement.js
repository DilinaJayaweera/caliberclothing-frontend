import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { ceoAPI } from '../../services/api';

const SupplierPaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  
  const [formData, setFormData] = useState({
    paymentDate: '',
    amountPaid: '',
    referenceNo: '',
    remarks: '',
    purchaseDetailsId: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchSuppliers();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await ceoAPI.getSupplierPayments();
      setPayments(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching supplier payments:', error);
      setError('Failed to fetch supplier payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await ceoAPI.getSuppliers();
      setSuppliers(response.data.filter(s => s.isActive));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      paymentDate: '',
      amountPaid: '',
      referenceNo: '',
      remarks: '',
      purchaseDetailsId: ''
    });
  };

  const handleCreate = () => {
    resetForm();
    setModalMode('create');
    setSelectedPayment(null);
    setShowModal(true);
  };

  const handleEdit = (payment) => {
    setFormData({
      paymentDate: payment.paymentDate ? payment.paymentDate.split('T')[0] : '',
      amountPaid: payment.amountPaid?.toString() || '',
      referenceNo: payment.referenceNo || '',
      remarks: payment.remarks || '',
      purchaseDetailsId: payment.purchaseDetails?.id || ''
    });
    setModalMode('edit');
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const handleDelete = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await ceoAPI.deleteSupplierPayment(paymentId);
        setSuccess('Payment record deleted successfully');
        fetchPayments();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting payment:', error);
        setError('Failed to delete payment record');
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
    
    if (!formData.paymentDate) errors.push('Payment date is required');
    if (!formData.amountPaid || parseFloat(formData.amountPaid) <= 0) errors.push('Valid amount is required');
    if (!formData.referenceNo.trim()) errors.push('Reference number is required');
    
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
      const paymentData = {
        paymentDate: new Date(formData.paymentDate).toISOString(),
        amountPaid: parseFloat(formData.amountPaid),
        referenceNo: formData.referenceNo,
        remarks: formData.remarks || null,
        purchaseDetails: formData.purchaseDetailsId ? { id: parseInt(formData.purchaseDetailsId) } : null
      };

      if (modalMode === 'create') {
        await ceoAPI.createSupplierPayment(paymentData);
        setSuccess('Payment record created successfully');
      } else {
        await ceoAPI.updateSupplierPayment(selectedPayment.id, paymentData);
        setSuccess('Payment record updated successfully');
      }

      setShowModal(false);
      fetchPayments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving payment:', error);
      setError(error.response?.data?.message || 'Failed to save payment record');
    }
  };

  // Filter payments based on search criteria
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchQuery || 
      payment.referenceNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.purchaseDetails?.supplierDetails?.supplierName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = !dateFilter || 
      new Date(payment.paymentDate).toDateString() === new Date(dateFilter).toDateString();
    
    const matchesSupplier = !supplierFilter || 
      payment.purchaseDetails?.supplierDetails?.id.toString() === supplierFilter;
    
    return matchesSearch && matchesDate && matchesSupplier;
  });

  const calculateStats = () => {
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
    const thisMonthPayments = filteredPayments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    });
    const thisMonthAmount = thisMonthPayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);

    return {
      total: filteredPayments.length,
      totalAmount: totalAmount,
      thisMonthCount: thisMonthPayments.length,
      thisMonthAmount: thisMonthAmount
    };
  };

  const stats = calculateStats();

  return (
    <div>
      <Header />
      
      <main className="content-container">
        <div className="container">
          <div className="dashboard">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Supplier Payment Management</h1>
              <div className="dashboard-actions">
                <Link to="/ceo/dashboard" className="btn btn-secondary">
                  ← Back to Dashboard
                </Link>
                <button onClick={handleCreate} className="btn btn-primary">
                  Add New Payment
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Statistics */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Payments</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">${stats.totalAmount.toLocaleString()}</div>
                <div className="stat-label">Total Amount</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.thisMonthCount}</div>
                <div className="stat-label">This Month</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">${stats.thisMonthAmount.toLocaleString()}</div>
                <div className="stat-label">This Month Amount</div>
              </div>
            </div>

            {/* Filters */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Filter Payments</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <input
                      type="text"
                      placeholder="Search by reference number or supplier name..."
                      className="form-control"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div style={{ minWidth: '150px' }}>
                    <select
                      className="form-control"
                      value={supplierFilter}
                      onChange={(e) => setSupplierFilter(e.target.value)}
                    >
                      <option value="">All Suppliers</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ minWidth: '150px' }}>
                    <input
                      type="date"
                      className="form-control"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                  {(searchQuery || supplierFilter || dateFilter) && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setSupplierFilter('');
                        setDateFilter('');
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
                <p>Loading supplier payments...</p>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Payment Records ({filteredPayments.length})</h2>
                </div>
                <div className="card-body">
                  {filteredPayments.length === 0 ? (
                    <p>No payment records found.</p>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Payment Date</th>
                            <th>Supplier</th>
                            <th>Reference No</th>
                            <th>Amount</th>
                            <th>Purchase Details</th>
                            <th>Remarks</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPayments.map(payment => (
                            <tr key={payment.id}>
                              <td>
                                <div>
                                  {payment.paymentDate ? 
                                    new Date(payment.paymentDate).toLocaleDateString() : 
                                    'N/A'
                                  }
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  {payment.paymentDate ? 
                                    new Date(payment.paymentDate).toLocaleTimeString() : 
                                    ''
                                  }
                                </div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 'bold' }}>
                                  {payment.purchaseDetails?.supplierDetails?.supplierName || 'N/A'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  {payment.purchaseDetails?.supplierDetails?.country}
                                </div>
                              </td>
                              <td>
                                <strong>{payment.referenceNo}</strong>
                              </td>
                              <td>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                  ${payment.amountPaid?.toLocaleString()}
                                </div>
                              </td>
                              <td>
                                <div>
                                  {payment.purchaseDetails?.purchaseNumber || 'N/A'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  {payment.purchaseDetails?.product}
                                </div>
                              </td>
                              <td>
                                <div style={{ maxWidth: '200px', fontSize: '0.9rem' }}>
                                  {payment.remarks || '-'}
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => handleEdit(payment)}
                                    className="btn btn-secondary btn-small"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(payment.id)}
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
          <div className="modal" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? 'Add New Payment Record' : 'Edit Payment Record'}
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
                  <label htmlFor="paymentDate">Payment Date *</label>
                  <input
                    type="date"
                    id="paymentDate"
                    name="paymentDate"
                    className="form-control"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="amountPaid">Amount Paid *</label>
                  <input
                    type="number"
                    id="amountPaid"
                    name="amountPaid"
                    className="form-control"
                    value={formData.amountPaid}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="referenceNo">Reference Number *</label>
                <input
                  type="text"
                  id="referenceNo"
                  name="referenceNo"
                  className="form-control"
                  value={formData.referenceNo}
                  onChange={handleChange}
                  required
                  placeholder="e.g., PAY001, TXN123456"
                />
              </div>

              <div className="form-group">
                <label htmlFor="purchaseDetailsId">Purchase Details (Optional)</label>
                <input
                  type="number"
                  id="purchaseDetailsId"
                  name="purchaseDetailsId"
                  className="form-control"
                  value={formData.purchaseDetailsId}
                  onChange={handleChange}
                  placeholder="Purchase Details ID"
                />
                <small className="text-muted">
                  Enter the purchase details ID if this payment is for a specific purchase
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="remarks">Remarks</label>
                <textarea
                  id="remarks"
                  name="remarks"
                  className="form-control"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Additional notes or comments about this payment..."
                ></textarea>
              </div>

              <div className="d-flex gap-2" style={{ marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {modalMode === 'create' ? 'Add Payment' : 'Update Payment'}
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

export default SupplierPaymentManagement;