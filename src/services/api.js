import axios from 'axios';

// Get base URL from environment variable or default to localhost:8083
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8083/api';

// Create axios instance with base URL
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add Basic Auth to requests if available
API.interceptors.request.use(
  (config) => {
    // Only use Basic Auth since that's your authentication method
    const basicAuth = localStorage.getItem('basicAuth');
    if (basicAuth) {
      config.headers.Authorization = `Basic ${basicAuth}`;
      console.log('Adding Basic Auth header:', `Basic ${basicAuth.substring(0, 10)}...`);
    } else {
      console.log('No Basic Auth found in localStorage');
    }
    
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.statusText);
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data and redirect to login
      localStorage.removeItem('basicAuth');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to set Basic Auth credentials
export const setBasicAuth = (username, password) => {
  const credentials = btoa(`${username}:${password}`);
  localStorage.setItem('basicAuth', credentials);
  console.log('Basic Auth credentials stored');
};

// Helper function to clear auth
export const clearAuth = () => {
  localStorage.removeItem('basicAuth');
  localStorage.removeItem('user');
  console.log('Auth cleared');
};

// Helper function to update Basic Auth credentials (for password changes)
export const updateBasicAuth = (username, newPassword) => {
  const credentials = btoa(`${username}:${newPassword}`);
  localStorage.setItem('basicAuth', credentials);
  console.log('Basic Auth credentials updated');
};

// Authentication APIs
export const authAPI = {
  login: async (username, password) => {
    try {
      const credentials = btoa(`${username}:${password}`);
      
      // Define role checks in order of preference
      const roleChecks = [
        { 
          role: 'CEO', 
          endpoint: `${BASE_URL}/ceo/dashboard`, 
          redirectUrl: '/ceo/dashboard' 
        },
        { 
          role: 'PRODUCT_MANAGER', 
          endpoint: `${BASE_URL}/product-manager/dashboard`, 
          redirectUrl: '/product-manager/dashboard' 
        },
        { 
          role: 'MERCHANDISE_MANAGER', 
          endpoint: `${BASE_URL}/merchandise-manager/dashboard`, 
          redirectUrl: '/merchandise-manager/dashboard' 
        },
        { 
          role: 'DISPATCH_OFFICER', 
          endpoint: `${BASE_URL}/dispatch-officer/dashboard`, 
          redirectUrl: '/dispatch-officer/dashboard' 
        },
        { 
          role: 'CUSTOMER', 
          endpoint: `${BASE_URL}/customer/dashboard`, 
          redirectUrl: '/c' 
        }
      ];
      
      // Test each role until one succeeds
      for (const check of roleChecks) {
        try {
          console.log(`Testing role: ${check.role} with endpoint: ${check.endpoint}`);
          
          const testResponse = await axios.get(check.endpoint, {
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          });
          
          console.log(`Login successful for role: ${check.role}`);
          
          // If successful, store credentials and return role info
          setBasicAuth(username, password);
          
          return {
            data: {
              success: true,
              message: "Login successful",
              role: check.role,
              username: username,
              redirectUrl: check.redirectUrl
            }
          };
        } catch (error) {
          console.log(`Role ${check.role} failed:`, error.response?.status);
          // Continue to next role check if this one fails
          if (error.response?.status === 401 || error.response?.status === 403) {
            continue;
          }
          // For other errors (500, network issues), break the loop
          break;
        }
      }
      
      // If no role worked, throw invalid credentials error
      throw new Error('Invalid username or password');
      
    } catch (error) {
      console.error('Login failed:', error);
      if (error.message === 'Invalid username or password') {
        throw error;
      }
      throw new Error('Login failed. Please try again.');
    }
  },
  
  logout: () => {
    clearAuth();
    return Promise.resolve({ data: { success: true, message: "Logout successful" } });
  },
  
  register: (userData) => API.post('/customer/register', userData),
  changePassword: (passwordData) => API.post('/auth/change-password', passwordData),
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    const basicAuth = localStorage.getItem('basicAuth');
    
    if (user && basicAuth) {
      return Promise.resolve({ data: JSON.parse(user) });
    } else {
      return Promise.reject(new Error('No user logged in'));
    }
  },
};

// Public APIs
export const publicAPI = {
  getProducts: () => API.get('/public/products'),
  getProduct: (id) => API.get(`/public/products/${id}`),
  getCategories: () => API.get('/public/categories'),
  searchProducts: (query) => API.get(`/public/products/search?name=${query}`),
  getProductsByCategory: (categoryId) => API.get(`/public/products/category/${categoryId}`),
};

// CEO APIs
export const ceoAPI = {
  getDashboard: () => API.get('/ceo/dashboard'),
  
  // Employee Management
  getEmployees: () => API.get('/ceo/employees'),
  getEmployee: (id) => API.get(`/ceo/employees/${id}`),
  createEmployee: (employeeData) => API.post('/ceo/employees', employeeData),
  updateEmployee: (id, employeeData) => {
    // Send flat structure directly - backend now accepts EmployeeUpdateRequest
    return API.put(`/ceo/employees/${id}`, employeeData);
  },
  deleteEmployee: (id) => API.delete(`/ceo/employees/${id}`),
  
  // Product Management
  getProducts: () => API.get('/ceo/products'),
  createProduct: (productData) => API.post('/ceo/products', productData),
  updateProduct: (id, productData) => API.put(`/ceo/products/${id}`, productData),
  deleteProduct: (id) => API.delete(`/ceo/products/${id}`),
  
  // Order Viewing
  getOrders: () => API.get('/ceo/orders'),
  getOrder: (id) => API.get(`/ceo/orders/${id}`),
  
  // Customer Viewing
  getCustomers: () => API.get('/ceo/customers'),
  getCustomer: (id) => API.get(`/ceo/customers/${id}`),
  
  // Delivery Provider Management
  getDeliveryProviders: () => API.get('/ceo/delivery-providers'),
  createDeliveryProvider: (providerData) => API.post('/ceo/delivery-providers', providerData),
  updateDeliveryProvider: (id, providerData) => API.put(`/ceo/delivery-providers/${id}`, providerData),
  deleteDeliveryProvider: (id) => API.delete(`/ceo/delivery-providers/${id}`),
  
  // Supplier Management
  getSuppliers: () => API.get('/ceo/suppliers'),
  createSupplier: (supplierData) => API.post('/ceo/suppliers', supplierData),
  updateSupplier: (id, supplierData) => API.put(`/ceo/suppliers/${id}`, supplierData),
  deleteSupplier: (id) => API.delete(`/ceo/suppliers/${id}`),
  
  // Supplier Payment Management
  getSupplierPayments: () => API.get('/ceo/supplier-payments'),
  createSupplierPayment: (paymentData) => API.post('/ceo/supplier-payments', paymentData),
  updateSupplierPayment: (id, paymentData) => API.put(`/ceo/supplier-payments/${id}`, paymentData),
  deleteSupplierPayment: (id) => API.delete(`/ceo/supplier-payments/${id}`),
  
  // Reports
  getSalesReport: (params) => API.get('/reports/sales', { params }),
  getCustomerGrowthReport: (params) => API.get('/reports/customer-growth', { params }),
  getMostSoldProductsReport: (params) => API.get('/reports/most-sold-products', { params }),
  getRevenueAnalysisReport: (params) => API.get('/reports/revenue-analysis', { params }),
  getInventoryStatusReport: () => API.get('/reports/inventory-status'),
  getOrderStatusDistributionReport: (params) => API.get('/reports/order-status-distribution', { params }),
  getSupplierPerformanceReport: (params) => API.get('/reports/supplier-performance', { params }),
  getCustomerDemographicsReport: () => API.get('/reports/customer-demographics'),
};

// Product Manager APIs
export const productManagerAPI = {
  getDashboard: () => API.get('/product-manager/dashboard'),
  
  // Product Management
  getProducts: () => API.get('/product-manager/products'),
  getProduct: (id) => API.get(`/product-manager/products/${id}`),
  createProduct: (productData) => API.post('/product-manager/products', productData),
  updateProduct: (id, productData) => API.put(`/product-manager/products/${id}`, productData),
  deleteProduct: (id) => API.delete(`/product-manager/products/${id}`),
  searchProducts: (query) => API.get(`/product-manager/products/search?name=${query}`),
  getProductsByCategory: (categoryId) => API.get(`/product-manager/products/category/${categoryId}`),
  getLowStockProducts: (threshold) => API.get(`/product-manager/products/low-stock?threshold=${threshold}`),
  updateStock: (id, quantity) => API.put(`/product-manager/products/${id}/stock?quantity=${quantity}`),
  
  // Category Management
  getCategories: () => API.get('/product-manager/categories'),
  getCategory: (id) => API.get(`/product-manager/categories/${id}`),
  createCategory: (categoryData) => API.post('/product-manager/categories', categoryData),
  updateCategory: (id, categoryData) => API.put(`/product-manager/categories/${id}`, categoryData),
  deleteCategory: (id) => API.delete(`/product-manager/categories/${id}`),
  searchCategories: (query) => API.get(`/product-manager/categories/search?name=${query}`),
};

// Merchandise Manager APIs
export const merchandiseManagerAPI = {
  getDashboard: () => API.get('/merchandise-manager/dashboard'),
  
  // Low Stock Notifications
  getLowStockNotifications: () => API.get('/merchandise-manager/notifications/low-stock'),
  markAsReordered: (productId) => API.post(`/merchandise-manager/notifications/mark-reordered/${productId}`),
  
  // Inventory Management
getInventory: () => API.get('/merchandise-manager/inventory'),
createInventory: (inventoryData) => API.post('/inventory', inventoryData), // Add this line
updateInventoryQuantity: (id, quantity) => API.put(`/merchandise-manager/inventory/${id}/quantity?quantity=${quantity}`),
updateReorderLevel: (id, reorderLevel) => API.put(`/merchandise-manager/inventory/${id}/reorder-level?reorderLevel=${reorderLevel}`),
addStock: (productId, quantity) => API.patch(`/merchandise-manager/inventory/add-stock/${productId}?quantity=${quantity}`),
updateProductOnDelivery: (id, deliveredQuantity) => API.put(`/merchandise-manager/products/${id}/delivered?deliveredQuantity=${deliveredQuantity}`),
  
  // Supplier Management
  getSuppliers: () => API.get('/merchandise-manager/suppliers'),
  createSupplier: (supplierData) => API.post('/merchandise-manager/suppliers', supplierData),
  updateSupplier: (id, supplierData) => API.put(`/merchandise-manager/suppliers/${id}`, supplierData),
  deleteSupplier: (id) => API.delete(`/merchandise-manager/suppliers/${id}`), // Added this line
  searchSuppliers: (name) => API.get(`/merchandise-manager/suppliers/search?name=${name}`),
  
  // Supplier Payment Management
  getSupplierPayments: () => API.get('/merchandise-manager/supplier-payments'),
  createSupplierPayment: (paymentData) => API.post('/merchandise-manager/supplier-payments', paymentData),
  updateSupplierPayment: (id, paymentData) => API.put(`/merchandise-manager/supplier-payments/${id}`, paymentData),
  getSupplierPaymentsByDateRange: (startDate, endDate) => API.get(`/merchandise-manager/supplier-payments/date-range?startDate=${startDate}&endDate=${endDate}`),
};

// Dispatch Officer APIs
export const dispatchOfficerAPI = {
  getDashboard: () => API.get('/dispatch-officer/dashboard'),
  
  // Order Management
  getOrders: () => API.get('/dispatch-officer/orders'),
  getOrder: (id) => API.get(`/dispatch-officer/orders/${id}`),
  getOrdersByCustomer: (customerId) => API.get(`/dispatch-officer/orders/customer/${customerId}`),
  getOrdersByStatus: (statusId) => API.get(`/dispatch-officer/orders/status/${statusId}`),
  getOrdersByDateRange: (startDate, endDate) => API.get(`/dispatch-officer/orders/date-range?startDate=${startDate}&endDate=${endDate}`),
  getOrdersByPriceRange: (minPrice, maxPrice) => API.get(`/dispatch-officer/orders/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`),
  updateOrderStatus: (id, statusId) => API.put(`/dispatch-officer/orders/${id}/status`, { statusId }),
  
  // Order Statuses
  getOrderStatuses: () => API.get('/dispatch-officer/order-statuses'),
  
  // Customer Viewing
  getCustomers: () => API.get('/dispatch-officer/customers'),
  getCustomer: (id) => API.get(`/dispatch-officer/customers/${id}`),
  searchCustomers: (searchTerm) => API.get(`/dispatch-officer/customers/search?searchTerm=${searchTerm}`),
  getActiveCustomers: () => API.get('/dispatch-officer/customers/active'),
  
  // Delivery Provider Viewing
  getDeliveryProviders: () => API.get('/dispatch-officer/delivery-providers'),
  getDeliveryProvider: (id) => API.get(`/dispatch-officer/delivery-providers/${id}`),
  getActiveDeliveryProviders: () => API.get('/dispatch-officer/delivery-providers/active'),
  
  // Statistics
  getStatistics: () => API.get('/dispatch-officer/statistics'),
};

// Customer APIs
export const customerAPI = {
  getDashboard: () => API.get('/customer/dashboard'),
  
  // Profile Management
  getProfile: () => API.get('/customer/profile'),
  getCurrentCustomer: () => API.get('/customer/current'), // New endpoint for current customer data
  updateProfile: (profileData) => API.put('/customer/profile', profileData),
  
  // Cart Management
  getCart: () => API.get('/customer/cart'),
  addToCart: (productId, quantity) => API.post('/customer/cart/add', { productId, quantity }),
  updateCartItem: (productId, quantity) => API.put('/customer/cart/update', { productId, quantity }),
  removeFromCart: (productId) => API.delete(`/customer/cart/remove/${productId}`),
  clearCart: () => API.delete('/customer/cart/clear'),
  getCartCount: () => API.get('/customer/cart/count'),
  getCartTotal: () => API.get('/customer/cart/total'),
  
  // Wishlist Management
  getWishlist: () => API.get('/customer/wishlist'),
  addToWishlist: (productId) => API.post(`/customer/wishlist/add/${productId}`),
  removeFromWishlist: (productId) => API.delete(`/customer/wishlist/remove/${productId}`),
  getWishlistCount: () => API.get('/customer/wishlist/count'),
  moveWishlistItemToCart: (productId, quantity) => API.post(`/customer/wishlist/move-to-cart/${productId}`, { quantity }),
  
  // Order Management
  getOrders: (params) => API.get('/customer/orders', { params }),
  getOrder: (id) => API.get(`/customer/orders/${id}`),
  placeOrder: (orderData) => API.post('/customer/orders', orderData),
  getOrderStatus: (orderNo) => API.get(`/customer/orders/status/${orderNo}`),
  getOrderReceipt: (id) => API.get(`/customer/orders/${id}/receipt`),
  
  // Payment Information
  getPaymentInfo: () => API.get('/customer/payment-info'),
  
  // Analytics
  getAnalytics: () => API.get('/customer/analytics/summary'),
  getSpendingTrend: (months) => API.get(`/customer/analytics/spending-trend?months=${months}`),
};

// Order APIs
export const orderAPI = {
  createOrder: (orderData) => API.post('/orders', orderData),
  updateOrder: (id, orderData) => API.put(`/orders/${id}`, orderData),
  getOrderById: (id) => API.get(`/orders/${id}`),
  getOrderByOrderNo: (orderNo) => API.get(`/orders/order-no/${orderNo}`),
  getAllOrders: () => API.get('/orders'),
  getOrdersByCustomerId: (customerId) => API.get(`/orders/customer/${customerId}`),
  getOrdersByEmployeeId: (employeeId) => API.get(`/orders/employee/${employeeId}`),
  getOrdersByStatusId: (statusId) => API.get(`/orders/status/${statusId}`),
  getOrdersByDateRange: (startDate, endDate) => API.get(`/orders/date-range?startDate=${startDate}&endDate=${endDate}`),
  getOrdersByPriceRange: (minPrice, maxPrice) => API.get(`/orders/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`),
  deleteOrder: (id) => API.delete(`/orders/${id}`),
  existsByOrderNo: (orderNo) => API.get(`/orders/exists/${orderNo}`),
};

// Inventory APIs
export const inventoryAPI = {
  getAllInventories: () => API.get('/inventory'),
  getInventoryById: (id) => API.get(`/inventory/${id}`),
  getInventoryByProductId: (productId) => API.get(`/inventory/product/${productId}`),
  createInventory: (inventoryData) => API.post('/inventory', inventoryData),
  updateInventory: (id, inventoryData) => API.put(`/inventory/${id}`, inventoryData),
  deleteInventory: (id) => API.delete(`/inventory/${id}`),
  getLowStockItems: () => API.get('/inventory/low-stock'),
  getItemsByQuantityLessThan: (quantity) => API.get(`/inventory/quantity-less-than/${quantity}`),
  getItemsByReorderLevel: (reorderLevel) => API.get(`/inventory/reorder-level/${reorderLevel}`),
  updateQuantity: (id, quantity) => API.patch(`/inventory/${id}/quantity?quantity=${quantity}`),
  updateReorderLevel: (id, reorderLevel) => API.patch(`/inventory/${id}/reorder-level?reorderLevel=${reorderLevel}`),
  checkStockAvailability: (productId, requiredQuantity) => API.get(`/inventory/check-stock/${productId}?requiredQuantity=${requiredQuantity}`),
  reduceStock: (productId, quantity) => API.patch(`/inventory/reduce-stock/${productId}?quantity=${quantity}`),
  addStock: (productId, quantity) => API.patch(`/inventory/add-stock/${productId}?quantity=${quantity}`),
};

// Common APIs
export const commonAPI = {
  getProvinces: () => API.get('/provinces'),
  getStatuses: () => API.get('/statuses'),
  getCategories: () => API.get('/categories'),
  getSuppliers: () => API.get('/suppliers'),
  getProducts: () => API.get('/products'), // Add this line
  getDeliveryProviders: () => API.get('/delivery-providers'),
  getPaymentMethods: () => API.get('/payment-methods'),
  getPaymentStatuses: () => API.get('/payment-statuses'),
  getOrderStatuses: () => API.get('/order-statuses'),
};

export default API;