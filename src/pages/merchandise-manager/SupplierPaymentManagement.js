import React, { useState, useEffect } from 'react';
// import './SupplierPaymentManagement.css';

const SupplierPaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [formData, setFormData] = useState({
    paymentDate: '',
    amountPaid: '',
    referenceNo: '',
    remarks: '',
    purchaseDetails: { id: '' }
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/merchandise-manager/supplier-payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentsByDateRange = async () => {
    if (!dateFilter.startDate || !dateFilter.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    try {
      const response = await fetch(
        `/api/merchandise-manager/supplier-payments/date-range?startDate=${dateFilter.startDate}T00:00:00&endDate=${dateFilter.endDate}T23:59:59`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments by date range:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'purchaseDetailsId') {
      setFormData({
        ...formData,
        purchaseDetails: { id: parseInt(value) }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const paymentData = {
      ...formData,
      amountPaid: parseFloat(formData.amountPaid),
      paymentDate: new Date(formData.paymentDate).toISOString()
    };

    try {
      const url = editingPayment 
        ? `/api/merchandise-manager/supplier-payments/${editingPayment.id}`
        : '/api/merchandise-manager/supplier-payments';
      
      const method = editingPayment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        fetchPayments();
        resetForm();
        setShowModal(false);
        alert(editingPayment ? 'Payment updated successfully!' : 'Payment created successfully!');
      } else {
        alert('Error saving payment');
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Error saving payment');
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
      amountPaid: payment.amountPaid?.toString() || '',
      referenceNo: payment.referenceNo || '',
      remarks: payment.remarks || '',
      purchaseDetails: { id: payment.purchaseDetails?.id || '' }
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      paymentDate: '',
      amountPaid: '',
      referenceNo: '',
      remarks: '',
      purchaseDetails: { id: '' }
    });
    setEditingPayment(null);
  };

  const getTotalAmount = () => {
    return payments.reduce((total, payment) => total + (payment.amountPaid || 0), 0);
  };

  const getPaymentsThisMonth = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
  };

  if (loading) {
    return <div className="loading">Loading supplier payments...</div>;
  }

  return (
    <div className="supplier-payment-management">
      <div className="header">
        <h1>Supplier Payment Management</h1>
        <button 
          className="add-btn"
          onClick={() => setShowModal(true)}
        >
          Add New Payment
        </button>
      </div>

      <div className="controls">
        <div className="date-filter">
          <label>Filter by Date Range:</label>
          <div className="date-inputs">
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
              className="date-input"
            />
            <span>to</span>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
              className="date-input"
            />
            <button 
              className="filter-btn"
              onClick={fetchPaymentsByDateRange}
            >
              Filter
            </button>
            <button 
              className="clear-btn"
              onClick={() => {
                setDateFilter({startDate: '', endDate: ''});
                fetchPayments();
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Payments:</span>
            <span className="stat-value">{payments.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Amount:</span>
            <span className="stat-value">${getTotalAmount().toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">This Month:</span>
            <span className="stat-value">{getPaymentsThisMonth().length}</span>
          </div>
        </div>
      </div>

      <div className="payments-table">
        <div className="table-header">
          <div className="header-cell">Payment Date</div>
          <div className="header-cell">Amount</div>
          <div className="header-cell">Reference No</div>
          <div className="header-cell">Purchase Details</div>
          <div className="header-cell">Actions</div>
        </div>

        <div className="table-body">
          {payments.map(payment => (
            <div key={payment.id} className="table-row">
              <div className="cell date-cell">
                <span className="date">
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </span>
                <span className="time">
                  {new Date(payment.paymentDate).toLocaleTimeString()}
                </span>
              </div>

              <div className="cell amount-cell">
                <span className="amount">${payment.amountPaid?.toFixed(2)}</span>
              </div>

              <div className="cell reference-cell">
                <span className="reference">{payment.referenceNo}</span>
              </div>

              <div className="cell purchase-cell">
                <div className="purchase-info">
                  <span className="purchase-no">
                    #{payment.purchaseDetails?.purchaseNumber || 'N/A'}
                  </span>
                  <span className="purchase-date">
                    {payment.purchaseDetails?.date ? 
                      new Date(payment.purchaseDetails.date).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="supplier">
                    {payment.purchaseDetails?.supplierDetails?.supplierName || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="cell actions-cell">
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(payment)}
                >
                  Edit
                </button>
                <button className="view-btn">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {payments.length === 0 && (
        <div className="no-payments">
          No supplier payments found.
        </div>
      )}

      <div className="monthly-summary">
        <h2>Monthly Payment Summary</h2>
        <div className="monthly-stats">
          <div className="month-stat">
            <h4>This Month</h4>
            <div className="month-details">
              <span>Payments: {getPaymentsThisMonth().length}</span>
              <span>Amount: ${getPaymentsThisMonth().reduce((total, p) => total + (p.amountPaid || 0), 0).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="month-stat">
            <h4>Average Payment</h4>
            <div className="month-details">
              <span>
                ${payments.length > 0 ? (getTotalAmount() / payments.length).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingPayment ? 'Edit Payment' : 'Add New Payment'}</h2>
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
            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-group">
                <label>Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Amount Paid</label>
                <input
                  type="number"
                  step="0.01"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleInputChange}
                  required
                  placeholder="0.00"
                />
              </div>
              
              <div className="form-group">
                <label>Reference Number</label>
                <input
                  type="text"
                  name="referenceNo"
                  value={formData.referenceNo}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter reference number"
                />
              </div>
              
              <div className="form-group">
                <label>Purchase Details ID</label>
                <input
                  type="number"
                  name="purchaseDetailsId"
                  value={formData.purchaseDetails.id}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter purchase details ID"
                />
              </div>
              
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter any additional remarks"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingPayment ? 'Update Payment' : 'Create Payment'}
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

export default SupplierPaymentManagement;