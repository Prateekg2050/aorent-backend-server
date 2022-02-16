import express from 'express';
const router = express.Router();

import reviewRouter from './reviewRoutes.js';
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  getTopProducts,
  wishlistProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

/********************************************************************************************/
/********************************************************************************************/

router.use('/:productId/review', reviewRouter);

router.post('/', protect, createProduct);

router.get('/top', getTopProducts);

router.get('/center/:latlng/radius/:distance', getProducts);

router.post('/:id/wishlist/:addremove', protect, wishlistProduct);

router
  .route('/:id')
  .get(getProductById)
  .delete(protect, deleteProduct)
  .put(protect, updateProduct);

export default router;
