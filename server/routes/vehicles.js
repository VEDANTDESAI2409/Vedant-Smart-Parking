const express = require('express');
const { body, param, query } = require('express-validator');
const vehicleController = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation rules
const vehicleValidation = [
  body('licensePlate')
    .trim()
    .notEmpty()
    .withMessage('License plate is required')
    .isLength({ max: 15 })
    .withMessage('License plate cannot exceed 15 characters'),
  body('make')
    .trim()
    .notEmpty()
    .withMessage('Make is required')
    .isLength({ max: 50 })
    .withMessage('Make cannot exceed 50 characters'),
  body('model')
    .trim()
    .notEmpty()
    .withMessage('Model is required')
    .isLength({ max: 50 })
    .withMessage('Model cannot exceed 50 characters'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Year is required and must be a valid number'),
  body('color')
    .trim()
    .notEmpty()
    .withMessage('Color is required')
    .isLength({ max: 30 })
    .withMessage('Color cannot exceed 30 characters'),
  body('vehicleType')
    .isIn(['car', 'motorcycle', 'truck', 'van', 'suv', 'electric', 'hybrid'])
    .withMessage('Invalid vehicle type'),
  body('fuelType')
    .optional()
    .isIn(['petrol', 'diesel', 'cng', 'electric', 'hybrid', 'other'])
    .withMessage('Invalid fuel type'),
  body('registrationExpiry')
    .isISO8601()
    .withMessage('Registration expiry date is required'),
];

// @route GET /api/vehicles
// @desc Get all vehicles for the authenticated user
router.get('/', vehicleController.getVehicles);

// @route POST /api/vehicles
// @desc Create a new vehicle for the authenticated user
router.post('/', vehicleValidation, vehicleController.createVehicle);

// @route GET /api/vehicles/:id
// @desc Get a specific vehicle
router.get('/:id', [param('id').isMongoId().withMessage('Invalid vehicle id')], vehicleController.getVehicle);

// @route PUT /api/vehicles/:id
// @desc Update a vehicle
router.put('/:id', [param('id').isMongoId().withMessage('Invalid vehicle id'), ...vehicleValidation], vehicleController.updateVehicle);

// @route DELETE /api/vehicles/:id
// @desc Delete a vehicle
router.delete('/:id', [param('id').isMongoId().withMessage('Invalid vehicle id')], vehicleController.deleteVehicle);

module.exports = router;
