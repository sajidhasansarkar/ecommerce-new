import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Toast from './components/Toast.jsx'
import { useLanguage } from './context/LanguageContext.jsx'

import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import About from './pages/About.jsx'

import AdminLayout from './admin/AdminLayout.jsx'
import Dashboard from './admin/Dashboard.jsx'
import AdminProducts from './admin/AdminProducts.jsx'
import AdminOrders from './admin/AdminOrders.jsx'
import AdminCustomers from './admin/AdminCustomers.jsx'
import AdminSiteSettings from './admin/AdminSiteSettings.jsx'
import AdminCategories from './admin/AdminCategories.jsx'
import AdminPromotions from './admin/AdminPromotions.jsx'

export default function App() {
  return (
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
            </main>
            <Footer />
            <Toast />
          </div>
        }
      />
    </Routes>
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
