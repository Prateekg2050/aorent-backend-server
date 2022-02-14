import express from 'express';
const router = express.Router({ mergeParams: true });

import { createProductReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

router.use(protect);

router.post('/', createProductReview);

export default router;
