// Validation helper functions

const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

const validateLicensePlate = (plate) => {
  const plateRegex = /^[A-Z0-9\s-]{1,15}$/;
  return plateRegex.test(plate);
};

const validatePassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
};

const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  return start > now && end > start;
};

const validateBookingDuration = (startTime, endTime, maxHours = 72) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationHours = (end - start) / (1000 * 60 * 60);

  return durationHours > 0 && durationHours <= maxHours;
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

const generateRandomCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

const calculateDuration = (startTime, endTime, unit = 'hours') => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;

  switch (unit) {
    case 'minutes':
      return Math.floor(diffMs / (1000 * 60));
    case 'hours':
      return Math.floor(diffMs / (1000 * 60 * 60));
    case 'days':
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    default:
      return diffMs;
  }
};

const paginate = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / itemsPerPage);
  const skip = (currentPage - 1) * itemsPerPage;

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: total,
    skip,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

const buildFilterQuery = (queryParams, allowedFilters) => {
  const filter = {};

  Object.keys(queryParams).forEach(key => {
    if (allowedFilters.includes(key) && queryParams[key]) {
      if (key === 'search') {
        // Handle search across multiple fields
        filter.$or = [
          { name: { $regex: queryParams[key], $options: 'i' } },
          { email: { $regex: queryParams[key], $options: 'i' } }
        ];
      } else if (key.includes('Date') || key.includes('Time')) {
        // Handle date fields
        filter[key] = new Date(queryParams[key]);
      } else if (typeof queryParams[key] === 'string' && queryParams[key].match(/^\d+$/)) {
        // Convert string numbers to numbers
        filter[key] = parseInt(queryParams[key]);
      } else {
        filter[key] = queryParams[key];
      }
    }
  });

  return filter;
};

module.exports = {
  validateEmail,
  validatePhone,
  validateLicensePlate,
  validatePassword,
  validateDateRange,
  validateBookingDuration,
  sanitizeInput,
  generateRandomCode,
  formatCurrency,
  formatDate,
  calculateDuration,
  paginate,
  buildFilterQuery
};