const express = require('express');
const { body, param } = require('express-validator');
const {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
} = require('../controllers/locationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createLocationValidation = [
  body('city')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City is required'),
  body('pincode')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be exactly 6 digits'),
  body('area')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Area is required'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location name must be between 1 and 100 characters'),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean')
];

const updateLocationValidation = [
  body('city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City is required'),
  body('pincode')
    .optional()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be exactly 6 digits'),
  body('area')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Area is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location name must be between 1 and 100 characters'),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean')
];

const locationIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid location ID')
];

// All routes require authentication and admin access
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/', getLocations);
router.get('/:id', locationIdValidation, getLocation);
router.post('/', createLocationValidation, createLocation);
router.put('/:id', locationIdValidation, updateLocationValidation, updateLocation);
router.delete('/:id', locationIdValidation, deleteLocation);

module.exports = router;
