import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useItems } from '../contexts/ItemContext';
import { useBookings } from '../contexts/BookingContext';
import { useChat } from '../contexts/ChatContext';
import { 
  Star, MapPin, Calendar, User, MessageCircle, 
  ArrowLeft, Heart, Share, ChevronLeft, ChevronRight,
  Clock, Shield, CheckCircle
} from 'lucide-react';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../utils/constants';
import toast from 'react-hot-toast';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getItem } = useItems();
  const { createBooking, calculateTotalAmount } = useBookings();
  const { startConversation } = useChat();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    message: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      const result = await getItem(id);
      if (result.success) {
        setItem(result.item);
      } else {
        toast.error('Item not found');
        navigate('/browse');
      }
      setLoading(false);
    };

    if (id) {
      fetchItem();
    }
  }, [id, getItem, navigate]);

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? (item.images.length - 1) : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === (item.images.length - 1) ? 0 : prev + 1
    );
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to book this item');
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      const totalAmount = calculateTotalAmount(
        item.price_per_day,
        bookingData.startDate,
        bookingData.endDate
      );

      const result = await createBooking({
        item_id: item.id,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        total_amount: totalAmount,
        message: bookingData.message
      });

      if (result.success) {
        toast.success('Booking request sent successfully!');
        setShowBookingModal(false);
        setBookingData({ startDate: '', endDate: '', message: '' });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact the owner');
      navigate('/login');
      return;
    }
    startConversation(item.owner_id);
    navigate('/messages');
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const calculateTotal = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    return calculateTotalAmount(
      item.price_per_day,
      bookingData.startDate,
      bookingData.endDate
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Item not found</p>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === item.owner_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative">
              {item.images && item.images.length > 0 ? (
                <div className="relative">
                  <img
                    src={item.images[currentImageIndex]}
                    alt={item.title}
                    className="w-full h-96 object-cover rounded-xl"
                  />
                  {item.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">No images available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {item.images && item.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-primary">{item.category}</span>
                <div className="flex space-x-2">
                  <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                    <Share className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(Math.round(item.rating))}
                  <span className="text-sm text-gray-600">
                    ({item.total_reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{item.location?.city}, {item.location?.state}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="text-3xl font-bold text-primary-600">
                  ${item.price_per_day}
                </div>
                <span className="text-gray-600">per day</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Available for rental</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Secure payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Flexible dates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Verified owner</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
              <div className="text-gray-600">
                <p>{item.location?.address}</p>
                <p>{item.location?.city}, {item.location?.state} {item.location?.postal_code}</p>
                <p>{item.location?.country}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isOwner ? (
                <>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full btn-primary"
                    disabled={!item.is_available}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    {item.is_available ? 'Book Now' : 'Not Available'}
                  </button>
                  <button
                    onClick={handleContactOwner}
                    className="w-full btn-secondary"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact Owner
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">This is your item</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Book {item.title}</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleBookingSubmit} className="modal-body space-y-4">
              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={bookingData.startDate}
                  onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={bookingData.endDate}
                  onChange={(e) => setBookingData(prev => ({ ...prev, endDate: e.target.value }))}
                  min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="form-label">Message to Owner (Optional)</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Tell the owner about your rental needs..."
                  value={bookingData.message}
                  onChange={(e) => setBookingData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              {bookingData.startDate && bookingData.endDate && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>
              )}
            </form>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleBookingSubmit}
                disabled={bookingLoading || !bookingData.startDate || !bookingData.endDate}
                className="btn-primary"
              >
                {bookingLoading ? 'Booking...' : 'Send Booking Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;