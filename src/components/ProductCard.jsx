import React from 'react'
import { Link } from 'react-router-dom'
import { Star, ShoppingBag } from 'lucide-react'
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
            {t('common.noImage')}
          </div>
        )}

        {badge && (
          <span className="tap-tight absolute top-2 left-2 sm:top-3 sm:left-3 bg-ink text-sand text-[10px] sm:text-[11px] font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full tracking-wide">
            {badge}
          </span>
        )}

        <div className="price-tag absolute bottom-3 right-3 bg-sand border border-ink/10 shadow-sm rounded px-2.5 py-1.5 tap-tight">
          <span className="font-mono text-sm font-medium text-ink">৳{product.price}</span>
          {product.oldPrice && (
            <span className="font-mono text-[11px] text-ink/40 line-through ml-1.5">৳{product.oldPrice}</span>
          )}
        </div>

        {/* Desktop: hover reveal button */}
        <button
          onClick={handleQuickAdd}
          className="hidden sm:block absolute inset-x-3 bottom-14 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-ink text-sand text-sm font-medium py-2.5 rounded-md"
        >
          {t('product.addToCart')}
        </button>

        {/* Mobile: always-visible icon button in top-right */}
        <button
          onClick={handleQuickAdd}
          className="sm:hidden absolute top-2 right-2 bg-sand/90 backdrop-blur-sm text-ink rounded-full p-2 shadow-sm active:scale-95 transition-transform tap-tight"
          aria-label={t('product.addToCart')}
        >
          <ShoppingBag size={15} />
        </button>
      </div>

      <h3 className="font-display text-sm sm:text-base text-ink leading-snug mb-1 group-hover:text-clay transition-colors line-clamp-2">
        {name}
      </h3>
      {product.rating > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-ink/60">
          <Star size={12} className="fill-gold text-gold tap-tight" />
          <span>{product.rating}</span>
          <span className="text-ink/30">·</span>
          <span>{product.reviews} {t('product.reviews')}</span>
        </div>
      )}
    </Link>
  )
}
