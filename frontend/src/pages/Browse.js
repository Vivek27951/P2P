import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useItems } from '../contexts/ItemContext';
import { Search, Filter, MapPin, Star, Calendar, X } from 'lucide-react';
import { ITEM_CATEGORIES, DISTANCE_OPTIONS } from '../utils/constants';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    category: searchParams.get('category') || '',
    maxDistance: 50,
    priceRange: [0, 1000],
    rating: 0
  });
  
  const { items, loading, fetchItems, filters, updateFilters } = useItems();

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setTempFilters(prev => ({ ...prev, category }));
      updateFilters({ category });
    }
  }, [searchParams, updateFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems({ searchTerm });
  };

  const handleFilterChange = (key, value) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    updateFilters(tempFilters);
    fetchItems(tempFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      maxDistance: 50,
      priceRange: [0, 1000],
      rating: 0
    };
    setTempFilters(clearedFilters);
    updateFilters(clearedFilters);
    fetchItems(clearedFilters);
    setSearchParams({});
  };

  const filteredItems = items.filter(item => {
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (tempFilters.category && item.category !== tempFilters.category) {
      return false;
    }
    if (item.price_per_day < tempFilters.priceRange[0] || item.price_per_day > tempFilters.priceRange[1]) {
      return false;
    }
    if (item.rating < tempFilters.rating) {
      return false;
    }
    return true;
  });

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Items</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for items..."
                className="form-input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </form>

          {/* Active Filters */}
          {(tempFilters.category || tempFilters.rating > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tempFilters.category && (
                <span className="badge badge-primary flex items-center space-x-1">
                  <span>{tempFilters.category}</span>
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {tempFilters.rating > 0 && (
                <span className="badge badge-primary flex items-center space-x-1">
                  <span>{tempFilters.rating}+ stars</span>
                  <button
                    onClick={() => handleFilterChange('rating', 0)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="card mb-8">
            <div className="card-header">
              <h3 className="card-title">Filter Results</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={tempFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {ITEM_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Distance Filter */}
              <div>
                <label className="form-label">Max Distance</label>
                <select
                  className="form-input"
                  value={tempFilters.maxDistance}
                  onChange={(e) => handleFilterChange('maxDistance', Number(e.target.value))}
                >
                  {DISTANCE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="form-label">Price Range (per day)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="form-input"
                    value={tempFilters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), tempFilters.priceRange[1]])}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="form-input"
                    value={tempFilters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [tempFilters.priceRange[0], Number(e.target.value)])}
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="form-label">Minimum Rating</label>
                <select
                  className="form-input"
                  value={tempFilters.rating}
                  onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                >
                  <option value={0}>Any Rating</option>
                  <option value={1}>1+ Stars</option>
                  <option value={2}>2+ Stars</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowFilters(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${filteredItems.length} items found`}
          </p>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <Link
                key={item.id}
                to={`/item/${item.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="badge badge-primary">{item.category}</span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{item.title}</h3>
                
                <div className="flex items-center space-x-1 mb-2">
                  {renderStars(Math.round(item.rating))}
                  <span className="text-sm text-gray-600">({item.total_reviews})</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{item.location?.city || 'Location not specified'}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{item.is_available ? 'Available' : 'Not available'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">
                    ${item.price_per_day}
                  </span>
                  <span className="text-sm text-gray-600">/day</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;