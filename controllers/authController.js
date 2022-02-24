import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';

// helper function

const createAndSendToken = (user, statusCode, res) => {
  res.status(statusCode).json({
    status: 'success',
    token: generateToken(user._id),
    data: {
      user: user,
    },
  });
};

// @desc        Register new user
// @route       POST /user/register
// @access      Public

const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.create({
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      phoneNumber: req.body.phoneNumber,
    });

    createAndSendToken(user, 201, res);
  } catch (error) {
    return next(new AppError(error, 404));
  }
});

// @desc        Login user
// @route       POST /user/login
// @access      Public

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) check if user exists and password is correct
  let user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // fetching again to hide user password
  user = await User.findById(user._id);

  // 3) if everything ok , send token to client
  createAndSendToken(user, 200, res);
});

// @desc        Forgot password
// @route       POST /user/forgotPassword
// @access      Public

const forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // 2) Generate a random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // we didnt save the document when added fields, validateBeforeSave set to false to avoid error in saving without required fields

  // 3) Send it to users email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/users/resetPassword/${await resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email, // or req.body.email
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // return next(new AppError(`${error}`), 500);
    return next(
      new AppError('There was an error sending the email. Try again later'),
      500
    );
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new passwordResetToken
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // reseting from user model
  // 4) Log the user in , send the JWT

  res.status(200).json({
    status: 'success',
    token: generateToken(user._id),
    user: user.select('password'),
  });
});

const updatePassword = asyncHandler(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user._id).select('+password');

  // 2) check if POSTed current password is correctPassword
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // 3) If so, update password
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(new AppError('Please enter new passwords', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  // 4) Log in user, send JWT
  createAndSendToken(user, 200, res);
});

export {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updatePassword,
};
