import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Avatar,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { staffApi, companyApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Users = () => {
  const { canCreate, canUpdate, canDelete, canRead } = useAuth();

  // ========================= STATE =========================
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [openLinkDialog, setOpenLinkDialog] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
    country: '',
    password: '',
    confirm_password: ''
  });

  // ========================= HELPERS =========================
  const notify = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get user company names (handles array of companies)
  const getUserCompanyNames = (user) => {
    if (!user.companies || user.companies.length === 0) return 'No Company';
    return user.companies.map(c => c.name).join(', ');
  };

  // ========================= FETCH DATA =========================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getAll();
      let usersList = [];

      if (Array.isArray(response)) usersList = response;
      else if (response?.data) usersList = response.data;
      else if (response?.results) usersList = response.results;
      else if (response?.users) usersList = response.users;

      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      notify(`Error fetching users: ${error.response?.data?.detail || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companyApi.getAll();
      let companiesList = [];

      if (Array.isArray(response)) companiesList = response;
      else if (response?.data) companiesList = response.data;
      else if (response?.results) companiesList = response.results;
      else if (response?.companies) companiesList = response.companies;

      setCompanies(companiesList);
    } catch (error) {
      console.error('Error fetching companies:', error);
      notify(`Error fetching companies: ${error.response?.data?.detail || error.message}`, 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  // ========================= CRUD LOGIC =========================
  const validateForm = () => {
    const { firstname, lastname, email, password, confirm_password } = formData;
    if (!firstname.trim()) return notify('First name is required', 'error'), false;
    if (!lastname.trim()) return notify('Last name is required', 'error'), false;
    if (!email.trim()) return notify('Email is required', 'error'), false;
    if (!email.includes('@')) return notify('Invalid email', 'error'), false;

    if (!editingUser && !password)
      return notify('Password is required for new users', 'error'), false;

    if (password && password !== confirm_password)
      return notify('Passwords do not match', 'error'), false;

    if (password && password.length < 6)
      return notify('Password must be at least 6 characters long', 'error'), false;

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        country: formData.country.trim()
      };

      if (formData.password.trim()) payload.password = formData.password.trim();

      if (editingUser) {
        await staffApi.update(editingUser.id, payload);
        notify('User updated successfully');
      } else {
        await staffApi.create(payload);
        notify('User created successfully');
      }

      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      notify(error.response?.data?.detail || error.message || 'Error saving user', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await staffApi.delete(userId);
      notify('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      notify(`Error deleting user: ${error.response?.data?.detail || error.message}`, 'error');
    }
  };

  // ========================= DIALOGS =========================
  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        mobile: user.mobile || '',
        country: user.country || '',
        password: '',
        confirm_password: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        mobile: '',
        country: '',
        password: '',
        confirm_password: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      mobile: '',
      country: '',
      password: '',
      confirm_password: ''
    });
  };

  // ========================= LINKING =========================
  const handleUserSelection = (userId, checked) => {
    setSelectedUsers(prev =>
      checked ? [...prev, userId] : prev.filter(id => id !== userId)
    );
  };

  const handleLinkStaffToCompany = async () => {
    if (!selectedCompany) return notify('Please select a company', 'error');
    if (selectedUsers.length === 0) return notify('Select at least one user', 'error');

    try {
      await staffApi.linkToCompany(selectedCompany, selectedUsers);
      notify(`Linked ${selectedUsers.length} user(s) to company`);
      setSelectedUsers([]);
      setSelectedCompany('');
      setOpenLinkDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Error linking staff:', error);
      notify(`Error linking staff: ${error.response?.data?.detail || error.message}`, 'error');
    }
  };

  // ========================= RENDER =========================
  return (
    <Box>
      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Users Management</Typography>
        <Box>
          {canCreate && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ mr: 2 }}>
              Add User
            </Button>
          )}
          {canUpdate && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<LinkIcon />}
              onClick={() => setOpenLinkDialog(true)}
              sx={{ mr: 2 }}
            >
              Link to Company
            </Button>
          )}
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchUsers} disabled={loading}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* USERS TABLE */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedUsers(users.map(u => u.id));
                      else setSelectedUsers([]);
                    }}
                  />
                </TableCell>
                <TableCell>User</TableCell>
                <TableCell>Companies</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                    />
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        {user.firstname?.[0] || '?'}
                        {user.lastname?.[0] || ''}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {user.firstname} {user.lastname}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{getUserCompanyNames(user)}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {canRead && (
                        <Tooltip title="View">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canUpdate && (
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(user)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDelete && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ADD/EDIT USER DIALOG */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="First Name" value={formData.firstname} onChange={(e) => handleInputChange('firstname', e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Last Name" value={formData.lastname} onChange={(e) => handleInputChange('lastname', e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Mobile" value={formData.mobile} onChange={(e) => handleInputChange('mobile', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Country" value={formData.country} onChange={(e) => handleInputChange('country', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={editingUser ? 'New Password (optional)' : 'Password'}
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required={!editingUser}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={editingUser ? 'Confirm New Password' : 'Confirm Password'}
                type="password"
                value={formData.confirm_password}
                onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                required={!editingUser}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* LINK TO COMPANY DIALOG */}
      <Dialog open={openLinkDialog} onClose={() => setOpenLinkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Link Staff to Company</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Company</InputLabel>
            <Select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} label="Select Company">
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Selected Users: {selectedUsers.length}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLinkDialog(false)}>Cancel</Button>
          <Button
            onClick={handleLinkStaffToCompany}
            variant="contained"
            disabled={!selectedCompany || selectedUsers.length === 0}
          >
            Link Staff
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Users;
