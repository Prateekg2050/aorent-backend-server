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
} from '../controllers/userControllers.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(protect, admin, getUsers); // tested
router.post('/register', registerUser); // tested
router.post('/login', loginUser); // tested
router
  .route('/profile')
  .get(protect, getUserProfile) // tested
  .put(protect, updateUserProfile); // tested
router
  .route('/:id')
  .delete(protect, admin, deleteUser) // tested
  .get(protect, admin, getUserById) // tested
  .put(protect, admin, updateUser); // tested

export default router;
