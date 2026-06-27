import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, Minus, Plus, Truck, ShieldCheck } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { api } from '../api.js'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { lang, t } = useLanguage()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeImage, setActiveImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError('')
    api.products.get(id)
      .then((p) => {
        setProduct(p)
        setSelectedColor(p.colors?.[0] || null)
        // sizeVariants থাকলে সেখান থেকে, না থাকলে পুরনো sizes থেকে
        const firstSize = p.sizeVariants?.[0]?.size || p.sizes?.[0] || null
        setSelectedSize(firstSize)
        return api.products.list({ category: p.categoryKey })
      })
      .then((list) => {
        setRelated(list.filter((p) => p._id !== id).slice(0, 4))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="aspect-square rounded-xl bg-stone" />
          <div className="space-y-4">
            <div className="h-8 bg-stone rounded w-2/3" />
            <div className="h-4 bg-stone rounded w-1/3" />
            <div className="h-6 bg-stone rounded w-1/4" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl mb-3">{t('product.notFound')}</h1>
        <Link to="/shop" className="text-clay hover:underline">{t('product.backToShop')}</Link>
      </div>
    )
  }

  const name = product.name[lang]
  const description = product.description?.[lang] || ''
  const badge = product.badge ? product.badge[lang] : null

  function handleAddToCart() {
    addItem(product, qty, { color: selectedColor, size: selectedSize, displayName: name })
  }

  function handleBuyNow() {
    addItem(product, qty, { color: selectedColor, size: selectedSize, displayName: name })
    navigate('/checkout')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-xs text-ink/50 mb-6">
        <Link to="/" className="hover:text-clay">{t('product.home')}</Link> /{' '}
        <Link to="/shop" className="hover:text-clay">{t('product.shop')}</Link> /{' '}
        <span className="text-ink">{name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* গ্যালারি */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-stone mb-3">
            {product.images?.length > 0 ? (
              <img src={product.images[activeImage]} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink/30 font-display text-lg">
                {t('common.noImage')}
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    i === activeImage ? 'border-clay' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ডিটেইলস */}
        <div>
          {badge && (
            <span className="inline-block bg-ink text-sand text-[11px] font-medium px-2.5 py-1 rounded-full mb-3">
              {badge}
            </span>
          )}
          <h1 className="font-display text-3xl lg:text-4xl text-ink mb-3 text-balance">{name}</h1>

          <div className="flex items-center gap-2 mb-4">
            {product.rating > 0 && (
              <>
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-gold text-gold" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                <span className="text-ink/40">·</span>
                <span className="text-sm text-ink/60">{product.reviews} {t('product.reviews')}</span>
                <span className="text-ink/40">·</span>
              </>
            )}
            {(() => {
              // selected size-এর stock দেখাবে, না হলে total stock
              const variant = product.sizeVariants?.find(v => v.size === selectedSize)
              const displayStock = variant ? variant.stock : product.stock
              return (
                <span className={`text-sm ${displayStock > 5 ? 'text-sage' : displayStock === 0 ? 'text-clay font-medium' : 'text-clay'}`}>
                  {displayStock === 0
                    ? (selectedSize ? `${selectedSize} — স্টক নেই` : 'স্টক নেই')
                    : displayStock > 5
                      ? t('product.inStock')
                      : t('product.lowStock', displayStock)
                  }
                </span>
              )
            })()}
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-mono text-2xl font-semibold text-ink">৳{product.price}</span>
            {product.oldPrice && (
              <span className="font-mono text-base text-ink/40 line-through">৳{product.oldPrice}</span>
            )}
          </div>

          {description && <p className="text-ink/70 leading-relaxed mb-6">{description}</p>}

          {/* sizeVariants (নতুন system) অথবা sizes (পুরনো) */}
          {(product.sizeVariants?.length > 0 || product.sizes?.length > 0) && (
            <div className="mb-6">
              <p className="text-sm font-medium text-ink mb-2">{t('product.selectSize')}</p>
              <div className="flex gap-2 flex-wrap">
                {(product.sizeVariants?.length > 0
                  ? product.sizeVariants
                  : product.sizes.map(s => ({ size: s, stock: product.stock }))
                ).map(({ size: s, stock: sv }) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    disabled={sv === 0}
                    className={`min-w-[44px] h-11 px-3 rounded-md border text-sm font-medium transition-colors relative ${
                      sv === 0
                        ? 'border-stone-dark text-ink/25 cursor-not-allowed line-through'
                        : selectedSize === s
                          ? 'border-ink bg-ink text-sand'
                          : 'border-stone-dark text-ink/70 hover:border-clay'
                    }`}
                  >
                    {s}
                    {sv > 0 && sv <= 3 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-clay text-sand text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {sv}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 1 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-ink mb-2">{t('product.selectColor')}</p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    aria-label={`color ${c}`}
                    className={`w-9 h-9 rounded-full border-2 transition-transform ${
                      selectedColor === c ? 'border-ink scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {(() => {
            const variant = product.sizeVariants?.find(v => v.size === selectedSize)
            const availableStock = variant ? variant.stock : product.stock
            const outOfStock = availableStock === 0
            return (
              <div className="flex items-center gap-4 mb-4">
                <div className={`flex items-center border rounded-md ${outOfStock ? 'border-stone-dark opacity-40' : 'border-stone-dark'}`}>
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={outOfStock}
                    className="p-2.5 hover:text-clay disabled:cursor-not-allowed"
                    aria-label="minus"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(availableStock, q + 1))}
                    disabled={outOfStock}
                    className="p-2.5 hover:text-clay disabled:cursor-not-allowed"
                    aria-label="plus"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="flex-1 border border-ink text-ink py-3 rounded-md font-medium hover:bg-ink hover:text-sand transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink"
                >
                  {outOfStock ? 'স্টক নেই' : t('product.addToCart')}
                </button>
              </div>
            )
          })()}
          </div>
          <button
            onClick={handleBuyNow}
            className="w-full bg-clay text-sand py-3 rounded-md font-medium hover:bg-clay-dark transition-colors mb-6"
          >
            {t('product.buyNow')}
          </button>

          <div className="border-t border-stone-dark pt-5 space-y-3">
            <div className="flex items-center gap-3 text-sm text-ink/70">
              <Truck size={17} className="text-clay shrink-0" />
              {t('product.shippingNote')}
            </div>
            <div className="flex items-center gap-3 text-sm text-ink/70">
              <ShieldCheck size={17} className="text-clay shrink-0" />
              {t('product.returnNote')}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl text-ink mb-8">{t('product.youMayLike')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-8">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
