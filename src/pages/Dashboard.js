import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Event as EventIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  LocationCity as CityIcon,
  Public as CountryIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { staffApi, eventApi, categoryApi, countryApi, cityApi, companyApi } from '../services/api';
import createAxiosInstance from '../services/axios';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeUsers: 0,
    categories: 0,
    cities: 0,
    countries: 0,
    companies: 0,
  });
  const [monthlyData, setMonthlyData] = useState([
    { name: 'Jan', events: 25, users: 80, revenue: 25000 },
    { name: 'Feb', events: 30, users: 95, revenue: 32000 },
    { name: 'Mar', events: 35, users: 110, revenue: 38000 },
    { name: 'Apr', events: 28, users: 85, revenue: 29000 },
    { name: 'May', events: 40, users: 120, revenue: 45000 },
    { name: 'Jun', events: 45, users: 135, revenue: 52000 },
  ]);
  const [categoryData, setCategoryData] = useState([
    { name: 'Water Activities', value: 35, color: '#0088FE' },
    { name: 'Land Activities', value: 25, color: '#00C49F' },
    { name: 'Entertainment', value: 20, color: '#FFBB28' },
    { name: 'Cultural', value: 15, color: '#FF8042' },
    { name: 'Adventure', value: 5, color: '#8884D8' },
  ]);

  const axiosInstance = createAxiosInstance();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize variables
      let eventsList = [];
      let usersList = [];
      let categoriesList = [];
      let citiesList = [];
      let countriesList = [];
      let companiesList = [];

      // Fetch events count
      try {
        console.log('Fetching events...');
        // Use the event API service
        const eventsResponse = await eventApi.getAll();
        console.log('Events response:', eventsResponse);
        
        if (Array.isArray(eventsResponse)) {
          eventsList = eventsResponse;
        } else if (eventsResponse?.data && Array.isArray(eventsResponse.data)) {
          eventsList = eventsResponse.data;
        } else if (eventsResponse?.results && Array.isArray(eventsResponse.results)) {
          eventsList = eventsResponse.results;
        } else if (eventsResponse?.events && Array.isArray(eventsResponse.events)) {
          eventsList = eventsResponse.events;
        }
        console.log('Processed events list:', eventsList);
      } catch (eventsError) {
        console.error('Error fetching events:', eventsError);
        eventsList = [];
      }

      // Fetch users count
      try {
        console.log('Fetching users...');
        const usersResponse = await staffApi.getAll();
        console.log('Users response:', usersResponse);
        
        if (Array.isArray(usersResponse)) {
          usersList = usersResponse;
        } else if (usersResponse?.data && Array.isArray(usersResponse.data)) {
          usersList = usersResponse.data;
        } else if (usersResponse?.results && Array.isArray(usersResponse.results)) {
          usersList = usersResponse.results;
        } else if (usersResponse?.users && Array.isArray(usersResponse.users)) {
          usersList = usersResponse.users;
        }
        console.log('Processed users list:', usersList);
      } catch (usersError) {
        console.error('Error fetching users:', usersError);
        usersList = [];
      }

      // Fetch categories count
      try {
        console.log('Fetching categories...');
        const categoriesResponse = await categoryApi.getAll();
        console.log('Categories response:', categoriesResponse);
        
        if (Array.isArray(categoriesResponse)) {
          categoriesList = categoriesResponse;
        } else if (categoriesResponse?.data && Array.isArray(categoriesResponse.data)) {
          categoriesList = categoriesResponse.data;
        } else if (categoriesResponse?.results && Array.isArray(categoriesResponse.results)) {
          categoriesList = categoriesResponse.results;
        }
        console.log('Processed categories list:', categoriesList);
      } catch (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        categoriesList = [];
      }

      // Fetch cities count
      try {
        console.log('Fetching cities...');
        const citiesResponse = await cityApi.getAll();
        console.log('Cities response:', citiesResponse);
        
        if (Array.isArray(citiesResponse)) {
          citiesList = citiesResponse;
        } else if (citiesResponse?.data && Array.isArray(citiesResponse.data)) {
          citiesList = citiesResponse.data;
        } else if (citiesResponse?.results && Array.isArray(citiesResponse.results)) {
          citiesList = citiesResponse.results;
        }
        console.log('Processed cities list:', citiesList);
      } catch (citiesError) {
        console.error('Error fetching cities:', citiesError);
        citiesList = [];
      }

      // Fetch countries count
      try {
        console.log('Fetching countries...');
        const countriesResponse = await countryApi.getAll();
        console.log('Countries response:', countriesResponse);
        
        if (Array.isArray(countriesResponse)) {
          countriesList = countriesResponse;
        } else if (countriesResponse?.data && Array.isArray(countriesResponse.data)) {
          countriesList = countriesResponse.data;
        } else if (countriesResponse?.results && Array.isArray(countriesResponse.results)) {
          countriesList = countriesResponse.results;
        }
        console.log('Processed countries list:', countriesList);
      } catch (countriesError) {
        console.error('Error fetching countries:', countriesError);
        countriesList = [];
      }

      // Fetch companies count
      try {
        console.log('Fetching companies...');
        const companiesResponse = await companyApi.getAll();
        console.log('Companies response:', companiesResponse);
        
        if (Array.isArray(companiesResponse)) {
          companiesList = companiesResponse;
        } else if (companiesResponse?.data && Array.isArray(companiesResponse.data)) {
          companiesList = companiesResponse.data;
        } else if (companiesResponse?.results && Array.isArray(companiesResponse.results)) {
          companiesList = companiesResponse.results;
        } else if (companiesResponse?.companies && Array.isArray(companiesResponse.companies)) {
          companiesList = companiesResponse.companies;
        }
        
        console.log('Processed companies list:', companiesList);
      } catch (companiesError) {
        console.error('Error fetching companies:', companiesError);
        companiesList = [];
      }

      // Update stats
      setStats({
        totalEvents: eventsList.length,
        activeUsers: usersList.length,
        categories: categoriesList.length,
        cities: citiesList.length,
        countries: countriesList.length,
        companies: companiesList.length,
      });

      // Generate monthly data based on events
      const currentMonth = new Date().getMonth();
      const monthlyStats = [];
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const monthName = new Date(2024, monthIndex).toLocaleDateString('en-US', { month: 'short' });
        monthlyStats.push({
          name: monthName,
          events: Math.floor(Math.random() * 50) + 20, // Mock data for now
          users: Math.floor(Math.random() * 100) + 50, // Mock data for now
          revenue: Math.floor(Math.random() * 30000) + 20000, // Mock data for now
        });
      }
      setMonthlyData(monthlyStats);

      // Generate category data based on actual categories
      if (categoriesList.length > 0) {
        const categoryStats = categoriesList.slice(0, 5).map((category, index) => ({
          name: category.name || `Category ${index + 1}`,
          value: Math.floor(Math.random() * 40) + 10, // Mock percentage data
          color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5],
        }));
        setCategoryData(categoryStats);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Debug logging for chart data
  useEffect(() => {
    console.log('Dashboard - monthlyData:', monthlyData);
    console.log('Dashboard - categoryData:', categoryData);
    console.log('Dashboard - stats:', stats);
  }, [monthlyData, categoryData, stats]);

  const statsCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents.toString(),
      icon: <EventIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#e3f2fd',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toString(),
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: '#e8f5e8',
    },
    {
      title: 'Categories',
      value: stats.categories.toString(),
      icon: <CategoryIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: '#fff8e1',
    },
    {
      title: 'Cities',
      value: stats.cities.toString(),
      icon: <CityIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: '#e1f5fe',
    },
    {
      title: 'Countries',
      value: stats.countries.toString(),
      icon: <CountryIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: '#f3e5f5',
    },
    {
      title: 'Companies',
      value: stats.companies.toString(),
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      color: '#ffebee',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchDashboardData}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card sx={{ bgcolor: stat.color }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Statistics
            </Typography>
            {monthlyData && monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="events" fill="#1976d2" />
                  <Bar dataKey="users" fill="#2e7d32" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography color="textSecondary">No data available for chart</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Event Categories
            </Typography>
            {categoryData && categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography color="textSecondary">No data available for chart</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trend
            </Typography>
            {monthlyData && monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#d32f2f" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography color="textSecondary">No data available for chart</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
