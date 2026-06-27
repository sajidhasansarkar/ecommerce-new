import express from 'express'
import { uploadImage } from '../controllers/uploadController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// অ্যাডমিন লগইন করা থাকলেই ছবি আপলোড করতে পারবে
router.post('/', protect, adminOnly, uploadImage)

export default router
