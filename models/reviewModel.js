import mongoose from 'mongoose';
import Product from './productModel.js';

const reviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: [true, 'Review can not be empty.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Review must belong to a user'],
      ref: 'User',
    },
    product: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Review must belong to a product'],
      ref: 'Product',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name avatar',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      numReviews: stats[0].nRating,
      averageRating: stats[0].avgRating,
    });
  } else if (stats === null) {
    await Product.findByIdAndUpdate(productId, {
      numReviews: 0,
      averageRating: 0,
    });
  }
};

// post does not have access to next middleware
reviewSchema.post('save', function () {
  // this points to current review
  // this.constructor is the model
  this.constructor.calcAverageRatings(this.product);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // this.r = await this.findOne(); does NOT WORK here.as already executed
  if (!this) await this.r.constructor.calcAverageRatings(this.r.product);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
