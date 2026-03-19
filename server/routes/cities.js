const express = require('express');
const { body, param } = require('express-validator');
const {
  getCities,
  getCity,
  createCity,
  updateCity,
  deleteCity,
} = require('../controllers/cityController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createCityValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City name must be between 1 and 50 characters'),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean')
];

const updateCityValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City name must be between 1 and 50 characters'),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean')
];

const cityIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid city ID')
];

// All routes require authentication and admin access
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/', getCities);
router.get('/:id', cityIdValidation, getCity);
router.post('/', createCityValidation, createCity);
router.put('/:id', cityIdValidation, updateCityValidation, updateCity);
router.delete('/:id', cityIdValidation, deleteCity);

module.exports = router;