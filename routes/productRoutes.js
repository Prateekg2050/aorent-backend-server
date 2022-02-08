import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  getTopProducts,
} from '../controllers/productController.js';
import { createProductReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

/********************************************************************************************/
/********************************************************************************************/

router.route('/').get(getProducts).post(protect, createProduct);

router.get('/top', getTopProducts);

router
  .route('/:id')
  .get(getProductById)
  .delete(protect, deleteProduct)
  .put(protect, updateProduct);

export default router;

// router.route('/:id/reviews').post(protect, createProductReview);
