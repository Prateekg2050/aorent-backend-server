import mongoose from 'mongoose';

const productReviewSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    isApproved: { type: Boolean },
    isFlag: { type: Boolean },
  },
  { timestamps: true }
);

const ProductReview = mongoose.model('User', productReviewSchema);

export default ProductReview;
