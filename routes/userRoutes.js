import express from 'express';
const router = express.Router();

import { getMe, updateUserProfile } from '../controllers/userController.js';
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

//Do not use to update password
router.route('/me').get(getMe).patch(updateUserProfile);

export default router;
