import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { getAll, getOne, updateOne } from './handlerFactory.js';

// @desc        Get all users
// @route       GET /admin/allUsers
// @access      Private/Admin
const getUsers = getAll(User);

// @desc        Get user by ID
// @route       GET /admin/user/:id
// @access      Private/Admin
const getUserById = getOne(User, { path: 'currentlyRenting listings' });

// @desc        Update user
// @route       PATCH /admin/user/:id
// @access      Private/Admin
const updateUser = updateOne(User);

// @desc        Get users under review
// @route       GET /admin/users/underReview
// @access      Private/Admin
const underReviewUsers = getAll(User, { underReview: true });

// @desc        Flag a user for some reason
// @route       DELETE /admin/users/:id
// @access      Private/Admin
const flagUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { flagged: true });

  if (user) {
    res.json({ message: 'User Flagged' });
  } else {
    res.status(400);
    throw new Error('No such user found');
  }
});

export { getUsers, underReviewUsers, flagUser, updateUser, getUserById };
