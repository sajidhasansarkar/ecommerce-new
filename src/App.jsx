import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Toast from './components/Toast.jsx'
import { useLanguage } from './context/LanguageContext.jsx'

// কাস্টমার-ফেসিং পেজ — lazy load করা হয়েছে যাতে প্রথম ভিজিটেই পুরো অ্যাডমিন
// প্যানেলের কোড ডাউনলোড করতে না হয়। প্রতিটা পেজ আলাদা JS চাঙ্কে বিল্ড হবে।
const Home          = lazy(() => import('./pages/Home.jsx'))
const Shop           = lazy(() => import('./pages/Shop.jsx'))
const ProductDetail  = lazy(() => import('./pages/ProductDetail.jsx'))
const Cart           = lazy(() => import('./pages/Cart.jsx'))
const Checkout       = lazy(() => import('./pages/Checkout.jsx'))
const Login          = lazy(() => import('./pages/Login.jsx'))
const Profile        = lazy(() => import('./pages/Profile.jsx'))
const About          = lazy(() => import('./pages/About.jsx'))

// অ্যাডমিন পেজ — আলাদা চাঙ্কে, কাস্টমার এগুলো কখনো ডাউনলোড করবে না
const AdminLayout       = lazy(() => import('./admin/AdminLayout.jsx'))
const Dashboard         = lazy(() => import('./admin/Dashboard.jsx'))
const AdminProducts     = lazy(() => import('./admin/AdminProducts.jsx'))
const AdminOrders       = lazy(() => import('./admin/AdminOrders.jsx'))
const AdminCustomers    = lazy(() => import('./admin/AdminCustomers.jsx'))
const AdminSiteSettings = lazy(() => import('./admin/AdminSiteSettings.jsx'))
const AdminCategories   = lazy(() => import('./admin/AdminCategories.jsx'))
const AdminPromotions   = lazy(() => import('./admin/AdminPromotions.jsx'))

function PageLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings" element={<AdminSiteSettings />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="promotions" element={<AdminPromotions />} />
        </Route>

        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Suspense fallback={<PageLoading />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/about" element={<About />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <Toast />
            </div>
          }
        />
      </Routes>
    </Suspense>
  )
}

function NotFound() {
  const { t } = useLanguage()
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-4xl text-ink mb-3">{t('notFound.title')}</h1>
      <p className="text-ink/60">{t('notFound.desc')}</p>
    </div>
  )
}
