import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect customers to the main products page
    navigate('/', { replace: true });
  }, [navigate]);

  // This component will never render as it immediately redirects
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      Redirecting to products...
    </div>
  );
};

export default CustomerDashboard;