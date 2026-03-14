const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getSlots,
  getSlot,
  createSlot,
  updateSlot,
  deleteSlot,
  getAvailableSlots,
  getSlotStats,
  scheduleMaintenance
} = require('../controllers/slotController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createSlotValidation = [
  body('slotNumber')
    .notEmpty()
    .withMessage('Slot number is required')
    .isLength({ max: 20 })
    .withMessage('Slot number cannot exceed 20 characters'),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('area')
    .notEmpty()
    .withMessage('Area is required')
    .isLength({ max: 50 })
    .withMessage('Area cannot exceed 50 characters'),
  body('floor')
    .isInt({ min: -2, max: 50 })
    .withMessage('Floor must be between -2 and 50'),
  body('section')
    .notEmpty()
    .withMessage('Section is required')
    .isLength({ max: 20 })
    .withMessage('Section cannot exceed 20 characters'),
  body('slotType')
    .isIn(['standard', 'premium', 'disabled', 'electric', 'covered'])
    .withMessage('Invalid slot type'),
  body('vehicleType')
    .isIn(['car', 'motorcycle', 'truck', 'van', 'suv', 'any'])
    .withMessage('Invalid vehicle type'),
  body('hourlyRate')
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  body('dailyRate')
    .isFloat({ min: 0 })
    .withMessage('Daily rate must be a positive number')
];

const updateSlotValidation = [
  body('slotNumber')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Slot number cannot exceed 20 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('area')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Area cannot exceed 50 characters'),
  body('floor')
    .optional()
    .isInt({ min: -2, max: 50 })
    .withMessage('Floor must be between -2 and 50'),
  body('section')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Section cannot exceed 20 characters'),
  body('slotType')
    .optional()
    .isIn(['standard', 'premium', 'disabled', 'electric', 'covered'])
    .withMessage('Invalid slot type'),
  body('vehicleType')
    .optional()
    .isIn(['car', 'motorcycle', 'truck', 'van', 'suv', 'any'])
    .withMessage('Invalid vehicle type'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  body('dailyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Daily rate must be a positive number'),
  body('status')
    .optional()
    .isIn(['available', 'occupied', 'maintenance', 'reserved', 'blocked'])
    .withMessage('Invalid status')
];

const slotIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid slot ID')
];

const availableSlotsValidation = [
  query('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid ISO date'),
  query('endTime')
    .isISO8601()
    .withMessage('End time must be a valid ISO date'),
  query('vehicleType')
    .optional()
    .isIn(['car', 'motorcycle', 'truck', 'van', 'suv', 'any'])
    .withMessage('Invalid vehicle type')
];

const maintenanceValidation = [
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ max: 200 })
    .withMessage('Reason cannot exceed 200 characters'),
  body('technician')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Technician name cannot exceed 100 characters')
];

// Public routes
router.get('/', getSlots);
router.get('/available', availableSlotsValidation, getAvailableSlots);
router.get('/:id', slotIdValidation, getSlot);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.post('/', createSlotValidation, createSlot);
router.put('/:id', slotIdValidation, updateSlotValidation, updateSlot);
router.delete('/:id', slotIdValidation, deleteSlot);
router.get('/:id/stats', slotIdValidation, getSlotStats);
router.post('/:id/maintenance', slotIdValidation, maintenanceValidation, scheduleMaintenance);

module.exports = router;