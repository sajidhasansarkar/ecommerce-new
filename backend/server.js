import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'

import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()
connectDB()

const app = express()

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet())

// ── CORS — only allow your frontend domain ────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  // Add 'http://localhost:5173' here only for local development
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl) in development
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}))

// ── Body parsing — reduced limit; use cloud storage for images ────────────────
app.use(express.json({ limit: '1mb' }))

// ── Global rate limiter — 100 requests per 15 min per IP ─────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'অনেক বেশি রিকোয়েস্ট হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন' },
})
app.use(globalLimiter)

// ── Strict rate limiter for auth endpoints — 10 per 15 min per IP ─────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'অনেকবার চেষ্টা করা হয়েছে, ১৫ মিনিট পর আবার চেষ্টা করুন' },
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
  res.send('লাবণ্য API চলছে ✓')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`সার্ভার চলছে পোর্ট ${PORT}-এ`))
