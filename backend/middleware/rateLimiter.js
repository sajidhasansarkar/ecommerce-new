import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'অনেকবার চেষ্টা করা হয়েছে, ১৫ মিনিট পর আবার চেষ্টা করুন' },
})

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'অনেক বেশি রিকোয়েস্ট হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন' },
  // Admin token থাকলে rate limit skip করবে
  skip: (req) => {
    try {
      const auth = req.headers.authorization || ''
      if (!auth.startsWith('Bearer ')) return false
      const token = auth.split(' ')[1]
      // JWT decode করে role চেক — verify না করে শুধু payload দেখি (verify server.js-এ হবে)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      return payload?.role === 'admin'
    } catch {
      return false
    }
  },
})
