import React, { useEffect } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, ArrowLeft, LogOut, Tag, Loader2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminLayout() {
  const { t } = useLanguage()
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // loading শেষ হওয়ার পরেই check করব — আগে করলে flicker হয়
    if (!loading && !localStorage.getItem('adminToken')) {
      navigate('/login', { replace: true })
    }
  }, [loading, navigate])

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  const links = [
    { to: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: t('admin.products'), icon: Package },
    { to: '/admin/orders', label: t('admin.orders'), icon: ShoppingCart },
    { to: '/admin/customers', label: t('admin.customers'), icon: Users },
    { to: '/admin/categories', label: t('admin.categories'), icon: Tag },
    { to: '/admin/settings', label: t('admin.siteSettings'), icon: Settings },
  ]

  // Auth লোড হওয়ার আগে loading spinner দেখাও — এটাই reload-এ error ঠেকায়
  if (loading) {
    return (
      <div className="min-h-screen bg-stone flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-clay" />
      </div>
    )
  }

  // Token নেই — useEffect navigate করবে, এখানে কিছু render করব না
  if (!localStorage.getItem('adminToken')) return null

  return (
    <div className="min-h-screen bg-stone flex">
      <aside className="w-60 bg-ink text-sand shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-sand/10">
          <Link to="/" className="font-display text-xl">{t('brand.name')}</Link>
          <p className="text-xs text-sand/40 mt-0.5">{t('admin.panel')}</p>
        </div>

        {/* Admin user info */}
        {user && (
          <div className="px-4 py-3 border-b border-sand/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-clay/30 flex items-center justify-center shrink-0 overflow-hidden">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                : <span className="text-xs font-bold text-clay">{user.name?.charAt(0)?.toUpperCase()}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-sand truncate">{user.name}</p>
              <p className="text-[10px] text-sand/40 truncate">{user.email || user.phone}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${isActive ? 'bg-clay text-sand' : 'text-sand/70 hover:bg-sand/10'}`
              }
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-sand/10 space-y-2">
          <Link to="/" className="flex items-center gap-2 text-sm text-sand/60 hover:text-sand">
            <ArrowLeft size={15} /> {t('admin.backToShop')}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-sand/60 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={15} /> {t('admin.logout')}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden bg-ink text-sand p-4 flex items-center justify-between">
          <span className="font-display text-lg">{t('admin.panel')}</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-sand/70">{t('admin.backToShop')}</Link>
            <button onClick={handleLogout} className="text-sm text-sand/70 hover:text-red-400">{t('admin.logout')}</button>
          </div>
        </div>
        <div className="p-5 sm:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
