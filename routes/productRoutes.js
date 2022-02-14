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

router.post('/', protect, createProduct);

router.get('/top', getTopProducts);

router.get('/center/:latlng/radius/:distance', getProducts);
router
  .route('/:id')
  .get(getProductById)
  .delete(protect, deleteProduct)
  .put(protect, updateProduct);

export default router;
