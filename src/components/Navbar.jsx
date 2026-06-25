import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, Search, Menu, X, Languages, LogOut, ChevronDown, Sparkles, TrendingUp, Tag, Info } from 'lucide-react'
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

  const staticLinks = [
    { to: '/shop', label: t('nav.shop'), end: true },
    { to: '/shop?badge=new', label: t('nav.newArrivals'), icon: Sparkles },
    { to: '/shop?badge=bestseller', label: t('nav.bestSellers'), icon: TrendingUp },
    { to: '/shop?badge=sale', label: t('nav.deals'), icon: Tag },
    { to: '/about', label: t('nav.about'), icon: Info },
  ]

  return (
    <>
      <style>{`
        .nav-pill {
          position: relative;
          font-size: 0.8rem;
          letter-spacing: 0.02em;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .nav-pill::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 1.5px;
          background: #C75D3C;
          border-radius: 2px;
          transform: scaleX(0);
          transition: transform 0.25s cubic-bezier(0.22,1,0.36,1);
          transform-origin: left;
        }
        .nav-pill:hover::after,
        .nav-pill.active::after { transform: scaleX(1); }
        .nav-pill.active { color: #C75D3C; font-weight: 500; }

        .cat-dropdown {
          animation: dropIn 0.18s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .nav-badge-new  { background: #d4e8c2; color: #3a6b1e; }
        .nav-badge-hot  { background: #fde8d0; color: #b94a1a; }
        .nav-badge-sale { background: #fde8d0; color: #b94a1a; }
      `}</style>

      <header className="sticky top-0 z-50 bg-sand/95 backdrop-blur-sm border-b border-stone-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <span className="font-display text-2xl lg:text-3xl font-600 text-ink tracking-tight">
                {t('brand.name')}
              </span>
              <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-clay group-hover:scale-150 transition-transform" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-7 mx-6">
              {/* Shop */}
              <NavLink to="/shop" end className={({ isActive }) =>
                `nav-pill text-ink/80 hover:text-clay ${isActive ? 'active' : ''}`
              }>
                {t('nav.shop')}
              </NavLink>

              {/* New Arrivals */}
              <NavLink to="/shop?badge=new" className={({ isActive }) =>
                `nav-pill flex items-center gap-1 text-ink/80 hover:text-clay ${isActive ? 'active' : ''}`
              }>
                <Sparkles size={12} className="text-emerald-500" />
                {t('nav.newArrivals')}
                <span className="nav-badge-new text-[9px] font-semibold px-1.5 py-0.5 rounded-full ml-0.5">NEW</span>
              </NavLink>

              {/* Best Sellers */}
              <NavLink to="/shop?badge=bestseller" className={({ isActive }) =>
                `nav-pill flex items-center gap-1 text-ink/80 hover:text-clay ${isActive ? 'active' : ''}`
              }>
                <TrendingUp size={12} className="text-amber-500" />
                {t('nav.bestSellers')}
              </NavLink>

              {/* Deals */}
              <NavLink to="/shop?badge=sale" className={({ isActive }) =>
                `nav-pill flex items-center gap-1 text-ink/80 hover:text-clay ${isActive ? 'active' : ''}`
              }>
                <Tag size={12} className="text-clay" />
                {t('nav.deals')}
                <span className="nav-badge-sale text-[9px] font-semibold px-1.5 py-0.5 rounded-full ml-0.5">🔥</span>
              </NavLink>

              {/* Categories dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCatOpen((v) => !v)}
                  className={`nav-pill flex items-center gap-1 text-ink/80 hover:text-clay ${catOpen ? 'active' : ''}`}
                >
                  {lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
                  <ChevronDown size={13} className={`transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
                </button>

                {catOpen && (
                  <div className="cat-dropdown absolute top-full left-0 mt-3 w-48 bg-sand border border-stone-dark rounded-xl shadow-lg py-2 z-50">
                    {categories.map((cat) => (
                      <NavLink
                        key={cat.key}
                        to={`/shop?category=${cat.key}`}
                        onClick={() => setCatOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-stone hover:text-clay ${
                            isActive ? 'text-clay font-medium bg-stone/50' : 'text-ink/80'
                          }`
                        }
                      >
                        {cat.icon && <span className="text-base">{cat.icon}</span>}
                        {lang === 'bn' ? cat.name.bn : cat.name.en}
                      </NavLink>
                    ))}
                    {categories.length === 0 && (
                      <p className="px-4 py-2 text-sm text-ink/30">
                        {lang === 'bn' ? 'কোনো ক্যাটাগরি নেই' : 'No categories'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* About */}
              <NavLink to="/about" className={({ isActive }) =>
                `nav-pill text-ink/80 hover:text-clay ${isActive ? 'active' : ''}`
              }>
                {t('nav.about')}
              </NavLink>
            </nav>

            {/* Desktop right */}
            <div className="hidden lg:flex items-center gap-4 shrink-0">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('nav.search')}
                  className="w-40 bg-stone/60 border border-stone-dark rounded-full px-4 py-1.5 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay placeholder:text-ink/40"
                />
                <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/50 hover:text-clay">
                  <Search size={16} />
                </button>
              </form>

              <button onClick={toggleLang} className="tap-tight inline-flex items-center gap-1 text-xs font-medium text-ink/70 hover:text-clay transition-colors border border-stone-dark rounded-full px-2.5 py-1">
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

            {/* Mobile right icons */}
            <div className="flex items-center gap-4 lg:hidden">
              <button onClick={toggleLang} className="tap-tight inline-flex items-center gap-1 text-xs font-medium text-ink/70 border border-stone-dark rounded-full px-2 py-1">
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
          <div className="lg:hidden mobile-nav-open border-t border-stone-dark bg-sand px-4 sm:px-6 py-5 space-y-1">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full bg-stone/60 border border-stone-dark rounded-full px-4 py-2 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-clay/40"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50">
                <Search size={16} />
              </button>
            </form>

            <nav className="flex flex-col">
              <NavLink to="/shop" end onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center py-3 border-b border-stone-dark/40 text-base ${isActive ? 'text-clay font-medium' : 'text-ink/80'}`}>
                {t('nav.shop')}
              </NavLink>
              <NavLink to="/shop?badge=new" onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center gap-2 py-3 border-b border-stone-dark/40 text-base ${isActive ? 'text-clay font-medium' : 'text-ink/80'}`}>
                <Sparkles size={15} className="text-emerald-500" /> {t('nav.newArrivals')}
              </NavLink>
              <NavLink to="/shop?badge=bestseller" onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center gap-2 py-3 border-b border-stone-dark/40 text-base ${isActive ? 'text-clay font-medium' : 'text-ink/80'}`}>
                <TrendingUp size={15} className="text-amber-500" /> {t('nav.bestSellers')}
              </NavLink>
              <NavLink to="/shop?badge=sale" onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center gap-2 py-3 border-b border-stone-dark/40 text-base ${isActive ? 'text-clay font-medium' : 'text-ink/80'}`}>
                <Tag size={15} className="text-clay" /> {t('nav.deals')} 🔥
              </NavLink>

              {/* Mobile categories */}
              <p className="text-[10px] font-semibold text-ink/30 uppercase tracking-widest pt-4 pb-2">
                {lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
              </p>
              {categories.map((cat) => (
                <NavLink key={cat.key} to={`/shop?category=${cat.key}`} onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 py-2.5 border-b border-stone-dark/30 text-sm pl-2 ${isActive ? 'text-clay font-medium' : 'text-ink/70'}`
                  }>
                  {cat.icon && <span>{cat.icon}</span>}
                  {lang === 'bn' ? cat.name.bn : cat.name.en}
                </NavLink>
              ))}

              <NavLink to="/about" onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center gap-2 py-3 border-b border-stone-dark/40 text-base mt-1 ${isActive ? 'text-clay font-medium' : 'text-ink/80'}`}>
                <Info size={15} /> {t('nav.about')}
              </NavLink>

              {user ? (
                <>
                  <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center py-3 border-b border-stone-dark/40 text-base text-ink/80">{t('nav.profile')}</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center py-3 border-b border-stone-dark/40 text-base text-ink/80">{t('userMenu.admin')}</Link>
                  )}
                  <button onClick={handleMobileLogout} className="flex items-center gap-2 py-3 text-base text-red-500 w-full">
                    <LogOut size={16} /> {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="flex items-center py-3 text-base text-ink/80">
                  {t('nav.login')}
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
