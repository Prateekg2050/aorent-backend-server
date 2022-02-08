import express from 'express';
const router = express.Router();

import {
  // utils
  approveUser,

  // user
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

// auth middleware
import { protect, admin } from '../middleware/authMiddleware.js';

// middleware
router.use(protect);
router.use(admin);

// user routes
router.route('/allUsers').get(getUsers);
router.route('/user/underReview').get(underReviewUsers);

router
  .route('/user/:id')
  .delete(flagUser)
  .get(getUserById)
  // to approve kyc verification
  .patch(approveUser, updateUser);

// product routes

router.route('/allProducts').get(getProducts);
router.route('/product/underReview').get(underReviewProducts);
router.route('/product/:id').get(getProductById);
router.route('/product/:id/approve').patch(approveProduct);

export default router;
