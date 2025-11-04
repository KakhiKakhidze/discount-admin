import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const Settings = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SettingsIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6">General Settings</Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Site Name"
                defaultValue="Discount Tourism"
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Contact Email"
                defaultValue="admin@discount.ge"
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Phone Number"
                defaultValue="+995 555 123 456"
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Address"
                defaultValue="Batumi, Georgia"
                margin="normal"
              />
              
              <Button variant="contained" sx={{ mt: 2 }}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Email Notifications"
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="SMS Notifications"
              />
              
              <FormControlLabel
                control={<Switch />}
                label="Push Notifications"
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                System Settings
              </Typography>
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Maintenance Mode"
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Auto Backup"
              />
              
              <FormControlLabel
                control={<Switch />}
                label="Debug Mode"
              />
              
              <Button variant="contained" sx={{ mt: 2 }}>
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
