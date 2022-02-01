import express from 'express';
const router = express.Router();

import {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  underReviewUsers,
  commonData,
} from '../controllers/userController.js';
import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(protect, admin, getUsers);

router.get('/commondata', protect, commonData);

router.post('/register', registerUser);
router.post('/login', loginUser);

router.post('/forgotPassword', forgotPassword);

router.patch('/updateMyPassword', protect, updatePassword);

router.patch('/resetPassword/:token', resetPassword);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .patch(protect, updateUserProfile);

router.route('/underReview').get(protect, admin, underReviewUsers);

router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

export default router;
