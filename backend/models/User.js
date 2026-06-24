import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, sparse: true, lowercase: true },
    password: { type: String },
    phone: { type: String, sparse: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    // Google OAuth
    googleId: { type: String, sparse: true },
    avatar: { type: String },
    // Phone OTP
    otp: { type: String },
    otpExpiry: { type: Date },
    // Profile
    address: { type: String },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('User', userSchema)
