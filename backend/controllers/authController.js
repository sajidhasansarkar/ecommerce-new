import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import admin from '../config/firebaseAdmin.js'
import User from '../models/User.js'

const COOKIE_OPTIONS = {
  httpOnly: true,        // JS দিয়ে অ্যাক্সেস করা যাবে না (XSS protection)
  secure: process.env.NODE_ENV === 'production', // production-এ শুধু HTTPS
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // cross-origin cookie fix
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 দিন (milliseconds)
  path: '/',
}

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function setTokenCookie(res, userId) {
  const token = generateToken(userId)
  res.cookie('authToken', token, COOKIE_OPTIONS)
}

function userResponse(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    address: user.address,
    // token আর response body-তে পাঠানো হচ্ছে না — cookie-তে আছে
  }
}

// POST /api/auth/register
export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'নাম, ইমেইল ও পাসওয়ার্ড দিন' })
    }
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে' })
    const user = await User.create({ name, email, password })
    setTokenCookie(res, user._id)
    res.status(201).json(userResponse(user))
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// POST /api/auth/login
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (user && (await user.matchPassword(password))) {
      setTokenCookie(res, user._id)
      res.json(userResponse(user))
    } else {
      res.status(401).json({ message: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/logout
export function logoutUser(req, res) {
  res.clearCookie('authToken', { ...COOKIE_OPTIONS, maxAge: 0 })
  res.json({ message: 'লগআউট সফল হয়েছে' })
}

// GET /api/auth/me
export async function getMe(req, res) {
  res.json(req.user)
}

// PUT /api/auth/profile
export async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'ব্যবহারকারী পাওয়া যায়নি' })

    const { name, email, phone, address, password } = req.body
    if (name) user.name = name
    if (email) user.email = email
    if (phone) user.phone = phone
    if (address) user.address = address
    if (password) user.password = password

    await user.save()
    res.json(userResponse(user))
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// POST /api/auth/google
export async function googleAuth(req, res) {
  try {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ message: 'Firebase ID token missing' })

    let decoded
    try {
      decoded = await admin.auth().verifyIdToken(credential)
    } catch {
      return res.status(401).json({ message: 'Google লগইন যাচাই করা যায়নি' })
    }

    const { uid: googleId, email, name, picture } = decoded
    if (!googleId || !email) return res.status(400).json({ message: 'Invalid Google payload' })

    let user = await User.findOne({ googleId })
    if (!user) {
      user = await User.findOne({ email })
      if (user) {
        user.googleId = googleId
        if (picture) user.avatar = picture
        await user.save()
      } else {
        user = await User.create({
          name: name || email.split('@')[0],
          email,
          googleId,
          avatar: picture || '',
          password: crypto.randomBytes(32).toString('hex'),
        })
      }
    }

    setTokenCookie(res, user._id)
    res.json(userResponse(user))
  } catch (err) {
    console.error('Google auth error:', err.message)
    res.status(500).json({ message: 'সার্ভার সমস্যা হয়েছে' })
  }
}

// POST /api/auth/facebook
export async function facebookAuth(req, res) {
  try {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ message: 'Firebase ID token missing' })

    let decoded
    try {
      decoded = await admin.auth().verifyIdToken(credential)
    } catch {
      return res.status(401).json({ message: 'Facebook লগইন যাচাই করা যায়নি' })
    }

    const { uid: facebookId, email, name, picture } = decoded
    if (!facebookId) return res.status(400).json({ message: 'Invalid Facebook payload' })

    let user = await User.findOne({ facebookId })
    if (!user && email) {
      user = await User.findOne({ email })
      if (user) {
        user.facebookId = facebookId
        if (picture && !user.avatar) user.avatar = picture
        await user.save()
      }
    }
    if (!user) {
      user = await User.create({
        name: name || (email ? email.split('@')[0] : 'Facebook User'),
        email: email || undefined,
        facebookId,
        avatar: picture || '',
        password: crypto.randomBytes(32).toString('hex'),
      })
    }

    setTokenCookie(res, user._id)
    res.json(userResponse(user))
  } catch (err) {
    console.error('Facebook auth error:', err.message)
    res.status(500).json({ message: 'সার্ভার সমস্যা হয়েছে' })
  }
}

export async function sendOtp(req, res) {
  try {
    const { phone } = req.body
    if (!phone) return res.status(400).json({ message: 'ফোন নম্বর দিন' })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    let user = await User.findOne({ phone })
    if (!user) {
      user = await User.create({
        name: 'User',
        phone,
        otp,
        otpExpiry,
        password: crypto.randomBytes(32).toString('hex'),
      })
    } else {
      user.otp = otp
      user.otpExpiry = otpExpiry
      await user.save()
    }

    console.log(`[DEV ONLY] OTP for ${phone}: ${otp}`)
    res.json({ message: 'OTP পাঠানো হয়েছে' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/verify-otp
export async function verifyOtp(req, res) {
  try {
    const { phone, otp } = req.body
    const user = await User.findOne({ phone })

    if (!user || !user.otp) return res.status(400).json({ message: 'OTP পাওয়া যায়নি' })
    if (user.otp !== otp) return res.status(400).json({ message: 'OTP সঠিক নয়' })
    if (new Date() > user.otpExpiry) return res.status(400).json({ message: 'OTP মেয়াদ শেষ' })

    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    setTokenCookie(res, user._id)
    res.json(userResponse(user))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/auth/users — admin: all registered users
export async function getUsers(req, res) {
  try {
    const users = await User.find({})
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
