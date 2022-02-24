import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';
import sendNotification from '../utils/notification.js';

/********************************************************************************************/
/*****************************************User Routes****************************************/

// @desc        Get all users
// @route       GET /admin/user/all
// @access      Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const doc = await features.query;

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: { doc },
  });
});

// @desc        Get user by ID
// @route       GET /admin/user/:id
// @access      Private/Admin
const getUserById = asyncHandler(async (req, res, next) => {
  let doc = await User.findById(req.params.id);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      doc,
    },
  });
});

// @desc        Get users under review
// @route       GET /admin/users/underReview
// @access      Private/Admin
const underReviewUsers = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(User.find({ underReview: true }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const doc = await features.query;

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: { doc },
  });
});

// @desc        Approve user
// @route       PATCH /admin/user/:id/:approve
// @access      Private/Admin
const approveUser = asyncHandler(async (req, res, next) => {
  if (!(req.params.approve === 'approve') && !(req.params.approve === 'reject'))
    return next(new AppError('Please select reject or approve option', 400));

  let user = await User.findById(req.params.id);

  // Check for flags
  // 1) If user has applied for kyc verification
  if (!user.underReview)
    return next(new AppError('User has not applied for verification', 400));

  // 2) If user is already a verified user
  if (user.isVerified)
    return next(new AppError('User is already verified', 400));

  if (req.params.approve === 'approve') {
    user = await User.findByIdAndUpdate(
      req.params.id,
      { underReview: false, isVerified: true },
      { new: true }
    );

    sendNotification(
      req.params.id,
      'success',
      'KYC approved',
      'Your KYC request has been approved'
    );
  }

  if (req.params.approve === 'reject') {
    user = await User.findByIdAndUpdate(
      req.params.id,
      { underReview: false, isVerified: false, kycDetails: {} },
      { new: true }
    );

    sendNotification(
      req.params.id,
      'fail',
      'KYC rejected',
      'Your KYC request has been rejected'
    );
  }

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc        Flag a user for some reason
// @route       DELETE /admin/users/:id
// @access      Private/Admin
const flagUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { flagged: true });

  if (user) {
    res.json({
      status: 'success',
      message: 'User Flagged',
    });
  } else {
    res.status(400);
    throw new Error('No such user found');
  }
});

/********************************************************************************************/
/*****************************************Product Routes*************************************/

// @desc        Get all products
// @route       GET /admin/product/all
// @access      Private/Admin
const getProducts = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .keyword();

  const doc = await features.query;

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: { doc },
  });
});

// @desc        Get products under review
// @route       GET /admin/products/underReview
// @access      Private/Admin
const underReviewProducts = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Product.find({ underReview: true }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .keyword();

  const doc = await features.query;
  const count = await Product.countDocuments({ underReview: true });
  console.log(count);
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: { doc },
  });
});

// @desc        Get product by ID
// @route       GET /admin/product/:id
// @access      Private/Admin
const getProductById = asyncHandler(async (req, res, next) => {
  let doc = await Product.findById(req.params.id).populate('user');
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      doc,
    },
  });
});

// @desc        Review the product and approve it
// @route       GET /admin/product/:id/:approve
// @access      Private/Admin
const approveProduct = asyncHandler(async (req, res) => {
  if (!req.params.approve === 'approve' || !req.params.approve === 'reject') {
    next(new AppError('Please select reject or approve option', 400));
  }

  let doc = undefined;

  if (req.params.approve === 'approve') {
    doc = await Product.findByIdAndUpdate(
      req.params.id,
      { underReview: false, isVerified: true, isListed: true },
      { new: true }
    );
  }

  if (req.params.approve === 'reject') {
    doc = await Product.findByIdAndUpdate(
      req.params.id,
      { underReview: false, isVerified: false },
      { new: true }
    );
  }

  if (doc) {
    res.json({
      status: 'success',
      data: { doc },
    });
  } else {
    res.status(400);
    throw new Error('No such product found');
  }
});

// @desc        Get all orders
// @route       GET /admin/order/all
// @access      Private/Admin
const getOrders = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Order.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const doc = await features.query;

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: { doc },
  });
});

// @desc        Get order by ID
// @route       GET /admin/order/:id
// @access      Private/Admin
const getOrderById = asyncHandler(async (req, res, next) => {
  let doc = await Order.findById(req.params.id);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      doc,
    },
  });
});

export {
  // user functions
  getUsers,
  underReviewUsers,
  flagUser,
  approveUser,
  getUserById,
  // products functions
  getProducts,
  underReviewProducts,
  getProductById,
  approveProduct,
  // order functions
  getOrders,
  getOrderById,
};
