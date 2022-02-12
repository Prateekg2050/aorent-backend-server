import asyncHandler from 'express-async-handler';
import dayjs from 'dayjs';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';

// @desc    Create new order
// @route   POST /orders
// @access  Private
const createOrder = asyncHandler(async (req, res, next) => {
  // Check if user is kyc verified
  const user = await User.findById(req.user._id);
  if (!user.isVerified) {
    return next(new AppError('Please get KYC verfied. Try again later', 401));
  }

  // extract variables
  let { item, startDate, duration, shippingAddress, paymentMethod } = req.body;

  // Check if date is in future or not
  startDate = Date(startDate);
  if (startDate < Date.now()) {
    return next(new AppError('Please select future date', 400));
  }

  // Check if req.body.item exist or not
  if (!item) {
    return next(new AppError('Please select some product', 400));
  }

  // Get product
  const product = await Product.findById(item);

  // Check for flags
  // 1) Product might not exist
  if (!product) {
    return next(new AppError('This product does not exists', 404));
  }

  // 2) If the product is still under review
  if (product.underReview) {
    return next(
      new AppError(
        'This product is still under review. Please try after sometime',
        400
      )
    );
  }

  // 3) If the product is verified
  if (!product.isVerified) {
    return next(new AppError('This product is rejected', 400));
  }

  // 4)Check if product is already rented out
  if (product.isRented) {
    return next(
      new AppError(
        'This item is already rented out. Please come after some time',
        400
      )
    );
  }

  // Rent manipultion
  const rent = product.rent;
  let serviceCharge = req.body.serviceCharge || 0;
  let returnDate, subTotal, deposit, totalPrice;

  // check if min. duration is more than given duration
  if (rent.minimumDuration > duration) {
    return next(
      new AppError('Duration provided is less than minimum duration', 400)
    );
  }

  // get return date according to monthly or hourly
  if (rent.durationType === 'monthly') {
    console.log('monthly');
    returnDate = dayjs(
      dayjs(startDate).valueOf() + duration * 30 * 86400 * 1000
    ).format();
  }

  if (rent.durationType === 'hourly') {
    console.log('hourly');
    returnDate = dayjs(
      dayjs(startDate).valueOf() + duration * 60 * 60 * 1000
    ).format();
  }

  // Calculate price according to rent and duration

  console.log(rent);

  // Calculate subtotal
  subTotal = rent.price * duration;

  // Check user premiuim for deposit
  if (user.isPremium) {
    deposit = 0;
  } else {
    deposit = rent.securityAmount;
  }

  // Make totaPrice
  totalPrice = subTotal + deposit + serviceCharge;

  console.log(totalPrice);
  const order = new Order({
    user: req.user._id,
    item,
    shippingAddress,
    paymentMethod,
    subTotal,
    depositCharged: deposit,
    serviceCharge,
    totalPrice,
    startDate,
    returnDate,
  });
  // TODO:update product rent variables

  product.rentedDate = startDate;
  product.returnDate = returnDate;
  product.currentlyRentedBy = req.user._id;
  product.isRented = true;
  product.sales.revenue = product.sales.revenue + subTotal;
  product.sales.users = product.sales.users + 1;

  await product.save({ validateBeforeSave: false });

  const createdOrder = await order.save();
  res.status(201).json({
    status: 'success',
    data: {
      createdOrder,
    },
  });
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
    const product = await Product.findById(order.item);

    product.isRented = true;
    product.currentlyRentedBy = req.user._id;
    product.rentedDate = req.body.rentedDate;
    product.returnDate = req.body.rentedDate + 60 * 1000 * 24 * 30;

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

  res.status(200).json({ status: 'success', data: orders });
});

export {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
};
