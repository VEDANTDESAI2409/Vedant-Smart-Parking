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

const createLocationValidation = [
  body('cityId').isMongoId().withMessage('Valid cityId is required'),
  body('pincodeId').isMongoId().withMessage('Valid pincodeId is required'),
  body('areaId').isMongoId().withMessage('Valid areaId is required'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location name must be between 1 and 100 characters'),
  body('lat').isFloat().withMessage('Latitude must be a valid number'),
  body('lng').isFloat().withMessage('Longitude must be a valid number'),
  body('status').optional().isBoolean().withMessage('Status must be a boolean'),
];

const updateLocationValidation = [
  body('cityId').optional().isMongoId().withMessage('Valid cityId is required'),
  body('pincodeId').optional().isMongoId().withMessage('Valid pincodeId is required'),
  body('areaId').optional().isMongoId().withMessage('Valid areaId is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location name must be between 1 and 100 characters'),
  body('lat').optional().isFloat().withMessage('Latitude must be a valid number'),
  body('lng').optional().isFloat().withMessage('Longitude must be a valid number'),
  body('status').optional().isBoolean().withMessage('Status must be a boolean'),
];

const locationIdValidation = [param('id').isMongoId().withMessage('Invalid location ID')];

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/', getLocations);
router.get('/:id', locationIdValidation, getLocation);
router.post('/', createLocationValidation, createLocation);
router.put('/:id', locationIdValidation, updateLocationValidation, updateLocation);
router.delete('/:id', locationIdValidation, deleteLocation);

module.exports = router;
