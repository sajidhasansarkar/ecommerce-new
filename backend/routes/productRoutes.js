import express from 'express'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  migrateBadgeKeys,
} from '../controllers/productController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getProducts)
// ⚠️ specific routes before /:id
router.post('/migrate/badges', protect, adminOnly, migrateBadgeKeys)
router.get('/:id', getProductById)

router.post('/', protect, adminOnly, createProduct)
router.put('/:id', protect, adminOnly, updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)

export default router
