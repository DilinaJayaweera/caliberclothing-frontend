import { api } from './api';

export const productService = {
  // Product operations
  async getAllProducts() {
    try {
      const response = await api.get('/products');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch products');
    }
  },

  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch product');
    }
  },

  async getProductByProductNo(productNo) {
    try {
      const response = await api.get(`/products/by-product-no/${productNo}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch product');
    }
  },

  async searchProducts(searchTerm) {
    try {
      const response = await api.get(`/products/search?name=${encodeURIComponent(searchTerm)}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to search products');
    }
  },

  async getProductsByCategory(categoryId) {
    try {
      const response = await api.get(`/products/category/${categoryId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch products by category');
    }
  },

  async getProductsBySupplier(supplierId) {
    try {
      const response = await api.get(`/products/supplier/${supplierId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch products by supplier');
    }
  },

  async getLowStockProducts(threshold = 10) {
    try {
      const response = await api.get(`/products/low-stock?threshold=${threshold}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch low stock products');
    }
  },

  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create product');
    }
  },

  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update product');
    }
  },

  async deleteProduct(id) {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete product');
    }
  },

  async updateProductStock(id, quantity) {
    try {
      const response = await api.put(`/products/${id}/stock?quantity=${quantity}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update product stock');
    }
  },

  // Category operations
  async getCategories() {
    try {
      const response = await api.get('/categories');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch categories');
    }
  },

  async getCategoryById(id) {
    try {
      const response = await api.get(`/categories/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch category');
    }
  },

  async getCategoryByCategoryNo(categoryNo) {
    try {
      const response = await api.get(`/categories/by-category-no/${categoryNo}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch category');
    }
  },

  async searchCategories(name) {
    try {
      const response = await api.get(`/categories/search?name=${encodeURIComponent(name)}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to search categories');
    }
  },

  async createCategory(categoryData) {
    try {
      const response = await api.post('/categories', categoryData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create category');
    }
  },

  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update category');
    }
  },

  async deleteCategory(id) {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete category');
    }
  },
};