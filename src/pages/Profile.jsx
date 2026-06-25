import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { api } from '../api.js'
import { User, Phone, Mail, MapPin, Lock, Check, ArrowLeft } from 'lucide-react'

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!user) {
    navigate('/login')
    return null
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
    setSuccess(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (form.password && form.password !== form.confirmPassword) {
      setError(t('profile.errPasswordMismatch'))
      return
    }
    if (!form.name.trim()) {
      setError(t('profile.errName'))
      return
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
    }
    if (form.password) payload.password = form.password

    setLoading(true)
    try {
      const data = await api.auth.updateProfile(payload)
      updateUser(data)
      setSuccess(true)
      setForm(f => ({ ...f, password: '', confirmPassword: '' }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 lg:py-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-ink/50 hover:text-clay mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> {t('profile.back')}
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-clay/20 flex items-center justify-center shrink-0 overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-clay">{user.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl text-ink">{user.name}</h1>
          <p className="text-sm text-ink/50">{user.email || user.phone}</p>
          {user.role === 'admin' && (
            <span className="inline-block mt-1 text-xs font-semibold bg-clay/15 text-clay px-2 py-0.5 rounded-full">{t('profile.admin')}</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <h2 className="text-sm font-semibold text-ink/60 uppercase tracking-wider border-b border-stone-dark pb-2">{t('profile.personalInfo')}</h2>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5 flex items-center gap-1.5">
            <User size={13} /> {t('profile.fullName')}
          </label>
          <input
            name="name" value={form.name} onChange={handleChange}
            className="w-full bg-sand border border-stone-dark rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5 flex items-center gap-1.5">
            <Mail size={13} /> {t('profile.email')}
          </label>
          <input
            name="email" type="email" value={form.email} onChange={handleChange}
            placeholder={t('profile.emailPlaceholder')}
            className="w-full bg-sand border border-stone-dark rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5 flex items-center gap-1.5">
            <Phone size={13} /> {t('profile.phone')}
          </label>
          <input
            name="phone" type="tel" value={form.phone} onChange={handleChange}
            placeholder="01XXXXXXXXX"
            className="w-full bg-sand border border-stone-dark rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5 flex items-center gap-1.5">
            <MapPin size={13} /> {t('profile.address')}
          </label>
          <textarea
            name="address" value={form.address} onChange={handleChange}
            rows={2} placeholder={t('profile.addressPlaceholder')}
            className="w-full bg-sand border border-stone-dark rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40 resize-none"
          />
        </div>

        <h2 className="text-sm font-semibold text-ink/60 uppercase tracking-wider border-b border-stone-dark pb-2 pt-2">{t('profile.changePassword')}</h2>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5 flex items-center gap-1.5">
            <Lock size={13} /> {t('profile.newPassword')} <span className="text-ink/40 font-normal">{t('profile.optional')}</span>
          </label>
          <input
            name="password" type="password" value={form.password} onChange={handleChange}
            placeholder="••••••••"
            className="w-full bg-sand border border-stone-dark rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
          />
        </div>

        {form.password && (
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">{t('profile.confirmPassword')}</label>
            <input
              name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-sand border border-stone-dark rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
            />
          </div>
        )}

        {error && <p className="text-sm text-clay">{error}</p>}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
            <Check size={15} /> {t('profile.saveSuccess')}
          </div>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full bg-ink text-sand py-3 rounded-lg font-medium hover:bg-clay transition-colors disabled:opacity-60"
        >
          {loading ? t('profile.saving') : t('profile.saveChanges')}
        </button>
      </form>
    </div>
  )
}
