import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBookings } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, Clock, User, Package, MessageCircle, 
  CheckCircle, XCircle, AlertCircle, Star,
  Filter, Search, Eye
} from 'lucide-react';
import { BOOKING_STATUS, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../utils/constants';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const Bookings = () => {
  const { bookings, fetchBookings, updateBookingStatus, loading } = useBookings();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) return;

    try {
      const result = await updateBookingStatus(selectedBooking.id, newStatus, updateMessage);
      if (result.success) {
        toast.success('Booking status updated successfully');
        setShowUpdateModal(false);
        setSelectedBooking(null);
        setNewStatus('');
        setUpdateMessage('');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  // Filter bookings based on user role and filters
  const filteredBookings = bookings.filter(booking => {
    // Tab filter
    if (activeTab === 'as_renter' && booking.renter_id !== user?.id) return false;
    if (activeTab === 'as_owner' && booking.renter_id === user?.id) return false;

    // Status filter
    if (statusFilter && booking.status !== statusFilter) return false;

    // Search filter
    if (searchTerm && !booking.item_id.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  const getBookingsByStatus = (status) => {
    return bookings.filter(booking => booking.status === status);
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const calculateDays = (startDate, endDate) => {
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const timeDiff = end.getTime() - start.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    } catch (error) {
      return 1;
    }
  };

  const canUpdateStatus = (booking) => {
    // Only item owners can update booking status (except renter can cancel)
    return booking.renter_id !== user?.id || booking.status === BOOKING_STATUS.PENDING;
  };

  const getAvailableStatuses = (currentStatus, isOwner) => {
    const statuses = [];
    
    if (isOwner) {
      switch (currentStatus) {
        case BOOKING_STATUS.PENDING:
          statuses.push(BOOKING_STATUS.APPROVED, BOOKING_STATUS.REJECTED);
          break;
        case BOOKING_STATUS.APPROVED:
          statuses.push(BOOKING_STATUS.ACTIVE, BOOKING_STATUS.CANCELLED);
          break;
        case BOOKING_STATUS.ACTIVE:
          statuses.push(BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED);
          break;
        default:
          break;
      }
    } else {
      // Renter can only cancel pending bookings
      if (currentStatus === BOOKING_STATUS.PENDING) {
        statuses.push(BOOKING_STATUS.CANCELLED);
      }
    }
    
    return statuses;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings</h1>
          <p className="text-gray-600">Manage your rental bookings and requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {getBookingsByStatus(BOOKING_STATUS.PENDING).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getBookingsByStatus(BOOKING_STATUS.ACTIVE).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {getBookingsByStatus(BOOKING_STATUS.COMPLETED).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {getBookingsByStatus(BOOKING_STATUS.CANCELLED).length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters and Tabs */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Bookings
              </button>
              <button
                onClick={() => setActiveTab('as_renter')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'as_renter'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                As Renter
              </button>
              <button
                onClick={() => setActiveTab('as_owner')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'as_owner'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                As Owner
              </button>
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {Object.values(BOOKING_STATUS).map(status => (
                  <option key={status} value={status}>
                    {BOOKING_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="form-input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'all' 
                ? "You don't have any bookings yet"
                : activeTab === 'as_renter'
                ? "You haven't made any booking requests yet"
                : "You haven't received any booking requests yet"
              }
            </p>
            <Link to="/browse" className="btn-primary">
              Browse Items
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => {
              const isOwner = booking.renter_id !== user?.id;
              const days = calculateDays(booking.start_date, booking.end_date);
              
              return (
                <div key={booking.id} className="card">
                  <div className="flex flex-col md:flex-row justify-between items-start space-y-4 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Booking #{booking.id.slice(-8)}
                        </h3>
                        <span className={`badge ${BOOKING_STATUS_COLORS[booking.status]}`}>
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </span>
                        <span className="badge badge-secondary">
                          {isOwner ? 'As Owner' : 'As Renter'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4" />
                          <span>Item ID: {booking.item_id.slice(-8)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{days} day{days > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {booking.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Message:</strong> {booking.message}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">
                          ${booking.total_amount}
                        </p>
                        <p className="text-sm text-gray-600">Total Amount</p>
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          to={`/item/${booking.item_id}`}
                          className="btn-secondary text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Item
                        </Link>
                        
                        {canUpdateStatus(booking) && (
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowUpdateModal(true);
                            }}
                            className="btn-primary text-sm"
                          >
                            Update Status
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {showUpdateModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Update Booking Status</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Booking #{selectedBooking.id.slice(-8)}
                </p>
                <p className="text-sm text-gray-600">
                  Current Status: {BOOKING_STATUS_LABELS[selectedBooking.status]}
                </p>
              </div>

              <div>
                <label className="form-label">New Status</label>
                <select
                  className="form-input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">Select new status</option>
                  {getAvailableStatuses(
                    selectedBooking.status, 
                    selectedBooking.renter_id !== user?.id
                  ).map(status => (
                    <option key={status} value={status}>
                      {BOOKING_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Message (Optional)</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Add a message about this status update..."
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus}
                className="btn-primary"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;