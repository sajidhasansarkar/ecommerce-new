/**
 * অ্যাডমিন ইউজার তৈরির স্ক্রিপ্ট
 *
 * চালানোর নিয়ম:
 *   cd backend
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=StrongPass123! node seed-admin.js
 *
 * অথবা backend/.env ফাইলে এই দুটো ভ্যারিয়েবল যোগ করুন:
 *   ADMIN_EMAIL=you@example.com
 *   ADMIN_PASSWORD=YourStrongPasswordHere
 *
 * পাসওয়ার্ড অবশ্যই শক্তিশালী হতে হবে — কমপক্ষে ১২ অক্ষর।
 */

import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import User from './models/User.js'

dotenv.config()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ADMIN_NAME = process.env.ADMIN_NAME || 'লাবণ্য অ্যাডমিন'

async function seedAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ ADMIN_EMAIL এবং ADMIN_PASSWORD environment variable সেট করুন')
    process.exit(1)
  }

  if (ADMIN_PASSWORD.length < 12) {
    console.error('❌ পাসওয়ার্ড কমপক্ষে ১২ অক্ষরের হতে হবে')
    process.exit(1)
  }

  await connectDB()

  const existing = await User.findOne({ email: ADMIN_EMAIL })
  if (existing) {
    console.log('✅ অ্যাডমিন ইউজার আগেই আছে:', ADMIN_EMAIL)
    process.exit(0)
  }

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  })

  console.log('✅ অ্যাডমিন ইউজার তৈরি হয়েছে!')
  console.log('   Email:', ADMIN_EMAIL)
  console.log('   এখন /login থেকে লগইন করুন।')
  process.exit(0)
}

seedAdmin().catch((err) => {
  console.error('❌ ত্রুটি:', err.message)
  process.exit(1)
})
