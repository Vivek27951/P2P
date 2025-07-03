export const ITEM_CATEGORIES = [
  { value: 'clothes', label: 'Clothes' },
  { value: 'tools', label: 'Tools' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'other', label: 'Other' }
];

export const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING]: 'Pending',
  [BOOKING_STATUS.APPROVED]: 'Approved',
  [BOOKING_STATUS.REJECTED]: 'Rejected',
  [BOOKING_STATUS.ACTIVE]: 'Active',
  [BOOKING_STATUS.COMPLETED]: 'Completed',
  [BOOKING_STATUS.CANCELLED]: 'Cancelled'
};

export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [BOOKING_STATUS.APPROVED]: 'bg-green-100 text-green-800',
  [BOOKING_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  [BOOKING_STATUS.ACTIVE]: 'bg-blue-100 text-blue-800',
  [BOOKING_STATUS.COMPLETED]: 'bg-purple-100 text-purple-800',
  [BOOKING_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800'
};

export const DEFAULT_COORDINATES = {
  lat: 40.7128,
  lon: -74.0060
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
};

export const DISTANCE_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' }
];

export const PRICE_RANGES = [
  { min: 0, max: 50, label: '$0 - $50' },
  { min: 50, max: 100, label: '$50 - $100' },
  { min: 100, max: 200, label: '$100 - $200' },
  { min: 200, max: 500, label: '$200 - $500' },
  { min: 500, max: 1000, label: '$500 - $1000' },
  { min: 1000, max: 99999, label: '$1000+' }
];

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DISPLAY_DATE_FORMAT = 'MMM DD, YYYY';
export const DISPLAY_DATETIME_FORMAT = 'MMM DD, YYYY h:mm A';