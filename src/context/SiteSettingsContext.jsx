// SiteSettingsContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api.js'

const SiteSettingsContext = createContext({ logoImage: '', setLogoImage: () => {}, loading: true })

export function SiteSettingsProvider({ children }) {
  const [logoImage, setLogoImageState] = useState(() => localStorage.getItem('cached_logoImage') || '')
  const [loading, setLoading] = useState(() => !localStorage.getItem('cached_logoImage'))

  function setLogoImage(val) {
    setLogoImageState(val)
    if (val) localStorage.setItem('cached_logoImage', val)
    else localStorage.removeItem('cached_logoImage')
  }

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
