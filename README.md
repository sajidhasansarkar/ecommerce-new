# আমার শপ (My Shop) — ই-কমার্স ফ্রন্টএন্ড

React (Vite) + Tailwind CSS দিয়ে বানানো জুতা ও মেয়েদের ভ্যানিটি ব্যাগের ই-কমার্স ফ্রন্টএন্ড।
সাইটটি বাংলা ও ইংরেজি — দুই ভাষাতেই চলে (ডিফল্ট: বাংলা)।

## চালানোর নিয়ম

```bash
npm install
npm run dev
```

ব্রাউজারে `http://localhost:5173` খুলুন।

বিল্ড করতে:

```bash
npm run build
npm run preview
```

## প্রজেক্ট স্ট্রাকচার

```
src/
  components/     শেয়ার্ড UI কম্পোনেন্ট (Navbar, Footer, ProductCard, Toast)
  context/        CartContext (কার্ট স্টেট) ও LanguageContext (ভাষা স্টেট)
  data/           ডামি প্রোডাক্ট ডেটা + translations.js (সব UI টেক্সট, bn/en)
  pages/          পাবলিক পেজ (Home, Shop, ProductDetail, Cart, Checkout, Login)
  admin/          অ্যাডমিন প্যানেল (Dashboard, Products, Orders, Customers)
```

## এখন কী কাজ করে

- **দুই ভাষা**: Navbar-এ ভাষা টগল বাটন (বাং/EN), পছন্দ `localStorage`-এ সংরক্ষিত থাকে
- **প্রোডাক্ট ক্যাটাগরি**: জুতা (sizes সহ) ও ভ্যানিটি ব্যাগ (sizes ছাড়া) — প্রতিটি প্রোডাক্টের নাম ও বিবরণ দুই ভাষাতেই আছে
- হোমপেজ, প্রোডাক্ট লিস্টিং, ফিল্টার/সার্চ/সর্ট
- প্রোডাক্ট ডিটেইলস (সাইজ ও রঙ নির্বাচন, কোয়ান্টিটি)
- কার্ট (sessionStorage এ পার্সিস্ট থাকে — ট্যাব বন্ধ করলে মুছে যাবে)
- চেকআউট ফর্ম (validation সহ, এখন অর্ডার শুধু লোকালি "প্লেস" হয়)
- লগইন/রেজিস্টার UI (এখনো কোনো প্রকৃত অথেনটিকেশন নেই)
- অ্যাডমিন প্যানেল: প্রোডাক্ট CRUD (bn/en দুই ভাষায় নাম-বিবরণ যুক্ত করার ফর্ম সহ), অর্ডার ও কাস্টমার লিস্ট (ডামি ডেটা)

## নতুন ক্যাটাগরি যুক্ত করতে চাইলে (যেমন: জুয়েলারি, কসমেটিক্স)

1. `src/data/translations.js`-এ `categories` অবজেক্টে নতুন key/label (bn + en) যুক্ত করুন।
2. `src/data/products.js`-এ `categoryKeys` অ্যারেতে নতুন key যুক্ত করুন এবং প্রোডাক্ট অবজেক্টে `categoryKey` সেট করুন।
3. `src/admin/AdminProducts.jsx`-এ `editableCategoryKeys` থেকেই dropdown অপশন আসে — এখানে কিছু বদলানোর প্রয়োজন নেই।
4. `src/components/Navbar.jsx`-এ `navLinks` অ্যারেতে চাইলে নতুন শর্টকাট লিংক যুক্ত করতে পারেন।

## নতুন ভাষা টেক্সট যুক্ত করতে চাইলে

`src/data/translations.js`-এর `bn` ও `en` — দুই অবজেক্টেই একই key যুক্ত করুন, তারপর কম্পোনেন্টে
`useLanguage()` থেকে `t('your.key')` দিয়ে ব্যবহার করুন। সংখ্যা/ভ্যারিয়েবল-নির্ভর টেক্সটের জন্য
key-এর মান একটা ফাংশন রাখা যায় (যেমন `lowStock: (n) => ...`), `t('product.lowStock', 5)` দিয়ে কল করুন।

## ব্যাকএন্ড (Node.js + Express + MongoDB) যুক্ত করার সময় যা বদলাতে হবে

1. **`src/data/products.js`** → এর বদলে `src/api/products.js` বানিয়ে `fetch('/api/products')` ব্যবহার করুন।
   প্রতিটি পেজ যেখানে `products` ইম্পোর্ট করা হয়েছে, সেখানে `useEffect` + `useState` দিয়ে ডেটা ফেচ করতে হবে।

2. **`src/context/CartContext.jsx`** → কার্ট ডেটা MongoDB-তে ইউজার-স্পেসিফিক রাখতে চাইলে,
   `addItem`/`removeItem`/`updateQty` ফাংশনগুলোর ভেতরে API কল যুক্ত করুন।

3. **`src/pages/Checkout.jsx`** → `handleSubmit`-এর ভেতরে যেখানে কমেন্ট আছে,
   সেখানে `POST /api/orders` কল করে রিয়েল অর্ডার আইডি ফিরিয়ে আনতে হবে।

4. **`src/pages/Login.jsx`** → `handleSubmit`-এ `POST /api/auth/login` ও
   `POST /api/auth/register` কল যুক্ত করতে হবে, এবং JWT/সেশন টোকেন সংরক্ষণের জন্য
   একটি `AuthContext` বানাতে হবে (CartContext এর প্যাটার্ন অনুসরণ করা যেতে পারে)।

5. **`src/admin/AdminProducts.jsx`**, **`AdminOrders.jsx`**, **`AdminCustomers.jsx`** →
   লোকাল স্টেট/ডামি ডেটার জায়গায় রিয়েল API কল (GET/POST/PUT/DELETE) যুক্ত করতে হবে।

## কাস্টমাইজেশন

- রঙ ও ফন্ট: `tailwind.config.js`
- গ্লোবাল স্টাইল: `src/index.css`
- প্রোডাক্ট ডেটা: `src/data/products.js`
- UI টেক্সট/ভাষা: `src/data/translations.js`
