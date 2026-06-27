# আমার শপ ব্যাকএন্ড — সেটআপ গাইড

## ১. কোথায় রাখবেন

এই `backend` ফোল্ডারটা আপনার `ecommerce-app` ফোল্ডারের **পাশে** রাখুন, ভেতরে না:

```
your-project/
├── ecommerce-app/    (ফ্রন্টএন্ড)
└── backend/          (এই ফোল্ডার)
```

## ২. ইনস্টল ও চালানো

```bash
cd backend
npm install
```

`.env` ফাইল খুলে এই জায়গাগুলো বদলান:
- `MONGODB_URI` → আপনার MongoDB Atlas বা লোকাল MongoDB-র কানেকশন স্ট্রিং
- `JWT_SECRET` → কোনো একটা র‍্যান্ডম লম্বা স্ট্রিং (যেমন পাসওয়ার্ড জেনারেটর দিয়ে বানানো)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` → ছবি আপলোডের জন্য।
  ফ্রি অ্যাকাউন্ট খুলুন এখানে: https://cloudinary.com/users/register/free
  লগইন করার পর Dashboard পেজেই এই তিনটা মান দেখতে পাবেন — কপি করে `.env`-এ বসিয়ে দিন।

তারপর চালান:

```bash
npm run dev
```

সার্ভার চলবে `http://localhost:5000`-এ। ব্রাউজারে গিয়ে দেখুন "আমার শপ API চলছে ✓" লেখা আসছে কিনা।

## ৩. প্রথম অ্যাডমিন ইউজার বানানো

সাইন-আপ ফর্ম দিয়ে সবাই `customer` রোলে রেজিস্টার হয়। প্রথম অ্যাডমিন বানাতে রেজিস্টার করার পর
MongoDB Atlas-এর Collections ভিউ থেকে (বা mongosh দিয়ে) সেই ইউজারের `role` ফিল্ড হাতে
`"admin"` করে দিন।

## ৪. API এন্ডপয়েন্ট লিস্ট

| মেথড | পাথ | কাজ | প্রোটেক্টেড? |
|---|---|---|---|
| GET | `/api/products` | সব প্রোডাক্ট (?category, ?q দিয়ে ফিল্টার) | না |
| GET | `/api/products/:id` | একটা প্রোডাক্ট | না |
| POST | `/api/products` | নতুন প্রোডাক্ট যুক্ত | অ্যাডমিন |
| PUT | `/api/products/:id` | প্রোডাক্ট এডিট | অ্যাডমিন |
| DELETE | `/api/products/:id` | প্রোডাক্ট ডিলিট | অ্যাডমিন |
| POST | `/api/upload` | ছবি Cloudinary-তে আপলোড করে অপ্টিমাইজড লিংক রিটার্ন করে | অ্যাডমিন |
| POST | `/api/orders` | নতুন অর্ডার (চেকআউট) | না (গেস্ট+লগইন উভয়) |
| GET | `/api/orders` | সব অর্ডার (?status দিয়ে ফিল্টার) | অ্যাডমিন |
| GET | `/api/orders/customers` | কাস্টমার লিস্ট (অর্ডার থেকে অ্যাগ্রিগেট) | অ্যাডমিন |
| PUT | `/api/orders/:id/status` | অর্ডার স্ট্যাটাস বদলানো | অ্যাডমিন |
| POST | `/api/auth/register` | নতুন ইউজার রেজিস্টার | না |
| POST | `/api/auth/login` | লগইন | না |
| GET | `/api/auth/me` | লগইন করা ইউজারের তথ্য | লগইন প্রয়োজন |

## ৫. ফ্রন্টএন্ডে যা বদলাতে হবে (আপনার `ecommerce-app/src` ফোল্ডারে)

নিচের প্রতিটায় ঠিক কোথায় কোড বদলাতে হবে তার মার্ক দেওয়া আছে।

### `src/data/products.js` এর জায়গায়

এই ফাইলটা রাখুন (চাইলে মুছবেন না, fallback হিসেবে থাকুক), কিন্তু যেখানে এটা থেকে `products` ইম্পোর্ট
করে ব্যবহার করা হয়েছে (Home.jsx, Shop.jsx, ProductDetail.jsx, AdminProducts.jsx), সেখানে
নতুন একটা ফাইল বানিয়ে ব্যবহার করুন:

**নতুন ফাইল বানান: `src/api/products.js`**
```js
const API_URL = 'http://localhost:5000/api/products'

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString()
  const res = await fetch(`${API_URL}?${query}`)
  return res.json()
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_URL}/${id}`)
  return res.json()
}

export async function createProduct(data, token) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateProduct(id, data, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}
```

তারপর যেসব পেজে আগে এভাবে ছিল:
```js
// ▼▼▼ পুরোনো লাইন — এটা মুছুন ▼▼▼
import { products } from '../data/products.js'
```
সেখানে এভাবে বদলান:
```js
// ▼▼▼ নতুন কোড — এভাবে বদলান ▼▼▼
import { useState, useEffect } from 'react'
import { fetchProducts } from '../api/products.js'

// কম্পোনেন্টের ভেতরে:
const [products, setProducts] = useState([])
useEffect(() => {
  fetchProducts().then(setProducts)
}, [])
```

### `src/pages/Checkout.jsx` এ মার্ক করা জায়গা

`handleSubmit` ফাংশনের ভেতরে এই কমেন্টটা খুঁজুন:
```js
// এখানে এখন কোনো ব্যাকএন্ড নেই, তাই অর্ডার লোকালি "প্লেস" করা হচ্ছে।
// ব্যাকএন্ড যুক্ত হলে এখানে POST /api/orders কল করতে হবে।
const id = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
setOrderId(id)
setPlaced(true)
clearCart()
```
এটা বদলে এভাবে করুন:
```js
const res = await fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items,
    fullName: form.fullName,
    phone: form.phone,
    address: form.address,
    city: form.city,
    paymentMethod: form.paymentMethod,
    subtotal,
    shipping,
    total,
  }),
})
const data = await res.json()
setOrderId(data.orderNumber)
setPlaced(true)
clearCart()
```
(এবং `handleSubmit`-এর আগে `async` যুক্ত করুন: `async function handleSubmit(e) {`)

### `src/pages/Login.jsx` এ মার্ক করা জায়গা

```js
// TODO: ব্যাকএন্ড যুক্ত হলে এখানে আসল API কল হবে:
// POST /api/auth/login  বা  POST /api/auth/register
```
এই কমেন্টের জায়গায়:
```js
const endpoint = mode === 'login' ? 'login' : 'register'
const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(form),
})
const data = await res.json()
if (data.token) {
  localStorage.setItem('my_shop_token', data.token)
  navigate('/')
} else {
  setError(data.message)
}
```

### `src/admin/AdminProducts.jsx`, `AdminOrders.jsx`, `AdminCustomers.jsx`

এই তিনটার `useState(initialProducts)` / `dummyOrders` / `dummyCustomers` — এগুলো একইভাবে
`useEffect` + `fetch` দিয়ে বদলাতে হবে, যেমনটা উপরে Products এর উদাহরণে দেখানো হয়েছে।
অ্যাডমিন রাউটে টোকেন পাঠাতে হবে (`Authorization: Bearer <token>` হেডারে), যেটা লগইনের পর
`localStorage`-এ সেভ করা থাকবে।

## ৬. CORS নিয়ে সতর্কতা

প্রোডাকশনে যাওয়ার আগে `server.js`-এ এই লাইন:
```js
app.use(cors())
```
বদলে নির্দিষ্ট ডোমেইন দিন:
```js
app.use(cors({ origin: 'https://your-frontend-domain.com' }))
```
