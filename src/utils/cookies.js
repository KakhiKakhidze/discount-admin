import Cookies from 'js-cookie';

// Cookie configuration
const COOKIE_CONFIG = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax', // More permissive for development
  path: '/', // Available across the app
};

// Admin session cookie names
export const ADMIN_COOKIES = {
  TOKEN: 'adminToken',
  USER: 'adminUser',
  PERMISSIONS: 'adminPermissions',
  SESSION_ID: 'admin_session_token',
  SESSION_DATA: 'adminSessionData',
};

// Set a cookie with admin configuration
export const setAdminCookie = (name, value, options = {}) => {
  Cookies.set(name, value, { ...COOKIE_CONFIG, ...options });
};

// Get a cookie value
export const getAdminCookie = (name) => {
  return Cookies.get(name);
};

// Remove a cookie
export const removeAdminCookie = (name) => {
  Cookies.remove(name, { path: '/' });
};

// Clear all admin cookies
export const clearAllAdminCookies = () => {
  Object.values(ADMIN_COOKIES).forEach(cookieName => {
    removeAdminCookie(cookieName);
  });
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const token = getAdminCookie(ADMIN_COOKIES.TOKEN);
  const user = getAdminCookie(ADMIN_COOKIES.USER);
  return !!(token && user);
};

// Get admin token
export const getAdminToken = () => {
  return getAdminCookie(ADMIN_COOKIES.TOKEN);
};

// Get admin user data
export const getAdminUser = () => {
  const userData = getAdminCookie(ADMIN_COOKIES.USER);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing admin user data:', error);
      return null;
    }
  }
  return null;
};

// Get admin permissions
export const getAdminPermissions = () => {
  const permissions = getAdminCookie(ADMIN_COOKIES.PERMISSIONS);
  if (permissions) {
    try {
      return JSON.parse(permissions);
    } catch (error) {
      console.error('Error parsing admin permissions:', error);
      return [];
    }
  }
  return [];
};

// Set admin session data
export const setAdminSession = (token, user, permissions, sessionId, sessionData) => {
  setAdminCookie(ADMIN_COOKIES.TOKEN, token);
  setAdminCookie(ADMIN_COOKIES.USER, JSON.stringify(user));
  setAdminCookie(ADMIN_COOKIES.PERMISSIONS, JSON.stringify(permissions));
  setAdminCookie(ADMIN_COOKIES.SESSION_ID, sessionId);
  setAdminCookie(ADMIN_COOKIES.SESSION_DATA, JSON.stringify(sessionData));
};

export default {
  setAdminCookie,
  getAdminCookie,
  removeAdminCookie,
  clearAllAdminCookies,
  isAdminAuthenticated,
  getAdminToken,
  getAdminUser,
  getAdminPermissions,
  setAdminSession,
};
