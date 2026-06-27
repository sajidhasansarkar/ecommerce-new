import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      sparse: true, // পুরনো প্রোডাক্টে null থাকলেও unique conflict হবে না
      // format: SHOE-001, BAG-002 — createProduct controller-এ auto-generate হয়
    },
    categoryKey: {
      type: String,
      required: true,
    },
    name: {
      bn: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      bn: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    price: { type: Number, required: true },
    oldPrice: { type: Number, default: null },
    // per-product discount — oldPrice থেকে auto-calculate করা যায়,
    // কিন্তু admin চাইলে manually override করতে পারবে
    discountPercent: { type: Number, default: null },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    sizes: { type: [String], default: null },
    colors: { type: [String], default: [] },
    images: { type: [String], default: [] },
    badge: {
      bn: { type: String, default: null },
      en: { type: String, default: null },
    },
    badgeKey: { type: String, default: null },
  },
  { timestamps: true }
)

export default mongoose.model('Product', productSchema)
