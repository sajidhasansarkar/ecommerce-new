import React, { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { api } from '../api.js'

export default function AdminCustomers() {
  const { t } = useLanguage()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await api.orders.customers()
        setCustomers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="text-ink/50 py-10 text-center">লোড হচ্ছে...</div>

  return (
    <div>
      <h1 className="font-display text-2xl lg:text-3xl text-ink mb-1">{t('admin.customers')}</h1>
      <p className="text-ink/60 text-sm mb-6">{customers.length} জন কাস্টমার</p>

      {error && <p className="text-clay text-sm mb-4">{error}</p>}

      <div className="bg-sand rounded-xl border border-stone-dark overflow-hidden">
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead className="bg-stone/50 text-left text-ink/60 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">{t('admin.nameCol')}</th>
                <th className="px-4 py-3">ফোন</th>
                <th className="px-4 py-3">{t('admin.orderCountCol')}</th>
                <th className="px-4 py-3">{t('admin.totalSpentCol')}</th>
                <th className="px-4 py-3">সর্বশেষ অর্ডার</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-t border-stone-dark">
                  <td className="px-4 py-3 text-ink font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-ink/60 font-mono">{c._id}</td>
                  <td className="px-4 py-3 text-ink/70">{c.orders}</td>
                  <td className="px-4 py-3 font-mono text-ink">৳{c.spent}</td>
                  <td className="px-4 py-3 text-ink/60">
                    {new Date(c.lastOrderDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink/40">এখনো কোনো অর্ডার হয়নি</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
