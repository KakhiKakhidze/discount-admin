import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  DialogContentText,
} from '@mui/material';
import {
  Business as CompanyIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { companyApi } from '../services/api';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deleteCompanyId, setDeleteCompanyId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    founded_year: new Date().getFullYear(),
    is_verified: false,
    is_active: true,
    email: '',
    phone: '',
    ceo: '',
    expires_at: '',
    identity_number: '',
    address: '',
    company_id: 0,
    user_id: 0,
  });

  // Load companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching companies from /en/api/v1/staff/company/admin/list...');
      
      const response = await companyApi.getAll();
      console.log('Company API response:', response);
      
      let companiesList = [];
      if (Array.isArray(response)) {
        companiesList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        companiesList = response.data;
      } else if (response?.results && Array.isArray(response.results)) {
        companiesList = response.results;
      }
      
      console.log('Processed companies list:', companiesList);
      setCompanies(companiesList);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (company = null) => {
    if (company) {
      setEditingCompany(company);
      // Format date and time for input fields
      let formattedDate = '';
      let formattedTime = '23:59';
      if (company.expires_at) {
        const date = new Date(company.expires_at);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
          formattedTime = date.toTimeString().slice(0, 5); // HH:MM format
        }
      }
      
      setFormData({
        name: company.name || '',
        description: company.description || '',
        founded_year: company.founded_year || new Date().getFullYear(),
        is_verified: company.is_verified || false,
        is_active: company.is_active !== undefined ? company.is_active : true,
        email: company.email || '',
        phone: company.phone || '',
        ceo: company.ceo || '',
        expires_at: formattedDate,
        identity_number: company.identity_number || '',
        address: company.address || '',
        company_id: company.company_id || company.id || null,
        user_id: company.user_id || null,
      });
    } else {
      setEditingCompany(null);
      // Set default expiration date to 1 year from now
      const defaultExpirationDate = new Date();
      defaultExpirationDate.setFullYear(defaultExpirationDate.getFullYear() + 1);
      const formattedDefaultDate = defaultExpirationDate.toISOString().split('T')[0];
      
      setFormData({
        name: '',
        description: '',
        founded_year: new Date().getFullYear(),
        is_verified: false,
        is_active: true,
        email: '',
        phone: '',
        ceo: '',
        expires_at: formattedDefaultDate,
        identity_number: '',
        address: '',
        company_id: null,
        user_id: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCompany(null);
    // Set default expiration date to 1 year from now
    const defaultExpirationDate = new Date();
    defaultExpirationDate.setFullYear(defaultExpirationDate.getFullYear() + 1);
    const formattedDefaultDate = defaultExpirationDate.toISOString().split('T')[0];
    
    setFormData({
      name: '',
      description: '',
      founded_year: new Date().getFullYear(),
      is_verified: false,
      is_active: true,
      email: '',
      phone: '',
      ceo: '',
      expires_at: formattedDefaultDate,
      identity_number: '',
      address: '',
      company_id: null,
      user_id: null,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Prepare data for submission
      const submitData = { ...formData };
      
      console.log('Saving company with data:', submitData);
      console.log('Editing company:', editingCompany);
      
      if (editingCompany) {
        // Update existing company
        console.log('Updating existing company...');
        await companyApi.update(editingCompany.id, submitData);
        setCompanies(companies.map(company => 
          company.id === editingCompany.id 
            ? { ...company, ...submitData }
            : company
        ));
      } else {
        // Create new company
        console.log('Creating new company...');
        const response = await companyApi.create(submitData);
        setCompanies([...companies, response.data || response]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving company:', error);
      setError(`Failed to ${editingCompany ? 'update' : 'create'} company: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDeleteClick = (companyId) => {
    setDeleteCompanyId(companyId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await companyApi.delete(deleteCompanyId);
      setCompanies(companies.filter(company => company.id !== deleteCompanyId));
      setOpenDeleteDialog(false);
      setDeleteCompanyId(null);
    } catch (error) {
      console.error('Error deleting company:', error);
      setError(`Failed to delete company: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setDeleteCompanyId(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Companies Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Company
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {companies.map((company) => (
          <Grid item xs={12} sm={6} md={4} key={company.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <CompanyIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {company.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {company.id}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Chip
                      label={company.is_active ? 'Active' : 'Inactive'}
                      color={company.is_active ? 'success' : 'default'}
                      size="small"
                    />
                    {company.is_verified && (
                      <Chip
                        label="Verified"
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
                
                {company.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {company.description}
                  </Typography>
                )}

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  {company.ceo && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>CEO:</strong> {company.ceo}
                    </Typography>
                  )}
                  {company.email && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Email:</strong> {company.email}
                    </Typography>
                  )}
                  {company.phone && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Phone:</strong> {company.phone}
                    </Typography>
                  )}
                  {company.address && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Address:</strong> {company.address}
                    </Typography>
                  )}
                  {company.identity_number && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>ID:</strong> {company.identity_number}
                    </Typography>
                  )}
                  {company.founded_year && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Founded:</strong> {company.founded_year}
                    </Typography>
                  )}
                  {company.expires_at && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Expires:</strong> {new Date(company.expires_at).toLocaleDateString()}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    <strong>Created:</strong> {company.created_at ? new Date(company.created_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(company)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(company.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Company Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCompany ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Founded Year"
                  type="number"
                  value={formData.founded_year}
                  onChange={(e) => handleInputChange('founded_year', parseInt(e.target.value) || '')}
                  required
                  inputProps={{ min: 1800, max: new Date().getFullYear() }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CEO"
                  value={formData.ceo}
                  onChange={(e) => handleInputChange('ceo', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Identity Number"
                  value={formData.identity_number}
                  onChange={(e) => handleInputChange('identity_number', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expires At"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => handleInputChange('expires_at', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Company expiration date (defaults to 1 year)"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Is Active</InputLabel>
                  <Select
                    value={formData.is_active}
                    label="Is Active"
                    onChange={(e) => handleInputChange('is_active', e.target.value)}
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Is Verified</InputLabel>
                  <Select
                    value={formData.is_verified}
                    label="Is Verified"
                    onChange={(e) => handleInputChange('is_verified', e.target.value)}
                  >
                    <MenuItem value={true}>Verified</MenuItem>
                    <MenuItem value={false}>Not Verified</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCompany ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this company? This action cannot be undone and will affect all associated staff members.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Companies;
