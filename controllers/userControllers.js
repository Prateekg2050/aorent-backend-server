import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';

// @desc        Register new user
// @route       POST /user/register
// @access      Public

const registerUser = asyncHandler(async (req, res) => {
  try {
    // const { name, email, password, address, phoneNumber } = req.body;
    const user = await User.create(req.body);

    if (user) {
      res.status(201).json({
        status: 'success',
        user,
        token: generateToken(user._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(400);
    throw new Error('User already exists');
  }
});

// @desc        Login user
// @route       POST /user/login
// @access      Public

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

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

// @desc        Get all users
// @route       GET /users
// @access      Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc        Delete a user
// @route       DELETE /users/:id
// @access      Private/Admin

// TODO: Delete products also when we delete the user
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.json({ message: 'User Removed' });
  } else {
    res.status(400);
    throw new Error('No such user found');
  }
});

// @desc        Get user by ID
// @route       GET /users/:id
// @access      Private/Admin

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(400);
    throw new Error('No such user found');
  }
});

// @desc        Update user
// @route       PUT /users/:id
// @access      Private/Admin

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (user) {
    res.status(201).json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc        Get users under review
// @route       GET /users/underReview
// @access      Private/Admin

const underReviewUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ underReview: true });
  if (users) {
    res.json({ users });
  } else {
    res.status(400);
    throw new Error('No such users found');
  }
});

// @desc        Get all common data of user
// @route       GET /users/commondata
// @access      Private

const commonData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('listings');

  if (user) {
    res.json({ user });
  } else {
    res.status(400);
    throw new Error('No such user found');
  }
});

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  underReviewUsers,
  commonData,
};
