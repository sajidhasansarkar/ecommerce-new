import mongoose from 'mongoose'

// ক্যাটাগরি মডেল — সব ক্যাটাগরির তথ্য এখানে থাকবে।
// নতুন ক্যাটাগরি যোগ করতে শুধু এই collection-এ একটি document যোগ করুন।
// বাকি সব (Navbar, Shop filter, Admin panel) এখান থেকেই পড়বে।

// সাব-ক্যাটাগরি স্কিমা — প্রতিটি ক্যাটাগরির ভেতরে subcategories অ্যারেতে থাকবে
const subcategorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      // e.g. "sneakers", "heels", "clutch", "tote"
    },
    name: {
      bn: { type: String, required: true }, // বাংলা নাম
      en: { type: String, required: true }, // English name
    },
    icon: {
      type: String,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
)

const categorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // e.g. "shoes", "bags", "jewelry", "watches"
    },
    name: {
      bn: { type: String, required: true }, // বাংলা নাম
      en: { type: String, required: true }, // English name
    },
    icon: {
      type: String,
      default: null, // optional emoji, e.g. "👟"
    },
    sortOrder: {
      type: Number,
      default: 0, // Nav-এ কোন ক্রমে দেখাবে তা নিয়ন্ত্রণ করে
    },
    isActive: {
      type: Boolean,
      default: true, // false হলে Nav ও Shop-এ দেখাবে না
    },
    // সাব-ক্যাটাগরি — hover করলে nested dropdown দেখাবে
    // এখন খালি রাখলেও চলবে; পরে AdminCategories থেকে যোগ করা যাবে
    subcategories: {
      type: [subcategorySchema],
      default: [],
    },
  },
  { timestamps: true }
)

export default mongoose.model('Category', categorySchema)
