import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="error">
            Something went wrong
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            An error occurred while loading this component.
          </Typography>
          
          {this.state.error && (
            <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
              <Typography variant="body2" component="div">
                <strong>Error:</strong> {this.state.error.toString()}
              </Typography>
              {this.state.errorInfo && this.state.errorInfo.componentStack && (
                <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                  <strong>Component Stack:</strong>
                  <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </Typography>
              )}
            </Alert>
          )}
          
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mr: 2 }}
          >
            Reload Page
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
