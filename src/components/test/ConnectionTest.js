// src/components/test/ConnectionTest.js
import React, { useState, useEffect } from 'react';
import { testConnection, authAPI, publicAPI, commonAPI } from '../../services/api';

const ConnectionTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, testFunction) => {
    try {
      setResults(prev => ({ ...prev, [name]: { status: 'testing...', data: null } }));
      const response = await testFunction();
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          status: '✅ Success', 
          data: response.data,
          statusCode: response.status 
        } 
      }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          status: '❌ Failed', 
          data: error.response?.data || error.message,
          statusCode: error.response?.status || 'No response'
        } 
      }));
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults({});

    console.log('Starting connection tests...');
    console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);

    // Test different endpoints
    await testEndpoint('General Health', () => commonAPI.healthCheck());
    await testEndpoint('Auth Health', () => authAPI.healthCheck());
    await testEndpoint('Public Health', () => publicAPI.healthCheck());
    await testEndpoint('Public Products', () => publicAPI.getProducts());
    await testEndpoint('Categories', () => commonAPI.getCategories());

    setLoading(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div style={{ 
      padding: '2rem', 
      margin: '2rem auto', 
      maxWidth: '800px',
      border: '2px solid #000', 
      borderRadius: '12px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2>Backend Connection Test</h2>
      
      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '8px' }}>
        <p><strong>Environment Info:</strong></p>
        <p>API Base URL: {process.env.REACT_APP_API_BASE_URL || 'Not set'}</p>
        <p>Node Environment: {process.env.NODE_ENV}</p>
        <p>Current Time: {new Date().toLocaleString()}</p>
      </div>

      <button 
        onClick={runAllTests} 
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: loading ? '#ccc' : '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '1rem'
        }}
      >
        {loading ? 'Testing...' : 'Run Tests Again'}
      </button>

      <div>
        <h3>Test Results:</h3>
        {Object.keys(results).length === 0 && !loading && (
          <p>No tests run yet. Click "Run Tests Again" to start.</p>
        )}
        
        {Object.entries(results).map(([testName, result]) => (
          <div 
            key={testName}
            style={{ 
              margin: '1rem 0',
              padding: '1rem',
              backgroundColor: '#fff',
              border: `2px solid ${result.status.includes('✅') ? '#4CAF50' : result.status.includes('❌') ? '#f44336' : '#ff9800'}`,
              borderRadius: '8px'
            }}
          >
            <h4>{testName}</h4>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>HTTP Status:</strong> {result.statusCode}</p>
            
            {result.data && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Response Data (click to expand)
                </summary>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '8px' }}>
        <h4>Troubleshooting Tips:</h4>
        <ul style={{ textAlign: 'left' }}>
          <li>✅ Make sure Spring Boot is running on localhost:8083</li>
          <li>✅ Check that CORS is configured in your Spring Boot backend</li>
          <li>✅ Verify .env.local file exists and has correct API URL</li>
          <li>✅ Restart React dev server after adding .env.local</li>
          <li>✅ Check browser console for detailed error messages</li>
          <li>✅ Test Spring Boot endpoints directly in browser: http://localhost:8083/api/health</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionTest;