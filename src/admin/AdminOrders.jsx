import React, { useState, useEffect } from 'react'
import { Eye, X, Loader2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { api } from '../api.js'

const statusColors = {
  processing: 'bg-gold/20 text-gold',
  shipped: 'bg-sage/20 text-sage',
  delivered: 'bg-sage/30 text-ink',
  cancelled: 'bg-clay/15 text-clay-dark',
}

export default function AdminOrders() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  async function loadOrders() {
    try {
      const data = await api.orders.list(filter !== 'all' ? { status: filter } : {})
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadOrders()
  }, [filter])

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId)
    try {
      await api.orders.updateStatus(orderId, newStatus)
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((o) => ({ ...o, status: newStatus }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const statuses = [
    { key: 'all', label: t('admin.statusAll') },
    { key: 'processing', label: t('admin.statusProcessing') },
    { key: 'shipped', label: t('admin.statusShipped') },
    { key: 'delivered', label: t('admin.statusDelivered') },
    { key: 'cancelled', label: t('admin.statusCancelled') },
  ]

  const statusLabel = {
    processing: t('admin.statusProcessing'),
    shipped: t('admin.statusShipped'),
    delivered: t('admin.statusDelivered'),
    cancelled: t('admin.statusCancelled'),
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div>
      <h1 className="font-display text-2xl lg:text-3xl text-ink mb-1">{t('admin.orders')}</h1>
      <p className="text-ink/60 text-sm mb-6">{t('admin.ordersDesc')}</p>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === s.key ? 'bg-ink text-sand' : 'bg-stone text-ink/60 hover:bg-stone-dark'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-ink/50 py-10 text-center">লোড হচ্ছে...</div>
      ) : (
        <div className="bg-sand rounded-xl border border-stone-dark overflow-hidden">
          <div className="overflow-x-auto thin-scroll">
            <table className="w-full text-sm">
              <thead className="bg-stone/50 text-left text-ink/60 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">{t('admin.orderIdCol')}</th>
                  <th className="px-4 py-3">{t('admin.customerCol')}</th>
                  <th className="px-4 py-3">{t('admin.dateCol')}</th>
                  <th className="px-4 py-3">{t('admin.totalCol')}</th>
                  <th className="px-4 py-3">{t('admin.statusCol')}</th>
                  <th className="px-4 py-3 text-right">{t('admin.viewCol')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-t border-stone-dark">
                    <td className="px-4 py-3 font-mono text-ink">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-ink">{o.fullName}</td>
                    <td className="px-4 py-3 text-ink/60">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-ink">৳{o.total}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[o.status]}`}>
                        {statusLabel[o.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelectedOrder(o)} className="p-1.5 text-ink/50 hover:text-clay">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-ink/40">কোনো অর্ডার নেই</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* অর্ডার ডিটেইলস মোডাল */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-sand rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto thin-scroll">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-ink">{selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-ink/50 text-xs mb-0.5">গ্রাহকের নাম</p>
                  <p className="text-ink font-medium">{selectedOrder.fullName}</p>
                </div>
                <div>
                  <p className="text-ink/50 text-xs mb-0.5">ফোন</p>
                  <p className="text-ink">{selectedOrder.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-ink/50 text-xs mb-0.5">ঠিকানা</p>
                  <p className="text-ink">{selectedOrder.address}, {selectedOrder.city}</p>
                </div>
                <div>
                  <p className="text-ink/50 text-xs mb-0.5">পেমেন্ট</p>
                  <p className="text-ink">{selectedOrder.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'বিকাশ'}</p>
                </div>
                <div>
                  <p className="text-ink/50 text-xs mb-0.5">তারিখ</p>
                  <p className="text-ink">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div className="border-t border-stone-dark pt-4">
                <p className="text-ink/50 text-xs mb-2">প্রোডাক্টসমূহ</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-stone-dark/50 last:border-0">
                    <div>
                      <p className="text-ink">{item.name}</p>
                      <p className="text-ink/50 text-xs">{item.color && `রং: ${item.color}`} {item.size && `| সাইজ: ${item.size}`} | পরিমাণ: {item.qty}</p>
                    </div>
                    <p className="font-mono text-ink">৳{item.price * item.qty}</p>
                  </div>
                ))}
              </div>

              <div className="bg-stone/40 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-ink/70"><span>সাবটোটাল</span><span className="font-mono">৳{selectedOrder.subtotal}</span></div>
                <div className="flex justify-between text-ink/70"><span>ডেলিভারি</span><span className="font-mono">৳{selectedOrder.shipping}</span></div>
                <div className="flex justify-between text-ink font-medium border-t border-stone-dark pt-1 mt-1"><span>মোট</span><span className="font-mono">৳{selectedOrder.total}</span></div>
              </div>

              <div>
                <p className="text-ink/50 text-xs mb-2">স্ট্যাটাস পরিবর্তন করুন</p>
                <div className="flex gap-2 flex-wrap">
                  {['processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedOrder._id, s)}
                      disabled={selectedOrder.status === s || updatingId === selectedOrder._id}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                        selectedOrder.status === s ? 'bg-ink text-sand' : 'bg-stone hover:bg-stone-dark text-ink'
                      }`}
                    >
                      {updatingId === selectedOrder._id && selectedOrder.status !== s ? <Loader2 size={12} className="animate-spin inline" /> : statusLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
