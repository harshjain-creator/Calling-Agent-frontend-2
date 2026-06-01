import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiFetch, tokenStore } from '@/lib/api'

const AuthCtx = createContext({
  user: null,
  loading: false,
  login: async () => {},
  logout: async () => {},
  isAuthed: false,
  role: null,
})

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => tokenStore.user)
  const [loading, setLoading] = useState(false)

  // Re-verify session on mount — /auth/me succeeds if httpOnly access cookie
  // is valid; else apiFetch transparently calls /auth/refresh (cookie-based).
  useEffect(() => {
    let cancelled = false
    apiFetch('/auth/me')
      .then(me => { if (!cancelled) { setUser(me); tokenStore.save({ user: me }) } })
      .catch(() => { if (!cancelled) { tokenStore.clear(); setUser(null) } })
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password }, skipAuth: true })
      // Server sets httpOnly cookies in Set-Cookie. We only persist the user
      // object so the SPA renders without a flicker on next reload.
      tokenStore.save({ user: data.user })
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST', body: {}, skipAuth: true })
    } catch { /* server may be down; clear local state regardless */ }
    tokenStore.clear()
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider value={{
      user, loading, login, logout,
      isAuthed: !!user,
      role: user?.role || null,
    }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() { return useContext(AuthCtx) }
