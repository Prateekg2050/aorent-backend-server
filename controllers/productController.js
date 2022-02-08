import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appError.js';

// @desc        Create a product
// @route       POST /products
// @access      Private
const createProduct = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user.isVerified) {
    next(
      new AppError(
        'You are not KYC verified. Please submit your KYC verification and wait until approved',
        400
      )
    );
  }

  const product = await Product.create({
    user: req.user._id,
    title: req.body.title,
    name: req.body.name,
    brand: req.body.brand,
    category: req.body.category,
    description: req.body.description,
    images: req.body.images,
    rent: req.body.rent,
    location: req.body.location,
  });

  if (product) {
    await product.save();

    // add to user listings array
    user.listings.unshift(product._id);
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      status: 'success',
      data: product,
    });
  }
});

// @desc        Fetch all products which are apporved
// @route       GET /products
// @access      Public
const getProducts = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Product.find({ underReview: false }),
    req.query
  )
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

// @desc        Fetch single product by ID
// @route       GET /products/:id
// @access      Public
const getProductById = asyncHandler(async (req, res, next) => {
  let product = await Product.findOne({ _id: req.params.id });

  if (!product.underReview)
    product = await Product.findByIdAndUpdate(
      { _id: req.params.id },
      { $inc: { counter: 1 } },
      { multi: false, new: true }
    );

  if (product) {
    res.status(200).json({
      status: 'success',
      data: product,
    });
  } else {
    next(new AppError('Product not found', 404));
  }
});

// @desc        Update a product
// @route       PUT /products/:id
// @access      Private
const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (product.user.toHexString() !== req.user._id.toHexString()) {
    return next(
      new AppError('You are not authorized to update the product.', 401)
    );
  }
  // product is under review as soon as product is updated

  product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      rent: req.body.rent,
      brand: req.body.brand,
      category: req.body.category,
      description: req.body.description,
      images: req.body.images,
      underReview: true,
    },
    {
      new: true,
    }
  );
  // console.log(product);
  if (product) {
    res.json({
      status: 'success',
      data: product,
    });
  } else {
    next(new AppError('Product not found.', 404));
  }
});

// @desc        Delete a product
// @route       DELETE /products/:id
// @access      Private/Admin
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  // 1) Check if product exists
  if (!product) {
    next(new AppError('Product not found', 404));
  }

  // 2) Check if user deleting is the owner of product
  if (!req.user._id.toHexString() === product.user.toHexString()) {
    next(new AppError('You are not authorized to delete this product.', 401));
  }

  // 3) Check if product is currently rented by someone
  if (product.isRented) {
    next(new AppError('Product is currently rented by someone', 400));
  }

  // Execute the deletion
  await product.remove();

  // Send 204 response
  res.status(204).json({
    message: 'Product Removed',
  });
});

// @desc        Get top rated products
// @route       GET /products/top
// @access      Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ counter: -1 }).limit(5);
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: products,
  });
});

export {
  getProductById,
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  getTopProducts,
};
