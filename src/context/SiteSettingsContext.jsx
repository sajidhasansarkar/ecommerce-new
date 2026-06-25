// SiteSettingsContext.jsx
// সাইটের গ্লোবাল সেটিংস (লোগো ইমেজ ইত্যাদি) একবার লোড করে সব কম্পোনেন্টে শেয়ার করে।
// Navbar লোগো ইমেজ এখান থেকে পড়বে।

import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api.js'

const SiteSettingsContext = createContext({ logoImage: '', setLogoImage: () => {}, lightImage: '', setLightImage: () => {} })

export function SiteSettingsProvider({ children }) {
  // localStorage থেকে আগের logo নিয়ে শুরু করি — reload-এ flash হবে না
  const [logoImage, setLogoImageState] = useState(() => localStorage.getItem('cached_logoImage') || '')
  const [lightImage, setLightImageState] = useState(() => localStorage.getItem('cached_lightImage') || '')
  // cache থাকলে loading false দিয়ে শুরু — text flash হবে না
  const [loading, setLoading] = useState(() => !localStorage.getItem('cached_logoImage'))

  function setLogoImage(val) {
    setLogoImageState(val)
    if (val) localStorage.setItem('cached_logoImage', val)
    else localStorage.removeItem('cached_logoImage')
  }

  function setLightImage(val) {
    setLightImageState(val)
    if (val) localStorage.setItem('cached_lightImage', val)
    else localStorage.removeItem('cached_lightImage')
  }

  useEffect(() => {
    api.settings.get()
      .then(s => {
        setLogoImage(s.logoImage || '')
        setLightImage(s.lightImage || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <SiteSettingsContext.Provider value={{ logoImage, setLogoImage, lightImage, setLightImage, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
