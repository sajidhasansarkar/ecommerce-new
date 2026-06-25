import React, { useState } from 'react'
import { Plus, Pencil, Trash2, X, GripVertical, Loader2 } from 'lucide-react'
import { useCategories } from '../context/CategoryContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { api } from '../api.js'

const emptyForm = {
  key: '',
  nameBn: '',
  nameEn: '',
  icon: '',
  sortOrder: 0,
}

export default function AdminCategories() {
  const { categories, setCategories } = useCategories()
  const { lang } = useLanguage()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [error, setError] = useState('')

  function openAdd() {
    setForm({ ...emptyForm, sortOrder: categories.length + 1 })
    setEditingId(null)
    setError('')
    setModalOpen(true)
  }

  function openEdit(cat) {
    setForm({
      key: cat.key,
      nameBn: cat.name.bn,
      nameEn: cat.name.en,
      icon: cat.icon || '',
      sortOrder: cat.sortOrder ?? 0,
    })
    setEditingId(cat._id)
    setError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.key.trim() || !form.nameBn.trim() || !form.nameEn.trim()) {
      setError('Key, বাংলা নাম এবং ইংরেজি নাম আবশ্যক।')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        key: form.key.toLowerCase().trim().replace(/\s+/g, '-'),
        name: { bn: form.nameBn.trim(), en: form.nameEn.trim() },
        icon: form.icon.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
      }
      if (editingId) {
        const updated = await api.categories.update(editingId, payload)
        setCategories((prev) => prev.map((c) => (c._id === editingId ? updated : c)))
      } else {
        const created = await api.categories.create(payload)
        setCategories((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder))
      }
      setModalOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(cat) {
    try {
      await api.categories.delete(cat._id)
      setCategories((prev) => prev.filter((c) => c._id !== cat._id))
      setDeleteTarget(null)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">
            {lang === 'bn' ? 'ক্যাটাগরি ম্যানেজমেন্ট' : 'Category Management'}
          </h1>
          <p className="text-sm text-ink/50 mt-1">
            {lang === 'bn'
              ? 'নতুন ক্যাটাগরি যোগ করুন — Navbar ও Shop-এ স্বয়ংক্রিয়ভাবে দেখা যাবে।'
              : 'Add categories here — they appear in the Navbar and Shop automatically.'}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-ink text-sand px-4 py-2 rounded-lg text-sm font-medium hover:bg-clay transition-colors"
        >
          <Plus size={16} />
          {lang === 'bn' ? 'নতুন ক্যাটাগরি' : 'New Category'}
        </button>
      </div>

      {/* Category list */}
      <div className="space-y-2">
        {categories.length === 0 && (
          <div className="text-center py-16 text-ink/40 text-sm border border-dashed border-stone-dark rounded-xl">
            {lang === 'bn' ? 'কোনো ক্যাটাগরি নেই। প্রথমটি যোগ করুন!' : 'No categories yet. Add your first one!'}
          </div>
        )}
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="flex items-center gap-3 bg-sand border border-stone-dark rounded-xl px-4 py-3"
          >
            <GripVertical size={16} className="text-ink/30 shrink-0" />
            <span className="text-xl w-7">{cat.icon || '📦'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-ink truncate">
                {cat.name.bn} / {cat.name.en}
              </p>
              <p className="text-xs text-ink/40 font-mono">key: {cat.key} · order: {cat.sortOrder}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openEdit(cat)}
                className="p-1.5 text-ink/50 hover:text-clay transition-colors"
                title="Edit"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => setDeleteTarget(cat)}
                className="p-1.5 text-ink/50 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-sand rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg">
                {editingId
                  ? (lang === 'bn' ? 'ক্যাটাগরি সম্পাদনা' : 'Edit Category')
                  : (lang === 'bn' ? 'নতুন ক্যাটাগরি' : 'New Category')}
              </h2>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {/* Key */}
              <div>
                <label className="block text-xs font-medium text-ink/60 mb-1">
                  Key (ইউনিক ID) *
                </label>
                <input
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  placeholder="e.g. jewelry, watches, clothing"
                  disabled={!!editingId}
                  className="w-full border border-stone-dark rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-clay/40 disabled:opacity-50 disabled:bg-stone/40"
                />
                <p className="text-[11px] text-ink/40 mt-1">
                  {lang === 'bn' ? 'ছোট হাতে লিখুন, স্পেস নয় (dash ব্যবহার করুন)। একবার সেট হলে পরিবর্তন করা যাবে না।' : 'Lowercase, no spaces (use dashes). Cannot change after creation.'}
                </p>
              </div>

              {/* Bengali name */}
              <div>
                <label className="block text-xs font-medium text-ink/60 mb-1">বাংলা নাম *</label>
                <input
                  value={form.nameBn}
                  onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                  placeholder="যেমন: গহনা"
                  className="w-full border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
                />
              </div>

              {/* English name */}
              <div>
                <label className="block text-xs font-medium text-ink/60 mb-1">English Name *</label>
                <input
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  placeholder="e.g. Jewelry"
                  className="w-full border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-xs font-medium text-ink/60 mb-1">
                  {lang === 'bn' ? 'আইকন (ইমোজি, ঐচ্ছিক)' : 'Icon (emoji, optional)'}
                </label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="👟 💍 ⌚ 👗"
                  className="w-full border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
                />
              </div>

              {/* Sort order */}
              <div>
                <label className="block text-xs font-medium text-ink/60 mb-1">
                  {lang === 'bn' ? 'ক্রম (Nav-এ কোন ক্রমে দেখাবে)' : 'Sort Order (position in Nav)'}
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  className="w-full border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 border border-stone-dark rounded-lg py-2 text-sm"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-ink text-sand rounded-lg py-2 text-sm font-medium hover:bg-clay transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingId ? (lang === 'bn' ? 'আপডেট করুন' : 'Update') : (lang === 'bn' ? 'যোগ করুন' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-sand rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-display text-lg mb-2">
              {lang === 'bn' ? 'ক্যাটাগরি মুছবেন?' : 'Delete Category?'}
            </h3>
            <p className="text-sm text-ink/60 mb-5">
              {lang === 'bn'
                ? `"${deleteTarget.name.bn}" মুছে ফেলা হবে। এই ক্যাটাগরির প্রোডাক্টগুলো থাকবে, কিন্তু Nav ও Shop থেকে ক্যাটাগরিটি সরে যাবে।`
                : `"${deleteTarget.name.en}" will be removed. Products in this category will remain, but the category will disappear from Nav and Shop.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 border border-stone-dark rounded-lg py-2 text-sm">
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-600 transition-colors"
              >
                {lang === 'bn' ? 'মুছুন' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
