import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Test Component (add this import)
import ConnectionTest from './components/test/ConnectionTest';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import CustomerRegistration from './pages/auth/CustomerRegistration';
import ProductDetails from './pages/public/ProductDetails';

// CEO Dashboard
import CEODashboard from './pages/ceo/CEODashboard';
import EmployeeManagement from './pages/ceo/EmployeeManagement';
import ProductManagement from './pages/ceo/ProductManagement';
import OrderViewing from './pages/ceo/OrderViewing';
import CustomerViewing from './pages/ceo/CustomerViewing';
import DeliveryProviderManagement from './pages/ceo/DeliveryProviderManagement';
import SupplierManagement from './pages/ceo/SupplierManagement';
import SupplierPaymentManagement from './pages/ceo/SupplierPaymentManagement';
import ReportsGeneration from './pages/ceo/ReportsGeneration';

// Product Manager Dashboard
import ProductManagerDashboard from './pages/product-manager/ProductManagerDashboard';
import PMProductManagement from './pages/product-manager/ProductManagement';

// Merchandise Manager Dashboard
import MerchandiseManagerDashboard from './pages/merchandise-manager/MerchandiseManagerDashboard';
import LowStockNotifications from './pages/merchandise-manager/LowStockNotifications';
import InventoryManagement from './pages/merchandise-manager/InventoryManagement';
import MMSupplierManagement from './pages/merchandise-manager/SupplierManagement';
import MMSupplierPaymentManagement from './pages/merchandise-manager/SupplierPaymentManagement';

// Dispatch Officer Dashboard
import DispatchOfficerDashboard from './pages/dispatch-officer/DispatchOfficerDashboard';
import DOOrderViewing from './pages/dispatch-officer/OrderViewing';
import DOCustomerViewing from './pages/dispatch-officer/CustomerViewing';
import DODeliveryProviderViewing from './pages/dispatch-officer/DeliveryProviderViewing';

// Customer Dashboard
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CartPage from './pages/customer/CartPage';
import WishlistPage from './pages/customer/WishlistPage';
import OrderHistory from './pages/customer/OrderHistory';
import OrderStatus from './pages/customer/OrderStatus';
import CustomerProfile from './pages/customer/CustomerProfile';

// Common
import ChangePassword from './pages/common/ChangePassword';
import NotFound from './pages/common/NotFound';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/products" element={<LandingPage />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<CustomerRegistration />} />

            {/* Test Route - Add this temporarily */}
            <Route path="/test" element={<ConnectionTest />} />

            {/* CEO Routes */}
            <Route path="/ceo/dashboard" element={
              <ProtectedRoute requiredRole="CEO">
                <CEODashboard />
              </ProtectedRoute>
            } />
            <Route path="/ceo/employees" element={
              <ProtectedRoute requiredRole="CEO">
                <EmployeeManagement />
              </ProtectedRoute>
            } />
            <Route path="/ceo/products" element={
              <ProtectedRoute requiredRole="CEO">
                <ProductManagement />
              </ProtectedRoute>
            } />
            <Route path="/ceo/orders" element={
              <ProtectedRoute requiredRole="CEO">
                <OrderViewing />
              </ProtectedRoute>
            } />
            <Route path="/ceo/customers" element={
              <ProtectedRoute requiredRole="CEO">
                <CustomerViewing />
              </ProtectedRoute>
            } />
            <Route path="/ceo/delivery-providers" element={
              <ProtectedRoute requiredRole="CEO">
                <DeliveryProviderManagement />
              </ProtectedRoute>
            } />
            <Route path="/ceo/suppliers" element={
              <ProtectedRoute requiredRole="CEO">
                <SupplierManagement />
              </ProtectedRoute>
            } />
            <Route path="/ceo/supplier-payments" element={
              <ProtectedRoute requiredRole="CEO">
                <SupplierPaymentManagement />
              </ProtectedRoute>
            } />
            <Route path="/ceo/reports" element={
              <ProtectedRoute requiredRole="CEO">
                <ReportsGeneration />
              </ProtectedRoute>
            } />

            {/* Product Manager Routes */}
            <Route path="/product-manager/dashboard" element={
              <ProtectedRoute requiredRole="PRODUCT_MANAGER">
                <ProductManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/product-manager/products" element={
              <ProtectedRoute requiredRole="PRODUCT_MANAGER">
                <PMProductManagement />
              </ProtectedRoute>
            } />

            {/* Merchandise Manager Routes */}
            <Route path="/merchandise-manager/dashboard" element={
              <ProtectedRoute requiredRole="MERCHANDISE_MANAGER">
                <MerchandiseManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/merchandise-manager/notifications" element={
              <ProtectedRoute requiredRole="MERCHANDISE_MANAGER">
                <LowStockNotifications />
              </ProtectedRoute>
            } />
            <Route path="/merchandise-manager/inventory" element={
              <ProtectedRoute requiredRole="MERCHANDISE_MANAGER">
                <InventoryManagement />
              </ProtectedRoute>
            } />
            <Route path="/merchandise-manager/suppliers" element={
              <ProtectedRoute requiredRole="MERCHANDISE_MANAGER">
                <MMSupplierManagement />
              </ProtectedRoute>
            } />
            <Route path="/merchandise-manager/supplier-payments" element={
              <ProtectedRoute requiredRole="MERCHANDISE_MANAGER">
                <MMSupplierPaymentManagement />
              </ProtectedRoute>
            } />

            {/* Dispatch Officer Routes */}
            <Route path="/dispatch-officer/dashboard" element={
              <ProtectedRoute requiredRole="DISPATCH_OFFICER">
                <DispatchOfficerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dispatch-officer/orders" element={
              <ProtectedRoute requiredRole="DISPATCH_OFFICER">
                <DOOrderViewing />
              </ProtectedRoute>
            } />
            <Route path="/dispatch-officer/customers" element={
              <ProtectedRoute requiredRole="DISPATCH_OFFICER">
                <DOCustomerViewing />
              </ProtectedRoute>
            } />
            <Route path="/dispatch-officer/delivery-providers" element={
              <ProtectedRoute requiredRole="DISPATCH_OFFICER">
                <DODeliveryProviderViewing />
              </ProtectedRoute>
            } />

            {/* Customer Routes */}
            <Route path="/customer/dashboard" element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/customer/cart" element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CartPage />
              </ProtectedRoute>
            } />
            <Route path="/customer/wishlist" element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <WishlistPage />
              </ProtectedRoute>
            } />
            <Route path="/customer/orders" element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <OrderHistory />
              </ProtectedRoute>
            } />
            <Route path="/customer/order-status/:orderNo" element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <OrderStatus />
              </ProtectedRoute>
            } />
            <Route path="/customer/profile" element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerProfile />
              </ProtectedRoute>
            } />

            {/* Common Routes */}
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;