import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    currentlyRentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please give a title'],
    },
    name: {
      type: String,
      required: [true, 'Please give a name'],
    },
    brand: {
      type: String,
      required: [true, 'Please tell us the brand'],
    },
    category: {
      type: String,
      required: [true, 'Please tell us the category'],
      lowercase: true,
      enum: {
        values: [
          'electronics',
          'furniture',
          'clothing',
          'properties',
          'services',
          'essentials',
          'industrial supplies',
          'sports',
          'entertainment',
          'luxury',
          'agriculture',
          'other',
        ],
        message: 'Categories can be selected only from the list',
      },
    },
    description: {
      type: String,
      required: [true, 'Please enter the description'],
    },
    images: [{ type: String }],
    rent: {
      durationType: {
        type: String,
        required: true,
        default: 'monthly',
        enum: ['hourly', 'monthly'],
      },
      price: { type: Number, required: true, default: 0 },
      securityAmount: { type: Number, required: true, default: 0 },
      minimumDuration: { type: Number, required: true, default: 0 },
      lateFees: { type: Number, required: true, default: 0 },
    },
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
    sales: {
      users: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
    },
    counter: { type: Number, default: 0 },
    underReview: { type: Boolean, default: true },
    isRented: { type: Boolean, default: false },
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

//TODO: Add reviews using virtual populate

// productSchema.pre(/^find/, function (next) {
//   this.find({ isRented: { $ne: true } });
//   next();
// });

const Product = mongoose.model('Product', productSchema);

export default Product;
