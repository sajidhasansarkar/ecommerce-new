import React, { useState, useEffect } from 'react'
import {
  Plus, Trash2, Save, Loader2, CheckCircle2,
  Tag, ToggleLeft, ToggleRight, Calendar, Users, AlertCircle, Copy, Check
} from 'lucide-react'
import { api } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'

/* ── Switch ── */
function Switch({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      style={{
        position: 'relative', width: 48, height: 24, borderRadius: 999,
        border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
        background: enabled ? 'linear-gradient(135deg,#C75D3C,#e07a5f)' : '#d4ccc4',
        boxShadow: enabled
          ? '0 0 0 3px rgba(199,93,60,0.18)'
          : 'inset 0 1px 3px rgba(0,0,0,0.15)',
        transition: 'background 0.25s, box-shadow 0.25s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3,
        left: enabled ? 'calc(100% - 21px)' : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
        transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </button>
  )
}

/* ── Copy button ── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button
      onClick={handleCopy}
      title="কপি করুন"
      className="p-1.5 rounded-lg text-ink/30 hover:text-clay hover:bg-clay/8 transition-colors"
    >
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  )
}

/* ── Promo Card (view mode) ── */
function PromoCard({ promo, onEdit, onDelete, onToggle, t }) {
  const isExpired = promo.expiry && new Date(promo.expiry) < new Date()
  const isExhausted = promo.maxUses > 0 && promo.usedCount >= promo.maxUses
  const isActive = promo.enabled && !isExpired && !isExhausted

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      isActive
        ? 'border-clay/25 bg-clay/3 shadow-sm'
        : 'border-stone-dark bg-stone/30 opacity-70'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-dark/40 bg-stone/20">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Tag size={14} className={isActive ? 'text-clay' : 'text-ink/30'} />
          <span className="font-mono font-bold text-base tracking-widest text-ink">{promo.code}</span>
          <CopyButton text={promo.code} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isExpired && <span className="text-[11px] text-red-500 bg-red-100 px-2 py-0.5 rounded-full font-medium">Expired</span>}
          {isExhausted && !isExpired && <span className="text-[11px] text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full font-medium">Limit শেষ</span>}
          {isActive && <span className="text-[11px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">Active</span>}
          <Switch enabled={promo.enabled} onChange={() => onToggle(promo)} />
          <button onClick={() => onEdit(promo)} className="px-3 py-1 text-xs text-ink/60 hover:text-clay border border-stone-dark hover:border-clay/40 rounded-lg transition-colors">
            {t('admin.promoEdit')}
          </button>
          <button onClick={() => onDelete(promo._id)} className="p-1.5 text-ink/25 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex flex-wrap items-center gap-4 text-sm">
        {/* Discount value */}
        <div className="flex items-center gap-1.5">
          <span className={`text-xl font-bold ${isActive ? 'text-clay' : 'text-ink/40'}`}>
            {promo.type === 'percent' ? `${promo.value}%` : `৳${promo.value}`}
          </span>
          <span className="text-xs text-ink/50">
            {promo.type === 'percent' ? '%' : '৳'} ছাড়
          </span>
        </div>

        <div className="w-px h-8 bg-stone-dark" />

        {/* Details */}
        <div className="flex flex-wrap gap-3">
          {promo.minOrder > 0 && (
            <span className="flex items-center gap-1 text-xs text-ink/60 bg-stone/60 border border-stone-dark px-2.5 py-1 rounded-lg">
              {t('admin.promoMinOrderCol')}: ৳{promo.minOrder}
            </span>
          )}
          {promo.maxUses > 0 && (
            <span className="flex items-center gap-1 text-xs text-ink/60 bg-stone/60 border border-stone-dark px-2.5 py-1 rounded-lg">
              <Users size={11} /> {promo.usedCount}/{promo.maxUses}
            </span>
          )}
          {promo.maxUses === 0 && (
            <span className="flex items-center gap-1 text-xs text-ink/60 bg-stone/60 border border-stone-dark px-2.5 py-1 rounded-lg">
              <Users size={11} /> {promo.usedCount} ({t('admin.promoNoLimit')})
            </span>
          )}
          {promo.expiry && (
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${
              isExpired ? 'text-red-500 bg-red-50 border-red-200' : 'text-ink/60 bg-stone/60 border-stone-dark'
            }`}>
              <Calendar size={11} />
              {new Date(promo.expiry).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {promo.label && <span className="text-xs text-ink/40 italic">{promo.label}</span>}
        </div>
      </div>
    </div>
  )
}

/* ── Create / Edit Form ── */
function PromoForm({ initial, onSave, onCancel, saving, t }) {
  const isEdit = !!initial?._id
  const blank = { code: '', label: '', type: 'percent', value: 10, minOrder: 0, maxUses: 0, expiry: '', enabled: true }
  const [form, setForm] = useState(initial ? {
    code: initial.code || '',
    label: initial.label || '',
    type: initial.type || 'percent',
    value: initial.value ?? 10,
    minOrder: initial.minOrder ?? 0,
    maxUses: initial.maxUses ?? 0,
    expiry: initial.expiry || '',
    enabled: initial.enabled !== false,
  } : blank)
  const [err, setErr] = useState({})

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErr(e => ({ ...e, [k]: '' })) }

  function validate() {
    const e = {}
    if (!form.code.trim()) e.code = 'কোড দেওয়া আবশ্যক'
    if (!/^[A-Z0-9_-]{2,20}$/.test(form.code.trim())) e.code = 'শুধু A-Z, 0-9, -, _ ব্যবহার করুন (২-২০ অক্ষর)'
    if (!form.value || form.value <= 0) e.value = 'ডিসকাউন্ট পরিমাণ দিন'
    if (form.type === 'percent' && form.value > 100) e.value = 'সর্বোচ্চ ১০০%'
    return e
  }

  function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErr(e); return }
    onSave({ ...form, code: form.code.toUpperCase().trim() })
  }

  return (
    <div className="rounded-2xl border-2 border-clay/30 bg-clay/3 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-clay/20 bg-clay/5">
        <Tag size={16} className="text-clay" />
        <h3 className="font-semibold text-sm text-ink">{isEdit ? t('admin.promoEditTitle') : t('admin.promoAddTitle')}</h3>
      </div>
      <div className="p-5 space-y-4">

        {/* Code + Label */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">{t('admin.promoCodeLabel')} *</label>
            <input
              value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
              placeholder="EID2025"
              maxLength={20}
              className={`w-full bg-sand border rounded-xl px-3.5 py-2.5 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-clay/30 ${err.code ? 'border-clay' : 'border-stone-dark'}`}
            />
            {err.code && <p className="text-xs text-clay mt-1">{err.code}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">{t('admin.promoLabelField')}</label>
            <input
              value={form.label}
              onChange={e => set('label', e.target.value)}
              placeholder={t('admin.promoLabelPlaceholder')}
              className="w-full bg-sand border border-stone-dark rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/30"
            />
          </div>
        </div>

        {/* Type + Value */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">{t('admin.promoTypeLabel')}</label>
            <div className="flex rounded-xl border border-stone-dark overflow-hidden bg-stone/40">
              {[{ v: 'percent', label: t('admin.promoTypePercent') }, { v: 'flat', label: t('admin.promoTypeFlat') }].map(opt => (
                <button
                  key={opt.v} type="button"
                  onClick={() => set('type', opt.v)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    form.type === opt.v
                      ? 'bg-clay text-sand'
                      : 'text-ink/60 hover:text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">{t('admin.promoValueLabel')} *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 text-sm font-medium pointer-events-none">
                {form.type === 'percent' ? '%' : '৳'}
              </span>
              <input
                type="number" min={1} max={form.type === 'percent' ? 100 : undefined}
                value={form.value}
                onChange={e => set('value', Number(e.target.value))}
                className={`w-full bg-sand border rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/30 ${err.value ? 'border-clay' : 'border-stone-dark'}`}
              />
            </div>
            {err.value && <p className="text-xs text-clay mt-1">{err.value}</p>}
          </div>
        </div>

        {/* Min order + Max uses */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">{t('admin.promoMinOrderLabel')}</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 text-sm pointer-events-none">৳</span>
              <input
                type="number" min={0} value={form.minOrder}
                onChange={e => set('minOrder', Number(e.target.value))}
                placeholder="0 = যেকোনো পরিমাণ"
                className="w-full bg-sand border border-stone-dark rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/30"
              />
            </div>
            <p className="text-xs text-ink/40 mt-1">০ রাখলে সব অর্ডারে কাজ করবে</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">{t('admin.promoMaxUsesLabel')}</label>
            <div className="relative">
              <Users size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
              <input
                type="number" min={0} value={form.maxUses}
                onChange={e => set('maxUses', Number(e.target.value))}
                placeholder="0 = সীমাহীন"
                className="w-full bg-sand border border-stone-dark rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/30"
              />
            </div>
            <p className="text-xs text-ink/40 mt-1">০ রাখলে সীমাহীনভাবে ব্যবহার করা যাবে</p>
          </div>
        </div>

        {/* Expiry + Enable */}
        <div className="grid sm:grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">{t('admin.promoExpiryLabel')}</label>
            <div className="relative">
              <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
              <input
                type="date" value={form.expiry}
                onChange={e => set('expiry', e.target.value)}
                className="w-full bg-sand border border-stone-dark rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/30"
              />
            </div>
            <p className="text-xs text-ink/40 mt-1">খালি রাখলে মেয়াদ শেষ হবে না</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-stone/40 rounded-xl border border-stone-dark">
            <div>
              <p className="text-sm font-medium text-ink">{t('admin.promoStatusLabel')}</p>
              <p className="text-xs text-ink/40">বন্ধ করলে কাস্টমার ব্যবহার করতে পারবে না</p>
            </div>
            <Switch enabled={form.enabled} onChange={v => set('enabled', v)} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-clay text-sand px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-clay-dark disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? t('admin.promoSaving') : t('admin.promoSave')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm text-ink/60 hover:text-ink border border-stone-dark hover:border-ink/30 transition-colors"
          >
            {t('admin.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ── */
export default function AdminPromoCodes() {
  const { t } = useLanguage()
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [pageError, setPageError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  function flash(msg) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  async function loadCodes() {
    try {
      const data = await api.promo.list()
      setCodes(data)
    } catch (e) {
      setPageError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCodes() }, [])

  async function handleSave(form) {
    setSaving(true)
    setPageError('')
    try {
      if (editTarget) {
        const updated = await api.promo.update(editTarget._id, form)
        setCodes(prev => prev.map(c => c._id === updated._id ? updated : c))
        flash('প্রোমো কোড আপডেট হয়েছে!')
      } else {
        const created = await api.promo.create(form)
        setCodes(prev => [created, ...prev])
        flash('নতুন প্রোমো কোড তৈরি হয়েছে!')
      }
      setShowForm(false)
      setEditTarget(null)
    } catch (e) {
      setPageError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('এই প্রোমো কোডটি ডিলিট করবেন?')) return
    try {
      await api.promo.delete(id)
      setCodes(prev => prev.filter(c => c._id !== id))
      flash('ডিলিট হয়েছে।')
    } catch (e) {
      setPageError(e.message)
    }
  }

  async function handleToggle(promo) {
    try {
      const updated = await api.promo.update(promo._id, { enabled: !promo.enabled })
      setCodes(prev => prev.map(c => c._id === updated._id ? updated : c))
    } catch (e) {
      setPageError(e.message)
    }
  }

  function handleEdit(promo) {
    setEditTarget(promo)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancel() {
    setShowForm(false)
    setEditTarget(null)
  }

  const activeCount = codes.filter(c => {
    const notExpired = !c.expiry || new Date(c.expiry) >= new Date()
    const withinLimit = c.maxUses === 0 || c.usedCount < c.maxUses
    return c.enabled && notExpired && withinLimit
  }).length

  if (loading) return (
    <div className="max-w-3xl animate-pulse space-y-4">
      <div className="h-8 w-48 bg-stone rounded-lg" />
      <div className="h-4 w-72 bg-stone rounded" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-stone-dark overflow-hidden">
          <div className="h-12 bg-stone/40 border-b border-stone-dark" />
          <div className="p-4 h-16 bg-stone/20" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-ink">{t('admin.promoCodeTitle')}</h1>
          <p className="text-ink/50 text-sm mt-1">{t('admin.promoCodeDesc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 bg-stone rounded-xl border border-stone-dark">
            <p className="text-xl font-bold text-clay">{activeCount}</p>
            <p className="text-[11px] text-ink/40">Active</p>
          </div>
          <button
            onClick={() => { setEditTarget(null); setShowForm(v => !v) }}
            className="flex items-center gap-2 bg-clay text-sand px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-clay-dark transition-colors"
          >
            <Plus size={15} />
            {t('admin.addPromoCode')}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {pageError && (
        <div className="flex items-center gap-2 text-clay text-sm mb-4 bg-clay/10 border border-clay/20 px-4 py-3 rounded-xl">
          <AlertCircle size={15} className="shrink-0" /> {pageError}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 text-green-700 text-sm mb-4 bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
          <CheckCircle2 size={15} className="shrink-0" /> {successMsg}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6">
          <PromoForm
            initial={editTarget}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
            t={t}
          />
        </div>
      )}

      {/* List */}
      {codes.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-stone-dark rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-stone/60 flex items-center justify-center mx-auto mb-3">
            <Tag size={24} className="text-ink/25" />
          </div>
          <p className="text-sm font-medium text-ink/50">{t('admin.promoNoCodes')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map(promo => (
            <PromoCard
              key={promo._id}
              promo={promo}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Usage tip */}
      {codes.length > 0 && (
        <div className="mt-6 p-4 bg-stone/60 border border-stone-dark rounded-xl text-xs text-ink/50 space-y-1">
          <p className="font-medium text-ink/70">💡 ব্যবহারের নিয়ম</p>
          <p>• কাস্টমার চেকআউটের সময় প্রোমো কোড বক্সে কোডটি লিখে Apply করবে।</p>
          <p>• প্রতিটি অর্ডারে একটিই প্রোমো কোড ব্যবহার করা যাবে।</p>
          <p>• কোড apply হলে সাথে সাথে ডিসকাউন্ট বাদ দিয়ে মোট দেখাবে।</p>
        </div>
      )}
    </div>
  )
}
