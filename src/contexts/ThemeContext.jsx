import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ThemeCtx = createContext({ theme: 'dark', setTheme: () => {}, toggle: () => {} })
const STORAGE_KEY = 'fristine.theme'

function resolveInitial() {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(resolveInitial)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = useCallback((t) => setThemeState(t === 'dark' ? 'dark' : 'light'), [])
  const toggle   = useCallback(() => setThemeState(t => t === 'dark' ? 'light' : 'dark'), [])

  return <ThemeCtx.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeCtx.Provider>
}

export function useTheme() { return useContext(ThemeCtx) }
