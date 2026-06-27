import React, { useState, useEffect } from 'react'
import {
  Loader2, Save, Plus, Trash2, CheckCircle2, Truck,
  Tag, ToggleLeft, ToggleRight, Percent, Calendar, Package
} from 'lucide-react'
import { api } from '../api.js'

/* ——— Toggle Switch ——— */
function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
        enabled ? 'bg-clay' : 'bg-stone-dark'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

/* ——— Section Card ——— */
function SectionCard({ icon: Icon, title, desc, children }) {
  return (
    <div className="rounded-xl border border-stone-dark bg-sand overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-dark bg-stone/30">
        <span className="w-8 h-8 rounded-lg bg-clay text-sand flex items-center justify-center shrink-0">
          <Icon size={16} />
        </span>
        <div>
          <p className="font-medium text-sm text-ink">{title}</p>
          {desc && <p className="text-xs text-ink/40 mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

/* ——— Discount Rule Row ——— */
function DiscountRow({ rule, onChange, onDelete }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-stone/40 rounded-xl border border-stone-dark">
      {/* Enable/Disable */}
      <Toggle enabled={rule.enabled} onChange={(v) => onChange({ ...rule, enabled: v })} />

      {/* Rule name */}
      <input
        value={rule.label}
        onChange={(e) => onChange({ ...rule, label: e.target.value })}
        placeholder="ডিসকাউন্টের নাম (যেমন: ঈদ অফার)"
        className="flex-1 min-w-[160px] bg-sand border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
      />

      {/* Type */}
      <select
        value={rule.type}
        onChange={(e) => onChange({ ...rule, type: e.target.value })}
        className="bg-sand border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
      >
        <option value="percent">% ছাড়</option>
        <option value="flat">টাকা ছাড়</option>
      </select>

      {/* Value */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 text-sm">
          {rule.type === 'percent' ? '%' : '৳'}
        </span>
        <input
          type="number"
          min="0"
          max={rule.type === 'percent' ? 100 : undefined}
          value={rule.value}
          onChange={(e) => onChange({ ...rule, value: Number(e.target.value) })}
          placeholder="0"
          className="w-24 bg-sand border border-stone-dark rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
        />
      </div>

      {/* Scope */}
      <select
        value={rule.scope}
        onChange={(e) => onChange({ ...rule, scope: e.target.value, productId: '' })}
        className="bg-sand border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
      >
        <option value="all">সব পণ্যে</option>
        <option value="category">ক্যাটাগরিতে</option>
        <option value="minOrder">ন্যূনতম অর্ডারে</option>
      </select>

      {/* Scope extra input */}
      {rule.scope === 'category' && (
        <input
          value={rule.categoryKey || ''}
          onChange={(e) => onChange({ ...rule, categoryKey: e.target.value })}
          placeholder="category key (যেমন: shoes)"
          className="w-36 bg-sand border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
        />
      )}
      {rule.scope === 'minOrder' && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 text-sm">৳</span>
          <input
            type="number"
            min="0"
            value={rule.minOrder || 0}
            onChange={(e) => onChange({ ...rule, minOrder: Number(e.target.value) })}
            placeholder="ন্যূনতম"
            className="w-28 bg-sand border border-stone-dark rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
          />
        </div>
      )}

      {/* Expiry */}
      <div className="relative">
        <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
        <input
          type="date"
          value={rule.expiry || ''}
          onChange={(e) => onChange({ ...rule, expiry: e.target.value })}
          className="bg-sand border border-stone-dark rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
        />
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        className="p-2 text-ink/30 hover:text-clay hover:bg-clay/10 rounded-lg transition-colors"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

/* ——— Main Component ——— */
export default function AdminPromotions() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  /* ─── Delivery Charge State ─── */
  const [deliveryEnabled, setDeliveryEnabled] = useState(true)
  const [deliveryCharge, setDeliveryCharge] = useState(80)
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(true)
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(1500)

  /* ─── Discount Rules State ─── */
  const [discountRules, setDiscountRules] = useState([])

  useEffect(() => {
    api.settings.get()
      .then((s) => {
        const p = s.promotions || {}
        // Delivery
        setDeliveryEnabled(p.deliveryEnabled ?? true)
        setDeliveryCharge(p.deliveryCharge ?? 80)
        setFreeDeliveryEnabled(p.freeDeliveryEnabled ?? true)
        setFreeDeliveryThreshold(p.freeDeliveryThreshold ?? 1500)
        // Discounts
        setDiscountRules(p.discountRules || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function addRule() {
    setDiscountRules((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        enabled: true,
        label: '',
        type: 'percent',
        value: 10,
        scope: 'all',
        categoryKey: '',
        minOrder: 0,
        expiry: '',
      },
    ])
  }

  function updateRule(id, updated) {
    setDiscountRules((prev) => prev.map((r) => (r.id === id ? updated : r)))
  }

  function deleteRule(id) {
    setDiscountRules((prev) => prev.filter((r) => r.id !== id))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await api.settings.update({
        promotions: {
          deliveryEnabled,
          deliveryCharge,
          freeDeliveryEnabled,
          freeDeliveryThreshold,
          discountRules,
        },
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-clay" />
      </div>
    )
  }

  const activeDiscounts = discountRules.filter((r) => r.enabled).length
  const expiredCount = discountRules.filter(
    (r) => r.expiry && new Date(r.expiry) < new Date()
  ).length

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-ink">অফার ও ডেলিভারি সেটিংস</h1>
          <p className="text-ink/50 text-sm mt-1">ডেলিভারি চার্জ নিয়ন্ত্রণ করুন এবং পণ্যে ডিসকাউন্ট সেট করুন</p>
        </div>
        {/* Stats */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-center px-4 py-2 bg-stone rounded-xl border border-stone-dark">
            <p className="text-xl font-bold text-clay">{activeDiscounts}</p>
            <p className="text-[11px] text-ink/40">সক্রিয় অফার</p>
          </div>
          {expiredCount > 0 && (
            <div className="text-center px-4 py-2 bg-red-50 rounded-xl border border-red-200">
              <p className="text-xl font-bold text-red-500">{expiredCount}</p>
              <p className="text-[11px] text-red-400">মেয়াদ শেষ</p>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 text-clay text-sm mb-5 bg-clay/10 border border-clay/20 px-4 py-3 rounded-lg">
          <span className="shrink-0">⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-green-700 text-sm mb-5 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
          <CheckCircle2 size={16} className="shrink-0" /> সেটিংস সফলভাবে সেভ হয়েছে!
        </div>
      )}

      <div className="space-y-5">

        {/* ─── Delivery Charge Section ─── */}
        <SectionCard
          icon={Truck}
          title="ডেলিভারি চার্জ সেটিংস"
          desc="অর্ডারের উপর ভিত্তি করে ডেলিভারি চার্জ নির্ধারণ করুন"
        >
          {/* Enable delivery charge */}
          <div className="flex items-center justify-between p-4 bg-stone/40 rounded-xl border border-stone-dark mb-4">
            <div>
              <p className="text-sm font-medium text-ink">ডেলিভারি চার্জ চালু করুন</p>
              <p className="text-xs text-ink/40 mt-0.5">বন্ধ করলে সব অর্ডারে ফ্রি ডেলিভারি হবে</p>
            </div>
            <Toggle enabled={deliveryEnabled} onChange={setDeliveryEnabled} />
          </div>

          {deliveryEnabled && (
            <div className="space-y-4">
              {/* Delivery charge amount */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1.5">
                    ডেলিভারি চার্জ (টাকা)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50 text-sm font-medium">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                      className="w-full bg-stone/40 border border-stone-dark rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
                    />
                  </div>
                  <p className="text-xs text-ink/40 mt-1">প্রতিটি অর্ডারে এই চার্জ যোগ হবে</p>
                </div>

                {/* Free delivery threshold */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-ink">ফ্রি ডেলিভারির সীমা</label>
                    <Toggle enabled={freeDeliveryEnabled} onChange={setFreeDeliveryEnabled} />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50 text-sm font-medium">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={freeDeliveryThreshold}
                      onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                      disabled={!freeDeliveryEnabled}
                      className="w-full bg-stone/40 border border-stone-dark rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40 disabled:opacity-40"
                    />
                  </div>
                  <p className="text-xs text-ink/40 mt-1">
                    {freeDeliveryEnabled
                      ? `৳${freeDeliveryThreshold}+ অর্ডারে ফ্রি ডেলিভারি`
                      : 'ফ্রি ডেলিভারি সীমা বন্ধ আছে'}
                  </p>
                </div>
              </div>

              {/* Preview box */}
              <div className="mt-2 p-4 bg-clay/5 border border-clay/20 rounded-xl">
                <p className="text-xs font-semibold text-clay mb-2 uppercase tracking-wide">প্রিভিউ</p>
                <div className="space-y-1.5 text-sm text-ink/70">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-clay/50 shrink-0" />
                    <span>
                      ৳{freeDeliveryThreshold}-এর কম অর্ডারে →{' '}
                      <strong className="text-ink">৳{deliveryCharge} ডেলিভারি চার্জ</strong>
                    </span>
                  </div>
                  {freeDeliveryEnabled && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                      <span>
                        ৳{freeDeliveryThreshold}+ অর্ডারে →{' '}
                        <strong className="text-green-600">ফ্রি ডেলিভারি 🎉</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!deliveryEnabled && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
              <Truck size={16} className="shrink-0" />
              সব অর্ডারে বর্তমানে ফ্রি ডেলিভারি চলছে
            </div>
          )}
        </SectionCard>

        {/* ─── Discount Rules Section ─── */}
        <SectionCard
          icon={Percent}
          title="ডিসকাউন্ট নিয়ম"
          desc="পণ্য বা অর্ডারের উপর স্বয়ংক্রিয় ডিসকাউন্ট সেট করুন"
        >
          {discountRules.length === 0 && (
            <div className="py-8 text-center border-2 border-dashed border-stone-dark rounded-xl mb-4">
              <Tag size={28} className="text-ink/20 mx-auto mb-2" />
              <p className="text-sm text-ink/40">কোনো ডিসকাউন্ট নিয়ম নেই</p>
              <p className="text-xs text-ink/30 mt-1">নিচের বাটন থেকে নতুন অফার যোগ করুন</p>
            </div>
          )}

          <div className="space-y-3 mb-4">
            {discountRules.map((rule) => {
              const isExpired = rule.expiry && new Date(rule.expiry) < new Date()
              return (
                <div key={rule.id}>
                  {isExpired && (
                    <div className="text-xs text-red-500 flex items-center gap-1 mb-1 ml-1">
                      <span>⚠️</span> এই অফারের মেয়াদ শেষ হয়ে গেছে
                    </div>
                  )}
                  <div className={isExpired ? 'opacity-50' : ''}>
                    <DiscountRow
                      rule={rule}
                      onChange={(updated) => updateRule(rule.id, updated)}
                      onDelete={() => deleteRule(rule.id)}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={addRule}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-clay/40 text-clay rounded-xl py-3 text-sm font-medium hover:bg-clay/5 transition-colors"
          >
            <Plus size={16} /> নতুন ডিসকাউন্ট যোগ করুন
          </button>

          {/* Legend */}
          {discountRules.length > 0 && (
            <div className="mt-4 p-3 bg-stone/40 rounded-lg border border-stone-dark text-xs text-ink/50 space-y-1">
              <p className="font-medium text-ink/70 mb-1.5">💡 নিয়মাবলী:</p>
              <p>• <strong>সব পণ্যে</strong> — সমস্ত পণ্যে এই ছাড় প্রযোজ্য হবে</p>
              <p>• <strong>ক্যাটাগরিতে</strong> — নির্দিষ্ট ক্যাটাগরির পণ্যে ছাড় দিন</p>
              <p>• <strong>ন্যূনতম অর্ডারে</strong> — নির্দিষ্ট পরিমাণের উপরে অর্ডারে ছাড়</p>
              <p>• <strong>মেয়াদ শেষ হলে</strong> — অফার স্বয়ংক্রিয়ভাবে নিষ্ক্রিয় দেখাবে</p>
            </div>
          )}
        </SectionCard>

        {/* ─── Active Offers Summary ─── */}
        {discountRules.some((r) => r.enabled && (!r.expiry || new Date(r.expiry) >= new Date())) && (
          <SectionCard
            icon={Package}
            title="সক্রিয় অফার সারসংক্ষেপ"
            desc="বর্তমানে চলমান অফারসমূহ"
          >
            <div className="space-y-2">
              {discountRules
                .filter((r) => r.enabled && (!r.expiry || new Date(r.expiry) >= new Date()))
                .map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <span className="font-medium text-green-800">{r.label || 'নামহীন অফার'}</span>
                    <span className="text-green-600">
                      {r.type === 'percent' ? `${r.value}% ছাড়` : `৳${r.value} ছাড়`}
                    </span>
                    <span className="text-green-500 text-xs ml-auto">
                      {r.scope === 'all' && 'সব পণ্যে'}
                      {r.scope === 'category' && `"${r.categoryKey}" ক্যাটাগরিতে`}
                      {r.scope === 'minOrder' && `৳${r.minOrder}+ অর্ডারে`}
                    </span>
                    {r.expiry && (
                      <span className="text-[11px] text-green-400 border border-green-300 rounded px-2 py-0.5">
                        {new Date(r.expiry).toLocaleDateString('bn-BD')} পর্যন্ত
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </SectionCard>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-8 pt-6 border-t border-stone-dark flex items-center justify-between">
        <p className="text-xs text-ink/40">সব পরিবর্তন একসাথে সেভ হবে</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-clay text-sand px-6 py-3 rounded-lg font-medium hover:bg-clay-dark disabled:opacity-60 transition-colors shadow-sm"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'সেভ হচ্ছে…' : 'সেটিংস সেভ করুন'}
        </button>
      </div>
    </div>
  )
}
