import express from 'express';
const router = express.Router();
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToPickedUp,
  updateOrderToReturned,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

/********************************************************************************************/
/********************************************************************************************/

router.use(protect);

router.route('/').post(createOrder);

router.route('/myorders').get(getMyOrders);

router.route('/:id').get(getOrderById);

router.route('/:id/pay').patch(updateOrderToPaid);

router.route('/:id/pickedup').patch(updateOrderToPickedUp);

router.route('/:id/return').patch(updateOrderToReturned);

export default router;
