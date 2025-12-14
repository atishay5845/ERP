// routes/razorpayRoutes.js
const express = require('express');
const router = express.Router();
const rp = require('../controllers/razorpayController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Create order (students or admin can call when paying)
router.post('/create-order', authMiddleware, roleMiddleware(['student', 'admin']), rp.createOrder);

// Verify payment after Razorpay checkout (frontend posts handler response)
router.post('/verify-payment', authMiddleware, roleMiddleware(['student', 'admin']), rp.verifyPayment);

// Webhook (Razorpay posts here) - NOTE: we will attach raw body on server when mounting
router.post('/webhook', rp.webhookHandler);

module.exports = router;
