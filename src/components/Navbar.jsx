import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, Search, Menu, X, Languages } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import UserMenu from './UserMenu.jsx'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { itemCount } = useCart()
  const { lang, toggleLang, t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()

  const navLinks = [
    { to: '/shop', label: t('nav.shop') },
    { to: '/shop?category=shoes', label: t('nav.shoes') },
    { to: '/shop?category=bags', label: t('nav.bags') },
  ]

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

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to} to={link.to}
                className={({ isActive }) =>
                  `font-body text-sm tracking-wide transition-colors hover:text-clay ${isActive ? 'text-clay font-medium' : 'text-ink/80'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
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
              className="flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-clay transition-colors border border-stone-dark rounded-full px-3 py-1.5"
            >
              <Languages size={15} />
              {lang === 'bn' ? 'বাং' : 'EN'}
            </button>

            <UserMenu />

            <Link to="/cart" aria-label={t('nav.cart')} className="relative text-ink/70 hover:text-clay transition-colors">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-clay text-sand text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 text-xs font-medium text-ink/70 border border-stone-dark rounded-full px-2.5 py-1"
            >
              <Languages size={13} />
              {lang === 'bn' ? 'বাং' : 'EN'}
            </button>
            <Link to="/cart" className="relative text-ink/80">
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-clay text-sand text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setOpen(!open)}>
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-stone-dark bg-sand px-4 sm:px-6 py-5 space-y-4">
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
            {navLinks.map((link) => (
              <NavLink
                key={link.to} to={link.to} onClick={() => setOpen(false)}
                className={({ isActive }) => `text-base py-1 ${isActive ? 'text-clay font-medium' : 'text-ink/80'}`}
              >
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="text-base py-1 text-ink/80">প্রোফাইল</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="text-base py-1 text-ink/80">অ্যাডমিন</Link>
                )}
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
