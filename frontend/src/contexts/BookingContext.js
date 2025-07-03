import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch user's bookings
  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/api/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new booking
  const createBooking = async (bookingData) => {
    try {
      const response = await axios.post('/api/bookings', bookingData);
      setBookings(prev => [...prev, response.data]);
      return { success: true, booking: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to create booking' 
      };
    }
  };

  // Update booking status
  const updateBookingStatus = async (bookingId, status, message = '') => {
    try {
      const response = await axios.put(`/api/bookings/${bookingId}`, {
        status,
        message
      });
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? response.data : booking
      ));
      return { success: true, booking: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to update booking' 
      };
    }
  };

  // Calculate total days between dates
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  // Calculate total amount
  const calculateTotalAmount = (pricePerDay, startDate, endDate) => {
    const days = calculateDays(startDate, endDate);
    return days * pricePerDay;
  };

  // Get bookings by status
  const getBookingsByStatus = (status) => {
    return bookings.filter(booking => booking.status === status);
  };

  // Get bookings by type (as renter or owner)
  const getBookingsByType = (type, userId) => {
    if (type === 'renter') {
      return bookings.filter(booking => booking.renter_id === userId);
    } else {
      return bookings.filter(booking => booking.renter_id !== userId);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const value = {
    bookings,
    loading,
    fetchBookings,
    createBooking,
    updateBookingStatus,
    calculateDays,
    calculateTotalAmount,
    getBookingsByStatus,
    getBookingsByType
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};