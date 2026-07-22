const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createStripePaymentIntent,confirmStripePayment,createRazorpayOrder,verifyRazorpayPayment } = require('../controllers/mainController');
router.post('/stripe/create-intent', protect, createStripePaymentIntent);
router.post('/stripe/confirm', protect, confirmStripePayment);
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
module.exports = router;
