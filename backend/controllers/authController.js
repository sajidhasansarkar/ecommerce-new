import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

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

// POST /api/auth/google — properly verifies Google ID token signature
export async function googleAuth(req, res) {
  try {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ message: 'Google credential missing' })

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google Client ID কনফিগার করা নেই' })
    }

    // Verify the token with Google's public keys (fixes the critical unverified JWT bug)
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const { sub: googleId, email, name, picture } = ticket.getPayload()

    if (!googleId || !email) return res.status(400).json({ message: 'Invalid Google payload' })

    let user = await User.findOne({ googleId })
    if (!user) {
      user = await User.findOne({ email })
      if (user) {
        user.googleId = googleId
        user.avatar = picture
        await user.save()
      } else {
        user = await User.create({
          name,
          email,
          googleId,
          avatar: picture,
          password: require('crypto').randomBytes(32).toString('hex'),
        })
      }
    }

    res.json(userResponse(user))
  } catch (err) {
    console.error('Google auth error:', err.message)
    res.status(401).json({ message: 'Google লগইন যাচাই করা যায়নি' })
  }
}

// POST /api/auth/send-otp
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
        password: require('crypto').randomBytes(32).toString('hex'),
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
