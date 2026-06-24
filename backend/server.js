import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { globalLimiter } from './middleware/rateLimiter.js'

import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()
connectDB()

const app = express()

app.use(helmet())

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://ecommerce-new-wheat.vercel.app',
  'http://localhost:5173/login',
  'https://ecommerce-f42iomwmk-sajidhasan-webs-projects.vercel.app',
  'https://ecommerce-new-git-main-sajidhasan-webs-projects.vercel.app/',
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow no origin (mobile apps, Postman)
    if (!origin) return callback(null, true)
    
    // Allow exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true)
    
    // Allow ALL Vercel preview deployments for your project
    if (origin.match(/https:\/\/ecommerce-new.*\.vercel\.app$/)) {
      return callback(null, true)
    }
    
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}))

app.use(express.json({ limit: '1mb' }))
app.use(globalLimiter)

app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
  res.send('লাবণ্য API চলছে ✓')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`সার্ভার চলছে পোর্ট ${PORT}-এ`))
