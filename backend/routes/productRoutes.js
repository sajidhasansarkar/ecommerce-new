import express from 'express'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  migrateBadgeKeys,
  migrateProductIds,
} from '../controllers/productController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getProducts)
// ⚠️ specific routes must come before /:id
router.post('/migrate/badges',      protect, adminOnly, migrateBadgeKeys)
router.post('/migrate/product-ids', protect, adminOnly, migrateProductIds)
router.get('/:id', getProductById)

router.post('/',    protect, adminOnly, createProduct)
router.put('/:id',  protect, adminOnly, updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)

export default router
