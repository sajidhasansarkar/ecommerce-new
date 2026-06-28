import express from 'express'
import {
  listPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  applyPromoCode,
} from '../controllers/promoController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// Customer route — কোড apply করা (লগইন লাগবে না)
router.post('/apply', applyPromoCode)

// Admin routes
router.get('/',         protect, adminOnly, listPromoCodes)
router.post('/',        protect, adminOnly, createPromoCode)
router.put('/:id',      protect, adminOnly, updatePromoCode)
router.delete('/:id',   protect, adminOnly, deletePromoCode)

export default router
