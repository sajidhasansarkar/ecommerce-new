import React from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { lang, t } = useLanguage()

  const name = product.name[lang]
  const badge = product.badge ? product.badge[lang] : null

  function handleQuickAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1, {
      color: product.colors?.[0] || null,
      size: product.sizes?.[0] || null,
      displayName: name,
    })
  }

  return (
    <Link to={`/product/${product._id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-stone mb-3">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/20 font-display text-sm">
            কোনো ছবি নেই
          </div>
        )}

        {badge && (
          <span className="absolute top-3 left-3 bg-ink text-sand text-[11px] font-medium px-2.5 py-1 rounded-full tracking-wide">
            {badge}
          </span>
        )}

        <div className="price-tag absolute bottom-3 right-3 bg-sand border border-ink/10 shadow-sm rounded px-2.5 py-1.5">
          <span className="font-mono text-sm font-medium text-ink">৳{product.price}</span>
          {product.oldPrice && (
            <span className="font-mono text-[11px] text-ink/40 line-through ml-1.5">৳{product.oldPrice}</span>
          )}
        </div>

        <button
          onClick={handleQuickAdd}
          className="hidden sm:block absolute inset-x-3 bottom-14 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-ink text-sand text-sm font-medium py-2.5 rounded-md"
        >
          {t('product.addToCart')}
        </button>
      </div>

      <h3 className="font-display text-base text-ink leading-snug mb-1 group-hover:text-clay transition-colors">
        {name}
      </h3>
      {product.rating > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-ink/60">
          <Star size={13} className="fill-gold text-gold" />
          <span>{product.rating}</span>
          <span className="text-ink/30">·</span>
          <span>{product.reviews} {t('product.reviews')}</span>
        </div>
      )}
    </Link>
  )
}
