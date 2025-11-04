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
  Block as BlockIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
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
          <BlockIcon
            sx={{
              fontSize: 64,
              color: 'error.main',
              mb: 2,
            }}
          />

          {/* Title */}
          <Typography variant="h4" component="h1" gutterBottom color="error">
            Access Denied
          </Typography>

          {/* Message */}
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            You don't have permission to access the admin panel. 
            Only authorized administrators can view this content.
          </Typography>

          {/* Alert */}
          <Alert severity="warning" sx={{ mb: 3 }}>
            If you believe this is an error, please contact your system administrator.
          </Alert>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/login')}
            >
              Back to Login
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

export default Unauthorized;
