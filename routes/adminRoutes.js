import express from 'express';
const router = express.Router();
import {
  getUsers,
  underReviewUsers,
  flagUser,
  getUserById,
  updateUser,
  // product routes
  getProducts,
  underReviewProducts,
  getProductById,
  approveProduct,
} from '../controllers/adminController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

router.use(protect);
router.use(admin);

router.route('/allUsers').get(getUsers);
router.route('/user/underReview').get(underReviewUsers);

router.route('/user/:id').delete(flagUser).get(getUserById).patch(updateUser);

// product routes
router.route('/allProducts').get(getProducts);
router.route('/product/underReview').get(underReviewProducts);
router.route('/product/:id').get(getProductById);
router.route('/product/:id/approve').patch(approveProduct);

export default router;
