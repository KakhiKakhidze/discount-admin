import axios from 'axios';
import { getAdminCookie } from '../utils/cookies';

// Get auth token from localStorage with fallback to cookies (same as main API)
const getAuthToken = () => {
  // Try to get from localStorage first (more reliable)
  const localToken = localStorage.getItem('adminToken');
  console.log('Order API - LocalStorage token:', localToken ? 'exists' : 'not found');
  
  if (localToken) {
    return localToken;
  }
  
  // Fallback to cookies
  const cookieToken = getAdminCookie('adminToken');
  console.log('Order API - Cookie token:', cookieToken ? 'exists' : 'not found');
  
  return cookieToken;
};

/**
 * Admin Order API Service
 * Handles order management for admin panel
 * Integrates with backend Order API endpoints
 */
class AdminOrderApiService {
  constructor() {
    this.baseURL = 'https://admin.discount.com.ge/en/api/v5';
    
    // Create axios instance
    this.axios = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,
      timeout: 30000,
    });

    // Add request interceptor for auth and logging
    this.axios.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Order API - Added Authorization header with token');
        } else {
          console.log('Order API - No auth token found');
        }
        
        console.log(`Admin Order API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('Order API - Request headers:', config.headers);
        return config;
      },
      (error) => {
        console.error('Admin Order API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => {
        console.log(`Admin Order API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('Admin Order API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }


  /**
   * Get order feed (list of orders) for admin
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Order feed data
   */
  async getOrderFeed(params = {}) {
    try {
      console.log('Fetching order feed from:', `${this.baseURL}/order/feed`);
      const response = await this.axios.get(`/order/feed`);
      console.log('Order feed response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching order feed:', error);
      if (error.response?.status === 403) {
        throw new Error('Access denied. Please check your authentication.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      throw this.handleError(error);
    }
  }

  /**
   * Get order details by ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderDetails(orderId) {
    try {
      const response = await this.axios.get(`/order/details/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update order status
   * @param {number} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Update response
   */
  async updateOrderStatus(orderId, status) {
    try {
      const response = await this.axios.patch(`/api/${this.apiVersion}/order/${orderId}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Cancel an order
   * @param {number} orderId - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelOrder(orderId, reason = '') {
    try {
      const response = await this.axios.post(`/api/${this.apiVersion}/order/cancel/${orderId}`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw this.handleError(error);
    }
  }


  /**
   * Export orders to CSV
   * @param {Object} params - Query parameters
   * @returns {Promise<Blob>} CSV file blob
   */
  async exportOrders(params = {}) {
    try {
      const response = await this.axios.get(`/api/${this.apiVersion}/order/export`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get payment status for an order
   * @param {string} orderNumber - Order number
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(orderNumber) {
    try {
      const response = await this.axios.get(`/api/${this.apiVersion}/payment/status/${orderNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Refund an order
   * @param {number} orderId - Order ID
   * @param {number} amount - Refund amount
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} Refund response
   */
  async refundOrder(orderId, amount, reason = '') {
    try {
      const response = await this.axios.post(`/api/${this.apiVersion}/order/${orderId}/refund`, {
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error refunding order:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - Axios error
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || data?.error || `HTTP ${status} Error`;
      return new Error(`${message} (${status})`);
    } else if (error.request) {
      return new Error('Network error - please check your connection');
    } else {
      return new Error(error.message || 'Unknown error occurred');
    }
  }
}

// Create and export singleton instance
const adminOrderApiService = new AdminOrderApiService();
export default adminOrderApiService;
