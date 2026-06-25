// CategoryContext.jsx
// ক্যাটাগরি একবার API থেকে লোড করে সব component-এ শেয়ার করে।
// Navbar, Shop, AdminProducts — সবাই এখান থেকে পড়বে।
// নতুন ক্যাটাগরি DB-তে যোগ হলে এখানে auto-reflect হবে।

import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api.js'

const CategoryContext = createContext([])

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.categories.list()
      .then(setCategories)
      .catch(() => {
        // Fallback: যদি API কাজ না করে, default দুটো ক্যাটাগরি দেখাবে
        setCategories([
          { key: 'shoes', name: { bn: 'জুতা', en: 'Shoes' }, icon: '👟' },
          { key: 'bags',  name: { bn: 'ভ্যানিটি ব্যাগ', en: 'Vanity Bags' }, icon: '👜' },
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <CategoryContext.Provider value={{ categories, loading, setCategories }}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  return useContext(CategoryContext)
}
