import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './components/auth/Login';
import CustomerRegister from './components/auth/CustomerRegister';
import ChangePassword from './components/auth/ChangePassword';
import CEODashboard from './pages/CEODashboard';
import ProductManagerDashboard from './pages/ProductManagerDashboard';
import MerchandiseManagerDashboard from './pages/MerchandiseManagerDashboard';
import DispatchOfficerDashboard from './pages/DispatchOfficerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

// Styles
import './styles/global.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<CustomerRegister />} />
              
              {/* Protected Routes */}
              <Route path="/change-password" element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } />
              
              {/* Role-based Dashboard Routes */}
              <Route path="/ceo/dashboard" element={
                <ProtectedRoute allowedRoles={['CEO']}>
                  <CEODashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/product-manager/dashboard" element={
                <ProtectedRoute allowedRoles={['PRODUCT_MANAGER']}>
                  <ProductManagerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/merchandise-manager/dashboard" element={
                <ProtectedRoute allowedRoles={['MERCHANDISE_MANAGER']}>
                  <MerchandiseManagerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/dispatch-officer/dashboard" element={
                <ProtectedRoute allowedRoles={['DISPATCH_OFFICER']}>
                  <DispatchOfficerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/customer/dashboard" element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              
              {/* Redirect unknown routes to landing page */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;