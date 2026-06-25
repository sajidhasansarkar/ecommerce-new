import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, RotateCcw, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { api } from '../api.js'

const HOME_SECTIONS = [
  { key: 'bestseller', bn: 'বেস্ট সেলার', titleBn: 'বেস্ট সেলার',       titleEn: 'Best Sellers'    },
  { key: 'new',        bn: 'নতুন',         titleBn: 'নতুন কালেকশন',      titleEn: 'New Arrivals'    },
  { key: 'trending',   bn: 'ট্রেন্ডিং',    titleBn: 'ট্রেন্ডিং',         titleEn: 'Trending Now'    },
  { key: 'sale',       bn: 'সেল',          titleBn: 'সেলের প্রোডাক্ট',   titleEn: 'On Sale'         },
  { key: 'limited',    bn: 'লিমিটেড',      titleBn: 'লিমিটেড এডিশন',    titleEn: 'Limited Edition' },
]

/* ——— Skeleton Components ——— */
function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-lg bg-stone mb-3 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-dark/40 to-transparent skeleton-shimmer" />
      </div>
      <div className="h-4 bg-stone rounded-md w-3/4 mb-2" />
      <div className="h-3 bg-stone rounded-md w-1/2" />
    </div>
  )
}

function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-stone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-24 grid lg:grid-cols-2 gap-8 items-center animate-pulse">
        <div className="order-2 lg:order-1 space-y-4">
          <div className="h-3 bg-stone-dark rounded w-24" />
          <div className="space-y-2">
            <div className="h-10 bg-stone-dark rounded-lg w-full" />
            <div className="h-10 bg-stone-dark rounded-lg w-4/5" />
            <div className="h-10 bg-clay/20 rounded-lg w-3/5" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-stone-dark rounded w-full" />
            <div className="h-3 bg-stone-dark rounded w-4/5" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="h-12 bg-stone-dark rounded-md w-36" />
            <div className="h-12 bg-stone rounded-md border border-stone-dark w-28" />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <div className="aspect-square rounded-2xl bg-stone-dark overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-stone via-stone-dark to-stone animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}

function CategorySkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-8 bg-stone rounded-lg w-48 mb-8" />
      <div className="grid grid-cols-2 gap-4">
        <div className="aspect-[16/10] rounded-lg bg-stone-dark" />
        <div className="aspect-[16/10] rounded-lg bg-stone-dark" />
      </div>
    </section>
  )
}

function SectionSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="flex justify-between mb-8">
        <div className="h-8 bg-stone rounded-lg w-40" />
        <div className="h-5 bg-stone rounded w-20" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    </section>
  )
}

/* ——— scroll-reveal hook — re-observes whenever deps change ——— */
function useReveal(deps = []) {
  useEffect(() => {
    // Small timeout so React has finished painting new elements
    const timer = setTimeout(() => {
      const els = document.querySelectorAll('.reveal:not(.revealed)')
      if (!els.length) return
      const io = new IntersectionObserver(
        (entries) => entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed')
            io.unobserve(e.target)
          }
        }),
        // Lower threshold so elements near bottom of mobile viewport trigger correctly
        { threshold: 0.06, rootMargin: '0px 0px -20px 0px' }
      )
      els.forEach(el => io.observe(el))
      return () => io.disconnect()
    }, 80)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/* ——— Hero Slider ——— */
function HeroSlider({ images }) {
  const [idx, setIdx] = useState(0)
  const timer = useRef(null)

  const go = useCallback((n) => setIdx(i => (i + n + images.length) % images.length), [images.length])

  useEffect(() => {
    if (images.length < 2) return
    timer.current = setInterval(() => go(1), 3500)
    return () => clearInterval(timer.current)
  }, [go, images.length])

  // Touch swipe support
  const touchStart = useRef(null)
  function onTouchStart(e) { touchStart.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) go(diff > 0 ? 1 : -1)
    touchStart.current = null
  }

  if (!images.length) return (
    <div className="aspect-square rounded-2xl overflow-hidden bg-stone/60 flex items-center justify-center">
      <p className="text-ink/30 font-display text-xl">লাবণ্য কালেকশন</p>
    </div>
  )

  if (images.length === 1) return (
    <div className="aspect-square rounded-2xl overflow-hidden">
      <img src={images[0]} alt="hero" className="w-full h-full object-cover" />
    </div>
  )

  return (
    <div
      className="relative aspect-square rounded-2xl overflow-hidden group"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {images.map((src, i) => (
        <img
          key={i} src={src} alt={`slide-${i}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === idx ? 1 : 0 }}
        />
      ))}
      {/* dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`tap-tight w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-sand w-4' : 'bg-sand/50'}`}
          />
        ))}
      </div>
      {/* arrows — always visible on touch, hover-only on pointer devices */}
      <button onClick={() => go(-1)}
        className="slider-arrow absolute left-2 top-1/2 -translate-y-1/2 bg-ink/40 text-sand rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ink/70 tap-tight"
      ><ChevronLeft size={18} /></button>
      <button onClick={() => go(1)}
        className="slider-arrow absolute right-2 top-1/2 -translate-y-1/2 bg-ink/40 text-sand rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ink/70 tap-tight"
      ><ChevronRight size={18} /></button>
    </div>
  )
}

/* ——— Marquee ——— */
function Marquee({ items }) {
  if (!items?.length) return null
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden bg-clay py-3 select-none">
      <div className="marquee-track">
        {doubled.map((text, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-6 text-sand font-mono text-xs tracking-widest uppercase whitespace-nowrap">
            {text}
            <span className="tap-tight w-1 h-1 rounded-full bg-sand/50 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ——— Promo Banner ——— */
function PromoBanner({ promo }) {
  if (!promo?.image) return null
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 reveal animate-scale-in">
      <Link to={promo.link || '/shop'}
        className="relative block w-full aspect-[21/8] sm:aspect-[21/8] aspect-[4/3] rounded-2xl overflow-hidden group"
      >
        <img src={promo.image} alt="promo" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-ink/20 to-transparent" />
        <div className="promo-shimmer absolute inset-0" />
        {(promo.title || promo.subtitle) && (
          <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-16">
            {promo.title && (
              <h2 className="font-display text-xl sm:text-3xl lg:text-5xl text-sand leading-tight mb-2 drop-shadow">
                {promo.title}
              </h2>
            )}
            {promo.subtitle && (
              <p className="text-sand/80 text-xs sm:text-sm lg:text-base mb-4 max-w-xs sm:max-w-sm">{promo.subtitle}</p>
            )}
            <span className="inline-flex items-center gap-2 bg-sand text-ink px-4 py-2 sm:px-5 sm:py-2.5 rounded-md text-sm font-medium w-fit hover:bg-clay hover:text-sand transition-colors">
              এখনই দেখুন <ArrowRight size={14} />
            </span>
          </div>
        )}
      </Link>
    </section>
  )
}

/* ——— Main Component ——— */
export default function Home() {
  const { lang, t } = useLanguage()
  const [products, setProducts]   = useState([])
  const [settings, setSettings]   = useState(null)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingSettings, setLoadingSettings] = useState(true)

  // Re-run reveal whenever products or settings load
  useReveal([loadingProducts, loadingSettings])

  useEffect(() => {
    api.products.list().then(setProducts).catch(() => {}).finally(() => setLoadingProducts(false))
    api.settings.get().then(setSettings).catch(() => {}).finally(() => setLoadingSettings(false))
  }, [])

  const sections = HOME_SECTIONS
    .map(s => ({ ...s, items: products.filter(p => p.badge?.bn === s.bn) }))
    .filter(s => s.items.length > 0)

  const sliderImages = (() => {
    if (settings?.heroSlider?.length) return settings.heroSlider
    const fallback = settings?.heroImage || products[0]?.images?.[0]
    return fallback ? [fallback] : []
  })()

  const shoesImage   = settings?.categoryImages?.shoes || 'https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=700&q=80'
  const bagsImage    = settings?.categoryImages?.bags  || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=80'
  const marqueeItems = settings?.marqueeItems || ['নতুন কালেকশন এসেছে', 'বিশেষ ছাড় চলছে', 'ফ্রি শিপিং ৳৫০০+ অর্ডারে', 'লিমিটেড এডিশন']

  const isLoading = loadingProducts || loadingSettings

  if (isLoading) return (
    <div>
      <HeroSkeleton />
      <div className="h-10 bg-clay/80 animate-pulse" />
      <CategorySkeleton />
      <SectionSkeleton />
      <SectionSkeleton />
    </div>
  )

  return (
    <div>
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden bg-stone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 lg:py-24 grid lg:grid-cols-2 gap-8 items-center">

          {/* Image — top on mobile, right on desktop */}
          <div className="order-1 lg:order-2 relative animate-fade-right">
            <HeroSlider images={sliderImages} />
          </div>

          {/* Text — bottom on mobile, left on desktop */}
          <div className="order-2 lg:order-1 animate-fade-left">
            <span className="inline-block font-mono text-xs tracking-widest text-clay uppercase mb-3">
              {t('home.eyebrow')}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-6xl leading-[1.08] text-ink text-balance mb-4">
              {t('home.heroTitle1')}<br />
              <span className="italic text-clay">{t('home.heroTitle2')}</span>
            </h1>
            <p className="text-ink/70 text-sm sm:text-base lg:text-lg max-w-md mb-6 leading-relaxed">
              {t('home.heroDesc')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop"
                className="inline-flex items-center gap-2 bg-ink text-sand px-5 py-3 sm:px-6 sm:py-3.5 rounded-md font-medium hover:bg-clay transition-colors text-sm sm:text-base"
              >
                {t('home.shopNow')} <ArrowRight size={16} />
              </Link>
              <Link to="/shop?category=shoes"
                className="inline-flex items-center gap-2 border border-ink/20 text-ink px-5 py-3 sm:px-6 sm:py-3.5 rounded-md font-medium hover:border-clay hover:text-clay transition-colors text-sm sm:text-base"
              >
                {t('nav.shoes')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Marquee ——— */}
      <Marquee items={marqueeItems} />

      {/* ——— Feature strip ——— */}
      <section className="border-y border-stone-dark reveal animate-fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { Icon: Truck,       title: t('home.featureShipping'),  sub: t('home.featureShippingSub') },
            { Icon: RotateCcw,   title: t('home.featureReturn'),    sub: t('home.featureReturnSub')   },
            { Icon: ShieldCheck, title: t('home.featureQuality'),   sub: t('home.featureQualitySub') },
          ].map(({ Icon, title, sub }, i) => (
            <div key={i} className={`flex items-center gap-3 reveal animate-fade-up delay-${(i+1)*100}`}>
              <Icon size={20} className="text-clay shrink-0" />
              <div>
                <p className="text-sm font-medium text-ink">{title}</p>
                <p className="text-xs text-ink/50">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ——— Categories ——— */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <h2 className="font-display text-2xl lg:text-3xl text-ink mb-6 reveal animate-fade-up">{t('home.categoriesTitle')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[
            { to: '/shop?category=shoes', src: shoesImage, label: t('nav.shoes'), delay: 'delay-100' },
            { to: '/shop?category=bags',  src: bagsImage,  label: t('nav.bags'),  delay: 'delay-200' },
          ].map(({ to, src, label, delay }) => (
            <Link key={to} to={to}
              className={`group relative aspect-[4/3] sm:aspect-[16/10] rounded-lg overflow-hidden bg-stone reveal animate-scale-in ${delay}`}
            >
              <img src={src} alt={label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
              <span className="absolute bottom-3 left-3 font-display text-lg sm:text-xl text-sand drop-shadow">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ——— Promo Banner ——— */}
      <PromoBanner promo={settings?.promoBanner} />

      {/* ——— Product sections ——— */}
      {sections.map((section) => (
        <section key={section.key} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-end justify-between mb-6 reveal animate-fade-up">
            <h2 className="font-display text-xl sm:text-2xl lg:text-3xl text-ink">
              {lang === 'bn' ? section.titleBn : section.titleEn}
            </h2>
            <Link to="/shop" className="text-sm text-clay hover:underline flex items-center gap-1 tap-tight">
              {t('home.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {section.items.map((p, pi) => (
              <div key={p._id} className={`reveal animate-fade-up delay-${Math.min(pi * 100, 400)}`}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      ))}

      {products.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="font-display text-xl text-ink/40">{t('home.noProductsTitle')}</p>
          <p className="text-sm text-ink/30 mt-2">{t('home.noProductsSub')}</p>
        </section>
      )}

      {products.length > 0 && sections.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12">
          <div className="flex items-end justify-between mb-6 reveal animate-fade-up">
            <h2 className="font-display text-xl sm:text-2xl lg:text-3xl text-ink">{t('home.allProducts')}</h2>
            <Link to="/shop" className="text-sm text-clay hover:underline flex items-center gap-1 tap-tight">
              {t('home.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {products.slice(0, 8).map((p, pi) => (
              <div key={p._id} className={`reveal animate-fade-up delay-${Math.min(pi * 100, 400)}`}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ——— Story strip ——— */}
      <section className="bg-ink text-sand mt-8 reveal animate-fade-up">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <p className="font-mono text-xs tracking-widest text-clay uppercase mb-4">{t('home.storyLabel')}</p>
          <h2 className="font-display text-xl sm:text-2xl lg:text-3xl italic leading-relaxed max-w-2xl mx-auto text-balance">
            {t('home.storyQuote')}
          </h2>
        </div>
      </section>
    </div>
  )
}
