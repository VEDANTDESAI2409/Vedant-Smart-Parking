const express = require('express');
const { importData } = require('../controllers/importController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.post('/:type', importData);

module.exports = router;
