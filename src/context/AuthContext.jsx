import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const token = localStorage.getItem('authToken')
    const stored = localStorage.getItem('userData')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {}
    }
    setLoading(false)
  }, [])

  function login(userData) {
    localStorage.setItem('authToken', userData.token)
    localStorage.setItem('userRole', userData.role)
    localStorage.setItem('userName', userData.name)
    localStorage.setItem('userData', JSON.stringify(userData))
    if (userData.role === 'admin') localStorage.setItem('adminToken', userData.token)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    localStorage.removeItem('userData')
    setUser(null)
  }

  function updateUser(userData) {
    const merged = { ...user, ...userData }
    localStorage.setItem('userData', JSON.stringify(merged))
    localStorage.setItem('userName', merged.name)
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
