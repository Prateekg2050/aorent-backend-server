import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { getAll, getOne, updateOne } from './handlerFactory.js';

// util functions
const approveUser = asyncHandler((req, res, next) => {
  req.body = { underReview: false };
  next();
});

// @desc        Get all users
// @route       GET /admin/allUsers
// @access      Private/Admin
const getUsers = getAll(User);

// @desc        Get user by ID
// @route       GET /admin/user/:id
// @access      Private/Admin
const getUserById = getOne(User, { path: 'currentlyRenting listings' });

// @desc        Update user
// @route       PATCH /admin/user/:id
// @access      Private/Admin
const updateUser = updateOne(User);

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
  // utils
  approveUser,
  // user functions
  getUsers,
  underReviewUsers,
  flagUser,
  updateUser,
  getUserById,
  // products controlers
  getProducts,
  underReviewProducts,
  getProductById,
  approveProduct,
};
