import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Toast() {
  const { toast } = useCart()
  const { t } = useLanguage()

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      {toast && (
        <div className="flex items-center gap-2 bg-ink text-sand px-5 py-3 rounded-full shadow-lg text-sm">
          <CheckCircle2 size={16} className="text-sage" />
          {t('cart.addedToCart', toast.name)}
        </div>
      )}
    </div>
  )
}
