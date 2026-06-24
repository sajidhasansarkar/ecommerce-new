import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, RotateCcw, ShieldCheck } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { api } from '../api.js'

// এই অর্ডারে হোমপেজে সেকশন দেখাবে
const HOME_SECTIONS = [
  { key: 'bestseller', bn: 'বেস্ট সেলার', titleBn: 'বেস্ট সেলার', titleEn: 'Best Sellers' },
  { key: 'new',        bn: 'নতুন',         titleBn: 'নতুন কালেকশন', titleEn: 'New Arrivals' },
  { key: 'trending',   bn: 'ট্রেন্ডিং',    titleBn: 'ট্রেন্ডিং',    titleEn: 'Trending Now' },
  { key: 'sale',       bn: 'সেল',          titleBn: 'সেলের প্রোডাক্ট', titleEn: 'On Sale' },
  { key: 'limited',    bn: 'লিমিটেড',      titleBn: 'লিমিটেড এডিশন', titleEn: 'Limited Edition' },
]

export default function Home() {
  const { lang, t } = useLanguage()
  const [products, setProducts] = useState([])

  useEffect(() => {
    api.products.list().then(setProducts).catch(() => {})
  }, [])

  // প্রতিটি সেকশনের জন্য প্রোডাক্ট আলাদা করা
  const sections = HOME_SECTIONS
    .map((s) => ({
      ...s,
      items: products.filter((p) => p.badge?.bn === s.bn),
    }))
    .filter((s) => s.items.length > 0)

  // কোনো ব্যাজ নেই এমন প্রোডাক্ট — সবচেয়ে নতুন ৪টা হিরোতে দেখাবে
  const heroBg = products[0]?.images?.[0] || null

  return (
    <div>
      {/* হিরো সেকশন */}
      <section className="relative overflow-hidden bg-stone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1">
            <span className="inline-block font-mono text-xs tracking-widest text-clay uppercase mb-4">
              {t('home.eyebrow')}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-ink text-balance mb-6">
              {t('home.heroTitle1')}
              <br />
              <span className="italic text-clay">{t('home.heroTitle2')}</span>
            </h1>
            <p className="text-ink/70 text-base lg:text-lg max-w-md mb-8 leading-relaxed">
              {t('home.heroDesc')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-ink text-sand px-6 py-3.5 rounded-md font-medium hover:bg-clay transition-colors"
              >
                {t('home.shopNow')} <ArrowRight size={18} />
              </Link>
              <Link
                to="/shop?category=shoes"
                className="inline-flex items-center gap-2 border border-ink/20 text-ink px-6 py-3.5 rounded-md font-medium hover:border-clay hover:text-clay transition-colors"
              >
                {t('nav.shoes')}
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative">
            {heroBg ? (
              <div className="aspect-square rounded-2xl overflow-hidden rotate-1">
                <img src={heroBg} alt="লাবণ্য কালেকশন" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-square rounded-2xl overflow-hidden rotate-1 bg-stone/60 flex items-center justify-center">
                <p className="text-ink/30 font-display text-xl">লাবণ্য কালেকশন</p>
              </div>
            )}
            <div className="absolute -bottom-5 -left-5 bg-sand rounded-xl shadow-lg p-4 max-w-[180px] hidden sm:block">
              <p className="font-display text-2xl text-clay">লাবণ্য</p>
              <p className="text-xs text-ink/60">
                {lang === 'bn' ? 'আপনার পছন্দের কালেকশন' : 'Your favorite collection'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ফিচার স্ট্রিপ */}
      <section className="border-y border-stone-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <Truck size={22} className="text-clay shrink-0" />
            <div>
              <p className="text-sm font-medium text-ink">{t('home.featureShipping')}</p>
              <p className="text-xs text-ink/50">{t('home.featureShippingSub')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw size={22} className="text-clay shrink-0" />
            <div>
              <p className="text-sm font-medium text-ink">{t('home.featureReturn')}</p>
              <p className="text-xs text-ink/50">{t('home.featureReturnSub')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck size={22} className="text-clay shrink-0" />
            <div>
              <p className="text-sm font-medium text-ink">{t('home.featureQuality')}</p>
              <p className="text-xs text-ink/50">{t('home.featureQualitySub')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ক্যাটাগরি */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-display text-2xl lg:text-3xl text-ink mb-8">{t('home.categoriesTitle')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/shop?category=shoes" className="group relative aspect-[16/10] rounded-lg overflow-hidden bg-stone">
            <img
              src="https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=700&q=80"
              alt={t('nav.shoes')}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
            <span className="absolute bottom-4 left-4 font-display text-xl text-sand">{t('nav.shoes')}</span>
          </Link>
          <Link to="/shop?category=bags" className="group relative aspect-[16/10] rounded-lg overflow-hidden bg-stone">
            <img
              src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=80"
              alt={t('nav.bags')}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
            <span className="absolute bottom-4 left-4 font-display text-xl text-sand">{t('nav.bags')}</span>
          </Link>
        </div>
      </section>

      {/* ব্যাজ অনুযায়ী ডায়নামিক সেকশন */}
      {sections.map((section) => (
        <section key={section.key} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl lg:text-3xl text-ink">
                {lang === 'bn' ? section.titleBn : section.titleEn}
              </h2>
            </div>
            <Link to="/shop" className="text-sm text-clay hover:underline flex items-center gap-1">
              {t('home.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {section.items.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      ))}

      {/* কোনো প্রোডাক্ট না থাকলে */}
      {products.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="font-display text-xl text-ink/40">কোনো প্রোডাক্ট যোগ করা হয়নি।</p>
          <p className="text-sm text-ink/30 mt-2">অ্যাডমিন প্যানেল থেকে প্রোডাক্ট যোগ করুন।</p>
        </section>
      )}

      {/* ব্যাজ আছে কিন্তু কোনো সেকশন দেখানো হয়নি — সব প্রোডাক্ট দেখান */}
      {products.length > 0 && sections.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-2xl lg:text-3xl text-ink">
              {lang === 'bn' ? 'সব প্রোডাক্ট' : 'All Products'}
            </h2>
            <Link to="/shop" className="text-sm text-clay hover:underline flex items-center gap-1">
              {t('home.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {products.slice(0, 8).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* স্টোরি স্ট্রিপ */}
      <section className="bg-ink text-sand mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="font-mono text-xs tracking-widest text-clay uppercase mb-4">{t('home.storyLabel')}</p>
          <h2 className="font-display text-2xl lg:text-3xl italic leading-relaxed max-w-2xl mx-auto text-balance">
            {t('home.storyQuote')}
          </h2>
        </div>
      </section>
    </div>
  )
}
