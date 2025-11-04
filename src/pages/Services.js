import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { Business as ServiceIcon } from '@mui/icons-material';

const Services = () => {
  const services = [
    { 
      id: 1, 
      name: 'Yacht Tours', 
      description: 'Luxury yacht tours in Batumi',
      price: '$150',
      status: 'Active',
      bookings: 45
    },
    { 
      id: 2, 
      name: 'Parachute Jumping', 
      description: 'Adventure parachute experiences',
      price: '$300',
      status: 'Active',
      bookings: 23
    },
    { 
      id: 3, 
      name: 'Quad Bike Tours', 
      description: 'Off-road quad bike adventures',
      price: '$80',
      status: 'Active',
      bookings: 67
    },
    { 
      id: 4, 
      name: 'Rafting', 
      description: 'White water rafting experiences',
      price: '$120',
      status: 'Active',
      bookings: 34
    },
    { 
      id: 5, 
      name: 'Sea Moto', 
      description: 'Jet ski and sea motor experiences',
      price: '$90',
      status: 'Active',
      bookings: 28
    },
    { 
      id: 6, 
      name: 'VIP Beach', 
      description: 'Premium beach services',
      price: '$200',
      status: 'Active',
      bookings: 15
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Services Management
      </Typography>
      
      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ServiceIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{service.name}</Typography>
                    <Typography color="textSecondary" variant="body2">
                      {service.description}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" color="primary">
                    {service.price}
                  </Typography>
                  <Chip 
                    label={service.status} 
                    color="success" 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {service.bookings} bookings this month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Services;
