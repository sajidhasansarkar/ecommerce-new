import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../data/translations.js'

const LanguageContext = createContext(null)

const STORAGE_KEY = 'my_shop_lang'

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved === 'en' || saved === 'bn' ? saved : 'bn'
    } catch {
      return 'bn'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // স্টোরেজ না থাকলেও সমস্যা নেই, স্টেট মেমোরিতে চলবে
    }
    document.documentElement.lang = lang
  }, [lang])

  function toggleLang() {
    setLang((l) => (l === 'bn' ? 'en' : 'bn'))
  }

  // t('nav.shop') এর মত key দিয়ে নেস্টেড translation খোঁজে।
  // মান যদি ফাংশন হয় (যেমন কাউন্ট-নির্ভর টেক্সট), তাহলে args দিয়ে কল করা হয়।
  function t(key, ...args) {
    const parts = key.split('.')
    let result = translations[lang]
    for (const part of parts) {
      result = result?.[part]
      if (result === undefined) return key
    }
    if (typeof result === 'function') return result(...args)
    return result
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
