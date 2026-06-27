import React, { useEffect, useState } from 'react'
import { Users, Mail, Phone, Calendar, ShieldCheck, Chrome, Facebook, UserCircle, Search } from 'lucide-react'
import { api } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function AuthBadge({ user }) {
  const { t } = useLanguage()
  if (user.googleId)   return <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600"><Chrome size={10}/> Google</span>
  if (user.facebookId) return <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600"><Facebook size={10}/> Facebook</span>
  if (user.phone && !user.email) return <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600"><Phone size={10}/> OTP</span>
  return <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone text-ink/50"><Mail size={10}/> {t('admin.authEmail')}</span>
}

function Avatar({ user, size = 'md' }) {
  const dim = size === 'lg' ? 'w-11 h-11 text-base' : 'w-9 h-9 text-sm'
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        referrerPolicy="no-referrer"
        className={`${dim} rounded-full object-cover shrink-0 ring-2 ring-sand`}
      />
    )
  }
  const initials = user.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  const colors = ['bg-clay/20 text-clay', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-amber-100 text-amber-600']
  const color = colors[(user.name?.charCodeAt(0) || 0) % colors.length]
  return (
    <div className={`${dim} rounded-full ${color} flex items-center justify-center font-bold shrink-0 ring-2 ring-sand`}>
      {initials}
    </div>
  )
}

export default function AdminCustomers() {
  const { t } = useLanguage()
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all') // all | google | facebook | email | otp

  useEffect(() => {
    api.auth.users()
      .then(data => setUsers(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)

    const matchFilter =
      filter === 'all'      ? true :
      filter === 'google'   ? !!u.googleId :
      filter === 'facebook' ? !!u.facebookId :
      filter === 'otp'      ? (!!u.phone && !u.email && !u.googleId && !u.facebookId) :
      filter === 'email'    ? (!!u.email && !u.googleId && !u.facebookId) : true

    return matchSearch && matchFilter
  })

  const counts = {
    all:      users.length,
    google:   users.filter(u => u.googleId).length,
    facebook: users.filter(u => u.facebookId).length,
    otp:      users.filter(u => u.phone && !u.email && !u.googleId && !u.facebookId).length,
    email:    users.filter(u => u.email && !u.googleId && !u.facebookId).length,
  }

  const tabs = [
    { key: 'all',      label: t('admin.statusAll') },
    { key: 'google',   label: 'Google' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'email',    label: t('admin.authEmail') },
    { key: 'otp',      label: 'OTP' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-ink mb-1">{t('admin.usersTitle')}</h1>
          <p className="text-ink/60 text-sm">{t('admin.totalUsersDesc', users.length)}</p>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.searchUsersPlaceholder')}
            className="pl-8 pr-4 py-2 bg-sand border border-stone-dark rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-clay/40"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filter === tab.key ? 'bg-ink text-sand' : 'bg-stone text-ink/60 hover:bg-stone-dark'
            }`}>
            {tab.label}
            <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${filter === tab.key ? 'bg-sand/20 text-sand' : 'bg-stone-dark text-ink/40'}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="animate-pulse">
          {/* Desktop table skeleton */}
          <div className="hidden md:block bg-sand rounded-xl border border-stone-dark overflow-hidden">
            <div className="flex items-center gap-6 px-4 py-3 bg-stone/50 border-b border-stone-dark">
              <div className="h-3 w-24 bg-stone-dark/60 rounded" />
              <div className="h-3 w-20 bg-stone-dark/60 rounded" />
              <div className="h-3 w-24 bg-stone-dark/60 rounded" />
              <div className="h-3 w-12 bg-stone-dark/60 rounded" />
              <div className="h-3 w-20 bg-stone-dark/60 rounded" />
            </div>
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 px-4 py-3.5 border-t border-stone-dark">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-9 h-9 rounded-full bg-stone shrink-0" />
                  <div>
                    <div className="h-4 w-28 bg-stone rounded mb-1.5" />
                    <div className="h-3 w-36 bg-stone rounded" />
                  </div>
                </div>
                <div>
                  <div className="h-3 w-32 bg-stone rounded mb-1.5" />
                  <div className="h-3 w-24 bg-stone rounded" />
                </div>
                <div className="h-5 w-16 bg-stone rounded-full" />
                <div className="h-5 w-14 bg-stone rounded-full" />
                <div className="h-3 w-20 bg-stone rounded" />
              </div>
            ))}
          </div>
          {/* Mobile card skeleton */}
          <div className="md:hidden space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-sand rounded-xl border border-stone-dark p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-stone shrink-0" />
                  <div>
                    <div className="h-4 w-28 bg-stone rounded mb-1.5" />
                    <div className="h-3 w-20 bg-stone rounded" />
                  </div>
                </div>
                <div className="h-3 w-full bg-stone rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-sand rounded-xl border border-stone-dark overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone/50 text-left text-ink/60 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">{t('admin.userCol')}</th>
                  <th className="px-4 py-3">{t('admin.contactCol')}</th>
                  <th className="px-4 py-3">{t('admin.loginMethodCol')}</th>
                  <th className="px-4 py-3">{t('admin.roleCol')}</th>
                  <th className="px-4 py-3">{t('admin.joinedDateCol')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} className="border-t border-stone-dark hover:bg-stone/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} />
                        <div>
                          <p className="text-ink font-medium">{u.name}</p>
                          {u.address && <p className="text-ink/40 text-xs truncate max-w-[160px]">{u.address}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.email && <p className="text-ink/70 text-xs">{u.email}</p>}
                      {u.phone && <p className="text-ink/50 text-xs font-mono">{u.phone}</p>}
                    </td>
                    <td className="px-4 py-3"><AuthBadge user={u} /></td>
                    <td className="px-4 py-3">
                      {u.role === 'admin'
                        ? <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-clay/15 text-clay w-fit"><ShieldCheck size={10}/> {t('admin.roleAdmin')}</span>
                        : <span className="text-xs text-ink/40">{t('admin.roleCustomer')}</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-ink/50 text-xs">
                      <div className="flex items-center gap-1"><Calendar size={11}/>{formatDate(u.createdAt)}</div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-ink/40">{t('admin.noUsersFound')}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(u => (
              <div key={u._id} className="bg-sand rounded-xl border border-stone-dark p-4 flex items-start gap-3">
                <Avatar user={u} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-ink font-medium">{u.name}</p>
                    {u.role === 'admin' && <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-clay/15 text-clay"><ShieldCheck size={10}/> {t('admin.roleAdmin')}</span>}
                  </div>
                  {u.email && <p className="text-ink/60 text-xs truncate">{u.email}</p>}
                  {u.phone && <p className="text-ink/50 text-xs font-mono">{u.phone}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <AuthBadge user={u} />
                    <span className="text-ink/40 text-[10px]">{formatDate(u.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-ink/40 py-10">{t('admin.noUsersFound')}</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
