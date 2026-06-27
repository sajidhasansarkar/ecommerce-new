import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { CheckCircle2, UserCheck } from 'lucide-react'
import { api } from '../api.js'

/* ─── Delivery charge helper ─── */
function calcShipping(subtotal, promotions) {
  if (!promotions) {
    // fallback to old hardcoded logic
    return subtotal >= 1500 || subtotal === 0 ? 0 : 80
  }
  const {
    deliveryEnabled = true,
    deliveryCharge = 80,
    freeDeliveryEnabled = true,
    freeDeliveryThreshold = 1500,
  } = promotions
  if (!deliveryEnabled || subtotal === 0) return 0
  if (freeDeliveryEnabled && subtotal >= freeDeliveryThreshold) return 0
  return deliveryCharge
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cod',
  })
  const [prefilled, setPrefilled] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [placed, setPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [promotions, setPromotions] = useState(null)

  useEffect(() => {
    api.settings.get()
      .then((s) => setPromotions(s.promotions || null))
      .catch(() => {})
  }, [])

  // Auto-fill form from logged-in user's profile data
  useEffect(() => {
    if (user) {
      const hasData = user.name || user.phone || user.address
      if (hasData) {
        setForm((f) => ({
          ...f,
          fullName: user.name || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
        }))
        setPrefilled(true)
      }
    }
  }, [user])

  const shipping = calcShipping(subtotal, promotions)
  const total = subtotal + shipping

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function validate() {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = t('checkout.errName')
    if (!/^01[0-9]{9}$/.test(form.phone.trim())) errs.phone = t('checkout.errPhone')
    if (!form.address.trim()) errs.address = t('checkout.errAddress')
    if (!form.city.trim()) errs.city = t('checkout.errCity')
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const orderItems = items.map((item) => ({
        productId: item.id,
        skuId: item.skuId || null,
        name: item.name,
        price: item.price,
        image: item.image,
        color: item.color || '',
        size: item.size || '',
        qty: item.qty,
      }))
      const data = await api.orders.create({
        ...form,
        items: orderItems,
        subtotal,
        shipping,
        total,
      })
      setOrderId(data.orderNumber)
      setPlaced(true)
      clearCart()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0 && !placed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-3">{t('checkout.cartEmpty')}</h1>
        <Link to="/shop" className="text-clay hover:underline">{t('cart.startShopping')}</Link>
      </div>
    )
  }

  if (placed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <CheckCircle2 size={48} className="text-sage mx-auto mb-4" />
        <h1 className="font-display text-3xl text-ink mb-3">{t('checkout.orderSuccess')}</h1>
        <p className="text-ink/60 mb-1">{t('checkout.orderIdLabel')}</p>
        <p className="font-mono text-lg text-clay font-semibold mb-8">{orderId}</p>
        <p className="text-ink/60 text-sm mb-8">{t('checkout.orderSuccessNote')}</p>
        <Link
          to="/shop"
          className="inline-block bg-ink text-sand px-6 py-3 rounded-md font-medium hover:bg-clay transition-colors"
        >
          {t('checkout.shopMore')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl text-ink mb-8">{t('checkout.title')}</h1>
      <div className="grid lg:grid-cols-3 gap-10">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5" noValidate>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">{t('checkout.deliveryInfo')}</h2>
            {user && prefilled && (
              <span className="flex items-center gap-1.5 text-xs text-sage font-medium bg-sage/10 px-3 py-1.5 rounded-full">
                <UserCheck size={13} />
                {t('checkout.autoFilled')}
              </span>
            )}
          </div>

          <Field
            label={t('checkout.fullName')}
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />
          <Field
            label={t('checkout.phone')}
            name="phone"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="01XXXXXXXXX"
          />
          <Field
            label={t('checkout.address')}
            name="address"
            value={form.address}
            onChange={handleChange}
            error={errors.address}
            as="textarea"
          />
          <Field
            label={t('checkout.city')}
            name="city"
            value={form.city}
            onChange={handleChange}
            error={errors.city}
          />

          <h2 className="font-display text-lg text-ink pt-4">{t('checkout.paymentMethod')}</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 border border-stone-dark rounded-md p-4 cursor-pointer hover:border-clay">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={form.paymentMethod === 'cod'}
                onChange={handleChange}
                className="accent-clay"
              />
              <div>
                <p className="text-sm font-medium text-ink">{t('checkout.cod')}</p>
                <p className="text-xs text-ink/50">{t('checkout.codSub')}</p>
              </div>
            </label>
            <label className="flex items-center gap-3 border border-stone-dark rounded-md p-4 cursor-pointer hover:border-clay">
              <input
                type="radio"
                name="paymentMethod"
                value="bkash"
                checked={form.paymentMethod === 'bkash'}
                onChange={handleChange}
                className="accent-clay"
              />
              <div>
                <p className="text-sm font-medium text-ink">{t('checkout.mobileBank')}</p>
                <p className="text-xs text-ink/50">{t('checkout.mobileBankSub')}</p>
              </div>
            </label>
          </div>

          {submitError && <p className="text-sm text-clay">{submitError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-clay text-sand py-3.5 rounded-md font-medium hover:bg-clay-dark transition-colors mt-2 disabled:opacity-60"
          >
            {submitting ? t('checkout.placingOrder') : t('checkout.confirmOrder')}
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-stone rounded-xl p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg text-ink mb-5">{t('cart.orderSummary')}</h2>
            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto thin-scroll">
              {items.map((item) => (
                <div key={item.key} className="flex items-center gap-3 text-sm">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover bg-sand shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-ink">{item.name}</p>
                    <p className="text-ink/50 text-xs">{t('cart.size')}: {item.size || '—'} · {item.qty}x</p>
                  </div>
                  <span className="font-mono text-ink shrink-0">৳{item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-stone-dark pt-4">
              <div className="flex justify-between text-ink/70">
                <span>{t('cart.subtotal')}</span>
                <span className="font-mono">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-ink/70">
                <span>{t('cart.shipping')}</span>
                <span className="font-mono">{shipping === 0 ? t('cart.free') : `৳${shipping}`}</span>
              </div>
              <div className="flex justify-between font-medium text-ink pt-2 border-t border-stone-dark">
                <span>{t('cart.total')}</span>
                <span className="font-mono">৳{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, error, placeholder, as = 'input' }) {
  const Tag = as
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      <Tag
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={as === 'textarea' ? 3 : undefined}
        className={`w-full bg-sand border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40 ${
          error ? 'border-clay' : 'border-stone-dark'
        }`}
      />
      {error && <p className="text-xs text-clay mt-1">{error}</p>}
    </div>
  )
}
