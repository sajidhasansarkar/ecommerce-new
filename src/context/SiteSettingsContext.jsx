// SiteSettingsContext.jsx
// সাইটের গ্লোবাল সেটিংস (লোগো ইমেজ ইত্যাদি) একবার লোড করে সব কম্পোনেন্টে শেয়ার করে।
// Navbar লোগো ইমেজ এখান থেকে পড়বে।

import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api.js'

const SiteSettingsContext = createContext({ logoImage: '', setLogoImage: () => {} })

export function SiteSettingsProvider({ children }) {
  const [logoImage, setLogoImage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.settings.get()
      .then(s => { setLogoImage(s.logoImage || '') })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <SiteSettingsContext.Provider value={{ logoImage, setLogoImage, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
