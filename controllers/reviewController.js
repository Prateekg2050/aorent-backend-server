import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Review from '../models/reviewModel.js';
import AppError from '../utils/appError.js';

// @desc        Create a new review
// @route       POST /products/:id/reviews
// @access      Private
// const createProductReview = asyncHandler(async (req, res) => {
//   const { rating, comment } = req.body;

//   const product = await Product.findById(req.params.id);

//   if (product) {
//     const alreadyReviewed = product.reviews.find(
//       (r) => r.user.toString() === req.user._id.toString()
//     );

//     if (alreadyReviewed) {
//       res.status(400);
//       throw new Error('Product already reviewed');
//     }

//     const review = {
//       name: req.user.name,
//       rating: Number(rating),
//       comment,
//       user: req.user._id,
//     };

//     product.reviews.push(review);

//     product.numReviews = product.reviews.length;

//     // TODO: make aggreation to get average rating
//     product.rating =
//       product.reviews.reduce((acc, item) => item.rating + acc, 0) /
//       product.reviews.length;

//     await product.save();

//     res.status(201).json({ mesage: 'Review Added' });
//   } else {
//     res.status(400);
//     throw new Error('Product not found');
//   }
// });

const createProductReview = asyncHandler(async (req, res, next) => {
  const { rating, review } = req.body;
  const doc = await Review.create({
    rating,
    review,
    user: req.user._id,
    product: req.params.productId,
  });
  res.status(201).json({
    status: 'success',
    data: { doc },
  });
});

export { createProductReview };
