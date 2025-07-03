import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ItemContext = createContext();

export const useItems = () => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemProvider');
  }
  return context;
};

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    location: null,
    maxDistance: 50,
    priceRange: [0, 1000]
  });
  const { isAuthenticated } = useAuth();

  // Fetch items with filters
  const fetchItems = async (customFilters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      const currentFilters = { ...filters, ...customFilters };
      
      if (currentFilters.category) {
        params.append('category', currentFilters.category);
      }
      
      if (currentFilters.location) {
        params.append('lat', currentFilters.location.lat);
        params.append('lon', currentFilters.location.lon);
        params.append('max_distance', currentFilters.maxDistance);
      }
      
      const response = await axios.get(`/api/items?${params.toString()}`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's items
  const fetchMyItems = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await axios.get('/api/items/my');
      setMyItems(response.data);
    } catch (error) {
      console.error('Error fetching my items:', error);
    }
  };

  // Create new item
  const createItem = async (itemData) => {
    try {
      const response = await axios.post('/api/items', itemData);
      setMyItems(prev => [...prev, response.data]);
      return { success: true, item: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to create item' 
      };
    }
  };

  // Update item
  const updateItem = async (itemId, itemData) => {
    try {
      const response = await axios.put(`/api/items/${itemId}`, itemData);
      setMyItems(prev => prev.map(item => 
        item.id === itemId ? response.data : item
      ));
      return { success: true, item: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to update item' 
      };
    }
  };

  // Delete item
  const deleteItem = async (itemId) => {
    try {
      await axios.delete(`/api/items/${itemId}`);
      setMyItems(prev => prev.filter(item => item.id !== itemId));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to delete item' 
      };
    }
  };

  // Get single item
  const getItem = async (itemId) => {
    try {
      const response = await axios.get(`/api/items/${itemId}`);
      return { success: true, item: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get item' 
      };
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Initial fetch
  useEffect(() => {
    fetchItems();
  }, []);

  // Fetch user's items when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyItems();
    }
  }, [isAuthenticated]);

  const value = {
    items,
    myItems,
    loading,
    filters,
    fetchItems,
    fetchMyItems,
    createItem,
    updateItem,
    deleteItem,
    getItem,
    updateFilters
  };

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};