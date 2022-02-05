import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appError.js';
import { getAll } from './handlerFactory.js';

// @desc        Fetch all products
// @route       GET /products
// @access      Public
const getProducts = getAll(Product);

// @desc        Fetch single product by ID
// @route       GET /products/:id
// @access      Public
const getProductById = asyncHandler(async (req, res) => {
  let product = Product.findById(req.params.id);

  product = await Product.findByIdAndUpdate(
    { _id: req.params.id },
    { $inc: { counter: 1 } },
    { multi: false }
  );

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc        Delete a product
// @route       DELETE /products/:id
// @access      Private/Admin

// TODO: Check orders before deleting because order will become null after that
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.remove();
    res.status(204).json({ message: 'Product Removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc        Create a product
// @route       POST /products
// @access      Private
const createProduct = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.isVerified) {
    next(new AppError('You are not KYC verified', 404));
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
  });

  if (product) {
    await product.save();

    // add to user listings array

    user.listings.unshift(product._id);
    await user.save();

    res.status(201).json({
      status: 'success',
      data: product,
    });
  }
});

// @desc        Update a product
// @route       PUT /products/:id
// @access      Private/Admin
const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (product.user.toHexString() !== req.user._id.toHexString()) {
    return next(
      new AppError('You are not authorized to update the product.', 404)
    );
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      rent: req.body.rent,
      brand: req.body.brand,
      category: req.body.category,
      description: req.body.description,
      images: req.body.images,
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
    return next(new AppError('Product not found.', 404));
  }
});

// @desc        Get top rated products
// @route       GET /products/top
// @access      Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ counter: -1 }).limit(5);
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
