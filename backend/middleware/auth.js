import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// লগইন করা থাকলেই কাজ করবে এমন রাউটের জন্য
export async function protect(req, res, next) {
  // httpOnly cookie থেকে token নাও
  const token = req.cookies?.authToken

  if (!token) {
    return res.status(401).json({ message: 'টোকেন পাওয়া যায়নি, অনুমতি নেই' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    return next()
  } catch (err) {
    return res.status(401).json({ message: 'টোকেন সঠিক নয়, অনুমতি নেই' })
  }
}

// শুধু অ্যাডমিনের জন্য — অ্যাডমিন প্যানেলের রাইট-অপারেশন (POST/PUT/DELETE) প্রোটেক্ট করতে ব্যবহার করুন
export function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next()
  }
  return res.status(403).json({ message: 'অ্যাডমিন অ্যাক্সেস প্রয়োজন' })
}
