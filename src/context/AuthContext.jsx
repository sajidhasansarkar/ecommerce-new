import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from sessionStorage on mount (token is in httpOnly cookie)
    const stored = sessionStorage.getItem('userData')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {}
    }
    setLoading(false)
  }, [])

  function login(userData) {
    // Token is now stored in httpOnly cookie by the server — don't store it here
    sessionStorage.setItem('userRole', userData.role)
    sessionStorage.setItem('userName', userData.name)
    sessionStorage.setItem('userData', JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    sessionStorage.removeItem('userRole')
    sessionStorage.removeItem('userName')
    sessionStorage.removeItem('userData')
    setUser(null)
  }

  function updateUser(userData) {
    const merged = { ...user, ...userData }
    sessionStorage.setItem('userData', JSON.stringify(merged))
    sessionStorage.setItem('userName', merged.name)
    setUser(merged)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
