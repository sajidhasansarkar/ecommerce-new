import React, { useState, useEffect } from 'react'
import { Eye, Trash2, Pencil, Download, X, Loader2, AlertTriangle, Check, FileText } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { api } from '../api.js'

const STATUS_COLORS = {
  processing: 'bg-amber-100 text-amber-700',
  shipped:    'bg-blue-100 text-blue-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-600',
}
const STATUS_EN = {
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
}
const PAYMENT_EN = {
  cod:   'Cash on Delivery',
  bkash: 'Mobile Banking',
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formatDateEn(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ─── Build receipt HTML ─── */
function buildReceiptHTML(order) {
  const statusLabel = STATUS_EN[order.status] || order.status
  const paymentLabel = PAYMENT_EN[order.paymentMethod] || order.paymentMethod

  const statusStyle = {
    processing: 'background:#fef3c7;color:#92400e',
    shipped:    'background:#dbeafe;color:#1e40af',
    delivered:  'background:#dcfce7;color:#166534',
    cancelled:  'background:#fee2e2;color:#b91c1c',
  }[order.status] || 'background:#f3f4f6;color:#374151'

  const rows = order.items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#fafaf9'}">
      <td style="padding:10px 12px;border-bottom:1px solid #f0ede8">
        <div style="font-weight:600;color:#1a1a1a">${item.name}</div>
        ${item.size || item.color ? `<div style="font-size:11px;color:#9a8f85;margin-top:2px">${[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}</div>` : ''}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ede8;text-align:center;color:#555">${item.qty}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ede8;text-align:right;color:#555">৳${item.price.toLocaleString()}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ede8;text-align:right;font-weight:600;color:#1a1a1a">৳${(item.price * item.qty).toLocaleString()}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Receipt — ${order.orderNumber}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#f5f0e8;min-height:100vh;padding:32px 16px}
  .page{max-width:680px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10)}
  .header{background:#1a1a1a;color:#fff;padding:28px 32px;display:flex;justify-content:space-between;align-items:flex-start}
  .brand{font-size:28px;font-weight:800;letter-spacing:-1px}
  .brand span{color:#c75d3c}
  .receipt-label{text-align:right}
  .receipt-label h2{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#aaa;margin-bottom:6px}
  .receipt-label .order-num{font-size:18px;font-weight:700;color:#fff;font-family:monospace}
  .receipt-label .date{font-size:12px;color:#888;margin-top:4px}
  .status-pill{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;margin-top:8px;${statusStyle}}
  .body{padding:28px 32px}
  .section{margin-bottom:24px}
  .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#b5a99a;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #f0ede8}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .info-item label{font-size:10px;color:#b5a99a;display:block;margin-bottom:3px;text-transform:uppercase;letter-spacing:.5px}
  .info-item p{font-size:14px;font-weight:600;color:#1a1a1a}
  .info-item.full{grid-column:1/-1}
  table{width:100%;border-collapse:collapse;font-size:13px}
  thead tr{background:#f5f0e8}
  thead th{padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9a8f85}
  thead th:nth-child(2){text-align:center}
  thead th:nth-child(3),thead th:nth-child(4){text-align:right}
  .totals-box{background:#f5f0e8;border-radius:10px;padding:16px 20px;margin-top:20px}
  .totals-row{display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;color:#6b5f57}
  .totals-row.grand{font-size:17px;font-weight:800;color:#1a1a1a;border-top:2px solid #ddd8d0;padding-top:12px;margin-top:8px;margin-bottom:0}
  .footer{background:#f5f0e8;padding:16px 32px;text-align:center;font-size:11px;color:#b5a99a;border-top:1px solid #ede8e0}
  .footer strong{color:#9a8f85}
  @media print{
    body{background:#fff;padding:0}
    .page{box-shadow:none;border-radius:0;max-width:100%}
    @page{margin:10mm;size:A4}
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">My Shop<span>.</span></div>
    <div class="receipt-label">
      <h2>Order Receipt</h2>
      <div class="order-num">${order.orderNumber}</div>
      <div class="date">${formatDateEn(order.createdAt)}</div>
      <div><span class="status-pill">${statusLabel}</span></div>
    </div>
  </div>

  <div class="body">
    <div class="section">
      <div class="section-title">Delivery Information</div>
      <div class="info-grid">
        <div class="info-item">
          <label>Customer Name</label>
          <p>${order.fullName}</p>
        </div>
        <div class="info-item">
          <label>Phone Number</label>
          <p>${order.phone}</p>
        </div>
        <div class="info-item full">
          <label>Address</label>
          <p>${order.address}, ${order.city}</p>
        </div>
        <div class="info-item">
          <label>Payment Method</label>
          <p>${paymentLabel}</p>
        </div>
        <div class="info-item">
          <label>Order Date</label>
          <p>${formatDateEn(order.createdAt)}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Products</div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Unit Price</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="totals-box">
        <div class="totals-row"><span>Subtotal</span><span>৳${order.subtotal.toLocaleString()}</span></div>
        <div class="totals-row"><span>Delivery Charge</span><span>${order.shipping === 0 ? 'Free' : '৳' + order.shipping.toLocaleString()}</span></div>
        <div class="totals-row grand"><span>Grand Total</span><span>৳${order.total.toLocaleString()}</span></div>
      </div>
    </div>
  </div>

  <div class="footer">
    <strong>My Shop</strong> &nbsp;·&nbsp; hello@yourstore.com
    <br/>Thank you for your order! Please keep this receipt.
  </div>
</div>
<script>
  // Auto-open print dialog when opened standalone
  if (window.opener === null && !document.referrer) {
    window.addEventListener('load', () => setTimeout(() => window.print(), 300))
  }
</script>
</body>
</html>`
}

/* ─── Download receipt as HTML file ─── */
function downloadReceipt(order) {
  const html = buildReceiptHTML(order)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `receipt-${order.orderNumber}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* ─── Confirm Dialog ─── */
function ConfirmDialog({ message, subMessage, onConfirm, onCancel, danger = true }) {
  const { t } = useLanguage()
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60" onClick={onCancel} />
      <div className="relative bg-sand rounded-xl p-6 w-full max-w-sm shadow-xl">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
          <AlertTriangle size={20} className={danger ? 'text-red-500' : 'text-amber-500'} />
        </div>
        <p className="font-medium text-ink mb-1">{message}</p>
        {subMessage && <p className="text-sm text-ink/60 mb-5">{subMessage}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 border border-stone-dark text-ink py-2 rounded-lg text-sm hover:bg-stone transition-colors">
            {t("admin.cancel")}
          </button>
          <button onClick={onConfirm} className={`flex-1 py-2 rounded-lg text-sm font-medium text-sand transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-clay hover:bg-clay-dark'}`}>
            {t("admin.confirmBtn")}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Edit Modal ─── */
function EditModal({ order, onClose, onSaved }) {
  const { t } = useLanguage()
  const [form, setForm] = useState({
    fullName: order.fullName,
    phone: order.phone,
    address: order.address,
    city: order.city,
    paymentMethod: order.paymentMethod,
    status: order.status,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const updated = await api.orders.update(order._id, form)
      onSaved(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative bg-sand rounded-xl w-full max-w-lg max-h-[92vh] overflow-y-auto thin-scroll shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-dark">
          <h2 className="font-display text-lg text-ink">{t("admin.editTitle")} — {order.orderNumber}</h2>
          <button onClick={onClose} className="tap-tight text-ink/50 hover:text-clay"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("checkout.fullName")} name="fullName" value={form.fullName} onChange={handleChange} />
            <Field label={t("checkout.phone")} name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <Field label={t("checkout.address")} name="address" value={form.address} onChange={handleChange} as="textarea" />
          <Field label={t("checkout.city")} name="city" value={form.city} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1.5">{t("checkout.paymentMethod")}</label>
              <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}
                className="w-full bg-stone border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40">
                <option value="cod">{t("checkout.cod")}</option>
                <option value="bkash">{t("checkout.mobileBank")}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1.5">{t("admin.statusCol")}</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full bg-stone border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40">
                <option value="processing">{t("admin.statusProcessing")}</option>
                <option value="shipped">{t("admin.statusShipped")}</option>
                <option value="delivered">{t("admin.statusDelivered")}</option>
                <option value="cancelled">{t("admin.statusCancelled")}</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-stone-dark flex gap-3">
          <button onClick={onClose} className="flex-1 border border-stone-dark text-ink py-2.5 rounded-lg text-sm hover:bg-stone transition-colors">
            {t("admin.cancel")}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-clay text-sand py-2.5 rounded-lg text-sm font-medium hover:bg-clay-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? t("admin.savingBtn") : t("admin.saveBtn")}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, as = 'input' }) {
  const Tag = as
  return (
    <div>
      <label className="block text-xs font-medium text-ink/60 mb-1.5">{label}</label>
      <Tag
        name={name} value={value} onChange={onChange}
        rows={as === 'textarea' ? 2 : undefined}
        className="w-full bg-stone border border-stone-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40 resize-none"
      />
    </div>
  )
}

/* ─── View Modal ─── */
function ViewModal({ order, onClose, onDownload, onEdit, onDelete, onStatusChange, updatingId }) {
  const { t } = useLanguage()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative bg-sand rounded-xl w-full max-w-lg max-h-[92vh] overflow-y-auto thin-scroll shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-dark">
          <div>
            <h2 className="font-display text-lg text-ink">{order.orderNumber}</h2>
            <p className="text-xs text-ink/50">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onDownload} title={t("admin.receiptDownload")}
              className="tap-tight flex items-center gap-1.5 bg-ink text-sand px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-clay transition-colors">
              <Download size={13} /> {t("admin.receiptDownload")}
            </button>
            <button onClick={onEdit} title={t("admin.editTitle")}
              className="tap-tight p-2 text-ink/50 hover:text-clay transition-colors">
              <Pencil size={16} />
            </button>
            <button onClick={onDelete} title={t("admin.deleteTitle")}
              className="tap-tight p-2 text-ink/50 hover:text-red-500 transition-colors">
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="tap-tight p-2 text-ink/50 hover:text-clay"><X size={18} /></button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 text-sm">
          {/* Customer info */}
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label={t("admin.customerNameLabel")} value={order.fullName} />
            <InfoRow label={t("admin.phoneLabel")} value={order.phone} />
            <div className="col-span-2">
              <InfoRow label={t("admin.addressLabel")} value={`${order.address}, ${order.city}`} />
            </div>
            <InfoRow label={t("admin.paymentLabel")} value={PAYMENT_EN[order.paymentMethod] || order.paymentMethod} />
            <InfoRow label={t("admin.statusCol")} value={
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                {STATUS_EN[order.status]}
              </span>
            } />
          </div>

          {/* Items */}
          <div className="border-t border-stone-dark pt-4">
            <p className="text-xs text-ink/50 mb-3 font-medium uppercase tracking-wide">{t("admin.productsLabel")}</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-stone/40 rounded-lg p-3">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-md object-cover shrink-0 bg-stone" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-ink font-medium truncate">{item.name}</p>
                    <p className="text-ink/50 text-xs">
                      {item.size && `${t("admin.sizeLabel")}: ${item.size}`}
                      {item.size && item.color && ' · '}
                      {item.color && `${t("admin.colorLabel")}: ${item.color}`}
                      {' · '}{t("admin.qtyLabel")}: {item.qty}
                    </p>
                  </div>
                  <span className="font-mono text-ink shrink-0">৳{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-stone/40 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-ink/70"><span>{t("admin.subtotalLabel")}</span><span className="font-mono">৳{order.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-ink/70"><span>{t("admin.deliveryChargeLabel")}</span><span className="font-mono">{order.shipping === 0 ? t("admin.freeLabel") : `৳${order.shipping.toLocaleString()}`}</span></div>
            <div className="flex justify-between text-ink font-semibold border-t border-stone-dark pt-2 mt-1">
              <span>{t("admin.grandTotalLabel")}</span><span className="font-mono">৳{order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick status change */}
          <div className="border-t border-stone-dark pt-4">
            <p className="text-xs text-ink/50 mb-2 font-medium uppercase tracking-wide">{t("admin.changeStatusLabel")}</p>
            <div className="flex gap-2 flex-wrap">
              {['processing','shipped','delivered','cancelled'].map(s => (
                <button key={s}
                  onClick={() => onStatusChange(order._id, s)}
                  disabled={order.status === s || updatingId === order._id}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                    order.status === s ? 'bg-ink text-sand' : 'bg-stone hover:bg-stone-dark text-ink'
                  }`}
                >
                  {updatingId === order._id && order.status !== s
                    ? <Loader2 size={12} className="animate-spin inline" />
                    : STATUS_EN[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Download receipt CTA */}
          <div className="border-t border-stone-dark pt-4">
            <button onClick={onDownload}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-stone-dark text-ink/60 hover:border-clay hover:text-clay rounded-xl py-3 text-sm font-medium transition-colors">
              <FileText size={16} />
              {t("admin.receiptDownloadCta")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-ink/50 mb-0.5">{label}</p>
      <p className="text-ink font-medium">{value}</p>
    </div>
  )
}

/* ─── Main Component ─── */
export default function AdminOrders() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [toast, setToast] = useState('')
  const [confirm, setConfirm] = useState(null)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

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
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder?._id === orderId) setSelectedOrder(o => ({ ...o, status: newStatus }))
      showToast(t("admin.statusUpdated"))
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleDelete(orderId) {
    try {
      await api.orders.delete(orderId)
      setOrders(prev => prev.filter(o => o._id !== orderId))
      setSelectedOrder(null)
      showToast(t("admin.orderDeleted"))
    } catch (err) {
      console.error(err)
    } finally {
      setConfirm(null)
    }
  }

  async function handleDeleteCancelled() {
    try {
      const res = await api.orders.deleteCancelled()
      setOrders(prev => prev.filter(o => o.status !== 'cancelled'))
      showToast(res.message || t("admin.cancelledOrdersDeleted"))
    } catch (err) {
      console.error(err)
    } finally {
      setConfirm(null)
    }
  }

  function handleSaved(updated) {
    setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))
    if (selectedOrder?._id === updated._id) setSelectedOrder(updated)
    setEditingOrder(null)
    showToast(t("admin.orderUpdated"))
  }

  const cancelledCount = orders.filter(o => o.status === 'cancelled').length

  const statuses = [
    { key: 'all',        label: t("admin.statusAll") },
    { key: 'processing', label: t("admin.statusProcessing") },
    { key: 'shipped',    label: t("admin.statusShipped") },
    { key: 'delivered',  label: t("admin.statusDelivered") },
    { key: 'cancelled',  label: t("admin.statusCancelled") },
  ]

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[70] bg-ink text-sand text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-up">
          <Check size={14} className="text-sage" /> {toast}
        </div>
      )}

      {/* Confirm Dialogs */}
      {confirm?.type === 'delete' && (
        <ConfirmDialog
          message={t("admin.deleteOrderConfirm")}
          subMessage={t("admin.deleteOrderSub")}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.type === 'deleteCancelled' && (
        <ConfirmDialog
          message={t("admin.deleteCancelledConfirm", cancelledCount)}
          subMessage={t("admin.deleteCancelledSub")}
          onConfirm={handleDeleteCancelled}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Edit Modal */}
      {editingOrder && (
        <EditModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={handleSaved}
        />
      )}

      {/* View Modal */}
      {selectedOrder && !editingOrder && (
        <ViewModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onDownload={() => { downloadReceipt(selectedOrder); showToast(t("admin.receiptDownloading")) }}
          onEdit={() => setEditingOrder(selectedOrder)}
          onDelete={() => setConfirm({ type: 'delete', id: selectedOrder._id })}
          onStatusChange={handleStatusChange}
          updatingId={updatingId}
        />
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-ink mb-1">{t("admin.orderManagement")}</h1>
          <p className="text-ink/60 text-sm">{t("admin.ordersSubDesc")}</p>
        </div>
        {cancelledCount > 0 && (
          <button
            onClick={() => setConfirm({ type: 'deleteCancelled' })}
            className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} /> {t("admin.deleteCancelledBtn", cancelledCount)}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {statuses.map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === s.key ? 'bg-ink text-sand' : 'bg-stone text-ink/60 hover:bg-stone-dark'
            }`}>
            {s.label}
            {s.key === 'cancelled' && cancelledCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{cancelledCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-ink/50 py-10 text-center flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> {t("common.loading")}
        </div>
      ) : (
        <div className="bg-sand rounded-xl border border-stone-dark overflow-hidden">
          <div className="overflow-x-auto thin-scroll">
            <table className="w-full text-sm">
              <thead className="bg-stone/50 text-left text-ink/60 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">{t("admin.orderNumberCol")}</th>
                  <th className="px-4 py-3">{t("admin.customerNameCol")}</th>
                  <th className="px-4 py-3">{t("admin.dateCol")}</th>
                  <th className="px-4 py-3">{t("admin.totalCol")}</th>
                  <th className="px-4 py-3">{t("admin.statusCol")}</th>
                  <th className="px-4 py-3 text-right">{t("admin.actionColOrders")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} className="border-t border-stone-dark hover:bg-stone/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-ink text-xs">{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-ink font-medium">{o.fullName}</p>
                      <p className="text-ink/50 text-xs">{o.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-ink/60 text-xs">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-ink">৳{o.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                        {STATUS_EN[o.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Download receipt directly from table row */}
                        <button
                          onClick={() => { downloadReceipt(o); showToast(t("admin.receiptDownloading")) }}
                          title={t("admin.receiptDownload")}
                          className="tap-tight p-1.5 text-ink/40 hover:text-clay transition-colors">
                          <Download size={14} />
                        </button>
                        <button onClick={() => setEditingOrder(o)} title={t("admin.editTitle")}
                          className="tap-tight p-1.5 text-ink/40 hover:text-clay transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setSelectedOrder(o)} title={t("admin.viewTitle")}
                          className="tap-tight p-1.5 text-ink/40 hover:text-clay transition-colors">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => setConfirm({ type: 'delete', id: o._id })} title={t("admin.deleteTitle")}
                          className="tap-tight p-1.5 text-ink/40 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-ink/40">{t("admin.noOrders")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
