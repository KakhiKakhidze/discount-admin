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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Link as LinkIcon,
  LinkOff as UnlinkIcon,
  Water as WaterIcon,
  Terrain as LandIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { categoryApi, companyApi, eventApi } from '../services/api';
import createAxiosInstance from '../services/axios';

const Categories = () => {
  const { canCreate, canUpdate, canDelete, canRead, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [events, setEvents] = useState([]);
  const [categoryCompanyMap, setCategoryCompanyMap] = useState({});
  const [companyCategoryRelationships, setCompanyCategoryRelationships] = useState({});
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [openUnlinkDialog, setOpenUnlinkDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [showLinkedOnly, setShowLinkedOnly] = useState(false);
  const [openLinkedCompaniesDialog, setOpenLinkedCompaniesDialog] = useState(false);
  const [viewingCategory, setViewingCategory] = useState(null);

  const axiosInstance = createAxiosInstance();

  // Fetch categories and companies on component mount
  useEffect(() => {
    fetchCategories();
    fetchCompanies();
    fetchEvents();
  }, []);

  // Fetch company-category relationships when companies are loaded
  useEffect(() => {
    if (companies.length > 0) {
      fetchCompanyCategoryRelationships();
    }
  }, [companies]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories from API...');
      const response = await categoryApi.getAll();
      console.log('Categories API response:', response);
      
      let categoriesData = [];
      if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response && response.results && Array.isArray(response.results)) {
        categoriesData = response.results;
      } else {
        console.warn('Unexpected categories API response format:', response);
        categoriesData = [];
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({
        open: true,
        message: `Error fetching categories: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch companies from API
  const fetchCompanies = async () => {
    try {
      console.log('Fetching companies from API...');
      const response = await companyApi.getAll();
      console.log('Companies API response:', response);
      
      let companiesData = [];
      if (Array.isArray(response)) {
        companiesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        companiesData = response.data;
      } else if (response && response.results && Array.isArray(response.results)) {
        companiesData = response.results;
      } else {
        console.warn('Unexpected companies API response format:', response);
        companiesData = [];
      }
      
      setCompanies(companiesData);
      return companiesData;
    } catch (error) {
      console.error('Error fetching companies:', error);
      setSnackbar({
        open: true,
        message: `Error fetching companies: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
      return [];
    }
  };

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      console.log('Fetching events from API...');
      const response = await eventApi.getAll();
      console.log('Events API response:', response);
      
      let eventsData = [];
      if (Array.isArray(response)) {
        eventsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        eventsData = response.data;
      } else if (response && response.results && Array.isArray(response.results)) {
        eventsData = response.results;
      } else {
        console.warn('Unexpected events API response format:', response);
        eventsData = [];
      }
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Fetch company-category relationships from API
  const fetchCompanyCategoryRelationships = async (companiesToUse = null) => {
    try {
      const companiesList = companiesToUse || companies;
      const relationshipsMap = {};
      
      // Try to fetch all relationships directly first
      try {
        console.log('Attempting to fetch all company-category relationships directly...');
        const directResponse = await categoryApi.getAllCompanyCategoryRelationships();
        
        let relationshipsData = [];
        if (Array.isArray(directResponse)) {
          relationshipsData = directResponse;
        } else if (directResponse && directResponse.data && Array.isArray(directResponse.data)) {
          relationshipsData = directResponse.data;
        } else if (directResponse && directResponse.results && Array.isArray(directResponse.results)) {
          relationshipsData = directResponse.results;
        }
        
        console.log('Direct relationships response (raw):', directResponse);
        console.log('Direct relationships data:', relationshipsData);
        console.log('Number of relationships found:', relationshipsData.length);
        
        // Build map: categoryId -> companyIds
        relationshipsData.forEach((relationship) => {
          // Handle different response formats
          const categoryId = relationship.category_id || 
                           relationship.category?.id || 
                           relationship.category?.pk ||
                           relationship.category;
          
          const companyId = relationship.company_id || 
                           relationship.company?.id || 
                           relationship.company?.pk ||
                           relationship.company;
          
          console.log('Processing relationship:', { 
            raw: relationship, 
            categoryId, 
            companyId 
          });
          
          if (categoryId && companyId) {
            // Ensure we use consistent keys (convert to string for comparison)
            const catIdStr = String(categoryId);
            const compIdStr = String(companyId);
            
            if (!relationshipsMap[catIdStr]) {
              relationshipsMap[catIdStr] = [];
            }
            if (!relationshipsMap[catIdStr].includes(compIdStr)) {
              relationshipsMap[catIdStr].push(compIdStr);
            }
          }
        });
        
        console.log('Built relationships map from direct API:', relationshipsMap);
        console.log(`Found ${Object.keys(relationshipsMap).length} categories with relationships`);
      } catch (directError) {
        console.log('Direct API not available, falling back to per-company fetch:', directError.message);
        console.error('Direct API error details:', directError);
        
        // Fallback: Fetch categories for each company
        if (companiesList.length === 0) return;
        
        await Promise.all(
          companiesList.map(async (company) => {
            try {
              const companyId = company.id || company.company_id;
              if (!companyId) return;
              
              const response = await categoryApi.getByCompanyAdmin(companyId);
              
              let categoriesData = [];
              if (Array.isArray(response)) {
                categoriesData = response;
              } else if (response && response.data && Array.isArray(response.data)) {
                categoriesData = response.data;
              } else if (response && response.results && Array.isArray(response.results)) {
                categoriesData = response.results;
              }
              
              console.log(`Company ${companyId} has ${categoriesData.length} categories:`, categoriesData);
              
              // Build reverse map: categoryId -> companyIds
              categoriesData.forEach((category) => {
                const categoryId = category.id || category.category_id;
                if (categoryId) {
                  if (!relationshipsMap[categoryId]) {
                    relationshipsMap[categoryId] = [];
                  }
                  if (!relationshipsMap[categoryId].includes(companyId)) {
                    relationshipsMap[categoryId].push(companyId);
                  }
                }
              });
            } catch (error) {
              console.error(`Error fetching categories for company ${company.id}:`, error);
            }
          })
        );
      }
      
      console.log('Final Company-Category Relationships Map:', relationshipsMap);
      console.log(`Total categories with relationships: ${Object.keys(relationshipsMap).length}`);
      setCompanyCategoryRelationships(relationshipsMap);
    } catch (error) {
      console.error('Error fetching company-category relationships:', error);
    }
  };

  // Build map of categories to companies based on events
  useEffect(() => {
    if (events.length > 0 && companies.length > 0) {
      const map = {};
      
      events.forEach(event => {
        const categoryId = event.category?.id || event.category;
        const companyId = event.company?.id || event.company || event.company_id;
        
        if (categoryId && companyId) {
          if (!map[categoryId]) {
            map[categoryId] = new Set();
          }
          map[categoryId].add(companyId);
        }
      });
      
      // Convert Sets to Arrays for easier rendering
      const finalMap = {};
      Object.keys(map).forEach(categoryId => {
        finalMap[categoryId] = Array.from(map[categoryId]);
      });
      
      console.log('Category-Company Map:', finalMap);
      setCategoryCompanyMap(finalMap);
    }
  }, [events, companies]);

  const [newCategory, setNewCategory] = useState({
    name: '',
    activity: 'water',
    color: '#0088FE',
    description: '',
    order: 0,
    category_id: null,
    is_active: true,
    company_id: null
  });

  const activityOptions = [
    { value: 'water', label: 'Water Activities', icon: <WaterIcon /> },
    { value: 'land', label: 'Land Activities', icon: <LandIcon /> },
  ];

  const colorOptions = [
    { value: '#0088FE', label: 'Blue' },
    { value: '#00C49F', label: 'Green' },
    { value: '#FFBB28', label: 'Yellow' },
    { value: '#FF8042', label: 'Orange' },
    { value: '#8884D8', label: 'Purple' },
    { value: '#FF0000', label: 'Red' },
    { value: '#9C27B0', label: 'Deep Purple' },
  ];

  const getActivityIcon = (activity) => {
    return activity === 'water' ? <WaterIcon /> : <LandIcon />;
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setNewCategory({
        name: category.name || '',
        activity: category.activity || 'water',
        color: category.color || '#0088FE',
        description: category.description || '',
        order: category.order || 0,
        category_id: category.category_id || category.id || null,
        is_active: category.is_active !== undefined ? category.is_active : true,
        company_id: category.company_id || null
      });
    } else {
      setEditingCategory(null);
      setNewCategory({
        name: '',
        activity: 'water',
        color: '#0088FE',
        description: '',
        order: 0,
        category_id: null,
        is_active: true,
        company_id: null
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setNewCategory({
      name: '',
      activity: 'water',
      color: '#0088FE',
      description: '',
      order: 0,
      category_id: null,
      is_active: true,
      company_id: null
    });
  };

  const handleInputChange = (field, value) => {
    setNewCategory(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!newCategory.name) {
      setSnackbar({
        open: true,
        message: 'Please fill in the category name.',
        severity: 'warning'
      });
      return;
    }

    try {
      console.log('Saving category with data:', newCategory);
      console.log('Editing category:', editingCategory);
      
      if (editingCategory) {
        // Update existing category
        console.log('Updating existing category...');
        await categoryApi.update(newCategory);
        setSnackbar({
          open: true,
          message: 'Category updated successfully!',
          severity: 'success'
        });
      } else {
        // Create new category
        console.log('Creating new category...');
        delete newCategory.category_id;
        await categoryApi.create(newCategory);
        setSnackbar({
          open: true,
          message: 'Category created successfully!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      // Refresh categories, events, and relationships
      await fetchCategories();
      await fetchEvents();
      if (companies.length > 0) {
        await fetchCompanyCategoryRelationships();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setSnackbar({
        open: true,
        message: `Error saving category: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryApi.delete(categoryId);
        setSnackbar({
          open: true,
          message: 'Category deleted successfully!',
          severity: 'success'
        });
        // Refresh categories, events, and relationships
        await fetchCategories();
        await fetchEvents();
        if (companies.length > 0) {
          await fetchCompanyCategoryRelationships();
        }
        if (companies.length > 0) {
          await fetchCompanyCategoryRelationships();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        setSnackbar({
          open: true,
          message: `Error deleting category: ${error.response?.data?.detail || error.message}`,
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle viewing linked companies for a category
  const handleViewLinkedCompanies = (category) => {
    setViewingCategory(category);
    setOpenLinkedCompaniesDialog(true);
  };

  const handleCloseLinkedCompaniesDialog = () => {
    setOpenLinkedCompaniesDialog(false);
    setViewingCategory(null);
  };

  // Company linking functions
  const handleOpenLinkDialog = (category) => {
    setSelectedCategory(category);
    setSelectedCompany('');
    setOpenLinkDialog(true);
  };

  const handleCloseLinkDialog = () => {
    setOpenLinkDialog(false);
    setSelectedCategory(null);
    setSelectedCompany('');
  };

  const handleLinkCategory = async () => {
    if (!selectedCompany) {
      setSnackbar({
        open: true,
        message: 'Please select a company to link.',
        severity: 'warning'
      });
      return;
    }

    try {
      await categoryApi.linkCategoryToCompany(selectedCompany, selectedCategory.id);
      setSnackbar({
        open: true,
        message: 'Category linked to company successfully!',
        severity: 'success'
      });
      handleCloseLinkDialog();
      
      // Refresh all data to ensure relationships are up to date
      await fetchCategories();
      const freshCompanies = await fetchCompanies();
      await fetchEvents();
      
      // Wait a bit for the API to process the link
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh relationships with fresh company data
      if (freshCompanies && freshCompanies.length > 0) {
        await fetchCompanyCategoryRelationships(freshCompanies);
      } else if (companies.length > 0) {
        await fetchCompanyCategoryRelationships();
      }
    } catch (error) {
      console.error('Error linking category to company:', error);
      setSnackbar({
        open: true,
        message: `Error linking category: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleUnlinkCategory = async (categoryId, companyId) => {
    if (window.confirm('Are you sure you want to unlink this category from the company?')) {
      try {
        await categoryApi.unlinkCategoryFromCompany(companyId, categoryId);
        setSnackbar({
          open: true,
          message: 'Category unlinked from company successfully!',
          severity: 'success'
        });
        
        // Refresh all data to ensure relationships are up to date
        await fetchCategories();
        const freshCompanies = await fetchCompanies();
        await fetchEvents();
        
        // Wait a bit for the API to process the unlink
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh relationships with fresh company data
        if (freshCompanies && freshCompanies.length > 0) {
          await fetchCompanyCategoryRelationships(freshCompanies);
        } else if (companies.length > 0) {
          await fetchCompanyCategoryRelationships();
        }
      } catch (error) {
        console.error('Error unlinking category from company:', error);
        setSnackbar({
          open: true,
          message: `Error unlinking category: ${error.response?.data?.detail || error.message}`,
          severity: 'error'
        });
      }
    }
  };

  // Filter categories by company
  const getFilteredCategories = () => {
    let filtered = categories;
    
    if (filterCompany) {
      filtered = filtered.filter(category => category.company_id === parseInt(filterCompany));
    }
    
    if (showLinkedOnly) {
      filtered = filtered.filter(category => category.company_id);
    }
    
    return filtered;
  };

  // Get company name by ID
  const getCompanyName = (companyId) => {
    console.log('Getting company name for ID:', companyId, 'Type:', typeof companyId);
    console.log('Available companies:', companies);
    const company = companies.find(c => {
      console.log(`Comparing ${c.id} (${typeof c.id}) with ${companyId} (${typeof companyId})`);
      return c.id === companyId || c.id === parseInt(companyId) || c.id === String(companyId);
    });
    console.log('Found company:', company);
    return company ? company.name : `Unknown Company (ID: ${companyId})`;
  };

  // Get all companies linked to a category
  const getLinkedCompanies = (categoryId) => {
    console.log('=== GETTING LINKED COMPANIES DEBUG ===');
    console.log('Category ID:', categoryId);
    console.log('Available companies:', companies);
    console.log('Category-company map (from events):', categoryCompanyMap);
    console.log('Company-category relationships:', companyCategoryRelationships);
    console.log('All categories:', categories);
    
    // Get companies from company-category relationship table (most reliable)
    // Try both string and number keys for categoryId
    const relationshipCompanyIds = companyCategoryRelationships[categoryId] || 
                                    companyCategoryRelationships[String(categoryId)] ||
                                    companyCategoryRelationships[parseInt(categoryId)] || [];
    console.log('Relationship-based company IDs for category', categoryId, ':', relationshipCompanyIds);
    
    // Get companies from events
    const eventBasedCompanyIds = categoryCompanyMap[categoryId] || [];
    console.log('Event-based company IDs for category', categoryId, ':', eventBasedCompanyIds);
    
    // Get direct category.company_id link
    const category = categories.find(cat => cat.id === categoryId);
    const directCompanyId = category?.company_id;
    console.log('Direct category.company_id:', directCompanyId);
    
    // Combine all company IDs and remove duplicates
    const allCompanyIds = new Set();
    
    // Add relationship-based companies
    relationshipCompanyIds.forEach(id => allCompanyIds.add(id));
    
    // Add event-based companies
    eventBasedCompanyIds.forEach(id => allCompanyIds.add(id));
    
    // Add direct link company
    if (directCompanyId) {
      allCompanyIds.add(directCompanyId);
    }
    
    // Convert company IDs to company objects
    const allCompanies = Array.from(allCompanyIds)
      .map(companyId => {
        const company = companies.find(c => {
          // Try multiple comparison methods
          return c.id === companyId || 
                 c.id === parseInt(companyId) || 
                 c.id === String(companyId) ||
                 parseInt(c.id) === parseInt(companyId);
        });
        return company;
      })
      .filter(company => company !== undefined);
    
    console.log('Final linked companies:', allCompanies);
    console.log('=====================================');
    return allCompanies;
  };

  // Check if category is linked to company
  const isCategoryLinked = (category) => {
    return category.company_id && category.company_id !== null;
  };

  // Check if category has any linked companies (through relationships, events, or direct links)
  const hasLinkedCompanies = (categoryId) => {
    const relationshipBasedConnections = companyCategoryRelationships[categoryId] && companyCategoryRelationships[categoryId].length > 0;
    const eventBasedConnections = categoryCompanyMap[categoryId] && categoryCompanyMap[categoryId].length > 0;
    const category = categories.find(cat => cat.id === categoryId);
    const directLink = category && category.company_id && category.company_id !== null && category.company_id !== '';
    
    const hasLinks = relationshipBasedConnections || eventBasedConnections || directLink;
    
    console.log(`hasLinkedCompanies for ${categoryId}:`, {
      relationshipBasedConnections,
      eventBasedConnections,
      directLink,
      categoryCompanyId: category?.company_id,
      result: hasLinks
    });
    
    return hasLinks;
  };

  // Get all categories linked to the same company
  const getCategoriesForCompany = (companyId) => {
    if (!companyId) return [];
    return categories.filter(cat => cat.company_id === companyId);
  };

  // Get company-to-categories mapping (for statistics)
  const getCompanyCategoriesMap = () => {
    const map = {};
    categories.forEach(category => {
      if (category.company_id) {
        if (!map[category.company_id]) {
          map[category.company_id] = [];
        }
        map[category.company_id].push(category);
      }
    });
    return map;
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
          Categories Management
        </Typography>
      
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={async () => {
              await fetchCategories();
              const companiesList = await fetchCompanies();
              await fetchEvents();
              if (companiesList && companiesList.length > 0) {
                await fetchCompanyCategoryRelationships(companiesList);
              }
            }}
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
            Add Category
          </Button>
        </Box>
      </Box>

      {/* Company Filter Section */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filter Categories
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Company</InputLabel>
            <Select
              value={filterCompany}
              label="Filter by Company"
              onChange={(e) => setFilterCompany(e.target.value)}
            >
              <MenuItem value="">All Companies</MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon />
                    {company.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant={showLinkedOnly ? "contained" : "outlined"}
            onClick={() => setShowLinkedOnly(!showLinkedOnly)}
            startIcon={<LinkIcon />}
          >
            {showLinkedOnly ? 'Show All' : 'Linked Only'}
          </Button>
          
          {filterCompany && (
            <Button
              variant="text"
              onClick={() => setFilterCompany('')}
              color="secondary"
            >
              Clear Filter
            </Button>
          )}
        </Box>
      </Box>

      {/* Debug Information */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'warning.50', borderRadius: 2, border: '1px solid #ff9800' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
          Debug Information
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Total Categories: {categories.length}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Total Companies: {companies.length}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Total Events: {events.length}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Categories with linked companies: {categories.filter(cat => hasLinkedCompanies(cat.id)).length}
        </Typography>
        
        {/* Yacht Category Debug */}
        {categories.find(cat => cat.name && cat.name.toLowerCase().includes('yacht')) && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1, border: '1px solid #2196f3' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'info.main' }}>
              Yacht Category Debug:
            </Typography>
            {(() => {
              const yachtCategory = categories.find(cat => cat.name && cat.name.toLowerCase().includes('yacht'));
              const linkedCompanies = getLinkedCompanies(yachtCategory.id);
              return (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Category: {yachtCategory.name} (ID: {yachtCategory.id})
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Company ID: {yachtCategory.company_id} (Type: {typeof yachtCategory.company_id})
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Linked Companies Count: {linkedCompanies.length}
                  </Typography>
                  <Typography variant="body2">
                    Company Names: {linkedCompanies.map(c => c.name).join(', ') || 'None found'}
                  </Typography>
                </Box>
              );
            })()}
          </Box>
        )}
      </Box>

      {/* Statistics Summary */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          Category Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
              {categories.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Categories
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
              {categories.filter(cat => hasLinkedCompanies(cat.id)).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              With Linked Companies
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
              {events.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Events
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 'bold' }}>
              {companies.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Companies
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Complete Company-Category Connections List */}
      <Box sx={{ mb: 3, p: 3, bgcolor: 'info.50', borderRadius: 2, border: '1px solid #2196f3' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5, color: 'info.main', fontWeight: 600 }}>
              All Company-Category Connections
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete list of all companies and their connected categories
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={async () => {
              await fetchCategories();
              const freshCompanies = await fetchCompanies();
              await fetchEvents();
              if (freshCompanies && freshCompanies.length > 0) {
                await fetchCompanyCategoryRelationships(freshCompanies);
              } else if (companies.length > 0) {
                await fetchCompanyCategoryRelationships();
              }
            }}
            sx={{ minWidth: 120 }}
          >
            Refresh
          </Button>
        </Box>
        {(() => {
          // Build complete connections map: company -> categories
          const companyCategoriesMap = {};
          
          // Add from companyCategoryRelationships (relationship table)
          Object.keys(companyCategoryRelationships).forEach(categoryId => {
            companyCategoryRelationships[categoryId].forEach(companyId => {
              if (!companyCategoriesMap[companyId]) {
                companyCategoriesMap[companyId] = [];
              }
              const category = categories.find(cat => cat.id === categoryId || cat.id === parseInt(categoryId));
              if (category && !companyCategoriesMap[companyId].find(c => c.id === category.id)) {
                companyCategoriesMap[companyId].push(category);
              }
            });
          });
          
          // Add from events
          Object.keys(categoryCompanyMap).forEach(categoryId => {
            categoryCompanyMap[categoryId].forEach(companyId => {
              if (!companyCategoriesMap[companyId]) {
                companyCategoriesMap[companyId] = [];
              }
              const category = categories.find(cat => cat.id === categoryId || cat.id === parseInt(categoryId));
              if (category && !companyCategoriesMap[companyId].find(c => c.id === category.id)) {
                companyCategoriesMap[companyId].push(category);
              }
            });
          });
          
          // Add from direct category.company_id links
          categories.forEach(category => {
            if (category.company_id) {
              const companyId = category.company_id;
              if (!companyCategoriesMap[companyId]) {
                companyCategoriesMap[companyId] = [];
              }
              if (!companyCategoriesMap[companyId].find(c => c.id === category.id)) {
                companyCategoriesMap[companyId].push(category);
              }
            }
          });
          
          const companiesWithCategories = Object.keys(companyCategoriesMap)
            .map(companyId => ({
              companyId: companyId,
              company: companies.find(c => c.id === parseInt(companyId) || c.id === companyId),
              categories: companyCategoriesMap[companyId]
            }))
            .filter(item => item.categories.length > 0)
            .sort((a, b) => {
              const nameA = a.company?.name || '';
              const nameB = b.company?.name || '';
              return nameA.localeCompare(nameB);
            });
          
          if (companiesWithCategories.length === 0) {
            return (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No company-category connections found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Link companies to categories to see connections here
                </Typography>
              </Box>
            );
          }
          
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {companiesWithCategories.map(({ companyId, company, categories: companyCategories }) => (
                <Card key={companyId} sx={{ border: '1px solid #2196f3', '&:hover': { boxShadow: 4 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <BusinessIcon sx={{ color: 'info.main', fontSize: 32 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                          {company ? company.name : `Company ID: ${companyId}`}
                        </Typography>
                        {company && (
                          <Typography variant="body2" color="text.secondary">
                            ID: {company.id} {company.email && `• ${company.email}`}
                          </Typography>
                        )}
                      </Box>
                      <Chip 
                        label={`${companyCategories.length} Categor${companyCategories.length > 1 ? 'ies' : 'y'}`}
                        color="info"
                        size="medium"
                        sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Connected Categories:
                      </Typography>
                      <List sx={{ py: 0, bgcolor: 'background.paper', borderRadius: 1 }}>
                        {companyCategories.map((category) => {
                          const isDirectLink = category.company_id === companyId;
                          return (
                            <ListItem 
                              key={category.id}
                              sx={{ 
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                mb: 1,
                                bgcolor: isDirectLink ? 'success.50' : 'white',
                                '&:last-child': { mb: 0 }
                              }}
                            >
                              <ListItemIcon>
                                <Box sx={{ 
                                  width: 12, 
                                  height: 12, 
                                  borderRadius: '50%', 
                                  bgcolor: category.color || '#0088FE'
                                }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={category.name}
                                secondary={
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                    <Chip 
                                      label={category.activity === 'water' ? 'Water Activity' : 'Land Activity'}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.65rem', height: '20px' }}
                                    />
                                    {isDirectLink && (
                                      <Chip 
                                        label="Direct Link"
                                        size="small"
                                        color="success"
                                        sx={{ fontSize: '0.65rem', height: '20px' }}
                                      />
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          );
        })()}
      </Box>

      {/* Company-to-Categories Mapping Overview */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'success.50', borderRadius: 2, border: '1px solid #4caf50' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
          Company-to-Categories Mapping
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Shows which companies are linked to multiple categories
        </Typography>
        {(() => {
          const companyCategoriesMap = getCompanyCategoriesMap();
          const companiesWithMultipleCategories = Object.keys(companyCategoriesMap).filter(
            companyId => companyCategoriesMap[companyId].length > 1
          );
          
          if (companiesWithMultipleCategories.length === 0) {
            return (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                No companies are linked to multiple categories
              </Typography>
            );
          }
          
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {companiesWithMultipleCategories.map((companyId) => {
                const company = companies.find(c => c.id === parseInt(companyId));
                const linkedCategories = companyCategoriesMap[companyId];
                
                return (
                  <Card key={companyId} sx={{ p: 2, border: '1px solid #4caf50' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <BusinessIcon sx={{ color: 'success.main', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {company ? company.name : `Company ID: ${companyId}`}
                      </Typography>
                      <Chip 
                        label={`${linkedCategories.length} Categories`}
                        color="success"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {linkedCategories.map((category) => (
                        <Chip
                          key={category.id}
                          label={category.name}
                          size="small"
                          sx={{ 
                            bgcolor: category.color + '20',
                            color: category.color,
                            border: `1px solid ${category.color}`,
                            fontWeight: 500
                          }}
                        />
                      ))}
                    </Box>
                  </Card>
                );
              })}
            </Box>
          );
        })()}
      </Box>

      {/* Category-Company Connections Overview */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
              Category-Company Links Overview
            </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {categories.map((category) => {
            const linkedCompanies = getLinkedCompanies(category.id);
            const sharedCategories = category.company_id ? getCategoriesForCompany(category.company_id) : [];
            
            return (
              <Box 
                key={category.id} 
                sx={{ 
                  p: 2, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 2, 
                  bgcolor: 'white',
                  minWidth: '200px',
                  flex: '1 1 200px'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: category.color 
                  }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {category.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {linkedCompanies.length} linked companies
                </Typography>
                {linkedCompanies.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {linkedCompanies.map((company) => (
                        <Chip
                          key={company.id}
                          label={company.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                    {sharedCategories.length > 1 && (
                      <Typography variant="caption" color="info.main" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                        📌 {sharedCategories.length - 1} other category{sharedCategories.length - 1 > 1 ? 'ies' : 'y'} share{sharedCategories.length - 1 > 1 ? '' : 's'} this company
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No companies linked
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Loading categories...
          </Typography>
        </Box>
      ) : categories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No categories found. Add your first category to get started.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {getFilteredCategories().map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card sx={{ 
                border: hasLinkedCompanies(category.id) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                position: 'relative',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: hasLinkedCompanies(category.id) ? '0 4px 12px rgba(25,118,210,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)'
                }
              }}>
                {/* Company Link Indicator */}
                {hasLinkedCompanies(category.id) && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    borderRadius: 1, 
                    px: 1,
                    py: 0.5,
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    <BusinessIcon sx={{ fontSize: 14 }} />
                    {getLinkedCompanies(category.id).length}
                  </Box>
                )}
                
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: category.color + '20',
                      color: category.color,
                      mr: 2 
                    }}>
                      {getActivityIcon(category.activity)}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{category.name}</Typography>
                      <Typography color="textSecondary" variant="caption">
                        {category.activity === 'water' ? 'Water Activity' : 'Land Activity'}
                      </Typography>
                      <Typography color="textSecondary">
                        {category.events_count || category.count || 0} events
                      </Typography>
                    </Box>
                    <Box>
                      {canUpdate && (
                        <Tooltip title={isCategoryLinked(category) ? "Change Company Link" : "Link to Company"}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenLinkDialog(category)}
                            color={isCategoryLinked(category) ? "primary" : "secondary"}
                          >
                            <LinkIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canUpdate && (
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(category)}
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
                            onClick={() => handleDeleteCategory(category.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  
                  {/* Description */}
                  {category.description && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Order and Color */}
                  <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip 
                      label={`Order: ${category.order || 0}`}
                      size="small"
                      variant="outlined"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        bgcolor: category.color,
                        border: '2px solid #e0e0e0'
                      }} />
                      <Typography variant="caption" color="text.secondary">
                        {category.color}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Linked Companies Information */}
                  <Box 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      bgcolor: hasLinkedCompanies(category.id) ? 'primary.50' : 'grey.50', 
                      borderRadius: 2, 
                      border: hasLinkedCompanies(category.id) ? '2px solid #1976d2' : '1px solid #e0e0e0'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <BusinessIcon sx={{ color: hasLinkedCompanies(category.id) ? 'primary.main' : 'text.secondary', fontSize: 20 }} />
                      <Typography variant="h6" color={hasLinkedCompanies(category.id) ? 'primary.main' : 'text.secondary'} sx={{ fontWeight: 700 }}>
                        Linked Companies ({getLinkedCompanies(category.id).length})
                      </Typography>
                    </Box>
                    
                    {hasLinkedCompanies(category.id) ? (
                      <List sx={{ py: 0 }}>
                        {getLinkedCompanies(category.id).map((company) => {
                          const isDirectLink = category.company_id === company.id;
                          
                          return (
                            <ListItem 
                              key={company.id}
                              sx={{ 
                                bgcolor: isDirectLink ? 'success.50' : 'white',
                                border: isDirectLink ? '1px solid #4caf50' : '1px solid #e0e0e0',
                                borderRadius: 1,
                                mb: 1,
                                '&:last-child': { mb: 0 }
                              }}
                            >
                              <ListItemIcon>
                                <BusinessIcon sx={{ color: isDirectLink ? 'success.main' : 'primary.main' }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={company.name || `Company ID: ${company.id}`}
                                secondary={isDirectLink ? 'Direct Link' : 'Event-based Link'}
                              />
                              {isDirectLink && (
                                <Chip 
                                  label="Direct" 
                                  size="small" 
                                  color="success" 
                                  variant="outlined"
                                />
                              )}
                            </ListItem>
                          );
                        })}
                      </List>
                    ) : category.company_id ? (
                      // Fallback: Show company even if lookup failed
                      <List sx={{ py: 0 }}>
                        <ListItem 
                          sx={{ 
                            bgcolor: 'warning.50',
                            border: '1px solid #ff9800',
                            borderRadius: 1
                          }}
                        >
                          <ListItemIcon>
                            <BusinessIcon sx={{ color: 'warning.main' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={getCompanyName(category.company_id)}
                            secondary="Direct Link"
                          />
                          <Chip 
                            label="Direct" 
                            size="small" 
                            color="warning" 
                            variant="outlined"
                          />
                        </ListItem>
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 1 }}>
                        No companies linked to this category yet
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Direct Company Link Information */}
                  {isCategoryLinked(category) && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ p: 1, bgcolor: 'success.50', borderRadius: 1, border: '1px solid #4caf50', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinkIcon sx={{ color: 'success.main', fontSize: 16 }} />
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                            Directly Linked: {getCompanyName(category.company_id)}
                          </Typography>
                        </Box>
                      </Box>
                      {(() => {
                        const sharedCategories = getCategoriesForCompany(category.company_id);
                        if (sharedCategories.length > 1) {
                          return (
                            <Box sx={{ p: 1, bgcolor: 'info.50', borderRadius: 1, border: '1px solid #2196f3' }}>
                              <Typography variant="caption" color="info.main" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                                📌 Shared with {sharedCategories.length - 1} other categor{sharedCategories.length - 1 > 1 ? 'ies' : 'y'}:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {sharedCategories
                                  .filter(cat => cat.id !== category.id)
                                  .map((sharedCat) => (
                                    <Chip
                                      key={sharedCat.id}
                                      label={sharedCat.name}
                                      size="small"
                                      sx={{ 
                                        bgcolor: sharedCat.color + '20',
                                        color: sharedCat.color,
                                        border: `1px solid ${sharedCat.color}`,
                                        fontSize: '0.65rem',
                                        height: '20px'
                                      }}
                                    />
                                  ))}
                              </Box>
                            </Box>
                          );
                        }
                        return null;
                      })()}
                    </Box>
                  )}
                  
                  {/* Status and Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={category.is_active ? 'Inactive' : 'Active'} 
                      color={category.is_active === 'Active' ? 'success' : 'default'} 
                      size="small" 
                      variant="outlined"
                    />
                    
                    {isCategoryLinked(category) && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<UnlinkIcon />}
                        onClick={() => handleUnlinkCategory(category.id, category.company_id)}
                        sx={{ ml: 1 }}
                      >
                        Unlink
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Category Name"
              fullWidth
              value={newCategory.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newCategory.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter category description..."
            />
            
            <FormControl fullWidth>
              <InputLabel>Activity Type</InputLabel>
              <Select
                value={newCategory.activity || 'water'}
                label="Activity Type"
                onChange={(e) => handleInputChange('activity', e.target.value)}
              >
                {activityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                value={newCategory.color || '#0088FE'}
                label="Color"
                onChange={(e) => handleInputChange('color', e.target.value)}
              >
                {colorOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        bgcolor: option.value,
                        border: '1px solid #ccc'
                      }} />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Order"
              fullWidth
              type="number"
              value={newCategory.order}
              onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
              helperText="Determines the display order of categories"
            />
            
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newCategory.is_active}
                label="Status"
                onChange={(e) => handleInputChange('is_active', e.target.value)}
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? 'Update' : 'Add'} Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Company Linking Dialog */}
      <Dialog open={openLinkDialog} onClose={handleCloseLinkDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon color="primary" />
            Link Category to Company
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Link "{selectedCategory?.name}" to a company:
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Company</InputLabel>
              <Select
                value={selectedCompany}
                label="Select Company"
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon />
                      {company.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLinkDialog}>Cancel</Button>
          <Button onClick={handleLinkCategory} variant="contained" disabled={!selectedCompany}>
            Link Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Linked Companies Details Dialog */}
      <Dialog open={openLinkedCompaniesDialog} onClose={handleCloseLinkedCompaniesDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon color="primary" />
            <Typography variant="h6">
              Linked Companies - {viewingCategory?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingCategory && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Companies linked to the "{viewingCategory.name}" category:
              </Typography>
              
              {getLinkedCompanies(viewingCategory.id).length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {getLinkedCompanies(viewingCategory.id).map((company) => {
                    const isDirectLink = viewingCategory.company_id === company.id;
                    const isEventBased = categoryCompanyMap[viewingCategory.id] && categoryCompanyMap[viewingCategory.id].includes(company.id);
                    
                    return (
                      <Card key={company.id} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: isDirectLink ? 'success.main' : 'primary.main' }}>
                            <BusinessIcon />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {company.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {company.id}
                            </Typography>
                            {company.email && (
                              <Typography variant="body2" color="text.secondary">
                                Email: {company.email}
                              </Typography>
                            )}
                            {company.phone && (
                              <Typography variant="body2" color="text.secondary">
                                Phone: {company.phone}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                            <Chip
                              label={isDirectLink ? "Direct Link" : "Event-based Link"}
                              color={isDirectLink ? "success" : "primary"}
                              size="small"
                              variant="filled"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {isDirectLink ? "Directly linked to category" : "Linked via events"}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No companies linked to this category
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the "Link to Company" button to add companies to this category
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLinkedCompaniesDialog}>Close</Button>
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

export default Categories;
