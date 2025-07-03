import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, Mail, Phone, MapPin, Edit, Save, X,
  Camera, Star, Package, Calendar, MessageCircle
} from 'lucide-react';
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '../utils/constants';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    profile_image: user?.profile_image || '',
    location: {
      address: user?.location?.address || '',
      city: user?.location?.city || '',
      state: user?.location?.state || '',
      country: user?.location?.country || '',
      postal_code: user?.location?.postal_code || ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      const base64Image = await convertToBase64(file);
      setFormData(prev => ({
        ...prev,
        profile_image: base64Image
      }));
      toast.success('Profile image updated');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      profile_image: user?.profile_image || '',
      location: {
        address: user?.location?.address || '',
        city: user?.location?.city || '',
        state: user?.location?.state || '',
        country: user?.location?.country || '',
        postal_code: user?.location?.postal_code || ''
      }
    });
    setIsEditing(false);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <div className="relative inline-block mb-4">
                {formData.profile_image ? (
                  <img
                    src={formData.profile_image}
                    alt={user?.full_name}
                    className="w-32 h-32 rounded-full object-cover mx-auto"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
                    <User className="w-16 h-16 text-gray-600" />
                  </div>
                )}
                
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {user?.full_name}
              </h2>
              <p className="text-gray-600 mb-2">@{user?.username}</p>
              
              <div className="flex items-center justify-center space-x-1 mb-4">
                {renderStars(Math.round(user?.rating || 0))}
                <span className="text-sm text-gray-600 ml-2">
                  ({user?.total_reviews || 0} reviews)
                </span>
              </div>

              {user?.bio && (
                <p className="text-gray-600 text-sm">{user.bio}</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-primary-600" />
                    <span className="text-gray-600">Items Listed</span>
                  </div>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">Bookings</span>
                  </div>
                  <span className="font-semibold">28</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">Messages</span>
                  </div>
                  <span className="font-semibold">45</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="full_name"
                        className="form-input"
                        value={formData.full_name}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-gray-900">{user?.full_name || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Email</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{user?.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        className="form-input"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Username</label>
                    <p className="text-gray-900">@{user?.username}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">Bio</label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        className="form-input"
                        rows="3"
                        placeholder="Tell others about yourself..."
                        value={formData.bio}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-gray-900">{user?.bio || 'No bio provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="form-label">Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        className="form-input"
                        value={formData.location.address}
                        onChange={handleLocationChange}
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user?.location?.address || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        className="form-input"
                        value={formData.location.city}
                        onChange={handleLocationChange}
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user?.location?.city || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">State</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="state"
                        className="form-input"
                        value={formData.location.state}
                        onChange={handleLocationChange}
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user?.location?.state || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Country</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="country"
                        className="form-input"
                        value={formData.location.country}
                        onChange={handleLocationChange}
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user?.location?.country || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Postal Code</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="postal_code"
                        className="form-input"
                        value={formData.location.postal_code}
                        onChange={handleLocationChange}
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user?.location?.postal_code || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;