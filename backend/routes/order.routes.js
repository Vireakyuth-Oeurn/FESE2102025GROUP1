const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// User routes (require authentication)
router.use(authMiddleware);

// Get user's orders
router.get('/my-orders', orderController.getUserOrders);

// Get specific order
router.get('/:id', orderController.getOrderById);

// Create new order
router.post('/', orderController.createOrder);

// Admin routes
router.get('/', adminMiddleware, orderController.getAllOrders);
router.put('/:id/status', adminMiddleware, orderController.updateOrderStatus);

module.exports = router; 