import React, { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useCategories } from '../context/CategoryContext.jsx'
import { api } from '../api.js'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('q') || ''
  const { lang, t } = useLanguage()
  const { categories } = useCategories()

  const sortOptions = [
    { value: 'default', label: t('shop.sortDefault') },
    { value: 'price-low', label: t('shop.sortPriceLow') },
    { value: 'price-high', label: t('shop.sortPriceHigh') },
    { value: 'rating', label: t('shop.sortRating') },
  ]

  const [sort, setSort] = useState('default')
  const [maxPrice, setMaxPrice] = useState(10000)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (activeCategory !== 'all') params.category = activeCategory
    if (searchQuery) params.q = searchQuery
    api.products.list(params)
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [activeCategory, searchQuery])

  function setCategory(catKey) {
    const params = new URLSearchParams(searchParams)
    if (catKey === 'all') params.delete('category')
    else params.set('category', catKey)
    setSearchParams(params)
  }

  const filtered = useMemo(() => {
    let list = [...products]
    list = list.filter((p) => p.price <= maxPrice)
    if (sort === 'price-low') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-high') list.sort((a, b) => b.price - a.price)
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    return list
  }, [products, sort, maxPrice])

  // Dynamic title: look up current category name
  const activeCatObj = categories.find((c) => c.key === activeCategory)
  const categoryTitle =
    activeCategory === 'all'
      ? t('shop.allProducts')
      : activeCatObj
        ? (lang === 'bn' ? activeCatObj.name.bn : activeCatObj.name.en)
        : activeCategory

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl lg:text-4xl text-ink mb-2">{categoryTitle}</h1>
        <p className="text-ink/60 text-sm">
          {loading ? t('common.loading') : searchQuery ? t('shop.resultsFor', searchQuery, filtered.length) : t('shop.productsFound', filtered.length)}
        </p>
      </div>

      {error && <p className="text-clay text-sm mb-4">{error}</p>}

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterPanel
            activeCategory={activeCategory}
            setCategory={setCategory}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            categories={categories}
            lang={lang}
            t={t}
          />
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 border border-stone-dark rounded-md px-3 py-2 text-sm"
            >
              <SlidersHorizontal size={15} /> {t('shop.filters')}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="ml-auto bg-sand border border-stone-dark rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="relative aspect-[4/5] rounded-lg bg-stone mb-3 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-dark/50 to-transparent" />
                    <div className="absolute bottom-3 right-3 h-7 w-16 bg-stone-dark rounded" />
                  </div>
                  <div className="h-4 bg-stone rounded-md w-3/4 mb-2" />
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 bg-stone rounded-full" />
                    <div className="h-3 bg-stone rounded-md w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-xl text-ink mb-2">{t('shop.noResults')}</p>
              <p className="text-ink/60 text-sm">{t('shop.noResultsSub')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-8">
              {filtered.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-sand p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg">{t('shop.filters')}</h3>
              <button onClick={() => setFiltersOpen(false)} aria-label={t('nav.close')}>
                <X size={20} />
              </button>
            </div>
            <FilterPanel
              activeCategory={activeCategory}
              setCategory={(c) => {
                setCategory(c)
                setFiltersOpen(false)
              }}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              categories={categories}
              lang={lang}
              t={t}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function FilterPanel({ activeCategory, setCategory, maxPrice, setMaxPrice, categories, lang, t }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-medium text-sm text-ink mb-3 uppercase tracking-wide">{t('shop.category')}</h3>
        <ul className="space-y-2">
          {/* "All" option */}
          <li>
            <button
              onClick={() => setCategory('all')}
              className={`text-sm w-full text-left py-1 transition-colors ${
                activeCategory === 'all' ? 'text-clay font-medium' : 'text-ink/70 hover:text-clay'
              }`}
            >
              {lang === 'bn' ? 'সব' : 'All'}
            </button>
          </li>

          {/* Dynamic categories from DB */}
          {categories.map((cat) => (
            <li key={cat.key}>
              <button
                onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-1.5 text-sm w-full text-left py-1 transition-colors ${
                  activeCategory === cat.key ? 'text-clay font-medium' : 'text-ink/70 hover:text-clay'
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {lang === 'bn' ? cat.name.bn : cat.name.en}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-medium text-sm text-ink mb-3 uppercase tracking-wide">{t('shop.maxPrice')}</h3>
        <input
          type="range"
          min="500"
          max="10000"
          step="100"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-clay"
        />
        <p className="text-sm text-ink/60 mt-1">{t('shop.upTo', maxPrice)}</p>
      </div>
    </div>
  )
}
