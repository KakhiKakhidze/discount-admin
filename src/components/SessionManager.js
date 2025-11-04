import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAdminCookie } from '../utils/cookies';



const SessionManager = () => {
  const { 
    isAuthenticated, 
    sessionId, 
    sessionData, 
    refreshSession, 
    logout,
    user 
  } = useAuth();
  
  const sessionRefreshInterval = useRef(null);
  const activityTimeout = useRef(null);

  // Session refresh interval (every 15 minutes)
  useEffect(() => {
    if (isAuthenticated && sessionId) {
      sessionRefreshInterval.current = setInterval(async () => {
        const success = await refreshSession();
        if (!success) {
          // Session refresh failed, but don't logout automatically
          console.log('Session refresh failed, but keeping user logged in');
        }
      }, 15 * 60 * 1000); // 15 minutes
    }

    return () => {
      if (sessionRefreshInterval.current) {
        clearInterval(sessionRefreshInterval.current);
      }
    };
  }, [isAuthenticated, sessionId, refreshSession, logout]);

  // Activity monitoring (reset timeout on user activity)
  useEffect(() => {
    if (isAuthenticated && sessionId) {
      const resetActivityTimeout = () => {
        if (activityTimeout.current) {
          clearTimeout(activityTimeout.current);
        }
        
        // Set timeout for 30 minutes of inactivity
        activityTimeout.current = setTimeout(() => {
          console.log('Session expired due to inactivity, but keeping user logged in');
          // Note: User must manually logout
        }, 30 * 60 * 1000); // 30 minutes
      };

      // Reset timeout on user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      events.forEach(event => {
        document.addEventListener(event, resetActivityTimeout, true);
      });

      // Initial timeout reset
      resetActivityTimeout();

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetActivityTimeout, true);
        });
        
        if (activityTimeout.current) {
          clearTimeout(activityTimeout.current);
        }
      };
    }
  }, [isAuthenticated, sessionId, logout]);

  // Log session start
  useEffect(() => {
    if (isAuthenticated && sessionId && user) {
      console.log('Admin session started:', {
        sessionId,
        user: user.email || user.username,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
    }
  }, [isAuthenticated, sessionId, user]);

  // This component doesn't render anything
  return null;
};

export default SessionManager;
