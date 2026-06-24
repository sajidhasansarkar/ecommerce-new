// ডামি প্রোডাক্ট ডেটা সরিয়ে ফেলা হয়েছে।
// সমস্ত প্রোডাক্ট এখন MongoDB ডেটাবেস থেকে আসে।
// API: GET /api/products

// ক্যাটাগরি key গুলো — translations.js এর সাথে মিলিয়ে রাখা হয়েছে
export const categoryKeys = ['all', 'shoes', 'bags']

// নিচের এক্সপোর্টগুলো পুরনো কোডের সাথে ব্যাকওয়ার্ড কম্প্যাটিবিলিটির জন্য রাখা হয়েছে
// কিন্তু আর কোনো ডামি ডেটা নেই — API ব্যবহার করুন
export const products = []
export function getProductById() { return null }
