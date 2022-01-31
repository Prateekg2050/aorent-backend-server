import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    image: [{ type: String }],
    coverImage: String,
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    underReview: { type: Boolean, default: true },
    rent: {
      time: {
        type: Number,
        default: 0,
        required: true,
      },
      price: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    isRented: { type: Boolean, default: false },
    rentedDate: { type: Date },
    returnDate: {
      type: Date,
      validate: {
        validator: function (val) {
          return returnDate > rentedDate;
        },
        message: 'Return date should be greater than rented on date',
      },
    },
    sales: {
      users: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
    },
    counter: { type: Number, default: 0 },
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

const Product = mongoose.model('Product', productSchema);

export default Product;
