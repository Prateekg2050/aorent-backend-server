import express from 'express';
const router = express.Router();

import {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  underReviewUsers,
  commonData,
} from '../controllers/userControllers.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(protect, admin, getUsers); // tested
router.get('/commondata', protect, commonData); // tested
router.post('/register', registerUser); // tested
router.post('/login', loginUser); // tested
router
  .route('/profile')
  .get(protect, getUserProfile) // tested
  .patch(protect, updateUserProfile); // tested
router.route('/underReview').get(protect, admin, underReviewUsers); // tested
router
  .route('/:id')
  .delete(protect, admin, deleteUser) // tested
  .get(protect, admin, getUserById) // tested
  .put(protect, admin, updateUser); // tested

export default router;
