import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';

// @desc        Get user profile
// @route       GET /users/profile
// @access      Private

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json(user);
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
      user,
      token: generateToken(user._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc        Get all common data of user
// @route       GET /users/commondata
// @access      Private

const commonData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate([
    'listings',
    'currentlyRenting',
  ]);

  if (user) {
    res.json({ user });
  } else {
    res.status(400);
    throw new Error('No such user found');
  }
});

export { getUserProfile, updateUserProfile, commonData };
