const express = require('express');
const {
  checkout,
  paystackWebhook,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getAdminAnalytics,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Webhook must be mounted with raw body in server.js; handler here expects raw buffer on req.body
router.post('/paystack/webhook', paystackWebhook);

router.use(protect);
router.post('/checkout', checkout);
router.get('/my-orders', getMyOrders);

router.get('/admin/all', restrictTo('admin'), getAllOrders);
router.get('/admin/analytics', restrictTo('admin'), getAdminAnalytics);
router.patch('/:id/status', restrictTo('admin'), updateOrderStatus);

module.exports = router;
