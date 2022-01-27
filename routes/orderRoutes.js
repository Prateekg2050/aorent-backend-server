import express from 'express';
const router = express.Router();
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
} from '../controllers/orderController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders); // tested
router.route('/myorders').get(protect, getMyOrders); // tested
router.route('/:id').get(protect, getOrderById); // tested
router.route('/:id/pay').put(protect, updateOrderToPaid); // tested
router.route('/:id/deliver').put(protect, updateOrderToDelivered); // tested

export default router;
