import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import admin from '../config/firebaseAdmin.js'
import User from '../models/User.js'

// JWT expires in 7 days (was 30d)
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
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
    token: generateToken(user._id),
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
      res.json(userResponse(user))
    } else {
      res.status(401).json({ message: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
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

// POST /api/auth/google — verifies a Firebase ID token (sent from frontend after signInWithPopup)
export async function googleAuth(req, res) {
  try {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ message: 'Firebase ID token missing' })

    // Verify the Firebase ID token with Firebase Admin SDK
    let decoded
    try {
      decoded = await admin.auth().verifyIdToken(credential)
    } catch {
      return res.status(401).json({ message: 'Google লগইন যাচাই করা যায়নি' })
    }

    const { uid: googleId, email, name, picture } = decoded

    if (!googleId || !email) return res.status(400).json({ message: 'Invalid Google payload' })

    // Find or create user
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

    res.json(userResponse(user))
  } catch (err) {
    console.error('Google auth error:', err.message)
    res.status(500).json({ message: 'সার্ভার সমস্যা হয়েছে' })
  }
}

// POST /api/auth/facebook — verifies a Firebase ID token from Facebook sign-in
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

    // Find or create user
    let user = await User.findOne({ facebookId })
    if (!user && email) {
      // Check if email already exists (Google or email/password account)
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
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

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

    // TODO: Send OTP via SMS (Twilio, SSLCommerz, etc.)
    // Example: await smsClient.send(phone, `আপনার OTP: ${otp}`)
    console.log(`[DEV ONLY] OTP for ${phone}: ${otp}`)

    // ✅ Fixed: OTP is NOT returned in the response anymore
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

    res.json(userResponse(user))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
