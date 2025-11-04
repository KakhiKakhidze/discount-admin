import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Divider,
  Button,
  Menu,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  LocationCity as CityIcon,
  Category as CategoryIcon,
  People as UserIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Info as InfoIcon,
  Public as CountryIcon,
  Business as CompanyIcon,
  Home as HomeIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  ShoppingCart as OrdersIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import SessionInfo from './SessionInfo';
import { getAdminCookie } from '../utils/cookies';
import logo from '../logo.jpg';
const drawerWidth = 240;

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Events', icon: <EventIcon />, path: '/events' },
  { text: 'Orders', icon: <OrdersIcon />, path: '/orders' },
  { text: 'Cities', icon: <CityIcon />, path: '/cities' },
  { text: 'Countries', icon: <CountryIcon />, path: '/countries' },
  { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
  { text: 'Companies', icon: <CompanyIcon />, path: '/companies' },
  { text: 'Users', icon: <UserIcon />, path: '/users' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

function Sidebar() {
  const location = useLocation();
  const { user, logout, permissions, sessionId, sessionData } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [sessionInfoOpen, setSessionInfoOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleSessionInfo = () => {
    handleMenuClose();
    setSessionInfoOpen(true);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', bgcolor: 'primary.main', boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            {/* App Bar Logo */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mr: 2
            }}>
              {/* Random Logo - Replace with your actual logo */}
              <img 
                src={logo} 
                alt="Company Logo" 
                style={{ 
                  height: '100px', 
                  maxWidth: '180px',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }} 
              />
            </Box>
            
            <Typography variant="h6" noWrap component="div" sx={{ color: 'white', fontWeight: 600 }}>
              Admin
            </Typography>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
              <SearchIcon sx={{ color: 'white', opacity: 0.8 }} />
              <NotificationsIcon sx={{ color: 'white', opacity: 0.8 }} />
            </Box>
          </Box>
          
          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              onClick={handleMenuOpen}
              startIcon={<AccountIcon />}
              sx={{ 
                textTransform: 'none',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              {user?.email || user?.username || user?.name || 'Admin'}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleSessionInfo}>
                <ListItemIcon>
                  <InfoIcon fontSize="small" />
                </ListItemIcon>
                Session Info
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#f8f9fa',
            borderRight: '1px solid #e0e0e0',
          },
        }}
        anchor="left"
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          {/* Logo Section */}
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
            <img 
              src={logo} 
              alt="Company Logo" 
              style={{ 
                maxWidth: '300px', 
                maxHeight: '200px', 
                objectFit: 'contain' 
              }} 
            />
          </Box>
          
          {/* User Info Section */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <AdminIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600, mb: 0.5 }}>
                Admin
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                {user?.email || user?.username || user?.name || 'Administrator'}
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5, fontWeight: 500 }}>
                {permissions?.includes('super_admin') ? 'Super Admin' : 'Administrator'}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <List sx={{ px: 1, py: 2 }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  onClick={isMobile ? handleDrawerToggle : undefined}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      {/* Session Info Dialog */}
      <SessionInfo 
        open={sessionInfoOpen} 
        onClose={() => setSessionInfoOpen(false)} 
      />
    </>
  );
}

export default Sidebar;
