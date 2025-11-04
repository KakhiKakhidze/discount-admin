import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  MyLocation,
  Search,
  Place,
  Navigation,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  CheckCircle,
  Map
} from '@mui/icons-material';

/**
 * Map Picker Component for Admin Panel
 * Allows users to select coordinates by clicking on a map
 */
const MapPicker = ({ 
  open,
  onClose,
  onLocationSelect,
  initialLocation = { lat: 41.6500, lng: 41.6333 },
  height = '400px'
}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(initialLocation);
  const [zoom, setZoom] = useState(13);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [manualCoords, setManualCoords] = useState({ lat: '', lng: '' });
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      setMapLoaded(false);
      setSelectedLocation(null);
      setSearchQuery('');
      setSearchResults([]);
      setError(null);
      setLoadingTimeout(false);
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    }
  }, [open]);

  // Initialize Google Map
  useEffect(() => {
    if (!open) return;

    // Set loading timeout
    const timeoutId = setTimeout(() => {
      if (!mapLoaded) {
        setLoadingTimeout(true);
        setError('Google Maps is taking too long to load. Please check your internet connection or API key configuration.');
      }
    }, 10000); // 10 second timeout

    const initMap = () => {
      if (window.google && mapRef.current && !mapLoaded) {
        try {
          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: mapCenter.lat, lng: mapCenter.lng },
            zoom: zoom,
            mapTypeId: 'roadmap',
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
          });

          // Add map click listener
          map.addListener('click', (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            
            const location = {
              lat: lat,
              lng: lng,
              address: `Selected Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`
            };
            
            console.log('MapPicker: Location clicked:', location);
            setSelectedLocation(location);

            // Add or update marker
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }
            
            markerRef.current = new window.google.maps.Marker({
              position: { lat: lat, lng: lng },
              map: map,
              title: 'Selected Location',
              animation: window.google.maps.Animation.DROP
            });

            // Add info window
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 10px;">
                  <h3>Selected Location</h3>
                  <p><strong>Latitude:</strong> ${lat.toFixed(6)}</p>
                  <p><strong>Longitude:</strong> ${lng.toFixed(6)}</p>
                </div>
              `
            });

            markerRef.current.addListener('click', () => {
              infoWindow.open(map, markerRef.current);
            });
          });

          // If initialLocation has valid coordinates, place a marker there
          if (initialLocation && initialLocation.lat && initialLocation.lng) {
            const location = {
              lat: initialLocation.lat,
              lng: initialLocation.lng,
              address: `Current Location (${initialLocation.lat.toFixed(6)}, ${initialLocation.lng.toFixed(6)})`
            };
            
            setSelectedLocation(location);
            
            // Add initial marker
            markerRef.current = new window.google.maps.Marker({
              position: { lat: initialLocation.lat, lng: initialLocation.lng },
              map: map,
              title: 'Current Location',
              animation: window.google.maps.Animation.DROP
            });

            // Add info window for initial marker
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 10px;">
                  <h3>Current Location</h3>
                  <p><strong>Latitude:</strong> ${initialLocation.lat.toFixed(6)}</p>
                  <p><strong>Longitude:</strong> ${initialLocation.lng.toFixed(6)}</p>
                </div>
              `
            });

            markerRef.current.addListener('click', () => {
              infoWindow.open(map, markerRef.current);
            });
          }

          googleMapRef.current = map;
          setMapLoaded(true);
          clearTimeout(timeoutId); // Clear timeout on successful load
        } catch (err) {
          console.error('Error initializing Google Map:', err);
          setError('Failed to initialize map');
          clearTimeout(timeoutId);
        }
      }
    };

    // Load Google Maps API if not already loaded
    if (!window.google) {
      // Check if API key is configured
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError('Google Maps API key is not configured. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your environment variables.');
        return;
      }
      
      const apiUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      
      const script = document.createElement('script');
      script.src = apiUrl;
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        clearTimeout(timeoutId);
        initMap();
      };
      script.onerror = (error) => {
        console.error('Google Maps API failed to load:', error);
        setError('Failed to load Google Maps API. Please check your API key and internet connection.');
        clearTimeout(timeoutId);
      };
      document.head.appendChild(script);
    } else {
      console.log('Google Maps API already loaded');
      initMap();
    }

    return () => {
      clearTimeout(timeoutId);
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [open, mapCenter, zoom, mapLoaded]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim() || !window.google) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const service = new window.google.maps.places.PlacesService(googleMapRef.current);
      const request = {
        query: searchQuery,
        fields: ['name', 'geometry', 'formatted_address']
      };

      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const searchResults = results.slice(0, 5).map(result => ({
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
            address: result.name,
            fullAddress: result.formatted_address
          }));
          
          setSearchResults(searchResults);
          
          // Center map on first result
          if (searchResults.length > 0) {
            setMapCenter({ lat: searchResults[0].lat, lng: searchResults[0].lng });
          }
        } else {
          setError('Search failed');
        }
        setLoading(false);
      });
    } catch (err) {
      setError('Search failed');
      setLoading(false);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    console.log('MapPicker: Search result selected:', result);
    
    setSelectedLocation(result);
    setMapCenter({ lat: result.lat, lng: result.lng });
  };

  // Handle current location
  const handleCurrentLocation = () => {
    if (navigator.geolocation && googleMapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const location = {
            lat: lat,
            lng: lng,
            address: 'Current Location'
          };
          
          setSelectedLocation(location);
          setMapCenter({ lat: lat, lng: lng });
        },
        (error) => {
          console.error('Error getting current location:', error);
          setError('Failed to get current location');
        }
      );
    }
  };

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedLocation && onLocationSelect) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  // Map controls
  const handleZoomIn = () => {
    if (googleMapRef.current) {
      const currentZoom = googleMapRef.current.getZoom();
      googleMapRef.current.setZoom(currentZoom + 1);
      setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (googleMapRef.current) {
      const currentZoom = googleMapRef.current.getZoom();
      googleMapRef.current.setZoom(currentZoom - 1);
      setZoom(currentZoom - 1);
    }
  };

  const handleCenterMap = () => {
    if (googleMapRef.current) {
      googleMapRef.current.setCenter({ lat: initialLocation.lat, lng: initialLocation.lng });
      setMapCenter({ lat: initialLocation.lat, lng: initialLocation.lng });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Map color="primary" />
          Select Location
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ position: 'relative' }}>
          {/* Search Bar */}
          <Box sx={{ 
            position: 'absolute', 
            top: 16, 
            left: 16, 
            right: 16, 
            zIndex: 1000,
            display: 'flex',
            gap: 1
          }}>
            <TextField
              fullWidth
              placeholder="Search for a place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              startIcon={loading ? <CircularProgress size={16} /> : <Search />}
            >
              Search
            </Button>
          </Box>

          {/* Map Container */}
          <Box
            ref={mapRef}
            sx={{
              width: '100%',
              height: height,
              borderRadius: 1,
              overflow: 'hidden',
              border: '2px solid #1976d2',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          />

          {/* Map Controls */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 16, 
            right: 16, 
            display: 'flex', 
            flexDirection: 'column',
            gap: 1
          }}>
            <IconButton
              onClick={handleZoomIn}
              sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              <ZoomIn />
            </IconButton>
            <IconButton
              onClick={handleZoomOut}
              sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              <ZoomOut />
            </IconButton>
            <IconButton
              onClick={handleCenterMap}
              sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              <CenterFocusStrong />
            </IconButton>
          </Box>

          {/* Current Location Button */}
          <Button
            variant="contained"
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
            }}
            onClick={handleCurrentLocation}
            startIcon={<MyLocation />}
          >
            Current Location
          </Button>

          {/* Selected Location Info */}
          {selectedLocation && (
            <Card sx={{ 
              position: 'absolute',
              top: 16,
              right: 16,
              minWidth: 250,
              bgcolor: 'white',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CheckCircle color="success" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Selected Location
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedLocation.address}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip 
                    label={`Lat: ${selectedLocation.lat.toFixed(6)}`} 
                    size="small" 
                    color="primary" 
                  />
                  <Chip 
                    label={`Lng: ${selectedLocation.lng.toFixed(6)}`} 
                    size="small" 
                    color="secondary" 
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Search Results
              </Typography>
              {searchResults.map((result, index) => (
                <Card 
                  key={index}
                  sx={{ 
                    p: 2, 
                    mb: 1, 
                    cursor: 'pointer',
                    border: selectedLocation?.lat === result.lat ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                  onClick={() => handleSearchResultSelect(result)}
                >
                  <Box display="flex" alignItems="center">
                    <Navigation sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {result.address}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          )}

          {/* Error Display */}
          {error && (
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.95)',
              zIndex: 1000
            }}>
              <Box textAlign="center" sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {loadingTimeout 
                    ? 'Google Maps is taking too long to load. You can:'
                    : 'To use the map picker, you need to:'
                  }
                </Typography>
                <Box component="ol" sx={{ textAlign: 'left', pl: 2 }}>
                  {loadingTimeout ? (
                    <>
                      <li>Check your internet connection</li>
                      <li>Verify your Google Maps API key is correct</li>
                      <li>Try refreshing the page</li>
                      <li>Or enter coordinates manually below</li>
                    </>
                  ) : (
                    <>
                      <li>Get a Google Maps API key from Google Cloud Console</li>
                      <li>Add it to your .env file as REACT_APP_GOOGLE_MAPS_API_KEY</li>
                      <li>Restart the development server</li>
                    </>
                  )}
                </Box>
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Manual Coordinate Input:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      label="Latitude"
                      type="number"
                      step="any"
                      value={manualCoords.lat}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Limit to 9 digits total
                        if (value.length <= 9) {
                          setManualCoords(prev => ({ ...prev, lat: value }));
                        }
                      }}
                      helperText="Max 9 digits total"
                      size="small"
                    />
                    <TextField
                      label="Longitude"
                      type="number"
                      step="any"
                      value={manualCoords.lng}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Limit to 9 digits total
                        if (value.length <= 9) {
                          setManualCoords(prev => ({ ...prev, lng: value }));
                        }
                      }}
                      helperText="Max 9 digits total"
                      size="small"
                    />
                  </Box>
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      if (manualCoords.lat && manualCoords.lng) {
                        // Format coordinates to have no more than 9 digits total
                        const formatCoordinate = (coord) => {
                          const str = coord.toString();
                          if (str.length <= 9) {
                            return parseFloat(coord);
                          }
                          // Truncate to 9 digits total
                          return parseFloat(str.substring(0, 9));
                        };

                        const location = {
                          lat: formatCoordinate(manualCoords.lat),
                          lng: formatCoordinate(manualCoords.lng),
                          address: `Manual: ${manualCoords.lat}, ${manualCoords.lng}`
                        };
                        onLocationSelect(location);
                      }
                    }}
                    disabled={!manualCoords.lat || !manualCoords.lng}
                    sx={{ mr: 1 }}
                  >
                    Use These Coordinates
                  </Button>
                  {loadingTimeout && (
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        setError(null);
                        setLoadingTimeout(false);
                        setMapLoaded(false);
                        // Clear any existing Google Maps scripts
                        const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
                        existingScripts.forEach(script => script.remove());
                        // Reset Google Maps
                        delete window.google;
                        // Trigger re-initialization
                        setTimeout(() => {
                          const event = new Event('retry-map');
                          window.dispatchEvent(event);
                        }, 100);
                      }}
                      sx={{ mr: 1 }}
                    >
                      Retry
                    </Button>
                  )}
                  <Button 
                    variant="outlined" 
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Loading State */}
          {!mapLoaded && !error && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.9)',
              zIndex: 1000
            }}>
              <Box textAlign="center">
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                  Loading Google Maps...
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  This may take a few moments
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    setError('Map loading skipped. You can enter coordinates manually below.');
                  }}
                >
                  Skip Map Loading
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={!selectedLocation}
        >
          Confirm Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MapPicker;
