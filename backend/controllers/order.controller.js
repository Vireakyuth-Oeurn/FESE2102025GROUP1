const { Order, OrderItem, Cart, CartItem, Product, Address, ActivityLog } = require('../models');
const { Op } = require('sequelize');

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'imageUrl']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'imageUrl']
        }]
      }, {
        model: Address,
        as: 'address'
      }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

// Create new order from cart
const createOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product'
        }]
      }]
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate shipping address
    const shippingAddress = await Address.findOne({
      where: { 
        id: addressId,
        userId: req.user.id
      }
    });

    if (!shippingAddress) {
      return res.status(404).json({ message: 'Shipping address not found' });
    }

    // Calculate total and validate stock
    let total = 0;
    for (const item of cart.items) {
      if (!item.product.isAvailable || item.product.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Product ${item.product.name} is not available in the requested quantity`
        });
      }
      total += item.product.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      addressId,
      paymentMethod,
      totalAmount: total,
      status: 'pending'
    });

    // Create order items and update stock
    for (const item of cart.items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      });

      // Update product stock
      await item.product.update({
        stockQuantity: item.product.stockQuantity - item.quantity
      });
    }

    // Clear cart
    await CartItem.destroy({
      where: { cartId: cart.id }
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'create_order',
      entityType: 'order',
      entityId: order.id
    });

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update({ status });

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'update_order_status',
      entityType: 'order',
      entityId: order.id,
      details: { status }
    });

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'imageUrl']
        }]
      }, {
        model: Address,
        as: 'address'
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

module.exports = {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getAllOrders
}; 