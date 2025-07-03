import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useItems } from '../contexts/ItemContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, Edit, Trash2, Eye, MoreVertical, 
  Package, Star, MapPin, Calendar,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { ITEM_CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

const MyItems = () => {
  const navigate = useNavigate();
  const { myItems, fetchMyItems, updateItem, deleteItem, loading } = useItems();
  const { user } = useAuth();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchMyItems();
  }, [fetchMyItems]);

  const handleEditItem = (item) => {
    setEditingItem(item.id);
    setEditFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      price_per_day: item.price_per_day,
      is_available: item.is_available
    });
  };

  const handleUpdateItem = async (itemId) => {
    try {
      const result = await updateItem(itemId, editFormData);
      if (result.success) {
        toast.success('Item updated successfully');
        setEditingItem(null);
        setEditFormData({});
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const result = await deleteItem(itemToDelete.id);
      if (result.success) {
        toast.success('Item deleted successfully');
        setShowDeleteModal(false);
        setItemToDelete(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const toggleItemAvailability = async (item) => {
    try {
      const result = await updateItem(item.id, { is_available: !item.is_available });
      if (result.success) {
        toast.success(`Item ${!item.is_available ? 'enabled' : 'disabled'} successfully`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Items</h1>
            <p className="text-gray-600">Manage your rental listings</p>
          </div>
          <Link to="/add-item" className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add New Item</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{myItems.length}</p>
              </div>
              <Package className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {myItems.filter(item => item.is_available).length}
                </p>
              </div>
              <ToggleRight className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {myItems.length > 0 
                    ? (myItems.reduce((sum, item) => sum + item.rating, 0) / myItems.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-blue-600">
                  {myItems.reduce((sum, item) => sum + item.total_reviews, 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {myItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
            <p className="text-gray-600 mb-4">Start earning by listing your first item</p>
            <Link to="/add-item" className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myItems.map(item => (
              <div key={item.id} className="card relative">
                {/* Item Image */}
                <div className="relative">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`badge ${item.is_available ? 'badge-success' : 'badge-secondary'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="badge badge-primary">{item.category}</span>
                  </div>
                </div>

                {/* Item Details */}
                {editingItem === item.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="form-input text-sm"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <textarea
                      className="form-input text-sm"
                      rows="2"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <div className="flex space-x-2">
                      <select
                        className="form-input text-sm flex-1"
                        value={editFormData.category}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        {ITEM_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="form-input text-sm w-24"
                        value={editFormData.price_per_day}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, price_per_day: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingItem(null)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateItem(item.id)}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center space-x-1 mb-2">
                      {renderStars(Math.round(item.rating))}
                      <span className="text-sm text-gray-600">({item.total_reviews})</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{item.location?.city || 'Location not specified'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-primary-600">
                        ${item.price_per_day}
                      </span>
                      <span className="text-sm text-gray-600">/day</span>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                {editingItem !== item.id && (
                  <div className="flex space-x-2">
                    <Link
                      to={`/item/${item.id}`}
                      className="flex-1 btn-secondary text-center text-sm py-2"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      View
                    </Link>
                    <button
                      onClick={() => handleEditItem(item)}
                      className="flex-1 btn-secondary text-sm py-2"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => toggleItemAvailability(item)}
                      className={`flex-1 text-sm py-2 px-3 rounded-lg border transition-colors ${
                        item.is_available 
                          ? 'border-red-300 text-red-600 hover:bg-red-50' 
                          : 'border-green-300 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {item.is_available ? (
                        <ToggleLeft className="w-4 h-4 inline mr-1" />
                      ) : (
                        <ToggleRight className="w-4 h-4 inline mr-1" />
                      )}
                      {item.is_available ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(item);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Delete Item</h3>
            </div>
            <div className="modal-body">
              <p className="text-gray-600">
                Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="btn-danger"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyItems;