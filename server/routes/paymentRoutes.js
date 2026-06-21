const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentHistory, requestRefund, getEarnings } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.post('/create-order', protect, roleCheck('student'), createOrder);
router.post('/verify', protect, roleCheck('student'), verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.post('/refund', protect, roleCheck('student'), requestRefund);
router.get('/earnings', protect, roleCheck('developer'), getEarnings);

module.exports = router;
