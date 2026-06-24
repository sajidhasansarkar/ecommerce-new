// NOTE: এই মডেলটা ঐচ্ছিক। বেশিরভাগ ক্ষেত্রে আলাদা Customer কালেকশনের দরকার নেই —
// User মডেল থেকে নাম-ইমেইল, আর Order মডেল থেকে orders count ও total spent
// অ্যাগ্রিগেট করে বানানো যায় (নিচে orderController.js এর getCustomers ফাংশনে দেখুন)।
// যদি ভবিষ্যতে কাস্টমারের জন্য বাড়তি ফিল্ড (যেমন নোট, ট্যাগ) রাখতে চান, তখন এই মডেল কাজে লাগবে।

import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Customer', customerSchema)
