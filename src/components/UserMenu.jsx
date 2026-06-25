import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  if (!user) {
    return (
      <Link
        to="/login"
        aria-label={t('userMenu.loginAria')}
        className="tap-tight inline-flex items-center justify-center text-ink/70 hover:text-clay transition-colors"
      >
        <User size={20} />
      </Link>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="tap-tight inline-flex items-center gap-1.5 text-ink/70 hover:text-clay transition-colors"
        aria-label={t('userMenu.menuAria')}
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-stone-dark" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-clay/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-clay leading-none">{user.name?.charAt(0)?.toUpperCase()}</span>
          </div>
        )}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-sand border border-stone-dark rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-dark">
            <p className="text-sm font-semibold text-ink truncate">{user.name}</p>
            <p className="text-xs text-ink/50 truncate">{user.email || user.phone}</p>
            {user.role === 'admin' && (
              <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide bg-clay/15 text-clay px-2 py-0.5 rounded-full">{t('userMenu.admin')}</span>
            )}
          </div>
          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink/80 hover:bg-stone hover:text-ink transition-colors"
            >
              <Settings size={15} /> {t('userMenu.profileInfo')}
            </Link>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink/80 hover:bg-stone hover:text-ink transition-colors"
              >
                <LayoutDashboard size={15} /> {t('userMenu.adminPanel')}
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="tap-tight flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut size={15} /> {t('userMenu.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
