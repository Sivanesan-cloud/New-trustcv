import React, { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('trustcv_user')
      const token  = localStorage.getItem('trustcv_token')
      return stored && token ? JSON.parse(stored) : null
    } catch { return null }
  })

  const login = useCallback((userData, token) => {
    localStorage.setItem('trustcv_token', token)
    localStorage.setItem('trustcv_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('trustcv_token')
    localStorage.removeItem('trustcv_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
