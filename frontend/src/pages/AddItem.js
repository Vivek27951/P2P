import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../contexts/ItemContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Upload, X, MapPin, Calendar, DollarSign, 
  Package, FileText, Tag, Image as ImageIcon
} from 'lucide-react';
import { ITEM_CATEGORIES, MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '../utils/constants';
import toast from 'react-hot-toast';

const AddItem = () => {
  const navigate = useNavigate();
  const { createItem } = useItems();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price_per_day: '',
    images: [],
    location: {
      type: 'Point',
      coordinates: [0, 0],
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: ''
    },
    available_dates: []
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

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
    const files = Array.from(e.target.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported image format`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingImages(true);
    try {
      const base64Images = await Promise.all(
        validFiles.map(file => convertToBase64(file))
      );

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...base64Images]
      }));

      toast.success(`${validFiles.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleLocationLookup = async () => {
    if (!formData.location.address) {
      toast.error('Please enter an address first');
      return;
    }

    try {
      // Simple geocoding simulation (in real app, use Google Maps API)
      // For now, just set some default coordinates for San Francisco
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: [-122.4194, 37.7749] // San Francisco coordinates
        }
      }));
      toast.success('Location coordinates updated');
    } catch (error) {
      toast.error('Failed to lookup location coordinates');
    }
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    // Generate next 60 days as available by default
    for (let i = 1; i <= 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    setFormData(prev => ({
      ...prev,
      available_dates: dates
    }));
    
    toast.success('Available dates generated for next 60 days');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category || !formData.price_per_day) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (!formData.location.city || !formData.location.state) {
        toast.error('Please provide location details');
        setLoading(false);
        return;
      }

      if (formData.images.length === 0) {
        toast.error('Please upload at least one image');
        setLoading(false);
        return;
      }

      const itemData = {
        ...formData,
        price_per_day: parseFloat(formData.price_per_day)
      };

      const result = await createItem(itemData);

      if (result.success) {
        toast.success('Item listed successfully!');
        navigate('/my-items');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to create item listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Item</h1>
          <p className="text-gray-600">Share your items with the community and earn money while helping others.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Basic Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="form-label">Item Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="e.g., Professional Camera Equipment"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  className="form-input"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {ITEM_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Price per Day ($) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="price_per_day"
                    className="form-input pl-10"
                    placeholder="25.00"
                    min="0"
                    step="0.01"
                    value={formData.price_per_day}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-input"
                  rows="4"
                  placeholder="Describe your item in detail. Include condition, features, and any important information for renters."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Photos
              </h2>
              <p className="card-subtitle">Add high-quality photos to attract more renters</p>
            </div>
            
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop images here, or click to select</p>
                <p className="text-sm text-gray-500 mb-4">
                  Support: JPG, PNG, WebP • Max size: 5MB each
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="btn-primary cursor-pointer inline-flex items-center"
                >
                  {uploadingImages ? 'Uploading...' : 'Choose Photos'}
                </label>
              </div>

              {/* Image Preview Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location
              </h2>
              <p className="card-subtitle">Help renters find your item</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  placeholder="123 Main St"
                  value={formData.location.address}
                  onChange={handleLocationChange}
                />
              </div>
              
              <div>
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="San Francisco"
                  value={formData.location.city}
                  onChange={handleLocationChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">State *</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  placeholder="CA"
                  value={formData.location.state}
                  onChange={handleLocationChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  className="form-input"
                  placeholder="USA"
                  value={formData.location.country}
                  onChange={handleLocationChange}
                />
              </div>

              <div>
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  name="postal_code"
                  className="form-input"
                  placeholder="94103"
                  value={formData.location.postal_code}
                  onChange={handleLocationChange}
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleLocationLookup}
                  className="btn-secondary"
                >
                  Update Coordinates
                </button>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Availability
              </h2>
              <p className="card-subtitle">Set when your item is available for rent</p>
            </div>
            
            <div className="space-y-4">
              <button
                type="button"
                onClick={generateAvailableDates}
                className="btn-secondary"
              >
                Generate Next 60 Days as Available
              </button>
              
              {formData.available_dates.length > 0 && (
                <div className="text-sm text-gray-600">
                  {formData.available_dates.length} available dates selected
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/my-items')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating Listing...' : 'List Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;