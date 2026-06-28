import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '../context/LanguageContext.jsx'
import { Package, DollarSign, AlertTriangle, TrendingUp, ShoppingCart } from 'lucide-react'
import { api } from '../api.js'

export default function Dashboard() {
  const { t, lang } = useLanguage()

  // ━━━ useQuery দিয়ে fetch ও cache ━━━
  // প্রথমবার লোড হওয়ার সময়ই শুধু loading skeleton দেখায়; পরে এই ট্যাবে
  // ফিরে আসলে cache থেকে ডেটা সাথে সাথে দেখায়, আবার নতুন করে লোডিং দেখায় না।
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ['admin-dashboard-products'],
    // ড্যাশবোর্ড স্ট্যাট (total products, low stock, avg price) পুরো ক্যাটালগ
    // থেকে হিসাব হয়, তাই বড় limit চাওয়া হলো
    queryFn: () => api.products.list({ limit: 500 }).then((res) => res.products ?? res),
  })

  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ['admin-dashboard-orders'],
    queryFn: () => api.orders.list(),
  })

  const loading = productsLoading || ordersLoading
  const error = productsError?.message || ordersError?.message || ''

  if (loading) return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="h-8 w-40 bg-stone rounded-lg mb-2" />
      <div className="h-4 w-64 bg-stone rounded mb-8" />
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-sand rounded-xl p-5 border border-stone-dark">
            <div className="w-6 h-6 bg-stone rounded mb-3" />
            <div className="h-7 w-16 bg-stone rounded mb-2" />
            <div className="h-3 w-24 bg-stone rounded" />
          </div>
        ))}
      </div>
      {/* Low stock panel */}
      <div className="bg-sand rounded-xl border border-stone-dark p-5 mb-6">
        <div className="h-5 w-36 bg-stone rounded mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-stone shrink-0" />
              <div className="h-4 w-32 bg-stone rounded" />
            </div>
            <div className="h-4 w-16 bg-stone rounded" />
          </div>
        ))}
      </div>
      {/* Recent orders panel */}
      <div className="bg-sand rounded-xl border border-stone-dark p-5">
        <div className="h-5 w-36 bg-stone rounded mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-t border-stone-dark">
            <div className="h-4 w-24 bg-stone rounded" />
            <div className="h-4 w-28 bg-stone rounded" />
            <div className="h-4 w-16 bg-stone rounded" />
            <div className="h-6 w-20 bg-stone rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
  if (error) return <div className="text-clay py-10 text-center">{error}</div>

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const lowStock = products.filter((p) => p.stock <= 10)
  const avgPrice = products.length ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0
  const pendingOrders = orders.filter((o) => o.status === 'processing').length

  const statusLabel = (status) => {
    const map = {
      processing: t('admin.statusProcessingLabel'),
      shipped:    t('admin.statusShippedLabel'),
      delivered:  t('admin.statusDeliveredLabel'),
      cancelled:  t('admin.statusCancelledLabel'),
    }
    return map[status] || status
  }

  const statusColor = (status) => {
    if (status === 'processing') return 'bg-gold/20 text-gold'
    if (status === 'shipped')    return 'bg-sage/20 text-sage'
    if (status === 'delivered')  return 'bg-sage/30 text-ink'
    return 'bg-clay/15 text-clay-dark'
  }

  const stats = [
    { label: t('admin.totalProducts'), value: products.length,   icon: Package,      color: 'text-clay' },
    { label: t('admin.totalStock'),    value: totalStock,         icon: TrendingUp,   color: 'text-sage' },
    { label: t('admin.avgPrice'),      value: `৳${avgPrice}`,    icon: DollarSign,   color: 'text-gold' },
    { label: t('admin.pendingOrders'), value: pendingOrders,      icon: ShoppingCart, color: 'text-clay-dark' },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl lg:text-3xl text-ink mb-1">{t('admin.dashboard')}</h1>
      <p className="text-ink/60 text-sm mb-8">{t('admin.dashboardDesc')}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-sand rounded-xl p-5 border border-stone-dark">
            <Icon size={20} className={`${color} mb-3`} />
            <p className="font-display text-2xl text-ink">{value}</p>
            <p className="text-xs text-ink/50 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Low stock */}
      <div className="bg-sand rounded-xl border border-stone-dark p-5 mb-6">
        <h2 className="font-display text-lg text-ink mb-4 flex items-center gap-2">
          <AlertTriangle size={17} className="text-clay" />
          {t('admin.lowStockTitle')}
        </h2>
        {lowStock.length === 0 ? (
          <p className="text-sm text-ink/60">{t('admin.lowStockOk')}</p>
        ) : (
          <div className="space-y-3">
            {lowStock.map((p) => (
              <div key={p._id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <img src={p.images[0]} alt={p.name[lang]} className="w-10 h-10 rounded object-cover bg-stone" />
                  <span className="text-ink">{p.name[lang]}</span>
                </div>
                <span className="font-mono text-clay font-medium">{p.stock} {t('admin.pieceLeft')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent orders */}
      {orders.length > 0 && (
        <div className="bg-sand rounded-xl border border-stone-dark p-5">
          <h2 className="font-display text-lg text-ink mb-4">{t('admin.recentOrders')}</h2>
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr] text-[11px] font-semibold uppercase tracking-wide text-ink/40 pb-2 border-b border-stone-dark mb-1">
            <span>Order #</span>
            <span>Customer</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Status</span>
          </div>
          <div className="space-y-1">
            {orders.slice(0, 5).map((o) => (
              <div key={o._id} className="grid grid-cols-[1fr_1.5fr_1fr_1fr] items-center text-sm py-2 border-b border-stone-dark/50 last:border-0">
                <span className="font-mono text-xs text-ink/60 truncate">{o.orderNumber}</span>
                <span className="text-ink truncate pr-2">{o.fullName}</span>
                <span className="font-mono text-ink text-right">৳{o.total}</span>
                <span className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(o.status)}`}>
                    {statusLabel(o.status)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// exported separately so it can be tree-shaken if not needed
