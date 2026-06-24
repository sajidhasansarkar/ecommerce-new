import express from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getCustomers,
} from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// চেকআউট পেজ থেকে গেস্ট ও লগইন করা ইউজার দুজনেই অর্ডার করতে পারবে, তাই protect নেই
router.post('/', createOrder)

// ⚠️ /customers রাউট অবশ্যই /:id এর আগে থাকতে হবে, নাহলে "customers" কে id হিসেবে ধরে নেবে
router.get('/customers', protect, adminOnly, getCustomers)

// নিচের সবগুলো অ্যাডমিন প্যানেলের জন্য — প্রোটেক্টেড
router.get('/', protect, adminOnly, getOrders)
router.get('/:id', protect, adminOnly, getOrderById)
router.put('/:id/status', protect, adminOnly, updateOrderStatus)

export default router
