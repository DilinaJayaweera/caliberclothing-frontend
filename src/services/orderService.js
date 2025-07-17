import { api } from './api';

export const orderService = {
  // Order CRUD operations
  async getAllOrders() {
    try {
      const response = await api.get('/orders');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch orders');
    }
  },

  async getOrderById(id) {
    try {
      const response = await api.get(`/orders/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch order');
    }
  },

  async getOrderByOrderNo(orderNo) {
    try {
      const response = await api.get(`/orders/order-no/${orderNo}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch order by order number');
    }
  },

  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create order');
    }
  },

  async updateOrder(id, orderData) {
    try {
      const response = await api.put(`/orders/${id}`, orderData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update order');
    }
  },

  async deleteOrder(id) {
    try {
      await api.delete(`/orders/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete order');
    }
  },

  async getOrdersByCustomerId(customerId) {
    try {
      const response = await api.get(`/orders/customer/${customerId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch customer orders');
    }
  },

  async getOrdersByEmployeeId(employeeId) {
    try {
      const response = await api.get(`/orders/employee/${employeeId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch employee orders');
    }
  },

  async getOrdersByStatusId(statusId) {
    try {
      const response = await api.get(`/orders/status/${statusId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch orders by status');
    }
  },

  async getOrdersByDateRange(startDate, endDate) {
    try {
      const start = startDate.toISOString();
      const end = endDate.toISOString();
      const response = await api.get(`/orders/date-range?startDate=${start}&endDate=${end}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch orders by date range');
    }
  },

  async getOrdersByPriceRange(minPrice, maxPrice) {
    try {
      const response = await api.get(`/orders/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch orders by price range');
    }
  },

  async checkOrderExists(orderNo) {
    try {
      const response = await api.get(`/orders/exists/${orderNo}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to check order existence');
    }
  },

  // Order Status operations
  async getAllOrderStatuses() {
    try {
      const response = await api.get('/order-statuses');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch order statuses');
    }
  },

  async getOrderStatusById(id) {
    try {
      const response = await api.get(`/order-statuses/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch order status');
    }
  },

  async getOrderStatusByValue(value) {
    try {
      const response = await api.get(`/order-statuses/value/${value}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch order status by value');
    }
  },

  async createOrderStatus(statusData) {
    try {
      const response = await api.post('/order-statuses', statusData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create order status');
    }
  },

  async updateOrderStatus(id, statusData) {
    try {
      const response = await api.put(`/order-statuses/${id}`, statusData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update order status');
    }
  },

  async deleteOrderStatus(id) {
    try {
      await api.delete(`/order-statuses/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete order status');
    }
  },

  // Payment operations
  async getAllPaymentMethods() {
    try {
      const response = await api.get('/payment-methods');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch payment methods');
    }
  },

  async getAllPaymentStatuses() {
    try {
      const response = await api.get('/payment-statuses');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch payment statuses');
    }
  },

  async createPayment(paymentData) {
    try {
      const response = await api.post('/payments', paymentData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create payment');
    }
  },

  // Utility functions
  generateOrderNo() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp.slice(-8)}${random}`;
  },

  calculateOrderTotal(items, discountValue = 0, discountType = 'PERCENTAGE') {
    const subtotal = items.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);

    let discount = 0;
    if (discountType === 'PERCENTAGE') {
      discount = (subtotal * discountValue) / 100;
    } else {
      discount = discountValue;
    }

    return {
      subtotal: subtotal,
      discount: discount,
      total: subtotal - discount
    };
  },

  validateOrderData(orderData) {
    const errors = [];

    if (!orderData.orderNo || orderData.orderNo.trim() === '') {
      errors.push('Order number is required');
    }

    if (!orderData.quantity || orderData.quantity < 1) {
      errors.push('Quantity must be at least 1');
    }

    if (!orderData.unitPrice || orderData.unitPrice <= 0) {
      errors.push('Unit price must be greater than 0');
    }

    if (!orderData.totalPrice || orderData.totalPrice <= 0) {
      errors.push('Total price must be greater than 0');
    }

    if (!orderData.shippingAddress || orderData.shippingAddress.trim() === '') {
      errors.push('Shipping address is required');
    }

    if (!orderData.customerId) {
      errors.push('Customer is required');
    }

    if (!orderData.employeeId) {
      errors.push('Employee is required');
    }

    if (!orderData.orderStatusId) {
      errors.push('Order status is required');
    }

    if (!orderData.paymentId) {
      errors.push('Payment information is required');
    }

    return errors;
  },

  formatOrderData(orderData) {
    return {
      orderNo: orderData.orderNo,
      quantity: parseInt(orderData.quantity),
      unitPrice: parseFloat(orderData.unitPrice),
      totalPrice: parseFloat(orderData.totalPrice),
      shippingAddress: orderData.shippingAddress,
      orderDate: orderData.orderDate || new Date().toISOString(),
      customer: { id: parseInt(orderData.customerId) },
      employee: { employeeNo: orderData.employeeNo },
      orderStatus: { id: parseInt(orderData.orderStatusId) },
      payment: { id: parseInt(orderData.paymentId) },
      discount: orderData.discountId ? { id: parseInt(orderData.discountId) } : null
    };
  },

  getOrderStatusColor(status) {
    const statusColors = {
      'PENDING': '#ffc107',
      'CONFIRMED': '#17a2b8',
      'PROCESSING': '#fd7e14',
      'SHIPPED': '#20c997',
      'DELIVERED': '#28a745',
      'CANCELLED': '#dc3545',
      'REFUNDED': '#6f42c1'
    };

    return statusColors[status?.toUpperCase()] || '#6c757d';
  },

  formatOrderDisplay(order) {
    return {
      ...order,
      formattedOrderDate: order.orderDate ? 
        new Date(order.orderDate).toLocaleDateString() : null,
      formattedTotalPrice: order.totalPrice ? 
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'LKR'
        }).format(order.totalPrice) : null,
      statusColor: this.getOrderStatusColor(order.orderStatus?.value)
    };
  },

  getOrderSummary(orders) {
    const summary = {
      totalOrders: orders.length,
      totalValue: 0,
      statusCounts: {},
      averageOrderValue: 0
    };

    orders.forEach(order => {
      summary.totalValue += parseFloat(order.totalPrice || 0);
      
      const status = order.orderStatus?.value || 'UNKNOWN';
      summary.statusCounts[status] = (summary.statusCounts[status] || 0) + 1;
    });

    summary.averageOrderValue = summary.totalOrders > 0 ? 
      summary.totalValue / summary.totalOrders : 0;

    return summary;
  }
};