import asyncHandler from 'express-async-handler';
import dayjs from 'dayjs';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';

// @desc    Create new order
// @route   POST /orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    item,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (!item) {
    return next(new AppError('There was some error creating producct', 500));
  } else {
    const order = new Order({
      user: req.user._id,
      item,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // const user = await User.findById(req.user._id);
    // user.currentlyRenting.unshift(item._id);
    // await user.save({ validateBeforeSave: false });

    const createdOrder = await order.save();
    res.status(201).json({ status: 'success', data: createdOrder });
  }
});

// @desc    Get an order by id
// @route   GET /orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json({ status: 'success', data: order });
  } else {
    next(new AppError('Order not found', 404));
  }
});

// @desc    Update order to Paid
// @route   PUT /orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  // 1) get the order
  const order = await Order.findById(req.params.id).populate(
    'user item',
    'name email'
  );

  if (order) {
    // 2) Set rented fields in product
    const product = await Product.findByIdAndUpdate(order.item, {
      isRented: true,
      currentlyRentedBy: req.user._id,
      rentedDate: Date.now(),
      returnDate: Date.now() + 60 * 1000 * 24 * 30,
    });

    const durationType = product.rent.durationType;
    let minDuration = 1;
    let returnDate = Date.now();

    if (durationType === 'monthly') {
    }

    // user currently renting push

    // 3)  order update
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updateOrder = await order.save();
    res.json(updateOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to Delivered
// @route   PUT /orders/:id/deliver
// @access  Private
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updateOrder = await order.save();
    res.json(updateOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });

  res.json(orders);
});

export {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
};
