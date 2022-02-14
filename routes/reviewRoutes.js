import express from 'express';
const router = express.Router();

import { createProductReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, createProductReview);

export default router;
