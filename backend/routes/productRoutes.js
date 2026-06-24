import express from 'express'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProductById)

// ▼▼▼ এই তিনটা রাউট প্রোটেক্ট করা আছে — অ্যাডমিন লগইন ছাড়া কাজ করবে না।
//     ডেভেলপমেন্টের সময় টেস্ট করা সহজ করতে চাইলে protect, adminOnly সরিয়ে দিতে পারেন,
//     কিন্তু প্রোডাকশনে যাওয়ার আগে এগুলো অবশ্যই রাখতে হবে।
router.post('/', protect, adminOnly, createProduct)
router.put('/:id', protect, adminOnly, updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)

export default router
