import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';

const protect = asyncHandler(async (req, res, next) => {
  // 1) Getting token and check if it exists
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to get access', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The token belonging to this user no longer exists', 401)
    );
  }

  // 4) Check if user changed password after token was issued
  if (!freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return next(new AppError('You are not authorized as admin.', 401));
  }
};

export { protect, admin };
