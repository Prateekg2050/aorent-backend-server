import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';

// @desc        Get user profile
// @route       GET /users/profile
// @access      Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
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
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });

  if (user) {
    res.status(201).json({
      status: 'success',
      data: { user, token: generateToken(user._id) },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc        Start user verification
// @route       PATCH /users/:id/kycVerify
// @access      Private
const kycVerify = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password');

  if (
    !req.body.name ||
    !req.body.idType ||
    !req.body.idNumber ||
    !req.body.idImage
  ) {
    next(new AppError('Please give all the required parameters', 400));
  }

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
    res.status(404);
    throw new Error('User not found');
  }
});

export { getMe, updateUserProfile, kycVerify };
