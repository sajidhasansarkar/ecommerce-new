import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  skuId: { type: String, default: null },
  name: String,
  price: Number,
  image: String,
  color: String,
  size: String,
  qty: Number,
})

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items: [orderItemSchema],
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    paymentMethod: { type: String, enum: ['cod', 'bkash'], default: 'cod' },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },       // প্রোমো কোড থেকে ডিসকাউন্ট
    promoCode: { type: String, default: '' },      // কোন প্রোমো কোড ব্যবহার হয়েছে
    shipping: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['processing', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
