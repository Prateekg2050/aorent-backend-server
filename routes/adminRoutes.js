import express from 'express';
const router = express.Router();
import {
  getUsers,
  underReviewUsers,
  flagUser,
  getUserById,
  updateUser,
} from '../controllers/adminController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

router.use(protect);
router.use(admin);

router.route('/allUsers').get(getUsers);
router.route('/underReview').get(underReviewUsers);

router.route('/user/:id').delete(flagUser).get(getUserById).patch(updateUser);

export default router;
