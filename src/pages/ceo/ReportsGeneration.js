import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { ceoAPI } from '../../services/api';

const ReportsGeneration = () => {
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportParams, setReportParams] = useState({
    period: 'month',
    startDate: '',
    endDate: '',
    limit: 10
  });

  useEffect(() => {
    // Set default date range for current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setReportParams(prev => ({
      ...prev,
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    }));
  }, []);

  const availableReports = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Comprehensive sales analysis including revenue, orders, and growth metrics',
      icon: '📊',
      requiresDateRange: true
    },
    {
      id: 'customer-growth',
      title: 'Customer Growth Report',
      description: 'Customer registration trends and growth analysis',
      icon: '👥',
      requiresDateRange: false
    },
    {
      id: 'most-sold-products',
      title: 'Most Sold Products',
      description: 'Top performing products by quantity and revenue',
      icon: '🏆',
      requiresDateRange: true
    },
    {
      id: 'revenue-analysis',
      title: 'Revenue Analysis',
      description: 'Detailed revenue breakdown and trends analysis',
      icon: '💰',
      requiresDateRange: true
    },
    {
      id: 'inventory-status',
      title: 'Inventory Status Report',
      description: 'Current inventory levels, low stock alerts, and valuation',
      icon: '📦',
      requiresDateRange: false
    },
    {
      id: 'order-status-distribution',
      title: 'Order Status Distribution',
      description: 'Analysis of order statuses and completion rates',
      icon: '📋',
      requiresDateRange: true
    },
    {
      id: 'supplier-performance',
      title: 'Supplier Performance',
      description: 'Supplier reliability and performance metrics',
      icon: '🏭',
      requiresDateRange: true
    },
    {
      id: 'customer-demographics',
      title: 'Customer Demographics',
      description: 'Customer distribution by age, location, and registration patterns',
      icon: '🎯',
      requiresDateRange: false
    }
  ];

  const generateReport = async (reportType) => {
    setLoading(true);
    setError('');
    setActiveReport(reportType);

    try {
      let response;
      const params = {
        period: reportParams.period,
        startDate: reportParams.startDate,
        endDate: reportParams.endDate,
        limit: reportParams.limit
      };

      switch (reportType) {
        case 'sales':
          response = await ceoAPI.getSalesReport(params);
          break;
        case 'customer-growth':
          response = await ceoAPI.getCustomerGrowthReport({ period: reportParams.period });
          break;
        case 'most-sold-products':
          response = await ceoAPI.getMostSoldProductsReport(params);
          break;
        case 'revenue-analysis':
          response = await ceoAPI.getRevenueAnalysisReport(params);
          break;
        case 'inventory-status':
          response = await ceoAPI.getInventoryStatusReport();
          break;
        case 'order-status-distribution':
          response = await ceoAPI.getOrderStatusDistributionReport({ period: reportParams.period });
          break;
        case 'supplier-performance':
          response = await ceoAPI.getSupplierPerformanceReport({ period: reportParams.period });
          break;
        case 'customer-demographics':
          response = await ceoAPI.getCustomerDemographicsReport();
          break;
        default:
          throw new Error('Invalid report type');
      }

      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setReportParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${parseFloat(value).toFixed(1)}%`;
  };

  const renderReportContent = () => {
    if (!reportData || !activeReport) return null;

    switch (activeReport) {
      case 'sales':
        return (
          <div className="report-content">
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <h3>Sales Summary</h3>
                </div>
                <div className="card-body">
                  <div className="stat-item">
                    <span>Total Sales:</span>
                    <strong>{formatCurrency(reportData.totalSales)}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Total Orders:</span>
                    <strong>{reportData.totalOrders}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Average Order Value:</span>
                    <strong>{formatCurrency(reportData.averageOrderValue)}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Growth Rate:</span>
                    <strong style={{ color: reportData.growthRate >= 0 ? '#28a745' : '#dc3545' }}>
                      {formatPercentage(reportData.growthRate)}
                    </strong>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <h3>Period Comparison</h3>
                </div>
                <div className="card-body">
                  <div className="stat-item">
                    <span>Previous Period Sales:</span>
                    <strong>{formatCurrency(reportData.previousPeriodSales)}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Sales Difference:</span>
                    <strong style={{ color: reportData.totalSales >= reportData.previousPeriodSales ? '#28a745' : '#dc3545' }}>
                      {formatCurrency(reportData.totalSales - reportData.previousPeriodSales)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {reportData.salesByDate && Object.keys(reportData.salesByDate).length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3>Daily Sales Breakdown</h3>
                </div>
                <div className="card-body">
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Sales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(reportData.salesByDate)
                          .sort(([a], [b]) => new Date(b) - new Date(a))
                          .slice(0, 10)
                          .map(([date, sales]) => (
                          <tr key={date}>
                            <td>{new Date(date).toLocaleDateString()}</td>
                            <td>{formatCurrency(sales)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'customer-growth':
        return (
          <div className="report-content">
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <h3>Customer Statistics</h3>
                </div>
                <div className="card-body">
                  <div className="stat-item">
                    <span>New Customers:</span>
                    <strong>{reportData.newCustomers}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Total Customers:</span>
                    <strong>{reportData.totalCustomers}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Growth Rate:</span>
                    <strong>{formatPercentage(reportData.growthRate)}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Retention Rate:</span>
                    <strong>{formatPercentage(reportData.retentionRate)}</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Registration Timeline</h3>
                </div>
                <div className="card-body">
                  {reportData.customersByDate && Object.entries(reportData.customersByDate).map(([date, count]) => (
                    <div key={date} className="stat-item">
                      <span>{new Date(date).toLocaleDateString()}:</span>
                      <strong>{count} customers</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'most-sold-products':
        return (
          <div className="report-content">
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <h3>Top Products by Quantity</h3>
                </div>
                <div className="card-body">
                  {reportData.topProductsByQuantity?.map(([product, quantity], index) => (
                    <div key={product} className="stat-item">
                      <span>#{index + 1} {product}:</span>
                      <strong>{quantity} units</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Top Products by Revenue</h3>
                </div>
                <div className="card-body">
                  {reportData.topProductsByRevenue?.map(([product, revenue], index) => (
                    <div key={product} className="stat-item">
                      <span>#{index + 1} {product}:</span>
                      <strong>{formatCurrency(revenue)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Summary</h3>
              </div>
              <div className="card-body">
                <div className="stat-item">
                  <span>Total Products Sold:</span>
                  <strong>{reportData.totalProductsSold}</strong>
                </div>
              </div>
            </div>
          </div>
        );

      case 'inventory-status':
        return (
          <div className="report-content">
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <h3>Inventory Overview</h3>
                </div>
                <div className="card-body">
                  <div className="stat-item">
                    <span>Total Products:</span>
                    <strong>{reportData.totalProducts}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Low Stock Items:</span>
                    <strong style={{ color: '#dc3545' }}>{reportData.lowStockCount}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Adequate Stock:</span>
                    <strong style={{ color: '#28a745' }}>{reportData.adequateStockCount}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Total Inventory Value:</span>
                    <strong>{formatCurrency(reportData.totalInventoryValue)}</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Stock Levels Distribution</h3>
                </div>
                <div className="card-body">
                  {reportData.stockLevels && Object.entries(reportData.stockLevels).map(([level, count]) => (
                    <div key={level} className="stat-item">
                      <span>{level}:</span>
                      <strong>{count} products</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {reportData.topLowStockItems && reportData.topLowStockItems.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3>Critical Low Stock Items</h3>
                </div>
                <div className="card-body">
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Current Stock</th>
                          <th>Reorder Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.topLowStockItems.map(item => (
                          <tr key={item.productId}>
                            <td>{item.productName}</td>
                            <td style={{ color: '#dc3545', fontWeight: 'bold' }}>{item.currentStock}</td>
                            <td>{item.reorderLevel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'order-status-distribution':
        return (
          <div className="report-content">
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <h3>Order Statistics</h3>
                </div>
                <div className="card-body">
                  <div className="stat-item">
                    <span>Total Orders:</span>
                    <strong>{reportData.totalOrders}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Completion Rate:</span>
                    <strong style={{ color: '#28a745' }}>{formatPercentage(reportData.completionRate)}</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Status Distribution</h3>
                </div>
                <div className="card-body">
                  {reportData.statusDistribution && Object.entries(reportData.statusDistribution).map(([status, count]) => (
                    <div key={status} className="stat-item">
                      <span>{status}:</span>
                      <strong>{count} orders ({formatPercentage(reportData.statusPercentages[status])})</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'supplier-performance':
        return (
          <div className="report-content">
            <div className="card">
              <div className="card-header">
                <h3>Supplier Performance Overview</h3>
              </div>
              <div className="card-body">
                <div className="stat-item">
                  <span>Total Suppliers:</span>
                  <strong>{reportData.totalSuppliers}</strong>
                </div>
              </div>
            </div>

            {reportData.topPerformers && reportData.topPerformers.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3>Top Performing Suppliers</h3>
                </div>
                <div className="card-body">
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Supplier</th>
                          <th>Country</th>
                          <th>On-Time Delivery</th>
                          <th>Quality Score</th>
                          <th>Total Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.topPerformers.map(supplier => (
                          <tr key={supplier.supplierId}>
                            <td>{supplier.supplierName}</td>
                            <td>{supplier.country}</td>
                            <td>{formatPercentage(supplier.onTimeDeliveryRate)}</td>
                            <td>{supplier.qualityScore.toFixed(1)}/5.0</td>
                            <td>{supplier.totalOrders}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'customer-demographics':
        return (
          <div className="report-content">
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <h3>Customer Overview</h3>
                </div>
                <div className="card-body">
                  <div className="stat-item">
                    <span>Total Customers:</span>
                    <strong>{reportData.totalCustomers}</strong>
                  </div>
                  <div className="stat-item">
                    <span>New Customers (12 months):</span>
                    <strong>{reportData.newCustomersLast12Months}</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Gender Distribution</h3>
                </div>
                <div className="card-body">
                  {reportData.genderDistribution && Object.entries(reportData.genderDistribution).map(([gender, count]) => (
                    <div key={gender} className="stat-item">
                      <span>{gender}:</span>
                      <strong>{count} customers</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <h3>Age Groups</h3>
                </div>
                <div className="card-body">
                  {reportData.ageGroups && Object.entries(reportData.ageGroups).map(([age, count]) => (
                    <div key={age} className="stat-item">
                      <span>{age}:</span>
                      <strong>{count} customers</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Country Distribution</h3>
                </div>
                <div className="card-body">
                  {reportData.countryDistribution && Object.entries(reportData.countryDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([country, count]) => (
                    <div key={country} className="stat-item">
                      <span>{country}:</span>
                      <strong>{count} customers</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Report data not available</div>;
    }
  };

  return (
    <div>
      <Header />
      
      <main className="content-container">
        <div className="container">
          <div className="dashboard">
            <div className="dashboard-header">
              <h1 className="dashboard-title">Reports & Analytics</h1>
              <div className="dashboard-actions">
                <Link to="/ceo/dashboard" className="btn btn-secondary">
                  ← Back to Dashboard
                </Link>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Report Parameters */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Report Parameters</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <label htmlFor="period" style={{ display: 'block', marginBottom: '0.25rem' }}>Period:</label>
                    <select
                      id="period"
                      name="period"
                      className="form-control"
                      value={reportParams.period}
                      onChange={handleParamChange}
                      style={{ minWidth: '120px' }}
                    >
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="3months">3 Months</option>
                      <option value="6months">6 Months</option>
                      <option value="year">Year</option>
                      <option value="2years">2 Years</option>
                      <option value="3years">3 Years</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="startDate" style={{ display: 'block', marginBottom: '0.25rem' }}>Start Date:</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      className="form-control"
                      value={reportParams.startDate}
                      onChange={handleParamChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" style={{ display: 'block', marginBottom: '0.25rem' }}>End Date:</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      className="form-control"
                      value={reportParams.endDate}
                      onChange={handleParamChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="limit" style={{ display: 'block', marginBottom: '0.25rem' }}>Limit:</label>
                    <select
                      id="limit"
                      name="limit"
                      className="form-control"
                      value={reportParams.limit}
                      onChange={handleParamChange}
                      style={{ minWidth: '80px' }}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Reports */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Available Reports</h3>
              </div>
              <div className="card-body">
                <div className="grid-2">
                  {availableReports.map(report => (
                    <div
                      key={report.id}
                      className="card"
                      style={{ 
                        cursor: 'pointer',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        border: activeReport === report.id ? '2px solid #000' : '2px solid #ccc'
                      }}
                      onClick={() => generateReport(report.id)}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '2rem' }}>
                          {report.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ marginBottom: '0.5rem' }}>{report.title}</h4>
                          <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                            {report.description}
                          </p>
                          {report.requiresDateRange && (
                            <small style={{ color: '#007bff', fontSize: '0.8rem' }}>
                              Uses date range parameters
                            </small>
                          )}
                        </div>
                        {loading && activeReport === report.id && (
                          <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Report Content */}
            {reportData && activeReport && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    {availableReports.find(r => r.id === activeReport)?.title} Results
                  </h3>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Generated on: {new Date().toLocaleString()}
                    {reportData.period && ` | Period: ${reportData.period}`}
                    {reportData.startDate && reportData.endDate && (
                      ` | ${new Date(reportData.startDate).toLocaleDateString()} - ${new Date(reportData.endDate).toLocaleDateString()}`
                    )}
                  </div>
                </div>
                <div className="card-body">
                  {renderReportContent()}
                </div>
              </div>
            )}

            {!reportData && !loading && (
              <div className="card">
                <div className="card-body text-center">
                  <h3>Select a Report to Generate</h3>
                  <p style={{ color: '#666' }}>
                    Click on any of the report cards above to generate detailed analytics and insights.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      
      <style jsx>{`
        .report-content .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }
        
        .report-content .stat-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default ReportsGeneration;