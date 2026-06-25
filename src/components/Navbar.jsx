import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, Search, Menu, X, Languages, LogOut, ChevronDown } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCategories } from '../context/CategoryContext.jsx'
import UserMenu from './UserMenu.jsx'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { itemCount } = useCart()
  const { lang, toggleLang, t } = useLanguage()
  const { user, logout } = useAuth()
  const { categories } = useCategories()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCatOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleMobileLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
      setOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-sand/95 backdrop-blur-sm border-b border-stone-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display text-2xl lg:text-3xl font-600 text-ink tracking-tight">
              {t('brand.name')}
            </span>
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-clay group-hover:scale-150 transition-transform" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <NavLink
              to="/shop"
              end
              className={({ isActive }) =>
                `font-body text-sm tracking-wide transition-colors hover:text-clay ${isActive ? 'text-clay font-medium' : 'text-ink/80'}`
              }
            >
              {t('nav.shop')}
            </NavLink>

            {/* Categories dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCatOpen((v) => !v)}
                className="flex items-center gap-1 font-body text-sm tracking-wide text-ink/80 hover:text-clay transition-colors"
              >
                {lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
                <ChevronDown size={14} className={`transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              </button>

              {catOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-sand border border-stone-dark rounded-lg shadow-md py-1 z-50">
                  {categories.map((cat) => (
                    <NavLink
                      key={cat.key}
                      to={`/shop?category=${cat.key}`}
                      onClick={() => setCatOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-stone hover:text-clay ${
                          isActive ? 'text-clay font-medium bg-stone/50' : 'text-ink/80'
                        }`
                      }
                    >
                      {cat.icon && <span>{cat.icon}</span>}
                      {lang === 'bn' ? cat.name.bn : cat.name.en}
                    </NavLink>
                  ))}
                  {categories.length === 0 && (
                    <p className="px-4 py-2 text-sm text-ink/40">
                      {lang === 'bn' ? 'কোনো ক্যাটাগরি নেই' : 'No categories'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="w-44 bg-stone/60 border border-stone-dark rounded-full px-4 py-1.5 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay placeholder:text-ink/40"
              />
              <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/50 hover:text-clay">
                <Search size={16} />
              </button>
            </form>

            <button
              onClick={toggleLang}
              className="tap-tight inline-flex items-center gap-1 text-xs font-medium text-ink/70 hover:text-clay transition-colors border border-stone-dark rounded-full px-2.5 py-1"
            >
              <Languages size={13} />
              {lang === 'bn' ? 'বাং' : 'EN'}
            </button>

            <UserMenu />

            <Link to="/cart" aria-label={t('nav.cart')} className="relative inline-flex items-center justify-center text-ink/70 hover:text-clay transition-colors tap-tight">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-clay text-sand text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile right-side icons */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={toggleLang}
              className="tap-tight inline-flex items-center gap-1 text-xs font-medium text-ink/70 border border-stone-dark rounded-full px-2 py-1"
            >
              <Languages size={12} />
              {lang === 'bn' ? 'বাং' : 'EN'}
            </button>
            <Link to="/cart" className="relative inline-flex items-center justify-center text-ink/80 tap-tight">
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-clay text-sand text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                  {itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setOpen(!open)} className="tap-tight inline-flex items-center justify-center text-ink/80">
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden mobile-nav-open border-t border-stone-dark bg-sand px-4 sm:px-6 py-5 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t('nav.search')}
              className="w-full bg-stone/60 border border-stone-dark rounded-full px-4 py-2 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-clay/40"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50">
              <Search size={16} />
            </button>
          </form>
          <nav className="flex flex-col gap-3">
            <NavLink
              to="/shop"
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) => `text-base py-1 ${isActive ? 'text-clay font-medium' : 'text-ink/80'}`}
            >
              {t('nav.shop')}
            </NavLink>

            {/* Mobile: categories as flat list under a label */}
            <p className="text-xs font-medium text-ink/40 uppercase tracking-wider mt-1">
              {lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
            </p>
            {categories.map((cat) => (
              <NavLink
                key={cat.key}
                to={`/shop?category=${cat.key}`}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-base py-1 pl-2 ${isActive ? 'text-clay font-medium' : 'text-ink/70'}`
                }
              >
                {cat.icon && <span>{cat.icon}</span>}
                {lang === 'bn' ? cat.name.bn : cat.name.en}
              </NavLink>
            ))}

            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="text-base py-1 text-ink/80">{t('nav.profile')}</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="text-base py-1 text-ink/80">{t('userMenu.admin')}</Link>
                )}
                <button
                  onClick={handleMobileLogout}
                  className="flex items-center gap-2 text-base py-1 text-red-500"
                >
                  <LogOut size={16} /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="text-base py-1 text-ink/80">
                {t('nav.login')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
