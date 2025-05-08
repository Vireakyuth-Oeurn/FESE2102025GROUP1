const { Order, OrderItem, Cart, CartItem, Product, Address, ActivityLog, User } = require('../models');
const { Op } = require('sequelize');

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        Address
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
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

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { shippingInfo, paymentMethod, paymentInfo } = req.body;
    const userId = req.user.id;

    // Get user's cart
    const cart = await req.user.getCart({
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'discount', 'stock']
      }]
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      const discountedPrice = item.product.price * (1 - item.product.discount / 100);
      return total + (discountedPrice * item.quantity);
    }, 0);

    // Create shipping address
    const address = await Address.create({
      street: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zipCode: shippingInfo.zipCode,
      country: shippingInfo.country,
      phone: shippingInfo.phone
    });

    // Create order
    const order = await Order.create({
      userId,
      addressId: address.id,
      totalAmount,
      status: 'pending',
      paymentMethod,
      paymentInfo: paymentInfo ? JSON.stringify(paymentInfo) : null
    });

    // Create order items and update product stock
    const orderItems = await Promise.all(
      cart.items.map(async (item) => {
        // Update product stock
        await Product.update(
          { stock: item.product.stock - item.quantity },
          { where: { id: item.product.id } }
        );

        // Create order item
        return OrderItem.create({
          orderId: order.id,
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          discount: item.product.discount
        });
      })
    );

    // Clear the cart
    await cart.setItems([]);

    // Fetch the complete order with items and products
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        Address,
        User
      ]
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
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

// Get order details
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, userId },
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        Address,
        User
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Error fetching order details', error: error.message });
  }
};

module.exports = {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderDetails
}; 