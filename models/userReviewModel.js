import mongoose from 'mongoose';

const userReviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    isApproved: { type: Boolean },
    isFlag: { type: Boolean },
    isBlackList: { type: Boolean },
  },
  { timestamps: true }
);

const UserReview = mongoose.model('User', userReviewSchema);

export default UserReview;
