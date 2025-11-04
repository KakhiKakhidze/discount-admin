import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Alert,
} from '@mui/material';
import {
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const InsufficientPermissions = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <SecurityIcon
            sx={{
              fontSize: 64,
              color: 'warning.main',
              mb: 2,
            }}
          />

          {/* Title */}
          <Typography variant="h4" component="h1" gutterBottom color="warning.main">
            Insufficient Permissions
          </Typography>

          {/* Message */}
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            You don't have the required permissions to access this feature. 
            Please contact your administrator to request additional access.
          </Typography>

          {/* Alert */}
          <Alert severity="info" sx={{ mb: 3 }}>
            You are logged in as an admin, but need specific permissions for this action.
          </Alert>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
            >
              Back to Dashboard
            </Button>
          </Box>

          {/* Footer */}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
            © 2024 Discount Admin Panel
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default InsufficientPermissions;
