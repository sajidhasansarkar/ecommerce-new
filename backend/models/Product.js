import mongoose from 'mongoose'

// এই শেপটা frontend এর src/data/products.js এর সাথে মিলিয়ে রাখা হয়েছে,
// যাতে ফ্রন্টএন্ডে কোনো বাড়তি ম্যাপিং কোড ছাড়াই API রেসপন্স সরাসরি কাজ করে।

const productSchema = new mongoose.Schema(
  {
    categoryKey: {
      type: String,
      required: true,
      // Enum is intentionally removed — valid values come from the Category collection.
      // This lets admins add new categories without touching the schema.
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
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    sizes: { type: [String], default: null }, // জুতার জন্য, ব্যাগের জন্য null/[]
    colors: { type: [String], default: [] },
    images: { type: [String], default: [] },
    badge: {
      bn: { type: String, default: null },
      en: { type: String, default: null },
    },
  },
  { timestamps: true }
)

export default mongoose.model('Product', productSchema)
