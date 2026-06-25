import React from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Cart() {
  const { items, removeItem, updateQty, subtotal } = useCart()
  const { t } = useLanguage()

  const shipping = subtotal >= 1500 || subtotal === 0 ? 0 : 80
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-3">{t('cart.empty')}</h1>
        <p className="text-ink/60 mb-8">{t('cart.emptySub')}</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-ink text-sand px-6 py-3 rounded-md font-medium hover:bg-clay transition-colors"
        >
          {t('cart.startShopping')} <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl text-ink mb-8">{t('cart.title')}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 border-b border-stone-dark pb-5">
              <img src={item.image} alt={item.name} className="w-24 h-24 rounded-md object-cover bg-stone shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base text-ink mb-1">{item.name}</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      {item.color && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-ink/50">{t('cart.color')}:</span>
                          <span className="w-3.5 h-3.5 rounded-full border border-ink/20" style={{ backgroundColor: item.color }} />
                        </div>
                      )}
                      {item.size && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-ink/50">{t('cart.size')}:</span>
                          <span className="text-xs text-ink">{item.size}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.key)}
                    aria-label={t('cart.remove')}
                    className="text-ink/40 hover:text-clay shrink-0"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-stone-dark rounded-md">
                    <button
                      onClick={() => updateQty(item.key, item.qty - 1)}
                      className="p-2 hover:text-clay"
                      aria-label="minus"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.key, item.qty + 1)}
                      className="p-2 hover:text-clay"
                      aria-label="plus"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="font-mono text-sm font-medium text-ink">৳{item.price * item.qty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* অর্ডার সামারি */}
        <div className="lg:col-span-1">
          <div className="bg-stone rounded-xl p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg text-ink mb-5">{t('cart.orderSummary')}</h2>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-ink/70">
                <span>{t('cart.subtotal')}</span>
                <span className="font-mono">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-ink/70">
                <span>{t('cart.shipping')}</span>
                <span className="font-mono">{shipping === 0 ? t('cart.free') : `৳${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-clay">{t('cart.freeShippingNote', 1500 - subtotal)}</p>
              )}
            </div>
            <div className="flex justify-between font-medium text-ink border-t border-stone-dark pt-4 mb-6">
              <span>{t('cart.total')}</span>
              <span className="font-mono">৳{total}</span>
            </div>
            <Link
              to="/checkout"
              className="block text-center bg-clay text-sand py-3 rounded-md font-medium hover:bg-clay-dark transition-colors"
            >
              {t('cart.checkout')}
            </Link>
            <Link
              to="/shop"
              className="block text-center text-sm text-ink/60 hover:text-clay mt-4"
            >
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
