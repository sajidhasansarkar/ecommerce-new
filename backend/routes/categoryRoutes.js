import express from 'express'
import { protect as authenticate, adminOnly as requireAdmin } from '../middleware/auth.js'
import {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js'

const router = express.Router()

// Public — frontend এ দেখানোর জন্য
router.get('/', getCategories)

// Admin only
router.get('/all', authenticate, requireAdmin, getAllCategories)
router.post('/', authenticate, requireAdmin, createCategory)
router.put('/:id', authenticate, requireAdmin, updateCategory)
router.delete('/:id', authenticate, requireAdmin, deleteCategory)

export default router
