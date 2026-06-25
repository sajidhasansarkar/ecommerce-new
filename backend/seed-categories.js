// seed-categories.js
// Usage: node seed-categories.js
// এই স্ক্রিপ্টটি একবার চালালে MongoDB-তে প্রাথমিক ক্যাটাগরি তৈরি হয়ে যাবে।
// পরে অ্যাডমিন প্যানেল থেকে নতুন ক্যাটাগরি যোগ/বাদ দেওয়া যাবে।

import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import Category from './models/Category.js'

dotenv.config()
await connectDB()

const initialCategories = [
  { key: 'shoes', name: { bn: 'জুতা',        en: 'Shoes'       }, icon: '👟', sortOrder: 1 },
  { key: 'bags',  name: { bn: 'ভ্যানিটি ব্যাগ', en: 'Vanity Bags' }, icon: '👜', sortOrder: 2 },
]

for (const cat of initialCategories) {
  await Category.updateOne({ key: cat.key }, { $setOnInsert: cat }, { upsert: true })
  console.log(`✓ Category "${cat.key}" ready`)
}

console.log('\nক্যাটাগরি seed সম্পন্ন হয়েছে।')
console.log('এখন থেকে অ্যাডমিন প্যানেল থেকে নতুন ক্যাটাগরি যোগ করা যাবে।')
process.exit(0)
