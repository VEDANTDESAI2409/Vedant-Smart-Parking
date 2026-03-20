const express = require('express');
const { body, param } = require('express-validator');
const {
  getPincodes,
  getPincode,
  createPincode,
  updatePincode,
  deletePincode,
} = require('../controllers/pincodeController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const createPincodeValidation = [
  body('cityId').isMongoId().withMessage('Valid cityId is required'),
  body('pincode')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be exactly 6 digits'),
  body('status').optional().isBoolean().withMessage('Status must be a boolean'),
];

const updatePincodeValidation = [
  body('cityId').optional().isMongoId().withMessage('Valid cityId is required'),
  body('pincode')
    .optional()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be exactly 6 digits'),
  body('status').optional().isBoolean().withMessage('Status must be a boolean'),
];

const pincodeIdValidation = [param('id').isMongoId().withMessage('Invalid pincode ID')];

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/', getPincodes);
router.get('/:id', pincodeIdValidation, getPincode);
router.post('/', createPincodeValidation, createPincode);
router.put('/:id', pincodeIdValidation, updatePincodeValidation, updatePincode);
router.delete('/:id', pincodeIdValidation, deletePincode);

module.exports = router;
