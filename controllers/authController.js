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

export { registerUser, loginUser };
