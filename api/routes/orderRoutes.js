const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createOrder,
    reviewOrder,
    approveOrder,
    processPayment,
    getOrders,
    getOrder
} = require('../controllers/orderController');

// Routes accessible by customers and distributors
router.post('/', protect, authorize('customer', 'distributor'), createOrder);
router.get('/', protect, getOrders);
router.get('/:orderId', protect, getOrder);

// Routes for marketing team
router.put('/:orderId/review', protect, authorize('marketing'), reviewOrder);

// Routes for admin
router.put('/:orderId/approve', protect, authorize('admin'), approveOrder);

// Payment route (accessible by customers and distributors)
router.put('/:orderId/payment', protect, authorize('customer', 'distributor'), processPayment);

module.exports = router; 