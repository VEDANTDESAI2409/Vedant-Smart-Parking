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

const createSlotValidation = [
  body('city').notEmpty().withMessage('City is required'),
  body('area').notEmpty().withMessage('Area is required'),
  body('pincode')
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits'),
  body('landmark').notEmpty().withMessage('Landmark is required'),
  body('vehicleType')
    .isIn(['car', 'bike'])
    .withMessage('Vehicle type must be car or bike'),
  body('slotType')
    .isIn(['normal', 'ev', 'disabled'])
    .withMessage('Slot type must be normal, ev, or disabled'),
  body('slotLocation').notEmpty().withMessage('Slot location is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
];

const updateSlotValidation = [
  body('city').optional().notEmpty().withMessage('City cannot be empty'),
  body('area').optional().notEmpty().withMessage('Area cannot be empty'),
  body('pincode')
    .optional()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits'),
  body('landmark').optional().notEmpty().withMessage('Landmark cannot be empty'),
  body('vehicleType')
    .optional()
    .isIn(['car', 'bike'])
    .withMessage('Vehicle type must be car or bike'),
  body('slotType')
    .optional()
    .isIn(['normal', 'ev', 'disabled'])
    .withMessage('Slot type must be normal, ev, or disabled'),
  body('slotLocation')
    .optional()
    .notEmpty()
    .withMessage('Slot location cannot be empty'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('status')
    .optional()
    .isIn(['available', 'occupied', 'maintenance', 'reserved', 'blocked'])
    .withMessage('Invalid status')
];

const slotIdValidation = [
  param('id').isMongoId().withMessage('Invalid slot ID')
];

const availableSlotsValidation = [
  query('startTime').isISO8601().withMessage('Start time must be a valid ISO date'),
  query('endTime').isISO8601().withMessage('End time must be a valid ISO date'),
  query('vehicleType')
    .optional()
    .isIn(['car', 'bike'])
    .withMessage('Vehicle type must be car or bike')
];

// Public routes
router.get('/', getSlots);
router.get('/available', availableSlotsValidation, getAvailableSlots);
router.get('/:id', slotIdValidation, getSlot);

// Protected routes
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.post('/', createSlotValidation, createSlot);
router.put('/:id', slotIdValidation, updateSlotValidation, updateSlot);
router.delete('/:id', slotIdValidation, deleteSlot);
router.get('/:id/stats', slotIdValidation, getSlotStats);
router.post('/:id/maintenance', slotIdValidation, scheduleMaintenance);

module.exports = router;