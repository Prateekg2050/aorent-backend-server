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

  const {
    title,
    name,
    brand,
    category,
    description,
    images,
    rent,
    longitude,
    latitude,
  } = req.body;

  // Check for missing fields

  if (
    !title ||
    !name ||
    !brand ||
    !category ||
    !description ||
    !images ||
    !rent ||
    !longitude ||
    !latitude
  ) {
    return next(new AppError('Some fields are missing', 400));
  }

  const product = await Product.create({
    user: req.user._id,
    title,
    name,
    brand,
    category,
    description,
    images,
    rent,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
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
// @route       GET /products/center/:latlng/radius/:distance
// @access      Public
const getProducts = asyncHandler(async (req, res, next) => {
  const { distance, latlng } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = distance / 6378.1; // in kms

  if (!lat || !lng) {
    throw new Error('Please provide lattitude and longitude in format lat,lng');
  }

  const features = new APIFeatures(
    Product.find({
      isVerified: true,
      $geoWithin: { $centerSphere: [[lng * 1, lat * 1], radius] },
    }),
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

  if (product.isVerified)
    product = await Product.findByIdAndUpdate(
      { _id: req.params.id },
      { $inc: { counter: 1 } },
      { new: true }
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
// @access      Private
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

// @desc        Get top rated products for carasouel or something else
// @route       GET /products/top
// @access      Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ underReview: false })
    .sort({ counter: -1 })
    .limit(5);
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
