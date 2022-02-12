import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
      minimumDuration: { type: Number, required: true, default: 0 },
      price: { type: Number, required: true, default: 0 },
      securityAmount: { type: Number, required: true, default: 0 },
      lateFees: { type: Number, required: true, default: 0 },
    },

    // rentee details
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
    currentlyRentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isRented: { type: Boolean, default: false },

    // rating and reviews
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

    // sales management
    sales: {
      users: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
    },

    // no of views
    counter: { type: Number, default: 0 },

    // location reference
    location: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      // longitude , latitude
      coordinates: [Number],
      address: String,
      description: String,
    },

    // approve product boolean
    isVerified: { type: Boolean, default: false },
    underReview: { type: Boolean, default: true },
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

const Product = mongoose.model('Product', productSchema);

export default Product;
