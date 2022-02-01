import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';

// @desc        Register new user
// @route       POST /user/register
// @access      Public

const registerUser = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    avatar: req.body.avatar,
  });

  res.status(201).json({
    status: 'success',
    user,
    token: generateToken(user._id),
  });
});

// @desc        Login user
// @route       POST /user/login
// @access      Public

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exists
  if (!email || !password) {
    next(new AppError('Please provide email and password', 400));
  }

  // 2) check if user exists and password is correct
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      user,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

export { registerUser, loginUser };
