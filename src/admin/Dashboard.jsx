import React, { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { Package, DollarSign, AlertTriangle, TrendingUp, ShoppingCart } from 'lucide-react'
import { api } from '../api.js'

export default function Dashboard() {
  const { t, lang } = useLanguage()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [prods, ords] = await Promise.all([
          api.products.list(),
          api.orders.list(),
        ])
        setProducts(prods)
        setOrders(ords)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="text-ink/50 py-10 text-center">লোড হচ্ছে...</div>
  if (error) return <div className="text-clay py-10 text-center">{error}</div>

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const lowStock = products.filter((p) => p.stock <= 10)
  const avgPrice = products.length ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0
  const pendingOrders = orders.filter((o) => o.status === 'processing').length

  const stats = [
    { label: t('admin.totalProducts'), value: products.length, icon: Package, color: 'text-clay' },
    { label: t('admin.totalStock'), value: totalStock, icon: TrendingUp, color: 'text-sage' },
    { label: t('admin.avgPrice'), value: `৳${avgPrice}`, icon: DollarSign, color: 'text-gold' },
    { label: 'পেন্ডিং অর্ডার', value: pendingOrders, icon: ShoppingCart, color: 'text-clay-dark' },
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

      {/* লো স্টক */}
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

      {/* সাম্প্রতিক অর্ডার */}
      {orders.length > 0 && (
        <div className="bg-sand rounded-xl border border-stone-dark p-5">
          <h2 className="font-display text-lg text-ink mb-4">সাম্প্রতিক অর্ডার</h2>
          <div className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <div key={o._id} className="flex items-center justify-between text-sm py-1 border-b border-stone-dark last:border-0">
                <span className="font-mono text-ink/70">{o.orderNumber}</span>
                <span className="text-ink">{o.fullName}</span>
                <span className="font-mono text-ink">৳{o.total}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  o.status === 'processing' ? 'bg-gold/20 text-gold' :
                  o.status === 'shipped' ? 'bg-sage/20 text-sage' :
                  o.status === 'delivered' ? 'bg-sage/30 text-ink' :
                  'bg-clay/15 text-clay-dark'
                }`}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
