import { api } from './api';

export const deliveryService = {
  // Delivery Provider operations
  async getAllProviders() {
    try {
      const response = await api.get('/delivery-providers');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch delivery providers');
    }
  },

  async getProviderById(id) {
    try {
      const response = await api.get(`/delivery-providers/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch delivery provider');
    }
  },

  async getActiveProviders() {
    try {
      const response = await api.get('/delivery-providers/active');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch active delivery providers');
    }
  },

  async createProvider(providerData) {
    try {
      const response = await api.post('/delivery-providers', providerData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create delivery provider');
    }
  },

  async updateProvider(id, providerData) {
    try {
      const response = await api.put(`/delivery-providers/${id}`, providerData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update delivery provider');
    }
  },

  async deleteProvider(id) {
    try {
      await api.delete(`/delivery-providers/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete delivery provider');
    }
  },

  // Delivery operations
  async getAllDeliveries() {
    try {
      const response = await api.get('/deliveries');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch deliveries');
    }
  },

  async getDeliveryById(id) {
    try {
      const response = await api.get(`/deliveries/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch delivery');
    }
  },

  async getDeliveryByTrackingNo(trackingNo) {
    try {
      const response = await api.get(`/deliveries/tracking/${trackingNo}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch delivery by tracking number');
    }
  },

  async getDeliveriesByServiceProvider(serviceProviderId) {
    try {
      const response = await api.get(`/deliveries/service-provider/${serviceProviderId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch deliveries by service provider');
    }
  },

  async getDeliveriesByStatus(statusId) {
    try {
      const response = await api.get(`/deliveries/status/${statusId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch deliveries by status');
    }
  },

  async getDeliveriesByOrder(orderId) {
    try {
      const response = await api.get(`/deliveries/order/${orderId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch deliveries by order');
    }
  },

  async getDeliveriesByDateRange(startDate, endDate, dateType = 'expected') {
    try {
      const start = startDate.toISOString();
      const end = endDate.toISOString();
      const response = await api.get(`/deliveries/${dateType}-date?startDate=${start}&endDate=${end}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch deliveries by date range');
    }
  },

  async createDelivery(deliveryData) {
    try {
      const response = await api.post('/deliveries', deliveryData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create delivery');
    }
  },

  async updateDelivery(id, deliveryData) {
    try {
      const response = await api.put(`/deliveries/${id}`, deliveryData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update delivery');
    }
  },

  async deleteDelivery(id) {
    try {
      await api.delete(`/deliveries/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete delivery');
    }
  },

  // Delivery Status operations
  async getAllDeliveryStatuses() {
    try {
      const response = await api.get('/delivery-status');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch delivery statuses');
    }
  },

  async getDeliveryStatusById(id) {
    try {
      const response = await api.get(`/delivery-status/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch delivery status');
    }
  },

  async getDeliveryStatusByValue(value) {
    try {
      const response = await api.get(`/delivery-status/value/${value}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch delivery status by value');
    }
  },

  async createDeliveryStatus(statusData) {
    try {
      const response = await api.post('/delivery-status', statusData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create delivery status');
    }
  },

  async updateDeliveryStatus(id, statusData) {
    try {
      const response = await api.put(`/delivery-status/${id}`, statusData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update delivery status');
    }
  },

  async deleteDeliveryStatus(id) {
    try {
      await api.delete(`/delivery-status/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete delivery status');
    }
  },

  // Utility functions
  generateTrackingNo() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TRK${timestamp.slice(-8)}${random}`;
  },

  validateDeliveryData(deliveryData) {
    const errors = [];

    if (!deliveryData.serviceProviderId) {
      errors.push('Delivery service provider is required');
    }

    if (!deliveryData.shippedDate) {
      errors.push('Shipped date is required');
    }

    if (!deliveryData.expectedDeliveryDate) {
      errors.push('Expected delivery date is required');
    }

    if (!deliveryData.trackingNo || deliveryData.trackingNo.trim() === '') {
      errors.push('Tracking number is required');
    }

    if (!deliveryData.statusId) {
      errors.push('Delivery status is required');
    }

    if (!deliveryData.orderId) {
      errors.push('Order is required');
    }

    return errors;
  },

  formatDeliveryData(formData) {
    return {
      deliveryServiceProvider: { id: parseInt(formData.serviceProviderId) },
      shippedDate: formData.shippedDate,
      expectedDeliveryDate: formData.expectedDeliveryDate,
      actualDeliveryDate: formData.actualDeliveryDate || null,
      trackingNo: formData.trackingNo || this.generateTrackingNo(),
      deliveryStatus: { id: parseInt(formData.statusId) },
      order: { id: parseInt(formData.orderId) },
      lastUpdatedTimestamp: new Date().toISOString()
    };
  },

  getDeliveryStatusColor(status) {
    const statusColors = {
      'PENDING': '#ffc107',
      'IN_TRANSIT': '#17a2b8',
      'OUT_FOR_DELIVERY': '#fd7e14',
      'DELIVERED': '#28a745',
      'FAILED': '#dc3545',
      'RETURNED': '#6f42c1'
    };

    return statusColors[status?.toUpperCase()] || '#6c757d';
  },

  formatDeliveryDisplay(delivery) {
    return {
      ...delivery,
      formattedShippedDate: delivery.shippedDate ? 
        new Date(delivery.shippedDate).toLocaleDateString() : null,
      formattedExpectedDate: delivery.expectedDeliveryDate ? 
        new Date(delivery.expectedDeliveryDate).toLocaleDateString() : null,
      formattedActualDate: delivery.actualDeliveryDate ? 
        new Date(delivery.actualDeliveryDate).toLocaleDateString() : null,
      statusColor: this.getDeliveryStatusColor(delivery.deliveryStatus?.value),
      isOverdue: delivery.expectedDeliveryDate && 
                 new Date(delivery.expectedDeliveryDate) < new Date() && 
                 !delivery.actualDeliveryDate
    };
  }
};