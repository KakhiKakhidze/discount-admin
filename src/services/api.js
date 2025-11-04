import axios from 'axios';
import { getAdminCookie } from '../utils/cookies';

const API_BASE_URL = 'https://admin.discount.com.ge/en/api/v1';
const API_V2_BASE_URL = 'https://admin.discount.com.ge/en/api/v2';
const API_V5_BASE_URL = 'https://admin.discount.com.ge/en/api/v5';

// Get auth token from localStorage with fallback to cookies
const getAuthToken = () => {
  // Try to get from localStorage first (more reliable)
  const localToken = localStorage.getItem('adminToken');
  console.log('API - LocalStorage token:', localToken ? 'exists' : 'not found');
  
  if (localToken) {
    return localToken;
  }
  
  // Fallback to cookies
  const cookieToken = getAdminCookie('adminToken');
  console.log('API - Cookie token:', cookieToken ? 'exists' : 'not found');
  
  return cookieToken;
};

// Create axios instance with credentials
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Enable credentials to send cookies with requests
  withCredentials: true,
  // Set timeout
  timeout: 10000,
});

// Create v2 axios instance for v2 endpoints
const axiosInstanceV2 = axios.create({
  baseURL: API_V2_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Create v5 axios instance for v5 endpoints
const axiosInstanceV5 = axios.create({
  baseURL: API_V5_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to add auth token
const addAuthInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Request config:', {
        method: config.method,
        headers: config.headers,
        data: config.data
      });
      
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );
};

// Add auth interceptors to all instances
addAuthInterceptor(axiosInstance);
addAuthInterceptor(axiosInstanceV2);
addAuthInterceptor(axiosInstanceV5);

// Response interceptor to handle common responses
const addResponseInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => {
      console.log(`API Response: ${response.status} ${response.statusText}`);
      console.log('Response data:', response.data);
      return response.data;
    },
    (error) => {
      console.error('API request failed:', error);
      
      if (error.response) {
        // Server responded with error status
        console.log(`Error Response: ${error.response.status} ${error.response.statusText}`);
        console.log('Error data:', error.response.data);
        
        // Handle authentication errors
        if (error.response.status === 401) {
          console.log('Authentication failed (401), clearing token...');
          // Clear invalid token but don't redirect automatically
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          localStorage.removeItem('adminPermissions');
          localStorage.removeItem('admin_session_token');
          localStorage.removeItem('adminSessionData');
          // Note: User must manually logout or refresh to see login page
        }
      } else if (error.request) {
        // Request was made but no response received
        console.log('No response received:', error.request);
      } else {
        // Something else happened
        console.log('Error setting up request:', error.message);
      }
      
      throw error;
    }
  );
};

// Add response interceptors to all instances
addResponseInterceptor(axiosInstance);
addResponseInterceptor(axiosInstanceV2);
addResponseInterceptor(axiosInstanceV5);

// API service class using axios
class ApiService {
  constructor() {
    this.axios = axiosInstance;
  }

  // Custom axios request with specific configuration
  async axiosRequest(config) {
    const requestConfig = {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
      ...config
    };
    
    return this.axios.request(requestConfig);
  }

  // GET request
  async get(endpoint, config = {}) {
    return this.axios.get(endpoint, config);
  }

  // POST request
  async post(endpoint, data, config = {}) {
    console.log('POST request to:', endpoint);
    console.log('POST data:', data);
    console.log('POST config:', config);
    return this.axios.post(endpoint, data, config);
  }

  // PUT request
  async put(endpoint, data, config = {}) {
    return this.axios.put(endpoint, data, config);
  }

  // PATCH request
  async patch(endpoint, data, config = {}) {
    console.log('PATCH request to:', endpoint);
    console.log('PATCH data:', data);
    console.log('PATCH config:', config);
    return this.axios.patch(endpoint, data, config);
  }

  // DELETE request
  async delete(endpoint, config = {}) {
    return this.axios.delete(endpoint, config);
  }

  // Generic request method for custom configurations
  async request(config) {
    return this.axios.request(config);
  }
}

// Create API service instance
const apiService = new ApiService();

// Create v2 API service class
class ApiServiceV2 {
  constructor() {
    this.axios = axiosInstanceV2;
  }

  // GET request
  async get(endpoint, config = {}) {
    return this.axios.get(endpoint, config);
  }

  // POST request
  async post(endpoint, data, config = {}) {
    return this.axios.post(endpoint, data, config);
  }

  // DELETE request
  async delete(endpoint, config = {}) {
    return this.axios.delete(endpoint, config);
  }
}

// Create v2 API service instance
const apiServiceV2 = new ApiServiceV2();

// Authentication API endpoints
export const authApi = {
  login: (credentials) => apiService.post('/auth/login', credentials),
  getProfile: () => apiService.get('/auth/profile'),
  logout: () => apiService.post('/auth/logout'),
  createAdmin: (data) => apiService.post('/auth/create', data),
  listAdmins: () => apiService.get('/auth/list'),
};

// City API endpoints
export const cityApi = {
  getAll: () => apiService.get('/city/list'),
  getById: (id) => apiService.get(`/city/${id}`),
  create: (data) => apiService.post('/city/upload', data),
  update: (data) => apiService.patch('/city/upload', data),
  delete: (id) => apiService.delete(`/city/delete/${id}`),
};

// Remove duplicate staffApi definition as it's now defined above

// Event API endpoints
export const eventApi = {
  getAll: () => apiService.get('/event/feed'),
  getPopular: () => apiService.get('/event/feed/popular'),
  getFeatured: () => apiService.get('/event/feed/featured'),
  getDiscounted: () => apiService.get('/event/feed/discounted'),
  getById: (id) => apiService.get(`/event/${id}`),
  create: (data) => apiService.post('/event/create', data),
  getDetails: (id) => apiService.get(`/event/details/${id}`),
  update: (id, data) => apiService.patch(`/event/update/${id}`, data),
  delete: (id) => apiService.delete(`/event/delete/${id}`),
  // Event Images
  uploadImage: (eventId, formData) => apiService.post(`/event/${eventId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  updateImage: (eventId, imageId, data) => apiService.put(`/event/${eventId}/images/update/${imageId}`, data),
  deleteImage: (eventId, imageId) => apiService.delete(`/event/${eventId}/images/delete/${imageId}`),
};

// Event API V2 endpoints (keeping for backward compatibility)
export const eventApiV2 = {
  getAll: () => apiService.get('/event/feed'),
  getById: (id) => apiService.get(`/event/${id}`),
  getDetails: (id) => apiService.get(`/event/${id}`),
  create: (data) => apiService.post('/event/create', data),
  update: (id, data) => apiService.patch(`/event/update/${id}`, data),
  delete: (id) => apiService.delete(`/event/delete/${id}`),
  deleteImage: (eventId, imageId) => apiService.delete(`/event/${eventId}/images/delete/${imageId}`),
  updateImage: (eventId, imageId, data) => apiService.put(`/event/${eventId}/images/update/${imageId}`, data),
};

// Event API V5 endpoints (using v5 API for better data)
export const eventApiV5 = {
  getAll: () => axiosInstanceV5.get('/order/feed'),
  getById: (id) => axiosInstanceV5.get(`/order/details/${id}`),
  getDetails: (id) => axiosInstanceV5.get(`/order/details/${id}`),
  create: (data) => apiService.post('/event/create', data), // Keep using v1 for creation
  update: (id, data) => apiService.patch(`/event/update/${id}`, data), // Keep using v1 for updates
  delete: (id) => apiService.delete(`/event/delete/${id}`), // Keep using v1 for deletion
  deleteImage: (eventId, imageId) => apiService.delete(`/event/${eventId}/images/delete/${imageId}`),
  updateImage: (eventId, imageId, data) => apiService.put(`/event/${eventId}/images/update/${imageId}`, data),
};

// Category API endpoints
export const categoryApi = {
  // v1 endpoints
  getAll: () => apiService.get('/category/list'),
  getById: (id) => apiService.get(`/category/${id}`),
  create: (data) => apiService.post('/category/upload', data),
  update: (data) => apiService.patch('/category/upload', data),
  delete: (id) => apiService.delete(`/category/delete/${id}`),
  
  // v2 endpoints - Staff access (staff must belong to company)
  getByCompanyStaff: (companyId) => apiService.get(`/category/company/${companyId}/list`),
  
  // v2 endpoints - Admin access
  getByCompanyAdmin: (companyId) => apiService.get(`/category/admin/company/${companyId}/list`),
  
  // v2 endpoints - Admin linking
  linkCategoryToCompany: (companyId, categoryId) => apiService.post('/category/company-category', {
    company_id: companyId,
    category_id: categoryId
  }),
  
  // v2 endpoints - Admin unlinking
  unlinkCategoryFromCompany: (companyId, categoryId) => apiService.delete('/category/company-category', {
    data: { company_id: companyId, category_id: categoryId }
  }),
  
  // v2 endpoints - Get all company-category relationships
  getAllCompanyCategoryRelationships: () => {
    // Try the services endpoint first (matches Django admin URL structure)
    return apiService.get('/services/companycategory/list').catch(() => {
      // Fallback to category endpoint
      return apiService.get('/category/company-category');
    });
  },
  
  // Legacy methods for backward compatibility
  getByCompany: (companyId) => apiService.get(`/category/admin/company/${companyId}/list`),
  linkToCompany: (data) => apiService.post('/category/company-category', data),
};

// Country API endpoints
export const countryApi = {
  getAll: () => apiService.get('/country/list'),
  getById: (id) => apiService.get(`/country/${id}`),
  create: (data) => apiService.post('/country/upload', data),
  update: (data) => apiService.patch('/country/upload', data),
  delete: (id) => apiService.delete(`/country/delete/${id}`),
};

// Staff API endpoints
export const staffApi = {
  getAll: () => apiService.get('/staff/list'),
  getById: (id) => apiService.get(`/staff/${id}`),
  create: (data) => apiService.post('/staff/create', data),
  update: (id, data) => apiService.put(`/staff/update/${id}`, data),
  delete: (id) => apiService.delete(`/staff/delete/${id}`),
  
  // Staff-Company linking
  linkToCompany: (companyId, staffIds) => apiService.post(`/staff/company/link/${companyId}`, {
    staff_ids: staffIds
  }),
  unlinkFromCompany: (companyId, staffIds) => apiService.delete(`/staff/company/link/${companyId}`, {
    data: { staff_ids: staffIds }
  }),
};

// Company API endpoints
export const companyApi = {
  getAll: () => apiService.get('/staff/company/list'),
  getById: (id) => apiService.get(`/staff/company/${id}`),
  create: (data) => apiService.post('/staff/company/create', data),
  update: (id, data) => apiService.patch(`/staff/company/update/${id}`, data),
  delete: (id) => apiService.delete(`/staff/company/delete/${id}`),
  
  // Staff-Company linking
  linkStaff: (companyId, staffIds) => apiService.post(`/staff/company/link/${companyId}`, { 
    staff_ids: staffIds 
  }),
  unlinkStaff: (companyId, staffIds) => apiService.delete(`/staff/company/link/${companyId}`, { 
    data: { staff_ids: staffIds } 
  }),
};

// Customer API endpoints
export const customerApi = {
  getAll: () => apiService.get('/customer/list'),
  getById: (id) => apiService.get(`/customer/${id}`),
};

export default apiService;

// Debug function - can be called from browser console
window.testCityAPI = async () => {
  try {
    console.log('Testing city API with axios...');
    const response = await axiosInstance.get('/city/list/');
    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('Test failed:', error);
    return { error: error.message };
  }
};
