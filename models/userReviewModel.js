import mongoose from 'mongoose';

const userReviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    isApproved: { type: Boolean, default: false },
    isFlag: { type: Boolean, default: false },
    isBlackList: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserReview = mongoose.model('User', userReviewSchema);

export default UserReview;
