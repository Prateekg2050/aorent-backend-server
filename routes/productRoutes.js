import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getProducts).post(protect, admin, createProduct); // tested
router.route('/:id/reviews').post(protect, createProductReview); // tested
router.get('/top', getTopProducts); // tested
router
  .route('/:id')
  .get(getProductById) // tested
  .delete(protect, admin, deleteProduct) // tested
  .put(protect, admin, updateProduct); // tested

export default router;
