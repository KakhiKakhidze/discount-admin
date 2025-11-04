import axios from 'axios';
import Cookies from 'js-cookie';

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: `https://admin.discount.com.ge/en/api/`,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    (config) => {
      // Get auth token from localStorage or cookies (prioritize localStorage)
      const authToken = localStorage.getItem('adminToken') || Cookies.get('adminToken');
      if (authToken) {
        config.headers["Authorization"] = `Bearer ${authToken}`;
      }

      // Get CSRF token from cookies (if available)
      const csrftoken = Cookies.get("csrftoken");
      if (csrftoken) {
        config.headers["X-CSRFToken"] = csrftoken;
      }

      // Get session token from cookies (this should come from the domain)
      const sessionToken = Cookies.get("admin_session_token");
      if (sessionToken) {
        config.headers["X-Session-Token"] = sessionToken;
      }

      // Ensure baseURL is set correctly
      config.baseURL = `https://admin.discount.com.ge/en/api/`;

      console.log('=== Axios Request Debug ===');
      console.log('URL:', config.url);
      console.log('Method:', config.method);
      console.log('Base URL:', config.baseURL);
      console.log('Full URL:', `${config.baseURL}${config.url}`);
      console.log('Headers:', config.headers);
      console.log('CSRF Token:', csrftoken ? 'Present' : 'Missing');
      console.log('Auth Token:', authToken ? 'Present' : 'Missing');
      console.log('Session Token:', sessionToken ? 'Present' : 'Missing');
      console.log('Cookies available:', document.cookie);
      console.log('========================');

      return config; 
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for better error handling
  instance.interceptors.response.use(
    (response) => {
      console.log('=== Axios Response Success ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.log('Response Headers:', response.headers);
      console.log('Cookies after response:', document.cookie);
      console.log('========================');
      
      // Check if the server set any cookies in the response
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        console.log('Server set cookies:', setCookieHeader);
      }
      
      return response;
    },
    (error) => {
      console.error('=== Axios Response Error ===');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Data:', error.response?.data);
      console.error('Headers:', error.response?.headers);
      console.error('Config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        baseURL: error.config?.baseURL
      });
      console.error('========================');
      
      // Handle 401/403 errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Authentication error, clearing tokens...');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminPermissions');
        Cookies.remove('adminToken');
        Cookies.remove('adminUser');
        Cookies.remove('adminPermissions');
        
        // Note: User must manually logout or refresh to see login page
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Test function to debug authentication
export const testAuth = async () => {
  try {
    console.log('Testing authentication...');
    const instance = createAxiosInstance();
    
    // Test a simple GET request first
    const response = await instance.get('/admin/login/');
    console.log('Test response:', response);
    return response;
  } catch (error) {
    console.error('Auth test failed:', error.response?.status, error.response?.data);
    return { error: error.response?.status, data: error.response?.data };
  }
};

// Function to check cookie availability
export const checkCookies = () => {
  console.log('=== Cookie Check ===');
  console.log('All cookies:', document.cookie);
  console.log('adminToken cookie:', Cookies.get('adminToken'));
  console.log('admin_session_token cookie:', Cookies.get('admin_session_token'));
  console.log('adminUser cookie:', Cookies.get('adminUser'));
  console.log('adminPermissions cookie:', Cookies.get('adminPermissions'));
  console.log('csrftoken cookie:', Cookies.get('csrftoken'));
  console.log('LocalStorage adminToken:', localStorage.getItem('adminToken'));
  console.log('LocalStorage admin_session_token:', localStorage.getItem('admin_session_token'));
  console.log('==================');
};

// Function to set cookies with proper domain
export const setCookieWithDomain = (name, value, options = {}) => {
  const cookieOptions = {
    expires: 7, // 7 days
    path: '/',
    ...options
  };
  
  // Try to set with domain if we're not on localhost
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    cookieOptions.domain = window.location.hostname;
  }
  
  Cookies.set(name, value, cookieOptions);
  console.log(`Cookie ${name} set with options:`, cookieOptions);
};

// Function to manually set admin session token
export const setAdminSessionToken = (token) => {
  if (token) {
    setCookieWithDomain('admin_session_token', token);
    localStorage.setItem('admin_session_token', token);
    console.log('Admin session token set:', token);
  } else {
    console.warn('No token provided to setAdminSessionToken');
  }
};

// Comprehensive test function for cross-domain cookies
export const testCrossDomainCookies = async () => {
  console.log('=== Testing Cross-Domain Cookie Behavior ===');
  
  // Check current cookies
  console.log('Current cookies:', document.cookie);
  console.log('Current domain:', window.location.hostname);
  console.log('Target domain:', 'admin.discount.com.ge');
  
  try {
    // Test 1: Simple request to see if CORS is working
    console.log('\n--- Test 1: CORS Check ---');
    const corsTest = await fetch('http://admin.discount.com.ge/en/api/v1/admin/login/', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('CORS test status:', corsTest.status);
    console.log('CORS test headers:', Object.fromEntries(corsTest.headers.entries()));
    
    // Test 2: Axios request with credentials
    console.log('\n--- Test 2: Axios with Credentials ---');
    const instance = createAxiosInstance();
    const axiosTest = await instance.get('/admin/login/');
    console.log('Axios test successful:', axiosTest);
    
    return { corsTest: corsTest.status, axiosTest: 'success' };
  } catch (error) {
    console.error('Cross-domain test failed:', error);
    
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Request error - no response received');
    } else {
      console.error('Other error:', error.message);
    }
    
    return { error: error.message };
  }
};

export default createAxiosInstance;
