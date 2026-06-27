import React, { useState, useEffect, useRef } from 'react'
import {
  Loader2, Save, Plus, Trash2, CheckCircle2,
  Truck, Percent, Calendar, Package, ChevronDown, X
} from 'lucide-react'
import { api } from '../api.js'
import { useCategories } from '../context/CategoryContext.jsx'

/* ══════════════════════════════════════════
   Switch — standard small pill toggle
══════════════════════════════════════════ */
function Switch({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className={`relative shrink-0 inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 ${
        enabled ? 'bg-clay' : 'bg-stone-dark/60'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
        enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
      }`} />
    </button>
  )
}

/* Toggle row — label + sublabel + switch */
function Toggle({ enabled, onChange, label, sublabel }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {sublabel && <p className="text-xs text-ink/40 mt-0.5">{sublabel}</p>}
      </div>
      <Switch enabled={enabled} onChange={onChange} />
    </div>
  )
}

/* ══════════════════════════════════════════
   Section Card
══════════════════════════════════════════ */
function SectionCard({ icon: Icon, title, desc, children }) {
  return (
    <div className="rounded-2xl border border-stone-dark bg-sand overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-dark bg-stone/40">
        <span className="w-9 h-9 rounded-xl bg-clay text-sand flex items-center justify-center shrink-0">
          <Icon size={17} />
        </span>
        <div>
          <p className="font-semibold text-sm text-ink">{title}</p>
          {desc && <p className="text-xs text-ink/40 mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

/* ══════════════════════════════════════════
   Number Input with prefix symbol
══════════════════════════════════════════ */
function AmountInput({ symbol, value, onChange, min = 0, max, placeholder, disabled }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 text-sm font-medium pointer-events-none select-none">
        {symbol}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-stone/40 border border-stone-dark rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay/50 disabled:opacity-40 transition"
      />
    </div>
  )
}

/* ══════════════════════════════════════════
   Category Dropdown (auto-suggest from context)
══════════════════════════════════════════ */
function CategorySelect({ value, onChange, categories }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selected = categories.find(c => c.key === value)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 bg-stone/40 border border-stone-dark rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay/50 transition text-left"
      >
        <span className={selected ? 'text-ink' : 'text-ink/40'}>
          {selected
            ? <span className="flex items-center gap-2">{selected.icon && <span>{selected.icon}</span>}{selected.name.en}</span>
            : 'Select category…'}
        </span>
        <ChevronDown size={15} className={`text-ink/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-sand border border-stone-dark rounded-xl shadow-lg overflow-hidden">
          {categories.length === 0 ? (
            <p className="text-sm text-ink/40 px-4 py-3">No categories found</p>
          ) : (
            categories.map(cat => (
              <button
                key={cat.key}
                type="button"
                onClick={() => { onChange(cat.key); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-clay/8 ${
                  cat.key === value ? 'bg-clay/10 text-clay font-medium' : 'text-ink'
                }`}
              >
                {cat.icon && <span className="text-base">{cat.icon}</span>}
                <span>{cat.name.en}</span>
                <span className="ml-auto text-[11px] text-ink/30 font-mono">{cat.key}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   Discount Rule Card
══════════════════════════════════════════ */
function DiscountRuleCard({ rule, onChange, onDelete, categories, index }) {
  const isExpired = rule.expiry && new Date(rule.expiry) < new Date()

  return (
    <div className={`rounded-xl border transition-all ${
      isExpired
        ? 'border-red-200 bg-red-50/50 opacity-70'
        : rule.enabled
          ? 'border-clay/30 bg-clay/3 shadow-sm'
          : 'border-stone-dark bg-stone/30'
    }`}>
      {/* Card header row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-stone-dark/40">
        <span className="w-6 h-6 rounded-full bg-stone-dark/40 flex items-center justify-center text-[11px] font-bold text-ink/50 shrink-0">
          {index + 1}
        </span>
        <input
          value={rule.label}
          onChange={e => onChange({ ...rule, label: e.target.value })}
          placeholder="Rule name (e.g. Eid Special Offer)"
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-ink placeholder:text-ink/30"
        />
        {isExpired && (
          <span className="text-[11px] text-red-500 bg-red-100 px-2 py-0.5 rounded-full font-medium shrink-0">
            Expired
          </span>
        )}
        <button
          onClick={onDelete}
          className="shrink-0 p-1.5 text-ink/25 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Card body */}
      <div className="px-4 py-4 space-y-4">
        {/* Row 1: Enable + Discount type + Value */}
        <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Discount type — smart toggle */}
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1.5">Discount Type</label>
              <div className="flex items-center gap-3 h-10">
                <span className={`text-sm font-medium transition-colors ${rule.type === 'percent' ? 'text-ink' : 'text-ink/35'}`}>% Off</span>
                <button
                  type="button"
                  onClick={() => onChange({ ...rule, type: rule.type === 'percent' ? 'flat' : 'percent' })}
                  aria-pressed={rule.type === 'flat'}
                  className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 ${
                    rule.type === 'flat' ? 'bg-clay' : 'bg-stone-dark/60'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    rule.type === 'flat' ? 'translate-x-[22px]' : 'translate-x-1'
                  }`} />
                </button>
                <span className={`text-sm font-medium transition-colors ${rule.type === 'flat' ? 'text-ink' : 'text-ink/35'}`}>৳ Off</span>
              </div>
            </div>

            {/* Value */}
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1.5">
                {rule.type === 'percent' ? 'Percentage (%)' : 'Amount (৳)'}
              </label>
              <AmountInput
                symbol={rule.type === 'percent' ? '%' : '৳'}
                value={rule.value}
                onChange={v => onChange({ ...rule, value: v })}
                min={0}
                max={rule.type === 'percent' ? 100 : undefined}
                placeholder="0"
              />
            </div>
          </div>

          {/* Enable toggle — right side */}
          <div className="pt-6">
            <Switch enabled={rule.enabled} onChange={v => onChange({ ...rule, enabled: v })} />
          </div>
        </div>

        {/* Row 2: Applies to + extra field + Expiry */}
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Scope */}
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1.5">Applies To</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: 'all',       label: 'All Products' },
                { value: 'category',  label: 'Category' },
                { value: 'minOrder',  label: 'Min Order' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...rule, scope: opt.value, categoryKey: '', minOrder: 0 })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    rule.scope === opt.value
                      ? 'bg-ink text-sand border-ink'
                      : 'bg-stone/40 text-ink/60 border-stone-dark hover:border-ink/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1.5">Expiry Date</label>
            <div className="relative">
              <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
              <input
                type="date"
                value={rule.expiry || ''}
                onChange={e => onChange({ ...rule, expiry: e.target.value })}
                className="w-full bg-stone/40 border border-stone-dark rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay/50 transition"
              />
            </div>
          </div>
        </div>

        {/* Category picker (conditional) */}
        {rule.scope === 'category' && (
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1.5">Select Category</label>
            <CategorySelect
              value={rule.categoryKey || ''}
              onChange={v => onChange({ ...rule, categoryKey: v })}
              categories={categories}
            />
          </div>
        )}

        {/* Min order amount (conditional) */}
        {rule.scope === 'minOrder' && (
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1.5">Minimum Order Amount</label>
            <AmountInput
              symbol="৳"
              value={rule.minOrder || 0}
              onChange={v => onChange({ ...rule, minOrder: v })}
              min={0}
              placeholder="0"
            />
            <p className="text-xs text-ink/40 mt-1">Discount applies when cart total is at least this amount</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   Main Page
══════════════════════════════════════════ */
export default function AdminPromotions() {
  const { categories } = useCategories()

  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')

  const [deliveryEnabled,       setDeliveryEnabled]       = useState(true)
  const [deliveryCharge,        setDeliveryCharge]        = useState(80)
  const [freeDeliveryEnabled,   setFreeDeliveryEnabled]   = useState(true)
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(1500)
  const [discountRules,         setDiscountRules]         = useState([])

  useEffect(() => {
    api.settings.get()
      .then(s => {
        const p = s.promotions || {}
        setDeliveryEnabled(p.deliveryEnabled ?? true)
        setDeliveryCharge(p.deliveryCharge ?? 80)
        setFreeDeliveryEnabled(p.freeDeliveryEnabled ?? true)
        setFreeDeliveryThreshold(p.freeDeliveryThreshold ?? 1500)
        setDiscountRules(p.discountRules || [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function addRule() {
    setDiscountRules(prev => [...prev, {
      id: Date.now().toString(),
      enabled: true,
      label: '',
      type: 'percent',
      value: 10,
      scope: 'all',
      categoryKey: '',
      minOrder: 0,
      expiry: '',
    }])
  }

  async function handleSave() {
    setSaving(true); setError(''); setSuccess(false)
    try {
      await api.settings.update({
        promotions: {
          deliveryEnabled, deliveryCharge,
          freeDeliveryEnabled, freeDeliveryThreshold,
          discountRules,
        },
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="max-w-3xl animate-pulse">
      <div className="h-8 w-56 bg-stone rounded-lg mb-2" />
      <div className="h-4 w-80 bg-stone rounded mb-7" />
      {/* Delivery card */}
      <div className="rounded-2xl border border-stone-dark overflow-hidden mb-5">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-dark bg-stone/40">
          <div className="w-9 h-9 rounded-xl bg-stone" />
          <div>
            <div className="h-4 w-36 bg-stone rounded mb-1.5" />
            <div className="h-3 w-52 bg-stone rounded" />
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-stone/50 rounded-xl border border-stone-dark">
            <div>
              <div className="h-4 w-40 bg-stone rounded mb-1.5" />
              <div className="h-3 w-56 bg-stone rounded" />
            </div>
            <div className="w-12 h-7 bg-stone rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i}>
                <div className="h-3 w-32 bg-stone rounded mb-1.5" />
                <div className="h-10 w-full bg-stone rounded-xl" />
                <div className="h-3 w-40 bg-stone rounded mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Discounts card */}
      <div className="rounded-2xl border border-stone-dark overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-dark bg-stone/40">
          <div className="w-9 h-9 rounded-xl bg-stone" />
          <div>
            <div className="h-4 w-32 bg-stone rounded mb-1.5" />
            <div className="h-3 w-48 bg-stone rounded" />
          </div>
        </div>
        <div className="p-6">
          <div className="py-10 border-2 border-dashed border-stone-dark rounded-xl flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-stone" />
            <div className="h-4 w-36 bg-stone rounded" />
            <div className="h-3 w-52 bg-stone rounded" />
          </div>
        </div>
      </div>
    </div>
  )

  const activeRules = discountRules.filter(r => r.enabled && (!r.expiry || new Date(r.expiry) >= new Date()))
  const expiredCount = discountRules.filter(r => r.expiry && new Date(r.expiry) < new Date()).length

  return (
    <div className="max-w-3xl">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-ink">Offers & Delivery</h1>
          <p className="text-ink/50 text-sm mt-1">
            Control delivery charges and set automatic discounts
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-center px-4 py-2.5 bg-stone rounded-xl border border-stone-dark">
            <p className="text-xl font-bold text-clay">{activeRules.length}</p>
            <p className="text-[11px] text-ink/40">Active offers</p>
          </div>
          {expiredCount > 0 && (
            <div className="text-center px-4 py-2.5 bg-red-50 rounded-xl border border-red-200">
              <p className="text-xl font-bold text-red-500">{expiredCount}</p>
              <p className="text-[11px] text-red-400">Expired</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="flex items-center gap-2 text-clay text-sm mb-5 bg-clay/10 border border-clay/20 px-4 py-3 rounded-xl">
          <span className="shrink-0">⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-green-700 text-sm mb-5 bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
          <CheckCircle2 size={16} className="shrink-0" /> Settings saved successfully!
        </div>
      )}

      <div className="space-y-5">

        {/* ── Delivery Charge ── */}
        <SectionCard
          icon={Truck}
          title="Delivery Charge"
          desc="Set delivery fees and free shipping threshold"
        >
          <div className="space-y-5">

            {/* Master toggle */}
            <div className="p-4 bg-stone/50 rounded-xl border border-stone-dark">
              <Toggle
                enabled={deliveryEnabled}
                onChange={setDeliveryEnabled}
                label="Enable delivery charge"
                sublabel="Turn off to offer free delivery on all orders"
              />
            </div>

            {deliveryEnabled ? (
              <>
                {/* Charge + Threshold inputs */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-ink/60 mb-1.5">
                      Delivery charge amount
                    </label>
                    <AmountInput
                      symbol="৳"
                      value={deliveryCharge}
                      onChange={setDeliveryCharge}
                      min={0}
                      placeholder="80"
                    />
                    <p className="text-xs text-ink/40 mt-1">Added to every order</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-ink/60">Free shipping threshold</label>
                      <Switch enabled={freeDeliveryEnabled} onChange={setFreeDeliveryEnabled} />
                    </div>
                    <AmountInput
                      symbol="৳"
                      value={freeDeliveryThreshold}
                      onChange={setFreeDeliveryThreshold}
                      min={0}
                      disabled={!freeDeliveryEnabled}
                      placeholder="1500"
                    />
                    <p className="text-xs text-ink/40 mt-1">
                      {freeDeliveryEnabled
                        ? `Free delivery on ৳${freeDeliveryThreshold}+ orders`
                        : 'Free shipping threshold is off'}
                    </p>
                  </div>
                </div>

                {/* Preview pill */}
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 bg-stone/60 border border-stone-dark rounded-full px-3 py-1.5 text-xs text-ink/60">
                    <Truck size={11} />
                    Under ৳{freeDeliveryThreshold} →
                    <strong className="text-ink">৳{deliveryCharge} charge</strong>
                  </span>
                  {freeDeliveryEnabled && (
                    <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 text-xs text-green-700">
                      <span>🎉</span>
                      ৳{freeDeliveryThreshold}+ → <strong>Free delivery</strong>
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                <Truck size={16} className="shrink-0" />
                Free delivery is currently enabled on all orders
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Discount Rules ── */}
        <SectionCard
          icon={Percent}
          title="Discount Rules"
          desc="Create automatic discounts for products or orders"
        >
          {discountRules.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-stone-dark rounded-xl mb-4">
              <div className="w-12 h-12 rounded-full bg-stone/60 flex items-center justify-center mx-auto mb-3">
                <Percent size={20} className="text-ink/25" />
              </div>
              <p className="text-sm font-medium text-ink/50">No discount rules yet</p>
              <p className="text-xs text-ink/30 mt-1">Add a rule below to start offering discounts</p>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {discountRules.map((rule, i) => (
                <DiscountRuleCard
                  key={rule.id}
                  rule={rule}
                  index={i}
                  categories={categories}
                  onChange={updated =>
                    setDiscountRules(prev => prev.map(r => r.id === rule.id ? updated : r))
                  }
                  onDelete={() =>
                    setDiscountRules(prev => prev.filter(r => r.id !== rule.id))
                  }
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addRule}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-clay/40 text-clay rounded-xl py-3 text-sm font-medium hover:bg-clay/5 hover:border-clay/70 transition-colors"
          >
            <Plus size={16} /> Add discount rule
          </button>
        </SectionCard>

        {/* ── Active Offers Summary ── */}
        {activeRules.length > 0 && (
          <SectionCard icon={Package} title="Active Offers" desc="Currently running discounts">
            <div className="space-y-2">
              {activeRules.map(r => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className="font-medium text-green-800">{r.label || 'Unnamed offer'}</span>
                  <span className="text-green-600">
                    {r.type === 'percent' ? `${r.value}% off` : `৳${r.value} off`}
                  </span>
                  <span className="text-green-500 text-xs ml-auto">
                    {r.scope === 'all'       && 'All products'}
                    {r.scope === 'category'  && (() => {
                      const cat = categories.find(c => c.key === r.categoryKey)
                      return cat ? `${cat.icon || ''} ${cat.name.en}`.trim() : r.categoryKey
                    })()}
                    {r.scope === 'minOrder'  && `৳${r.minOrder}+ orders`}
                  </span>
                  {r.expiry && (
                    <span className="text-[11px] text-green-500 border border-green-300 rounded-md px-2 py-0.5 shrink-0">
                      Until {new Date(r.expiry).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      {/* ── Save ── */}
      <div className="mt-8 pt-6 border-t border-stone-dark flex items-center justify-between">
        <p className="text-xs text-ink/40">All changes save together</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-clay text-sand px-6 py-3 rounded-xl font-medium hover:bg-clay-dark disabled:opacity-60 transition-colors shadow-sm"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
