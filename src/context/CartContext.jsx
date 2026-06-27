import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'my_shop_cart_v1'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const [toast, setToast] = useState(null)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // স্টোরেজ ব্যর্থ হলে নিরবে এড়িয়ে যাওয়া হচ্ছে
    }
  }, [items])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast?.ts])

  function addItem(product, qty = 1, options = {}) {
    const { color = null, size = null, displayName = product.name } = options
    // Use MongoDB _id — this is what the order system needs
    const productId = product._id
    const skuId = product.productId || null   // SHOE-001 style ID
    setItems((prev) => {
      const key = `${productId}__${color || 'default'}__${size || 'default'}`
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
      }
      return [
        ...prev,
        {
          key,
          id: productId,           // MongoDB ObjectId string
          skuId,                   // SHOE-001 style product ID
          name: displayName,
          price: product.price,
          image: product.images?.[0] || '',
          color,
          size,
          qty,
        },
      ]
    })
    setToast({ name: displayName, ts: Date.now() })
  }

  function removeItem(key) {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }

  function updateQty(key, qty) {
    if (qty < 1) return
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)))
  }

  function clearCart() {
    setItems([])
  }

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items])
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])

  const value = {
    items,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    subtotal,
    itemCount,
    toast,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
