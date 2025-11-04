import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Visibility,
  Cancel,
  Refresh,
  Payment,
  Person,
  Email,
  Phone,
  CalendarToday,
  AttachMoney,
  CheckCircle,
  Error as ErrorIcon,
  Pending
} from '@mui/icons-material';
import adminOrderApiService from '../services/orderApi';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Order status options
  const statusOptions = [
    { value: 'all', label: 'ყველა' },
    { value: 'pending', label: 'მოლოდინში' },
    { value: 'paid', label: 'გადახდილი' },
    { value: 'cancelled', label: 'გაუქმებული' },
    { value: 'refunded', label: 'დაბრუნებული' }
  ];

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  // Status icons
  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle />;
      case 'pending': return <Pending />;
      case 'cancelled': return <Cancel />;
      case 'refunded': return <Refresh />;
      default: return <ErrorIcon />;
    }
  };

  // Load orders
  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      console.log('Loading orders with params:', params);
      const ordersResponse = await adminOrderApiService.getOrderFeed(params);
      console.log('Orders API response:', ordersResponse);
      
      const ordersData = ordersResponse.orders || ordersResponse.data || ordersResponse;
      console.log('Extracted orders data:', ordersData);
      console.log('Orders count:', Array.isArray(ordersData) ? ordersData.length : 'Not an array');
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error loading orders:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setError(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Load order details
  const loadOrderDetails = async (orderId) => {
    try {
      const orderDetails = await adminOrderApiService.getOrderDetails(orderId);
      setSelectedOrder(orderDetails);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error loading order details:', error);
      setError(error.message || 'Failed to load order details');
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminOrderApiService.updateOrderStatus(orderId, newStatus);
      await loadOrders(); // Reload orders
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error.message || 'Failed to update order status');
    }
  };

  // Cancel order
  const cancelOrder = async (orderId) => {
    try {
      await adminOrderApiService.cancelOrder(orderId, 'Cancelled by admin');
      await loadOrders(); // Reload orders
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError(error.message || 'Failed to cancel order');
    }
  };

  // Export orders
  const exportOrders = async () => {
    try {
      const blob = await adminOrderApiService.exportOrders({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting orders:', error);
      setError(error.message || 'Failed to export orders');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Load data on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Reload when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadOrders();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    return (
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          შეკვეთის დეტალები - #{selectedOrder.order_number || selectedOrder.id}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Customer Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                მომხმარებლის ინფორმაცია
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText 
                    primary="სახელი" 
                    secondary={selectedOrder.customer_name || `${selectedOrder.customer?.firstname} ${selectedOrder.customer?.lastname}`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Email /></ListItemIcon>
                  <ListItemText 
                    primary="ელ-ფოსტა" 
                    secondary={selectedOrder.customer_email || selectedOrder.customer?.email} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Phone /></ListItemIcon>
                  <ListItemText 
                    primary="ტელეფონი" 
                    secondary={selectedOrder.customer_phone || 'N/A'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="ქვეყანა" 
                    secondary={selectedOrder.customer_country || 'N/A'} 
                  />
                </ListItem>
              </List>
            </Grid>
            
            {/* Order Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                შეკვეთის ინფორმაცია
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="შეკვეთის ნომერი" 
                    secondary={`#${selectedOrder.order_number || selectedOrder.id}`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="მონაწილეთა რაოდენობა" 
                    secondary={selectedOrder.people_count || 0} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CalendarToday /></ListItemIcon>
                  <ListItemText 
                    primary="ღონისძიების თარიღი" 
                    secondary={selectedOrder.event_date ? new Date(selectedOrder.event_date).toLocaleDateString('ka-GE') : 'N/A'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="შენიშვნები" 
                    secondary={selectedOrder.notes || 'N/A'} 
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Event Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                ღონისძიების ინფორმაცია
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="ღონისძიების სახელი" 
                    secondary={selectedOrder.event?.name || 'N/A'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="აღწერა" 
                    secondary={selectedOrder.event?.description || 'N/A'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="მდებარეობა" 
                    secondary={selectedOrder.event?.location || 'N/A'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="ქალაქი" 
                    secondary={selectedOrder.event?.city?.name || 'N/A'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="კატეგორია" 
                    secondary={selectedOrder.event?.category?.name || 'N/A'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="კოორდინატები" 
                    secondary={selectedOrder.event?.latitude && selectedOrder.event?.longitude ? 
                      `${selectedOrder.event.latitude}, ${selectedOrder.event.longitude}` : 'N/A'} 
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Pricing Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                ფასების ინფორმაცია
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><AttachMoney /></ListItemIcon>
                  <ListItemText 
                    primary="ძირითადი ფასი" 
                    secondary={`${selectedOrder.base_price || selectedOrder.event?.base_price || 0}₾`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="ფასი ერთ ადამიანზე" 
                    secondary={`${selectedOrder.event?.price_per_person || 0}₾`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="ფასდაკლება" 
                    secondary={`${selectedOrder.discount_amount || 0}₾`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="ჯამი" 
                    secondary={`${selectedOrder.total_price || 0}₾`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="კომისია" 
                    secondary={`${selectedOrder.commission_amount || 0}₾`} 
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Event Details */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                ღონისძიების დეტალები
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="მინ. ადამიანი" 
                    secondary={selectedOrder.event?.min_people || 'N/A'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="მაქს. ადამიანი" 
                    secondary={selectedOrder.event?.max_people || 'N/A'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="ნახვების რაოდენობა" 
                    secondary={selectedOrder.event?.views_count || 0} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="დაჯავშნების რაოდენობა" 
                    secondary={selectedOrder.event?.bookings_count || 0} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="პოპულარული" 
                    secondary={selectedOrder.event?.is_popular ? 'კი' : 'არა'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="რეკომენდებული" 
                    secondary={selectedOrder.event?.is_featured ? 'კი' : 'არა'} 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              icon={getStatusIcon(selectedOrder.status)}
              label={`სტატუსი: ${selectedOrder.status}`}
              color={getStatusColor(selectedOrder.status)}
              variant="outlined"
            />
            <Chip
              icon={getStatusIcon(selectedOrder.payment_status)}
              label={`გადახდა: ${selectedOrder.payment_status}`}
              color={getStatusColor(selectedOrder.payment_status)}
              variant="outlined"
            />
            <Chip
              label={`შექმნილი: ${selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('ka-GE') : 'N/A'}`}
              variant="outlined"
            />
            <Chip
              label={`განახლებული: ${selectedOrder.updated_at ? new Date(selectedOrder.updated_at).toLocaleDateString('ka-GE') : 'N/A'}`}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            დახურვა
          </Button>
          {selectedOrder.status === 'pending' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => updateOrderStatus(selectedOrder.id, 'paid')}
            >
              მონიშნე გადახდილად
            </Button>
          )}
          {selectedOrder.status !== 'cancelled' && (
            <Button
              variant="contained"
              color="error"
              onClick={() => cancelOrder(selectedOrder.id)}
            >
              გაუქმება
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary">
          შეკვეთები
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportOrders}
          >
            ექსპორტი
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadOrders}
            disabled={loading}
          >
            განახლება
          </Button>
        </Box>
      </Box>


      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="ძებნა მომხმარებლის სახელით, ელ-ფოსტით ან შეკვეთის ნომრით..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>სტატუსი</InputLabel>
                <Select
                  value={statusFilter}
                  label="სტატუსი"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Debug Information */}
      <Box mb={3} p={2} bgcolor="info.50" borderRadius={1} border="1px solid #2196f3">
        <Typography variant="subtitle2" color="info.main" gutterBottom>
          Debug Information:
        </Typography>
        <Typography variant="body2">
          Loading: {loading ? 'Yes' : 'No'} | 
          Error: {error || 'None'} | 
          Orders Count: {orders.length} | 
          Filtered Count: {filteredOrders.length}
        </Typography>
        {orders.length > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            First Order: {JSON.stringify(orders[0], null, 2)}
          </Typography>
        )}
      </Box>

      {/* Results */}
      {!loading && !error && (
        <Box mb={3}>
          <Typography variant="h6" color="text.secondary">
            ნაპოვნია {filteredOrders.length} შეკვეთა
          </Typography>
        </Box>
      )}

      {/* Orders Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>შეკვეთის ნომერი</TableCell>
                <TableCell>მომხმარებელი</TableCell>
                <TableCell>ელ-ფოსტა</TableCell>
                <TableCell>ტელეფონი</TableCell>
                <TableCell>ღონისძიება</TableCell>
                <TableCell>კატეგორია</TableCell>
                <TableCell>ქალაქი</TableCell>
                <TableCell>მონაწილეები</TableCell>
                <TableCell>თარიღი</TableCell>
                <TableCell>ფასი</TableCell>
                <TableCell>სტატუსი</TableCell>
                <TableCell>გადახდა</TableCell>
                <TableCell>მოქმედებები</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    <Typography variant="body1" color="text.secondary">
                      შეკვეთები არ მოიძებნა
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        #{order.order_number || order.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                          {order.customer_name?.charAt(0) || order.customer?.firstname?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {order.customer_name || `${order.customer?.firstname} ${order.customer?.lastname}`}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.customer_email || order.customer?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.customer_phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {order.event?.name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {order.event?.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.event?.category?.name || 'N/A'}
                        size="small"
                        sx={{ 
                          backgroundColor: order.event?.category?.color + '20',
                          color: order.event?.category?.color,
                          border: `1px solid ${order.event?.category?.color}`
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.event?.city?.name || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {order.people_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.event_date ? new Date(order.event_date).toLocaleDateString('ka-GE') : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {order.total_price || order.base_price || 0}₾
                        </Typography>
                        {order.discount_amount && parseFloat(order.discount_amount) > 0 && (
                          <Typography variant="caption" color="success.main">
                            -{order.discount_amount}₾ ფასდაკლება
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(order.payment_status)}
                        label={order.payment_status}
                        color={getStatusColor(order.payment_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => loadOrderDetails(order.id)}
                        title="დეტალები"
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Order Details Dialog */}
      {renderOrderDetails()}
    </Box>
  );
};

export default OrdersPage;
