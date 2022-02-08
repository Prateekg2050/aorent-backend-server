import express from 'express';
const router = express.Router();

import {
  // user
  getUsers,
  underReviewUsers,
  flagUser,
  getUserById,
  approveUser,

  // product routes
  getProducts,
  underReviewProducts,
  getProductById,
  approveProduct,
} from '../controllers/adminController.js';

// auth middleware
import { protect, admin } from '../middleware/authMiddleware.js';

// middleware
router.use(protect);
router.use(admin);

// user routes
router.get('/user/all', getUsers);
router.route('/user/underReview').get(underReviewUsers);

router.route('/user/:id').delete(flagUser).get(getUserById).patch(approveUser);

// product routes

router.route('/product/all').get(getProducts);
router.route('/product/underReview').get(underReviewProducts);
router.route('/product/:id').get(getProductById);
router.route('/product/:id/approve').patch(approveProduct);

export default router;
