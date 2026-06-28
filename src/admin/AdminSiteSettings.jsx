import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Loader2, Save, Image, Upload, Link as LinkIcon, RefreshCw,
  Plus, Trash2, GripVertical, Eye, EyeOff, ChevronDown,
  ImageIcon, Megaphone, LayoutGrid, Tag, CheckCircle2
} from 'lucide-react'
import { api } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useSiteSettings } from '../context/SiteSettingsContext.jsx'
import { useCategories } from '../context/CategoryContext.jsx'

const DEFAULT_MARQUEE = ['New collection arrived', 'Special discounts available', 'Free shipping on ৳500+ orders', 'Limited edition']

function fileToDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

// Resize and compress large images client-side before upload
const TARGET_MAX_BYTES = 700_000 // ~700KB এর মধ্যে রাখার চেষ্টা করবে
const MAX_DIMENSION = 1920       // px — এর বেশি হলে scale down করা হবে

function loadImage(dataUrl) {
  return new Promise((res, rej) => {
    const img = new window.Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = dataUrl
  })
}

async function compressImageFile(file) {
  const rawDataUrl = await fileToDataUrl(file)

  // Skip compression for GIFs (may contain animation)
  if (file.type === 'image/gif') return rawDataUrl

  const img = await loadImage(rawDataUrl)
  let { width, height } = img

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)

  // কোয়ালিটি ধাপে ধাপে কমিয়ে টার্গেট সাইজের মধ্যে আনার চেষ্টা
  let quality = 0.85
  let out = canvas.toDataURL('image/jpeg', quality)
  while (out.length * 0.75 > TARGET_MAX_BYTES && quality > 0.4) {
    quality -= 0.1
    out = canvas.toDataURL('image/jpeg', quality)
  }

  // যদি কম্প্রেস করা ছবি মূল ছবির চেয়ে বড় হয়ে যায় (rare/small images), মূলটাই রাখি
  return out.length < rawDataUrl.length ? out : rawDataUrl
}

/* ——— Accordion Section ——— */
function AccordionSection({ icon: Icon, title, desc, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${open ? 'border-clay/40 shadow-sm' : 'border-stone-dark'}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${open ? 'bg-clay/5' : 'bg-sand hover:bg-stone/40'}`}
      >
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-clay text-sand' : 'bg-stone text-ink/50'}`}>
          <Icon size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-ink">{title}</span>
            {badge != null && (
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${badge > 0 ? 'bg-clay/15 text-clay' : 'bg-stone text-ink/40'}`}>
                {badge}
              </span>
            )}
          </div>
          {desc && <p className="text-xs text-ink/40 mt-0.5 truncate">{desc}</p>}
        </div>
        <ChevronDown
          size={16}
          className={`text-ink/40 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-6 pt-4 border-t border-stone-dark bg-sand">
          {children}
        </div>
      )}
    </div>
  )
}

/* ——— ImagePicker ——— */
function ImagePicker({ label, value, onChange, aspect = 'aspect-video' }) {
  const { t } = useLanguage()
  const [tab, setTab] = useState('url')
  const [urlInput, setUrlInput] = useState(value || '')
  const [dragOver, setDragOver] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => { setUrlInput(value || '') }, [value])

  async function processFile(file) {
    if (!file.type.startsWith('image/')) {
      setFileError('Please select an image file — JPG, PNG, WebP, or GIF')
      return
    }
    setFileError('')
    setProcessing(true)
    try {
      const dataUrl = await compressImageFile(file)
      const result = await api.upload.image(dataUrl, file.name)
      onChange(result.url)
    } catch (e) {
      setFileError(e.message || 'Failed to process image, please try again')
    } finally {
      setProcessing(false)
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false)
    if (processing) return
    const f = e.dataTransfer.files[0]; if (f) processFile(f)
  }, [processing])

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium text-ink">{label}</p>}
      <div className="flex border border-stone-dark rounded-lg overflow-hidden w-fit bg-stone/30">
        {[
          { key: 'url',    icon: LinkIcon, text: t('admin.linkTab') },
          { key: 'upload', icon: Upload,   text: 'Upload / Drag' },
        ].map(({ key, icon: Icon, text }) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${tab === key ? 'bg-ink text-sand' : 'text-ink/60 hover:bg-stone/60'}`}>
            <Icon size={12} /> {text}
          </button>
        ))}
      </div>

      {tab === 'url' && (
        <div className="flex gap-2">
          <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-stone/40 border border-stone-dark rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40" />
          <button type="button" onClick={() => onChange(urlInput.trim())}
            className="bg-ink text-sand px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-clay transition-colors shrink-0">
            {t('admin.setBtn')}
          </button>
        </div>
      )}
      {tab === 'upload' && (
        <>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" disabled={processing}
            onChange={async e => { if (e.target.files[0]) await processFile(e.target.files[0]); e.target.value = '' }} />
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => !processing && fileRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-lg py-8 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none ${
              processing ? 'opacity-60 pointer-events-none' : ''
            } ${
              dragOver
                ? 'border-clay bg-clay/5 text-clay scale-[1.01]'
                : 'border-stone-dark text-ink/50 hover:border-clay hover:bg-clay/3 hover:text-clay'
            }`}
          >
            {processing ? (
              <>
                <Loader2 size={30} className="animate-spin text-clay" />
                <p className="text-sm font-medium">{t('admin.uploadingCloudinary')}</p>
              </>
            ) : dragOver ? (
              <>
                <ImageIcon size={30} className="text-clay" />
                <p className="text-sm font-semibold">Drop to upload</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <Upload size={22} className="text-ink/30" />
                  <span className="text-ink/20 text-lg font-light">|</span>
                  <ImageIcon size={22} className="text-ink/30" />
                </div>
                <p className="text-sm font-medium">Click to browse  ·  or drag & drop here</p>
                <p className="text-xs text-ink/40">JPG, PNG, WebP supported</p>
              </>
            )}
          </div>
        </>
      )}
      {fileError && (
        <p className="text-xs text-clay flex items-center gap-1.5">⚠️ {fileError}</p>
      )}

      {value ? (
        <div className={`relative w-full ${aspect} rounded-xl overflow-hidden border border-stone-dark bg-stone/30`}>
          <img src={value} alt={label} className="w-full h-full object-cover" onError={e => { e.target.style.opacity = '0.3' }} />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-ink/70 text-sand rounded-full p-1.5 hover:bg-clay transition-colors">
            <RefreshCw size={13} />
          </button>
        </div>
      ) : (
        <div className={`w-full ${aspect} rounded-xl border-2 border-dashed border-stone-dark bg-stone/20 flex flex-col items-center justify-center gap-2`}>
          <ImageIcon size={24} className="text-ink/20" />
          <p className="text-ink/30 text-sm">{t('admin.noImageSet')}</p>
        </div>
      )}
    </div>
  )
}

/* ——— Live Preview ——— */
function LivePreview({ heroSlider, categoryImages, promoBanner, marqueeItems }) {
  const { t } = useLanguage()
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    if (heroSlider.length < 2) return
    const timer = setInterval(() => setSlide(i => (i + 1) % heroSlider.length), 2000)
    return () => clearInterval(timer)
  }, [heroSlider.length])

  return (
    <div className="rounded-xl border border-stone-dark overflow-hidden bg-stone/20 text-[10px] shadow-sm">
      {/* browser bar */}
      <div className="bg-stone px-3 py-2 flex items-center gap-2 border-b border-stone-dark">
        <div className="flex gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        </div>
        <div className="flex-1 bg-stone-dark rounded-md px-2 py-0.5 text-ink/40 font-mono text-[9px] ml-1">
          {t('admin.homepagePreview')}
        </div>
      </div>

      {/* fake navbar */}
      <div className="bg-sand px-3 py-1.5 flex items-center justify-between border-b border-stone-dark/50">
        <div className="w-10 h-1.5 bg-ink/70 rounded" />
        <div className="flex gap-2">
          <div className="w-6 h-1 bg-ink/20 rounded" />
          <div className="w-6 h-1 bg-ink/20 rounded" />
          <div className="w-6 h-1 bg-ink/20 rounded" />
        </div>
      </div>

      {/* hero */}
      <div className="bg-stone p-3 grid grid-cols-2 gap-3 items-center">
        <div>
          <div className="w-8 h-1 bg-clay/50 rounded mb-1.5" />
          <div className="w-16 h-2 bg-ink/60 rounded mb-1" />
          <div className="w-12 h-2 bg-clay/80 rounded mb-2" />
          <div className="w-14 h-4 bg-ink rounded" />
        </div>
        <div className="relative aspect-square rounded-lg overflow-hidden bg-stone-dark">
          {heroSlider.length > 0
            ? <img src={heroSlider[slide]} className="w-full h-full object-cover transition-opacity duration-700" alt="" />
            : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="text-ink/20" /></div>
          }
          {heroSlider.length > 1 && (
            <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
              {heroSlider.map((_, i) => <span key={i} className={`w-1 h-1 rounded-full transition-all ${i === slide ? 'bg-sand w-2.5' : 'bg-sand/40'}`} />)}
            </div>
          )}
        </div>
      </div>

      {/* marquee */}
      {marqueeItems.length > 0 && (
        <div className="bg-clay py-1 px-3 overflow-hidden">
          <p className="text-sand/90 font-mono whitespace-nowrap truncate tracking-widest" style={{fontSize:8}}>
            {marqueeItems.join('  ·  ')}
          </p>
        </div>
      )}

      {/* categories */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {(categoryImages.length > 0 ? categoryImages.slice(0, 4) : [{ key: 'cat1', image: '' }, { key: 'cat2', image: '' }]).map(({ key, image }, i) => (
          <div key={key} className="relative aspect-video rounded-md overflow-hidden bg-stone-dark">
            {image
              ? <img src={image} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={12} className="text-ink/20" /></div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
            <span className="absolute bottom-1 left-1.5 text-sand font-bold" style={{fontSize:8}}>{key}</span>
          </div>
        ))}
      </div>

      {/* promo */}
      {promoBanner.image && (
        <div className="px-3 pb-3">
          <div className="relative aspect-[21/8] rounded-md overflow-hidden bg-stone-dark">
            <img src={promoBanner.image} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/60 to-transparent" />
            {promoBanner.title && (
              <span className="absolute bottom-1 left-2 text-sand font-bold" style={{fontSize:8}}>{promoBanner.title}</span>
            )}
          </div>
        </div>
      )}

      {/* footer hint */}
      <div className="bg-ink/80 px-3 py-2">
        <div className="flex justify-between">
          <div className="w-10 h-1 bg-sand/30 rounded" />
          <div className="flex gap-2">
            <div className="w-6 h-1 bg-sand/20 rounded" />
            <div className="w-6 h-1 bg-sand/20 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ——— Main ——— */
export default function AdminSiteSettings() {
  const { t, lang } = useLanguage()
  const { setLogoImage: setContextLogoImage } = useSiteSettings()
  const { categories } = useCategories()
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')
  const [showPreview, setShowPreview] = useState(true)

  const [heroImage,     setHeroImage]     = useState('')
  const [categoryImages, setCategoryImages] = useState([]) // [{key, image}]
  const [heroSlider,    setHeroSlider]    = useState([])
  const [promoBanner,   setPromoBanner]   = useState({ image: '', title: '', subtitle: '', link: '/shop' })
  const [marqueeItems,  setMarqueeItems]  = useState(DEFAULT_MARQUEE)
  const [newMarquee,    setNewMarquee]    = useState('')
  const [logoImage,     setLogoImage]     = useState('')

  // ━━━ useQuery দিয়ে fetch ও cache ━━━ settings এডিটেবল ফর্ম স্টেটে থাকে,
  // তাই ডেটা এলে নিচের useEffect দিয়ে ফর্মে sync করা হয়। cache hit হলে এই
  // sync প্রায় instant হয়, তাই এই ট্যাবে ফিরে এলে আবার লোডিং দেখায় না।
  const {
    data: settings,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['admin-site-settings'],
    queryFn: () => api.settings.get(),
  })

  useEffect(() => {
    if (!settings) return
    const s = settings
    setHeroImage(s.heroImage || '')
    // categoryImages আসতে পারে [{key,image}] array অথবা পুরনো {shoes,bags} object
    if (Array.isArray(s.categoryImages)) {
      setCategoryImages(s.categoryImages)
    } else if (s.categoryImages && typeof s.categoryImages === 'object') {
      // পুরনো format migrate করি
      const migrated = Object.entries(s.categoryImages)
        .filter(([, img]) => img)
        .map(([key, image]) => ({ key, image }))
      setCategoryImages(migrated)
    }
    setHeroSlider(s.heroSlider || [])
    setPromoBanner(s.promoBanner || { image: '', title: '', subtitle: '', link: '/shop' })
    setMarqueeItems(s.marqueeItems || DEFAULT_MARQUEE)
    setLogoImage(s.logoImage || '')
  }, [settings])

  useEffect(() => {
    if (queryError) setError(queryError.message)
  }, [queryError])

  const sliderForPreview = heroSlider.length > 0 ? heroSlider : (heroImage ? [heroImage] : [])

  async function handleSave() {
    setSaving(true); setError(''); setSuccess(false)
    try {
      await api.settings.update({
        heroImage,
        categoryImages,
        heroSlider,
        promoBanner,
        marqueeItems,
        logoImage,
      })
      setSuccess(true)
      setContextLogoImage(logoImage)
      setTimeout(() => setSuccess(false), 4000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="max-w-5xl animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-8 w-44 bg-stone rounded-lg mb-2" />
          <div className="h-4 w-64 bg-stone rounded" />
        </div>
        <div className="h-9 w-32 bg-stone rounded-lg" />
      </div>
      {/* Accordion items */}
      {[
        { w: 'w-32', dw: 'w-48' },
        { w: 'w-24', dw: 'w-56' },
        { w: 'w-36', dw: 'w-40' },
        { w: 'w-28', dw: 'w-52' },
        { w: 'w-20', dw: 'w-36' },
      ].map(({ w, dw }, i) => (
        <div key={i} className="rounded-xl border border-stone-dark overflow-hidden mb-3">
          <div className="flex items-center gap-3 px-5 py-4 bg-stone/30">
            <div className="w-8 h-8 rounded-lg bg-stone shrink-0" />
            <div className="flex-1">
              <div className={`h-4 ${w} bg-stone rounded mb-1.5`} />
              <div className={`h-3 ${dw} bg-stone rounded`} />
            </div>
            <div className="w-4 h-4 bg-stone rounded" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-ink">{t('admin.siteSettings')}</h1>
          <p className="text-ink/50 text-sm mt-1">{t('admin.siteSettingsDesc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPreview(v => !v)}
            className="flex items-center gap-2 text-sm border border-stone-dark rounded-lg px-3 py-2 hover:border-clay hover:text-clay transition-colors bg-sand">
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden sm:inline">{showPreview ? t('admin.hidePreview') : t('admin.showPreview')}</span>
          </button>
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
          <CheckCircle2 size={16} className="shrink-0" /> {t('admin.saveSuccess')}
        </div>
      )}

      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-[1fr_300px]' : ''}`}>
        {/* ——— Left: accordion sections ——— */}
        <div className="space-y-3">

          {/* 1. Hero Slider */}
          <AccordionSection
            icon={ImageIcon}
            title={t('admin.heroSlider')}
            desc={t('admin.heroSliderDesc')}
            badge={heroSlider.length}
            defaultOpen={true}
          >
            {/* existing slides */}
            {heroSlider.length > 0 && (
              <div className="space-y-2 mb-5">
                {heroSlider.map((src, i) => (
                  <div key={i} className="flex items-center gap-3 bg-stone/50 rounded-lg p-2 border border-stone-dark">
                    <GripVertical size={15} className="text-ink/25 shrink-0" />
                    <img src={src} alt="" className="w-16 h-11 object-cover rounded-md shrink-0 border border-stone-dark" onError={e => e.target.style.opacity = '0.3'} />
                    <p className="text-xs text-ink/50 flex-1 truncate font-mono">{src.length > 45 ? src.slice(0, 45) + '…' : src}</p>
                    <button onClick={() => setHeroSlider(s => s.filter((_, j) => j !== i))}
                      className="text-ink/30 hover:text-clay transition-colors shrink-0 p-1 hover:bg-clay/10 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {heroSlider.length === 0 && (
              <div className="mb-4 py-3 px-4 bg-stone/40 rounded-lg border border-dashed border-stone-dark text-xs text-ink/40">
                {t('admin.noSlides')}
              </div>
            )}
            <ImagePicker label={t('admin.addSlide')} value="" onChange={url => { if (url) setHeroSlider(s => [...s, url]) }} aspect="aspect-video" />

            <div className="mt-5 pt-5 border-t border-stone-dark">
              <p className="text-xs text-ink/40 mb-3 flex items-center gap-1.5">
                <span className="w-3 h-px bg-ink/20 inline-block" />
                {t('admin.singleHeroDesc')}
              </p>
              <ImagePicker label={t('admin.singleHero')} value={heroImage} onChange={setHeroImage} aspect="aspect-video" />
            </div>
          </AccordionSection>

          {/* 2. Marquee */}
          <AccordionSection
            icon={Megaphone}
            title={t('admin.marqueeSection')}
            desc={t('admin.marqueeDesc')}
            badge={marqueeItems.length}
          >
            <div className="space-y-2 mb-4">
              {marqueeItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-stone/50 rounded-lg px-3 py-2.5 border border-stone-dark">
                  <span className="w-1.5 h-1.5 rounded-full bg-clay shrink-0" />
                  <p className="text-sm flex-1">{item}</p>
                  <button onClick={() => setMarqueeItems(m => m.filter((_, j) => j !== i))}
                    className="text-ink/30 hover:text-clay shrink-0 p-1 hover:bg-clay/10 rounded transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newMarquee} onChange={e => setNewMarquee(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newMarquee.trim()) { setMarqueeItems(m => [...m, newMarquee.trim()]); setNewMarquee('') } }}
                placeholder={t('admin.marqueePlaceholder')}
                className="flex-1 bg-stone/40 border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40" />
              <button
                onClick={() => { if (newMarquee.trim()) { setMarqueeItems(m => [...m, newMarquee.trim()]); setNewMarquee('') } }}
                className="bg-clay text-sand px-4 py-2 rounded-lg text-sm font-medium hover:bg-clay-dark transition-colors flex items-center gap-1.5 shrink-0">
                <Plus size={14} /> {t('admin.marqueeAdd')}
              </button>
            </div>
          </AccordionSection>

          {/* 3. Category Images */}
          <AccordionSection
            icon={LayoutGrid}
            title={t('admin.categoryImages')}
            desc={t('admin.categoryImagesDesc')}
            badge={categoryImages.filter(c => c.image).length}
          >
            {categories.length === 0 ? (
              <div className="py-4 text-center text-sm text-ink/40 border border-dashed border-stone-dark rounded-lg">
                {'Add categories first from the Categories section'}
              </div>
            ) : (
              <div className="space-y-6">
                {categories.map((cat) => {
                  const entry = categoryImages.find(c => c.key === cat.key)
                  const imgVal = entry?.image || ''
                  function setCatImage(val) {
                    setCategoryImages(prev => {
                      const exists = prev.find(c => c.key === cat.key)
                      if (exists) return prev.map(c => c.key === cat.key ? { ...c, image: val } : c)
                      return [...prev, { key: cat.key, image: val }]
                    })
                  }
                  return (
                    <div key={cat.key} className="border border-stone-dark rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {cat.icon && <span className="text-lg">{cat.icon}</span>}
                        <span className="font-medium text-sm text-ink">
                          {cat.name.en}
                        </span>
                        <span className="text-xs text-ink/30 font-mono ml-1">({cat.key})</span>
                        {imgVal && (
                          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Image set</span>
                        )}
                      </div>
                      <ImagePicker
                        label=""
                        value={imgVal}
                        onChange={setCatImage}
                        aspect="aspect-video"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </AccordionSection>

          {/* 4. Promo Banner */}
          <AccordionSection
            icon={Tag}
            title={t('admin.promoBanner')}
            desc={t('admin.promoBannerDesc')}
            badge={promoBanner.image ? 1 : 0}
          >
            <ImagePicker label={t('admin.bannerImage')} value={promoBanner.image}
              onChange={v => setPromoBanner(b => ({ ...b, image: v }))} />
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">{t('admin.bannerTitle')}</label>
                <input value={promoBanner.title}
                  onChange={e => setPromoBanner(b => ({ ...b, title: e.target.value }))}
                  placeholder={t('admin.bannerTitlePlaceholder')}
                  className="w-full bg-stone/40 border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">{t('admin.bannerSubtitle')}</label>
                <input value={promoBanner.subtitle}
                  onChange={e => setPromoBanner(b => ({ ...b, subtitle: e.target.value }))}
                  placeholder={t('admin.bannerSubtitlePlaceholder')}
                  className="w-full bg-stone/40 border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-ink mb-1.5">{t('admin.bannerLink')}</label>
                <input value={promoBanner.link}
                  onChange={e => setPromoBanner(b => ({ ...b, link: e.target.value }))}
                  placeholder="/shop"
                  className="w-full bg-stone/40 border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40" />
              </div>
            </div>
          </AccordionSection>

          {/* 5. Site Logo */}
          <AccordionSection
            icon={Image}
            title={t('admin.siteLogo')}
            desc={t('admin.siteLogoDesc')}
            badge={logoImage ? 1 : 0}
          >
            <div className="mb-4 px-3 py-2.5 bg-stone/50 rounded-lg border border-stone-dark text-xs text-ink/50 flex items-start gap-2">
              <span className="shrink-0 mt-0.5">💡</span>
              <span>{t('admin.siteLogoTip')}</span>
            </div>
            <ImagePicker
              label={t('admin.siteLogoLabel')}
              value={logoImage}
              onChange={setLogoImage}
              aspect="aspect-[4/1]"
            />
            {logoImage && (
              <div className="mt-3 p-3 bg-stone/40 rounded-lg border border-stone-dark">
                <p className="text-xs text-ink/40 mb-2">{t('admin.siteLogoPreviewNote')}</p>
                <div className="bg-sand rounded-lg px-4 py-3 border border-stone-dark inline-flex items-center gap-2">
                  <img src={logoImage} alt="logo preview" className="h-10 w-auto max-w-[160px] object-contain" onError={e => e.target.style.opacity='0.3'} />
                </div>
              </div>
            )}

          </AccordionSection>
        </div>

        {/* ——— Right: Live Preview ——— */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 lg:self-start">
            <p className="text-xs font-semibold text-ink/40 uppercase tracking-widest mb-3">{t('admin.livePreview')}</p>
            <LivePreview
              heroSlider={sliderForPreview}
              categoryImages={categoryImages}
              promoBanner={promoBanner}
              marqueeItems={marqueeItems}
            />
            <p className="text-[10px] text-ink/30 text-center mt-2">↑ Real-time preview</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-8 pt-6 border-t border-stone-dark flex items-center justify-between">
        <p className="text-xs text-ink/40">All changes save together</p>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-clay text-sand px-6 py-3 rounded-lg font-medium hover:bg-clay-dark disabled:opacity-60 transition-colors shadow-sm">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? t('admin.savingSettings') : t('admin.saveSettings')}
        </button>
      </div>
    </div>
  )
}
