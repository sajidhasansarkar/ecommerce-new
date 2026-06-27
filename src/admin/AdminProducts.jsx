import React, { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Loader2, Link as LinkIcon, Upload, Image } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useCategories } from '../context/CategoryContext.jsx'
import { api } from '../api.js'

// categoryKeys removed — now loaded from CategoryContext

// প্রতিটি ব্যাজের bn/en ভ্যালু — Home.jsx এর ফিল্টারের সাথে মিলিয়ে রাখা হয়েছে
const BADGE_OPTIONS = [
  { key: '',            bn: null,            en: null,           label: 'কোনো ব্যাজ নেই' },
  { key: 'bestseller',  bn: 'বেস্ট সেলার',  en: 'Best Seller',  label: '🏆 বেস্ট সেলার' },
  { key: 'new',         bn: 'নতুন',          en: 'New Arrival',  label: '🆕 নতুন কালেকশন' },
  { key: 'sale',        bn: 'সেল',           en: 'Sale',         label: '🔥 সেল' },
  { key: 'trending',    bn: 'ট্রেন্ডিং',     en: 'Trending',     label: '📈 ট্রেন্ডিং' },
  { key: 'limited',     bn: 'লিমিটেড',       en: 'Limited',      label: '⚡ লিমিটেড এডিশন' },
]

const emptyForm = {
  nameBn: '', nameEn: '',
  categoryKey: 'shoes',
  price: '', oldPrice: '', stock: '',
  descriptionBn: '', descriptionEn: '',
  images: [],
  imageInput: '',
  badgeKey: '',
}

// Convert a File to base64 data URL
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function AdminProducts() {
  const { t, lang } = useLanguage()
  const { categories } = useCategories()
  const queryClient = useQueryClient()

  // ━━━ প্রোডাক্ট লিস্ট — useQuery দিয়ে fetch ও cache করা হচ্ছে ━━━
  // প্রথমবার লোড হওয়ার সময় isLoading true থাকে, কিন্তু এরপর প্রতিটা
  // mutation-এ (add/edit/delete) আমরা cache সরাসরি বদলে দিই, তাই useQuery
  // আর কখনো isLoading=true ফিরিয়ে পুরো পেজ রিলোড দেখায় না।
  const {
    data: list = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.products.list(),
  })

  const [formError, setFormError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [imgTab, setImgTab] = useState('url') // 'url' | 'upload' | 'drag'
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  // লিস্ট লোড করতে গিয়ে এরর হলে দেখানোর জন্য — মডালের ফর্ম এরর থেকে আলাদা রাখা হয়েছে
  const error = formError || queryError?.message || ''

  // ━━━ Create/Update mutation ━━━
  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? api.products.update(id, payload) : api.products.create(payload),
    onSuccess: () => {
      // সার্ভারে সেভ হয়ে গেছে — cache invalidate করে ব্যাকগ্রাউন্ডে রিফ্রেশ করা হচ্ছে,
      // কিন্তু পুরোনো ডেটা স্ক্রিনে থেকেই যায় যতক্ষণ না নতুনটা আসে (কোনো ফ্ল্যাশ/রিলোড দেখাবে না)
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setModalOpen(false)
    },
    onError: (err) => setFormError(err.message),
  })

  // ━━━ Delete mutation — optimistic update সহ ━━━
  // ডিলিট বাটনে ক্লিক করলেই সাথে সাথে লিস্ট থেকে আইটেমটা সরিয়ে দেওয়া হয় (UI তে),
  // ব্যাকগ্রাউন্ডে সার্ভারে রিকোয়েস্ট যায়। কোনো "লোড হচ্ছে..." স্পিনার দেখাবে না,
  // কোনো রিলোড হবে না — শুধু আইটেমটা মিলিয়ে যাবে।
  const deleteMutation = useMutation({
    mutationFn: (id) => api.products.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin-products'] })
      const previousList = queryClient.getQueryData(['admin-products'])
      queryClient.setQueryData(['admin-products'], (old = []) =>
        old.filter((p) => p._id !== id)
      )
      return { previousList }
    },
    onError: (err, _id, context) => {
      // সার্ভারে ডিলিট ব্যর্থ হলে আগের লিস্ট ফিরিয়ে আনা হচ্ছে
      if (context?.previousList) {
        queryClient.setQueryData(['admin-products'], context.previousList)
      }
      setFormError(err.message)
    },
    onSettled: () => {
      // নিশ্চিত করার জন্য ব্যাকগ্রাউন্ডে একবার সার্ভারের সাথে sync করা হচ্ছে,
      // কিন্তু এটা UI ব্লক করবে না বা স্পিনার দেখাবে না
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })

  const saving = saveMutation.isPending

  function openAddModal() {
    setForm(emptyForm)
    setEditingId(null)
    setImgTab('url')
    setUploadError('')
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(product) {
    setForm({
      nameBn: product.name.bn,
      nameEn: product.name.en,
      categoryKey: product.categoryKey,
      price: product.price,
      oldPrice: product.oldPrice || '',
      stock: product.stock,
      descriptionBn: product.description?.bn || '',
      descriptionEn: product.description?.en || '',
      images: product.images || [],
      imageInput: '',
      badgeKey: BADGE_OPTIONS.find((b) => b.bn === product.badge?.bn)?.key || '',
    })
    setEditingId(product._id)
    setImgTab('url')
    setUploadError('')
    setFormError('')
    setModalOpen(true)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function addImageUrl() {
    const url = form.imageInput.trim()
    if (!url) return
    if (form.images.includes(url)) {
      setForm((f) => ({ ...f, imageInput: '' }))
      return
    }
    setForm((f) => ({ ...f, images: [...f.images, url], imageInput: '' }))
  }

  function handleImageKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addImageUrl()
    }
  }

  async function processFiles(files) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const filtered = Array.from(files).filter((f) => validTypes.includes(f.type))
    if (filtered.length === 0) return

    setUploading(true)
    setUploadError('')
    try {
      // প্রতিটা ফাইলকে আগে base64 এ কনভার্ট করে, তারপর Cloudinary-তে (আমাদের ব্যাকএন্ডের
      // মাধ্যমে) আপলোড করা হয়। Cloudinary থেকে পাওয়া সরাসরি লিংকটাই ফর্মে যোগ হবে —
      // base64 ডেটা ডাটাবেসে সেভ হয় না।
      const dataUrls = await Promise.all(filtered.map(fileToDataUrl))
      const uploaded = []
      for (let i = 0; i < dataUrls.length; i++) {
        const result = await api.upload.image(dataUrls[i], filtered[i].name)
        uploaded.push(result.url)
      }
      setForm((f) => ({
        ...f,
        images: [...f.images, ...uploaded.filter((u) => !f.images.includes(u))],
      }))
    } catch (e) {
      setUploadError(e.message || t("admin.uploadError"))
    } finally {
      setUploading(false)
    }
  }

  function handleFileInput(e) {
    processFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    if (uploading) return
    processFiles(e.dataTransfer.files)
  }, [uploading])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  function removeImage(idx) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  function moveImage(idx, dir) {
    setForm((f) => {
      const imgs = [...f.images]
      const swap = idx + dir
      if (swap < 0 || swap >= imgs.length) return f
      ;[imgs[idx], imgs[swap]] = [imgs[swap], imgs[idx]]
      return { ...f, images: imgs }
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nameBn.trim() || !form.nameEn.trim() || !form.price || !form.stock) return

    const payload = {
      categoryKey: form.categoryKey,
      name: { bn: form.nameBn, en: form.nameEn },
      description: { bn: form.descriptionBn, en: form.descriptionEn },
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      stock: Number(form.stock),
      images: form.images,
      badge: (() => {
        const opt = BADGE_OPTIONS.find((b) => b.key === form.badgeKey)
        return { bn: opt?.bn || null, en: opt?.en || null }
      })(),
      badgeKey: form.badgeKey || null,
    }

    setFormError('')
    saveMutation.mutate({ id: editingId, payload })
  }

  function confirmDelete() {
    const id = deleteTarget._id
    setDeleteTarget(null) // মডাল সাথে সাথে বন্ধ হবে, লিস্ট থেকে আইটেমও অপটিমিস্টিকালি সরে যাবে
    deleteMutation.mutate(id)
  }

  if (loading) return <div className="text-ink/50 py-10 text-center">{t("common.loading")}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-ink">{t('admin.productManagement')}</h1>
          <p className="text-ink/60 text-sm mt-1">{list.length} {lang === 'bn' ? 'টি প্রোডাক্ট' : 'products'}</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-clay text-sand px-4 py-2.5 rounded-md text-sm font-medium hover:bg-clay-dark transition-colors"
        >
          <Plus size={16} /> {t('admin.newProduct')}
        </button>
      </div>

      {error && <p className="text-clay text-sm mb-4">{error}</p>}

      <div className="bg-sand rounded-xl border border-stone-dark overflow-hidden">
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead className="bg-stone/50 text-left text-ink/60 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">{t('admin.productCol')}</th>
                <th className="px-4 py-3">{t('admin.categoryCol')}</th>
                <th className="px-4 py-3">{t('admin.priceCol')}</th>
                <th className="px-4 py-3">{t('admin.stockCol')}</th>
                <th className="px-4 py-3 text-right">{t('admin.actionCol')}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p._id} className="border-t border-stone-dark">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <div className="relative shrink-0">
                          <img src={p.images[0]} alt={p.name[lang]} className="w-10 h-10 rounded object-cover bg-stone" />
                          {p.images.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 bg-clay text-sand text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                              {p.images.length}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-stone shrink-0 flex items-center justify-center">
                          <Image size={14} className="text-ink/30" />
                        </div>
                      )}
                      <span className="text-ink font-medium">{p.name[lang]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    <span>{t(`categories.${p.categoryKey}`)}</span>
                    {p.badge?.bn && (
                      <span className="ml-2 inline-block bg-clay/10 text-clay text-[10px] font-semibold px-1.5 py-0.5 rounded">
                        {p.badge.bn}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-ink">৳{p.price}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 10 ? 'text-clay font-medium' : 'text-ink/70'}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(p)} className="p-1.5 text-ink/50 hover:text-clay">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-ink/50 hover:text-clay-dark">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink/40">{t("admin.noAdminProducts")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* অ্যাড/এডিট মোডাল */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-sand rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto thin-scroll">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-ink">
                {editingId ? t('admin.editProduct') : t('admin.addProduct')}
              </h2>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">নাম (বাংলা) *</label>
                  <input name="nameBn" value={form.nameBn} onChange={handleChange} required
                    className="w-full bg-stone/40 border border-stone-dark rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Name (English) *</label>
                  <input name="nameEn" value={form.nameEn} onChange={handleChange} required
                    className="w-full bg-stone/40 border border-stone-dark rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">ক্যাটাগরি</label>
                  <select name="categoryKey" value={form.categoryKey} onChange={handleChange}
                    className="w-full bg-stone/40 border border-stone-dark rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40">
                    {categories.map((c) => <option key={c.key} value={c.key}>{lang === 'bn' ? c.name.bn : c.name.en}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">দাম (৳) *</label>
                  <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required
                    className="w-full bg-stone/40 border border-stone-dark rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">স্টক *</label>
                  <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required
                    className="w-full bg-stone/40 border border-stone-dark rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">পুরনো দাম (৳) — ঐচ্ছিক</label>
                <input name="oldPrice" type="number" min="0" value={form.oldPrice} onChange={handleChange}
                  placeholder="কাটা দাম দেখাতে চাইলে দিন"
                  className="w-full bg-stone/40 border border-stone-dark rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40" />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">প্রোডাক্ট ক্যাটাগরি ব্যাজ</label>
                <div className="grid grid-cols-3 gap-2">
                  {BADGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, badgeKey: opt.key }))}
                      className={`py-2 px-3 rounded-md border text-xs font-medium transition-colors text-left ${
                        form.badgeKey === opt.key
                          ? 'border-clay bg-clay/10 text-clay'
                          : 'border-stone-dark text-ink/60 hover:border-clay/50 hover:text-ink'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {form.badgeKey && (
                  <p className="text-xs text-ink/40 mt-1.5">
                    ব্যাজ: <span className="text-clay font-medium">{BADGE_OPTIONS.find(b => b.key === form.badgeKey)?.bn}</span> / <span className="text-clay font-medium">{BADGE_OPTIONS.find(b => b.key === form.badgeKey)?.en}</span>
                  </p>
                )}
              </div>

              {/* ━━━ ইমেজ সেকশন ━━━ */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  প্রোডাক্টের ছবি
                  <span className="ml-1.5 text-xs font-normal text-ink/40">({form.images.length} টি যোগ করা হয়েছে)</span>
                </label>

                {/* ট্যাব */}
                <div className="flex border border-stone-dark rounded-md overflow-hidden mb-3">
                  <button type="button" onClick={() => setImgTab('url')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${imgTab === 'url' ? 'bg-ink text-sand' : 'text-ink/60 hover:bg-stone/40'}`}>
                    <LinkIcon size={13} /> লিংক
                  </button>
                  <button type="button" onClick={() => setImgTab('upload')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${imgTab === 'upload' ? 'bg-ink text-sand' : 'text-ink/60 hover:bg-stone/40'}`}>
                    <Upload size={13} /> আপলোড
                  </button>
                  <button type="button" onClick={() => setImgTab('drag')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${imgTab === 'drag' ? 'bg-ink text-sand' : 'text-ink/60 hover:bg-stone/40'}`}>
                    <Image size={13} /> ড্র্যাগ
                  </button>
                </div>

                {/* URL ট্যাব */}
                {imgTab === 'url' && (
                  <div>
                    <div className="flex gap-2">
                      <input
                        name="imageInput"
                        value={form.imageInput}
                        onChange={handleChange}
                        onKeyDown={handleImageKeyDown}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 bg-stone/40 border border-stone-dark rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
                      />
                      <button type="button" onClick={addImageUrl}
                        className="bg-ink text-sand px-3.5 py-2.5 rounded-md text-sm font-medium hover:bg-clay transition-colors shrink-0">
                        যোগ
                      </button>
                    </div>
                    <p className="text-xs text-ink/40 mt-1">Enter চেপেও যোগ করা যাবে।</p>
                  </div>
                )}

                {/* আপলোড ট্যাব */}
                {imgTab === 'upload' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      multiple
                      className="hidden"
                      disabled={uploading}
                      onChange={handleFileInput}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-stone-dark rounded-md py-4 text-sm text-ink/60 hover:border-clay hover:text-clay transition-colors disabled:opacity-60"
                    >
                      {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                      {uploading ? t("admin.uploadingCloudinary") : t("admin.chooseImageBtn")}
                    </button>
                    <p className="text-xs text-ink/40 mt-1">{t("admin.uploadHint")}</p>
                  </div>
                )}

                {/* ড্র্যাগ ও ড্রপ ট্যাব */}
                {imgTab === 'drag' && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`w-full border-2 border-dashed rounded-md py-8 flex flex-col items-center justify-center gap-2 transition-colors ${
                      uploading ? 'opacity-60 pointer-events-none' : ''
                    } ${
                      dragOver ? 'border-clay bg-clay/5 text-clay' : 'border-stone-dark text-ink/50 hover:border-clay/50'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={28} className="animate-spin text-clay" />
                        <p className="text-sm font-medium">{t("admin.uploadingCloudinary")}</p>
                      </>
                    ) : (
                      <>
                        <Image size={28} className={dragOver ? 'text-clay' : 'text-ink/30'} />
                        <p className="text-sm font-medium">{dragOver ? t("admin.dropHere") : t("admin.dragHere")}</p>
                        <p className="text-xs">{t("admin.dragDropHint")}</p>
                      </>
                    )}
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs text-clay mt-2">⚠️ {uploadError}</p>
                )}

                {/* প্রিভিউ গ্রিড */}
                {form.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {form.images.map((url, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-stone-dark bg-stone/30 aspect-square">
                        <img
                          src={url}
                          alt={`ছবি ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-clay text-sand text-[9px] font-semibold px-1.5 py-0.5 rounded">
                            মূল
                          </span>
                        )}
                        <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                          <div className="flex gap-1">
                            <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0}
                              className="bg-sand/90 text-ink text-xs px-2 py-1 rounded disabled:opacity-30 hover:bg-sand" title="সামনে আনুন">←</button>
                            <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === form.images.length - 1}
                              className="bg-sand/90 text-ink text-xs px-2 py-1 rounded disabled:opacity-30 hover:bg-sand" title="পিছে নিন">→</button>
                          </div>
                          <button type="button" onClick={() => removeImage(idx)}
                            className="bg-clay text-sand text-xs px-2.5 py-1 rounded hover:bg-clay-dark">
                            মুছুন
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">বিবরণ (বাংলা)</label>
                <textarea name="descriptionBn" rows={2} value={form.descriptionBn} onChange={handleChange}
                  className="w-full bg-stone/40 border border-stone-dark rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Description (English)</label>
                <textarea name="descriptionEn" rows={2} value={form.descriptionEn} onChange={handleChange}
                  className="w-full bg-stone/40 border border-stone-dark rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40" />
              </div>
              {error && <p className="text-clay text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 border border-stone-dark text-ink py-2.5 rounded-md text-sm font-medium hover:bg-stone/40">
                  বাতিল
                </button>
                <button type="submit" disabled={saving || uploading}
                  className="flex-1 bg-clay text-sand py-2.5 rounded-md text-sm font-medium hover:bg-clay-dark disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editingId ? t('admin.update') : t('admin.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ডিলিট কনফার্মেশন */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-sand rounded-xl p-6 w-full max-w-sm text-center">
            <h3 className="font-display text-lg text-ink mb-2">{t('admin.deleteConfirmTitle')}</h3>
            <p className="text-sm text-ink/60 mb-6">"{deleteTarget.name[lang]}" {t('admin.deleteConfirmDesc')}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-stone-dark text-ink py-2.5 rounded-md text-sm font-medium hover:bg-stone/40">
                বাতিল
              </button>
              <button onClick={confirmDelete}
                className="flex-1 bg-clay-dark text-sand py-2.5 rounded-md text-sm font-medium hover:bg-ink">
                {t('admin.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
