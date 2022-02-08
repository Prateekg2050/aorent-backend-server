import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';
import { getAll, getOne } from './handlerFactory.js';

// @desc        Get all users
// @route       GET /admin/allUsers
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

// @desc        Update user
// @route       PATCH /admin/user/:id
// @access      Private/Admin
const approveUser = asyncHandler(async (req, res, next) => {
  const doc = await User.findByIdAndUpdate(
    req.params.id,
    { underReview: false },
    { new: true }
  );

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
const underReviewUsers = getAll(User, { underReview: true });

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

// @desc        Get all products
// @route       GET /admin/allProducts
// @access      Private/Admin
const getProducts = getAll(Product);

// @desc        Get products under review
// @route       GET /admin/products/underReview
// @access      Private/Admin
const underReviewProducts = getAll(Product, { underReview: true });

// @desc        Get product by ID
// @route       GET /admin/product/:id
// @access      Private/Admin
const getProductById = getOne(Product, { path: 'user currentlyRentedBy' });

// @desc        Review the product and approve it
// @route       GET /admin/product/:id/approve
// @access      Private/Admin
const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, {
    underReview: false,
  });

  if (product) {
    res.json({
      status: 'success',
      message: 'Product Approved',
    });
  } else {
    res.status(400);
    throw new Error('No such product found');
  }
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
};
