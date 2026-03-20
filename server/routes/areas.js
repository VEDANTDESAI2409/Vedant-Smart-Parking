const express = require('express');
const { body, param } = require('express-validator');
const {
  getAreas,
  getArea,
  createArea,
  updateArea,
  deleteArea,
} = require('../controllers/areaController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const createAreaValidation = [
  body('cityId').isMongoId().withMessage('Valid cityId is required'),
  body('pincodeId').isMongoId().withMessage('Valid pincodeId is required'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Area name must be between 1 and 100 characters'),
  body('status').optional().isBoolean().withMessage('Status must be a boolean'),
];

const updateAreaValidation = [
  body('cityId').optional().isMongoId().withMessage('Valid cityId is required'),
  body('pincodeId').optional().isMongoId().withMessage('Valid pincodeId is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Area name must be between 1 and 100 characters'),
  body('status').optional().isBoolean().withMessage('Status must be a boolean'),
];

const areaIdValidation = [param('id').isMongoId().withMessage('Invalid area ID')];

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/', getAreas);
router.get('/:id', areaIdValidation, getArea);
router.post('/', createAreaValidation, createArea);
router.put('/:id', areaIdValidation, updateAreaValidation, updateArea);
router.delete('/:id', areaIdValidation, deleteArea);

module.exports = router;
