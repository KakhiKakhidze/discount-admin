import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  setAdminCookie, 
  getAdminCookie, 
  removeAdminCookie, 
  setAdminSession 
} from '../utils/cookies';
import createAxiosInstance from '../services/axios';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  permissions: [],
  sessionId: null,
  sessionData: null,
  login: () => {},
  logout: () => {},
  refreshSession: () => {},
  loading: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  // Create axios instance
  const axiosInstance = createAxiosInstance();

  // Check if user is already logged in on app start
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check for stored authentication data
        const storedUser = getAdminCookie('adminUser');
        const storedPermissions = getAdminCookie('adminPermissions');
        const storedSessionId = getAdminCookie('admin_session_token');
        const storedSessionData = getAdminCookie('adminSessionData');

        if (storedUser) {
          // Restore user data without validation (to prevent logout on refresh)
          setUser(JSON.parse(storedUser));
          setPermissions(storedPermissions ? JSON.parse(storedPermissions) : []);
          setSessionId(storedSessionId);
          setSessionData(storedSessionData ? JSON.parse(storedSessionData) : null);
          console.log('Restored user session from stored data');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearStoredData = () => {
    removeAdminCookie('adminToken');
    removeAdminCookie('adminUser');
    removeAdminCookie('adminPermissions');
    removeAdminCookie('admin_session_token');
    removeAdminCookie('adminSessionData');
    setUser(null);
    setPermissions([]);
    setSessionId(null);
    setSessionData(null);
  };

  const validateSession = async (token, sessionId) => {
    try {
      const response = await axiosInstance.get('/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      // If we get here, session is valid
      console.log('Session validation successful');
    } catch (error) {
      console.error('Session validation error:', error);
      // Session is invalid, clear stored data
      clearStoredData();
      // Note: User must manually logout or refresh to see login page
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axiosInstance.post('v1/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const data = response.data;
      
      // Extract user data and permissions
      const userData = data.user || data;
      const userPermissions = data.permissions || data.roles || ['admin'];
      const sessionInfo = data.session || {};
      
      // Ensure admin role is always present for admin panel access
      if (!userPermissions.includes('admin')) {
        userPermissions.push('admin');
      }
      
      // Ensure basic permissions are present for admin users
      const basicPermissions = ['create', 'read', 'update', 'delete'];
      basicPermissions.forEach(permission => {
        if (!userPermissions.includes(permission)) {
          userPermissions.push(permission);
        }
      });
      
      // Store token, user data, permissions, and session info
      const tokenValue = data.token || data.access_token;
      const sessionToken = data.admin_session_token || data.session_token || sessionInfo.id || sessionInfo.session_id;
      
      console.log('Login - Token to store:', tokenValue ? 'exists' : 'null');
      console.log('Login - Session token from server:', sessionToken ? 'exists' : 'null');
      
      setAdminCookie('adminToken', tokenValue);
      setAdminCookie('adminUser', JSON.stringify(userData));
      setAdminCookie('adminPermissions', JSON.stringify(userPermissions));
      
      // Only set session token if we got one from the server
      if (sessionToken) {
        setAdminCookie('admin_session_token', sessionToken);
        setAdminCookie('adminSessionData', JSON.stringify(sessionInfo));
        
        // Also store in localStorage as fallback
        localStorage.setItem('admin_session_token', sessionToken);
        localStorage.setItem('adminSessionData', JSON.stringify(sessionInfo));
        
        setSessionId(sessionToken);
        setSessionData(sessionInfo);
      } else {
        console.warn('No session token received from server');
        // Clear any existing session data
        removeAdminCookie('admin_session_token');
        removeAdminCookie('adminSessionData');
        localStorage.removeItem('admin_session_token');
        localStorage.removeItem('adminSessionData');
        setSessionId(null);
        setSessionData(null);
      }
      
      // Store other data in localStorage as fallback
      localStorage.setItem('adminToken', tokenValue);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      localStorage.setItem('adminPermissions', JSON.stringify(userPermissions));
      
      console.log('Login - Cookies and localStorage set');
      
      setUser(userData);
      setPermissions(userPermissions);
      
      // Log session creation
      await logSessionActivity('login', userData.email || userData.username);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Call the logout endpoint
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      clearStoredData();
    }
  };

  const refreshSession = async () => {
    try {
      const token = getAdminCookie('adminToken');
      const currentSessionId = getAdminCookie('admin_session_token');
      
      if (!token || !currentSessionId) {
        return false;
      }

      const response = await axiosInstance.get('/v1/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = response.data;
      const newSessionInfo = data.session || {};
      
      // Update session data
      setAdminCookie('admin_session_token', newSessionInfo.id || newSessionInfo.session_id || currentSessionId);
      setAdminCookie('adminSessionData', JSON.stringify(newSessionInfo));
    
      setSessionId(newSessionInfo.id || newSessionInfo.session_id || currentSessionId);
      setSessionData(newSessionInfo);
      
      // Log session refresh
      await logSessionActivity('refresh', user?.email || user?.username);
      
      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  };

  const logSessionActivity = async (action, userIdentifier) => {
    try {
      const token = getAdminCookie('adminToken');
      const currentSessionId = getAdminCookie('admin_session_token');
      
      if (!token || !currentSessionId) return;

      // Session activity logging is now handled by the server automatically
      // No need to send explicit activity logs
    } catch (error) {
      console.error('Error logging session activity:', error);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && (permissions.includes('admin') || permissions.includes('super_admin'));

  // Check if user has specific permission
  const hasPermission = (permission) => {
    // If user is admin, they have all basic permissions
    if (isAdmin && (permissions.includes('admin') || permissions.includes('super_admin'))) {
      const basicPermissions = ['create', 'read', 'update', 'delete'];
      if (basicPermissions.includes(permission)) {
        return true;
      }
    }
    return isAdmin && (permissions.includes(permission) || permissions.includes('super_admin'));
  };

  // Check if user can perform specific actions
  const canCreate = hasPermission('create');
  const canRead = hasPermission('read');
  const canUpdate = hasPermission('update');
  const canDelete = hasPermission('delete');
  const canManageUsers = hasPermission('manage_users');
  const canManageSettings = hasPermission('manage_settings');

  const debugSessionTokens = () => {
    console.log('Admin Token:', getAdminCookie('adminToken'));
    console.log('Admin User:', getAdminCookie('adminUser'));
    console.log('Admin Permissions:', getAdminCookie('adminPermissions'));
    console.log('Admin Session Token:', getAdminCookie('admin_session_token'));
    console.log('Admin Session Data:', getAdminCookie('adminSessionData'));
    console.log('Local Admin Token:', localStorage.getItem('adminToken'));
    console.log('Local Admin User:', localStorage.getItem('adminUser'));
    console.log('Local Admin Permissions:', localStorage.getItem('adminPermissions'));
    console.log('Local Admin Session Token:', localStorage.getItem('admin_session_token'));
    console.log('Local Admin Session Data:', localStorage.getItem('adminSessionData'));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isAdmin,
      permissions,
      sessionId,
      sessionData,
      hasPermission,
      canCreate,
      canRead,
      canUpdate,
      canDelete,
      canManageUsers,
      canManageSettings,
      login, 
      logout, 
      refreshSession,
      debugSessionTokens,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
