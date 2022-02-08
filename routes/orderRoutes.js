import express from 'express';
const router = express.Router();
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
} from '../controllers/orderController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

/********************************************************************************************/
/********************************************************************************************/

router.use(protect);

router.route('/').post(createOrder);

router.route('/myorders').get(getMyOrders);

router.route('/:id').get(getOrderById);

export default router;
