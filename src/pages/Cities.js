import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
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
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  LocationCity as CityIcon, 
  Add as AddIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { cityApi, countryApi } from '../services/api';
import createAxiosInstance from '../services/axios';

const Cities = () => {
  const { canCreate, canUpdate, canDelete, canRead, isAuthenticated } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [newCity, setNewCity] = useState({
    name: '',
    city_id: null,
    country_id: 1,
    is_active: true,
    population: 0
  });

  // API data
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);

  const axiosInstance = createAxiosInstance();

  // Fetch cities and countries on component mount
  useEffect(() => {
    fetchCities();
    fetchCountries();
  }, []);

  // Fetch cities from API
  const fetchCities = async () => {
    try {
      setLoading(true);
      console.log('Fetching cities from API...');
      const response = await cityApi.getAll();
      console.log('Cities API response:', response);
      
      let citiesData = [];
      if (Array.isArray(response)) {
        citiesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        citiesData = response.data;
      } else if (response && response.results && Array.isArray(response.results)) {
        citiesData = response.results;
      } else {
        console.warn('Unexpected cities API response format:', response);
        citiesData = [];
      }
      
      setCities(citiesData);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setSnackbar({
        open: true,
        message: `Error fetching cities: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch countries from API
  const fetchCountries = async () => {
    try {
      console.log('Fetching countries from API...');
      const response = await countryApi.getAll();
      console.log('Countries API response:', response);
      
      let countriesData = [];
      if (Array.isArray(response)) {
        countriesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        countriesData = response.data;
      } else if (response && response.results && Array.isArray(response.results)) {
        countriesData = response.results;
      } else {
        console.warn('Unexpected countries API response format:', response);
        countriesData = [];
      }
      
      setCountries(countriesData);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setSnackbar({
        open: true,
        message: `Error fetching countries: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
    }
  };

  // Function to get country name from country ID
  const getCountryName = (countryId) => {
    const country = countries.find(c => c.id === countryId);
    return country ? country.name : `Country ${countryId}`;
  };

  const handleOpenDialog = (city = null) => {
    if (city) {
      setEditingCity(city);
      setNewCity({
        name: city.name || '',
        country_id: city.country_id || city.country?.id || '',
        is_active: city.is_active || true,
        population: city.population || 0,
        city_id: city.city_id || city.id || null
      });
    } else {
      setEditingCity(null);
      setNewCity({
        name: '',
        country_id: countries.length > 0 ? countries[0].id : '',
        is_active: true,
        population: 0,
        city_id: null
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCity(null);
    setNewCity({
      name: '',
      country_id: countries.length > 0 ? countries[0].id : '',
      is_active: true,
      population: 0,
      city_id: null
    });
  };

  const handleInputChange = (field, value) => {
    setNewCity(prev => ({
      ...prev,
      [field]: field === 'country_id' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async () => {
    if (!newCity.name || !newCity.country_id || newCity.population === undefined || newCity.population === null) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields.',
        severity: 'warning'
      });
      return;
    }

    try {
      console.log('Saving city with data:', newCity);
      console.log('Editing city:', editingCity);
      
      if (editingCity) {
        // Update existing city
        console.log('Updating existing city...');
        await cityApi.update(newCity);
        setSnackbar({
          open: true,
          message: 'City updated successfully!',
          severity: 'success'
        });
      } else {
        // Create new city
        console.log('Creating new city...');
        await cityApi.create(newCity);
        setSnackbar({
          open: true,
          message: 'City created successfully!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      // Refresh cities list
      await fetchCities();
    } catch (error) {
      console.error('Error saving city:', error);
      setSnackbar({
        open: true,
        message: `Error saving city: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteCity = async (cityId) => {
    if (window.confirm('Are you sure you want to delete this city?')) {
      try {
        await cityApi.delete(cityId);
        setSnackbar({
          open: true,
          message: 'City deleted successfully!',
          severity: 'success'
        });
        // Refresh cities list
        await fetchCities();
      } catch (error) {
        console.error('Error deleting city:', error);
        setSnackbar({
          open: true,
          message: `Error deleting city: ${error.response?.data?.detail || error.message}`,
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          Authentication required. Please login first.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Cities Management
        </Typography>
      
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchCities}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            color="primary"
          >
            Add City
          </Button>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Loading cities...
          </Typography>
        </Box>
      ) : cities.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No cities found. Add your first city to get started.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {cities.map((city) => (
            <Grid item xs={12} sm={6} md={4} key={city.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CityIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{city.name}</Typography>
                      <Typography color="textSecondary">Country: {city.country?.name || getCountryName(city.country_id) || 'Unknown'}</Typography>
                    </Box>
                    <Box>
                      {canUpdate && (
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(city)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDelete && (
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteCity(city.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Population: {city.population?.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: {city.is_active ? 'Active' : 'Inactive'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit City Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCity ? 'Edit City' : 'Add New City'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="City Name"
              fullWidth
              value={newCity.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={newCity.country_id}
                label="Country"
                onChange={(e) => handleInputChange('country_id', e.target.value)}
                required
                disabled={countries.length === 0}
              >
                {countries.length === 0 ? (
                  <MenuItem disabled>Loading countries...</MenuItem>
                ) : (
                  countries.map((country) => (
                    <MenuItem key={country.id} value={country.id}>
                      {country.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {countries.length === 0 && (
                <Typography variant="caption" color="textSecondary">
                  Loading countries...
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Population"
              fullWidth
              type="number"
              value={newCity.population}
              onChange={(e) => handleInputChange('population', parseInt(e.target.value) || 0)}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newCity.is_active ? 'Active' : 'Inactive'}
                label="Status"
                onChange={(e) => handleInputChange('is_active', e.target.value === 'Active')}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCity ? 'Update' : 'Add'} City
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Cities;
