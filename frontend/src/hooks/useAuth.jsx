import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/auth'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        // Fetch user profile from backend
        const userData = await authAPI.getProfile()
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        // If token is invalid, clear it
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  const login = async (email, seedPhrase, password) => {
    const response = await authAPI.login(email, seedPhrase, password)
    if (response.user) {
      try {
        // Fetch the full profile so the route guard and pages immediately see a
        // complete user object (country, phone, profileCompleted, ...).
        const profile = await authAPI.getProfile()
        setUser(profile)
      } catch (error) {
        // Profile fetch is non-critical; fall back to the login payload.
        setUser(response.user)
      }
    }
    return response
  }

  const isAdmin = user?.role === 'admin'

  const logout = () => {
    setUser(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
  }

  const setUserContext = (newUser) => {
    setUser(newUser)
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    setUserContext
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
