import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const SessionInfo = ({ open, onClose }) => {
  const { 
    user, 
    sessionId, 
    sessionData, 
    permissions, 
    refreshSession,
    logout 
  } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');

  const handleRefreshSession = async () => {
    setRefreshing(true);
    setRefreshMessage('');
    
    try {
      const success = await refreshSession();
      if (success) {
        setRefreshMessage('Session refreshed successfully!');
      } else {
        setRefreshMessage('Failed to refresh session. Please login again.');
      }
    } catch (error) {
      setRefreshMessage('Error refreshing session: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getSessionStatus = () => {
    if (!sessionId) return 'No Session';
    if (sessionData?.expires_at) {
      const expiresAt = new Date(sessionData.expires_at);
      const now = new Date();
      if (expiresAt > now) {
        return 'Active';
      } else {
        return 'Expired';
      }
    }
    return 'Active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Expired': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          Session Information
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            User Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              <strong>Email:</strong> {user?.email || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Username:</strong> {user?.username || user?.name || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Role:</strong> 
              <Chip 
                label={permissions?.includes('super_admin') ? 'Super Admin' : 'Administrator'}
                color={permissions?.includes('super_admin') ? 'error' : 'primary'}
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Session Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              <strong>Session ID:</strong> {sessionId || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> 
              <Chip 
                label={getSessionStatus()}
                color={getStatusColor(getSessionStatus())}
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
            {sessionData?.created_at && (
              <Typography variant="body2">
                <strong>Created:</strong> {formatTimestamp(sessionData.created_at)}
              </Typography>
            )}
            {sessionData?.expires_at && (
              <Typography variant="body2">
                <strong>Expires:</strong> {formatTimestamp(sessionData.expires_at)}
              </Typography>
            )}
            {sessionData?.last_activity && (
              <Typography variant="body2">
                <strong>Last Activity:</strong> {formatTimestamp(sessionData.last_activity)}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Permissions
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {permissions?.map((permission) => (
              <Chip
                key={permission}
                label={permission}
                color="primary"
                variant="outlined"
                size="small"
              />
            )) || <Typography variant="body2" color="textSecondary">No permissions assigned</Typography>}
          </Box>
        </Box>

        {refreshMessage && (
          <Alert severity={refreshMessage.includes('successfully') ? 'success' : 'warning'} sx={{ mb: 2 }}>
            {refreshMessage}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshSession}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Session'}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={logout}
          >
            End Session
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionInfo;
