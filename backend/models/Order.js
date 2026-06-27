import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.Mixed, // ObjectId or string — flexible for any source
    default: null,
  },
  skuId: { type: String, default: null },  // SHOE-001 style product ID
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
