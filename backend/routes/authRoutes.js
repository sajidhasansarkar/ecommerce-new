import express from 'express'
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  googleAuth,
  facebookAuth,
  sendOtp,
  verifyOtp,
  getUsers,
} from '../controllers/authController.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Rate-limited auth endpoints (brute-force protection)
router.post('/register', authLimiter, registerUser)
router.post('/login', authLimiter, loginUser)
router.post('/google', authLimiter, googleAuth)
router.post('/facebook', authLimiter, facebookAuth)
router.post('/send-otp', authLimiter, sendOtp)
router.post('/verify-otp', authLimiter, verifyOtp)

// Protected profile routes
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.get('/users', protect, adminOnly, getUsers)

export default router
