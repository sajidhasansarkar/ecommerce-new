import mongoose from 'mongoose'

// প্রতিটি size variant — size নাম + ওই size-এ কতটি স্টক আছে
const sizeVariantSchema = new mongoose.Schema({
  size:  { type: String, required: true },  // যেমন: "39", "40", "S", "M", "XL"
  stock: { type: Number, required: true, default: 0 },
}, { _id: false })

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      sparse: true,
    },
    categoryKey: { type: String, required: true },
    name: {
      bn: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      bn: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    price:           { type: Number, required: true },
    oldPrice:        { type: Number, default: null },
    discountPercent: { type: Number, default: null },
    rating:          { type: Number, default: 0 },
    reviews:         { type: Number, default: 0 },

    // ━━━ Stock system ━━━
    // sizeVariants থাকলে size-wise stock, না থাকলে (ব্যাগ/জুয়েলারি) শুধু stock ব্যবহার হবে
    sizeVariants: { type: [sizeVariantSchema], default: [] },
    // total stock — sizeVariants থাকলে sum, না থাকলে manually সেট
    stock: { type: Number, required: true, default: 0 },

    // পুরনো sizes field (backward compat — নতুনে ব্যবহার নেই)
    sizes:  { type: [String], default: [] },
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

// sizeVariants থেকে total stock auto-calculate করার virtual/pre-save
productSchema.pre('save', function(next) {
  if (this.sizeVariants && this.sizeVariants.length > 0) {
    this.stock = this.sizeVariants.reduce((sum, v) => sum + (v.stock || 0), 0)
  }
  next()
})

// ━━━ Indexes ━━━
// shop পেজে category দিয়ে ফিল্টার করার সময় এই index ছাড়া পুরো collection scan হতো
productSchema.index({ categoryKey: 1 })
// createdAt দিয়ে sort করা হয় প্রতিটা লিস্ট রিকোয়েস্টে — compound index দিয়ে দ্রুত হবে
productSchema.index({ categoryKey: 1, createdAt: -1 })
// সার্চের জন্য টেক্সট ইনডেক্স — regex দিয়ে scan করার বদলে এটা ব্যবহার করা ভালো
productSchema.index({ 'name.en': 'text', 'name.bn': 'text', 'description.en': 'text', 'description.bn': 'text' })

export default mongoose.model('Product', productSchema)
