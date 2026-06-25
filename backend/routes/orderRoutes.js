import express from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  deleteCancelledOrders,
  getCustomers,
} from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.post('/', createOrder)

// ⚠️ specific routes আগে, /:id পরে
router.get('/customers', protect, adminOnly, getCustomers)
router.delete('/bulk/cancelled', protect, adminOnly, deleteCancelledOrders)

router.get('/', protect, adminOnly, getOrders)
router.get('/:id', protect, adminOnly, getOrderById)
router.put('/:id/status', protect, adminOnly, updateOrderStatus)
router.put('/:id', protect, adminOnly, updateOrder)
router.delete('/:id', protect, adminOnly, deleteOrder)

export default router
