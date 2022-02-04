import express from 'express';
const router = express.Router();

import {
  getUserProfile,
  updateUserProfile,
  commonData,
} from '../controllers/userController.js';
import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

/********************************************************************************************/
/********************************************************************************************/

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.get('/commondata', commonData);
router.route('/profile').get(getUserProfile).patch(updateUserProfile);

export default router;
