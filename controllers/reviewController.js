import asyncHandler from 'express-async-handler';
import dayjs from 'dayjs';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Review from '../models/reviewModel.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';

// @desc        Create a new review
// @route       POST /products/:productId/review
// @access      Private
const createProductReview = asyncHandler(async (req, res, next) => {
  const { rating, review } = req.body;

  // check if user has used the product before
  const order = await Order.findOne({
    user: req.user._id,
    // item: req.params.productId,
    // isPaid: true,
    // returnDate: { $lte: new Date(dayjs().format()) },
  });

  if (!order) {
    return next(
      new AppError('Please try the product before reviewing it', 400)
    );
  }

  const doc = await Review.create({
    rating,
    review,
    user: req.user._id,
    product: req.params.productId,
  });

  if (!doc) {
    return next(new AppError('Error in submitting review', 500));
  }

  res.status(201).json({
    status: 'success',
    data: { doc },
    message: 'Review Submitted',
  });
});

// @desc        Get all reviews
// @route       GET /products/:productId/review
// @access      Public
const getAllReviews = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Review.find({ product: req.params.productId }),
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

// @desc        Get a review by id
// @route       GET /products/:id/review/:reviewId
// @access      Public
const getReview = asyncHandler(async (req, res, next) => {
  const doc = await Review.findOne({ _id: req.params.reviewId });

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

// @desc        Edit a review
// @route       PATCH /products/:productId/review/:reviewId
// @access      Private
const editReview = asyncHandler(async (req, res, next) => {
  const doc = await Review.findByIdAndUpdate(
    req.params.reviewId,
    { rating: req.body.rating, review: req.body.review },
    {
      new: true,
    }
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

// @desc        Delete a review
// @route       DELETE /products/:id/review/:reviewId
// @access      Private
const deleteReview = asyncHandler(async (req, res, next) => {
  const doc = await Review.findByIdAndRemove(req.params.reviewId);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export {
  createProductReview,
  getAllReviews,
  editReview,
  deleteReview,
  getReview,
};
