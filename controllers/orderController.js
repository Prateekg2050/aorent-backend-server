import asyncHandler from 'express-async-handler';
import dayjs from 'dayjs';
import shortid from 'shortid';
import crypto from 'crypto';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import razorpay from '../config/razorpay.js';
import Transaction from '../models/transactionModel.js';

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
    return next(new AppError('Order not found', 404));
  }
});

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
    return next(new AppError('This product is not verified', 400));
  }

  // 4)Check if product is already rented out
  if (product.isRented) {
    return next(
      new AppError(
        'This item is already rented out. Please try again later',
        400
      )
    );
  }

  // TODO: 5) Cannot rent his own product

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

  // Calculate subtotal
  subTotal = rent.price * duration;

  // Check user premiuim for deposit
  if (user.isPremium) {
    deposit = 0;
  } else {
    deposit = rent.securityAmount;
  }

  //TODO: Take the factor of coupon code

  // Make totalPrice
  totalPrice = subTotal + deposit + serviceCharge;

  // Create the order
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
    proposedReturnDate,
  });

  const createdOrder = await order.save();

  const razorpayId = await razorpay.orders.create({
    amount: totalPrice * 100,
    currency: 'INR',
    receipt: shortid.generate(),
    notes: {
      desc: `OrderId : ${createdOrder._id} , Item ${item} , User : ${req.user._id} `,
    },
  });

  if (!razorpayId) {
    return next(new AppError('Error in order creation', 400));
  }

  order.razorpay = razorpayId;
  await order.save({ validateBeforeSave: false });

  // giving 15 minutes to pay the order else order will be deleted

  // TODO: production will have this code

  // setTimeout(function () {
  //   cancelOrder(createdOrder._id);
  // }, 2 * 60 * 1000);

  res.status(201).json({
    status: 'success',
    razorpayId,
    data: {
      createdOrder,
    },
  });
});

// @desc    Cancel a order
// @route   util function
// @access  Internal access only
const cancelOrder = asyncHandler(async (orderId) => {
  const order = await Order.findById(orderId);

  if (order.isPaid) {
    console.log('order was paid');
  } else {
    // TODO: Reset variables
    await order.remove();
  }
  console.log('order deleted due to payment failure');
});

// @desc    Update order to Paid
// @route   PUT /orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const { orderCreationId, razorpayPaymentId, razorpaySignature } = req.body;

  // Check for payment variables
  if (!orderCreationId)
    return next(new AppError('Order creation ID is required', 400));

  if (!razorpayPaymentId)
    return next(new AppError('razorpayPaymentId is required', 400));

  if (!razorpaySignature)
    return next(new AppError('razorpaySignature is required', 400));

  // 1) get the order
  const order = await Order.findById(req.params.id);

  if (!order)
    return next(
      new AppError(
        'The order might have cancelled due to payment failure. Please place another order',
        400
      )
    );

  console.log(order);
  // and product
  const product = await Product.findById(order.item);
  if (!product)
    return next(
      new AppError(
        'Product you are trying to order is not available somehow',
        400
      )
    );

  // 2) Check for valid payment
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
  const digest = shasum.digest('hex');

  if (digest !== razorpaySignature) {
    return next(new AppError('Transaction is not legit', 400));
  } else if (digest === razorpaySignature) {
    const transaction = new Transaction({
      user: req.user._id,
      item: order.item,
      order: order._id,
      status: 'Paid',
      orderid: orderCreationId,
      paymentId: razorpayPaymentId,
      amount: order.totalPrice,
    });

    await transaction.save();
  }

  if (order) {
    // 3) Set rented fields in product

    // Update product rented out variables and update the product sales
    product.rentedDate = order.startDate;
    product.returnDate = order.proposedReturnDate;
    product.currentlyRentedBy = req.user._id;
    product.isRented = true;
    product.sales.revenue = product.sales.revenue + order.subTotal;
    product.sales.users = product.sales.users + 1;

    await product.save({ validateBeforeSave: false });

    // user currently renting push
    const user = await User.findById(req.user._id);
    user.currentlyRenting.unshift(order.item);

    // Save user
    await user.save({ validateBeforeSave: false });

    // 4)  order update
    order.isPaid = true;
    order.paidAt = Date.now();

    const updateOrder = await order.save();
    res.json({
      status: 'success',
      data: updateOrder,
      message: 'Paid for order successfully',
    });
  } else {
    next(new AppError('Order not found', 404));
  }
});

// @desc    Update order to picked up
// @route   PUT /orders/:id/pickedup
// @access  Private
const updateOrderToPickedUp = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user item');

  console.log(order.item);

  // 1) Check if order is available
  if (!order) next(new AppError('Order not found', 404));

  // 2) Check for permission
  if (req.user._id.toHexString() !== order.item.user.toHexString())
    return next(
      new AppError(
        'Only the owner of product can update it to be picked up',
        401
      )
    );

  // 3) Check if order is paid
  if (!order.isPaid)
    return next(
      new AppError(
        'Order is still not paid. Please do not handover the product to user',
        401
      )
    );

  // 4) Start changing variables

  order.isPickedUp = true;
  order.pickedUpAt = Date.now();

  const updatedOrder = await order.save({ validateBeforeSave: false });

  res.json({
    status: 'success',
    data: updatedOrder,
    message: 'Rentee has picked up the product from the owner',
  });
});

const updateOrderToReturned = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user item');

  // 1) Check if order is available
  if (!order) next(new AppError('Order not found', 404));

  // 2) Check for permission
  if (req.user._id.toHexString() !== order.item.user.toHexString())
    return next(
      new AppError(
        'Only the owner of product can update it to be picked up',
        401
      )
    );

  // 3) Start changing variables
  order.returnDelivered = true;
  order.returnDate = Date.now();

  //TODO: add backlog if late submit
  // console.log(new Date(Date.now()));
  // console.log(new Date(order.item.returnDate));

  if (new Date(Date.now()) > new Date(order.returnDate)) {
    console.log('in if');
    console.log(order.user._id);
    const user = await User.findByIdAndUpdate(order.user._id, {
      backlog: {
        referenceOrder: order._id,
        amount: order.item.rent.lateFees,
        reason: 'You delivered the item back late than it was expected to.',
      },
    });

    console.log(user);
    // console.log(order.returnDate);
  }

  const date = Date.now();
  // console.log(date);

  console.log(x);

  // change back product variables
  const product = await Product.findById(order.item._id);
  product.rentedDate = undefined;
  product.returnDate = undefined;
  product.currentlyRentedBy = undefined;
  product.isRented = false;
  product.isListed = false;

  await product.save({ validateBeforeSave: false });

  const updateOrder = await order.save({ validateBeforeSave: false });

  res.json({
    status: 'success',
    data: updateOrder,
  });
});

// @desc    Get logged in user orders
// @route   GET /orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    data: orders,
  });
});

export {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToPickedUp,
  updateOrderToReturned,
  getMyOrders,
};
