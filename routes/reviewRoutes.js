import express from 'express';
const router = express.Router({ mergeParams: true });

import {
  createProductReview,
  getAllReviews,
  editReview,
  deleteReview,
  getReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').post(protect, createProductReview).get(getAllReviews);

router
  .route('/:reviewId')
  .get(getReview)
  .patch(protect, editReview)
  .delete(protect, deleteReview);

export default router;
