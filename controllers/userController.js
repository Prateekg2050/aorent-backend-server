import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import AppError from '../utils/appError.js';
import { sendNotification } from '../utils/fcm.js';

// @desc        Get user profile
// @route       GET /users/profile
// @access      Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('listings currentlyRenting wishlist');

  if (user) {
    res.json({
      status: 'success',
      data: user,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc        Update user profile
// @route       PUT /users/profile
// @access      Private
const updateUserProfile = asyncHandler(async (req, res, next) => {
  const doc = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });

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

// @desc        Delete me
// @route       PUT /users/profile
// @access      Private
const deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: 'success', message: 'User deleted' });
});

// @desc        Start user verification
// @route       PATCH /users/:id/kycVerify
// @access      Private
const kycVerify = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user.isVerified)
    return next(new AppError('You are already a verified user', 400));

  if (
    !req.body.name ||
    !req.body.idType ||
    !req.body.idNumber ||
    !req.body.idImage
  )
    return next(new AppError('Please give all the required parameters', 400));

  if (req.body.idImage.length !== 2)
    return next(new AppError('Please send only two images', 400));

  const kycVerify = {
    name: req.body.name,
    idType: req.body.idType,
    idNumber: req.body.idNumber,
    idImage: req.body.idImage,
  };

  user.kycDetails = kycVerify;
  user.underReview = true;

  await user.save({ validateBeforeSave: false });

  if (user) {
    res.json({
      status: 'success',
      message: 'KYC verification submitted',
      data: { user },
    });
  } else {
    return next(new AppError('User not found', 404));
  }
});

// @desc        Get user listings
// @route       GET /users/myRentals
// @access      Private
const getListings = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('listings');
  let listings = user.listings;
  if (!user.listings) {
    listings = [];
  }

  res.status(200).json({
    status: 'success',
    results: listings.length,
    rentals: listings,
    message: 'User MyRentals fetched successfully',
  });
});

// @desc        Set fcm token
// @route       POST /users/subscribeNotifications
// @access      Private
const setFcmToken = asyncHandler(async (req, res, next) => {
  if (!req.body.token)
    return next(new AppError('Please send fcm token in body', 400));

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    {
      fcm: {
        token: req.body.token,
        date: Date.now(),
      },
    },
    { new: true, safe: true, upsert: true }
  );

  sendNotification(
    user.fcm.token,
    `Hello ${user.name}`,
    'Please check us out 👋'
  );

  res.status(200).json({
    status: 'success',
    data: user.fcm,
    message: 'User FCM token updated successfully',
  });
});

export {
  getMe,
  updateUserProfile,
  kycVerify,
  deleteMe,
  getListings,
  setFcmToken,
};

// @desc        To get total revenue with date
// @route       GET /users/:productId/revenue
// @access      Private
const revenue = asyncHandler(async (req, res, next) => {
  const revenue = await Order.aggregate([
    // 1) lookeup
    { $lookup },
    // 2) match with user id
    { $match: { item: req.params.productId } },
    // 3) group transactional data
    {
      $group: {
        _id: '$returnDate',
        income: {},
      },
    },
  ]);
});
