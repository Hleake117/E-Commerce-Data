import { useState, useEffect } from 'react'

const THEMES = {
  light: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    text: '#111827',
    textSecondary: '#6b7280',
    background: '#f3f4f6',
    white: '#ffffff',
    border: '#e5e7eb',
    success: '#10b981',
    error: '#dc2626',
    errorBg: '#fef2f2',
    errorBorder: '#fecaca',
  },
  dark: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    background: '#111827',
    white: '#1f2937',
    border: '#374151',
    success: '#10b981',
    error: '#ef4444',
    errorBg: '#7f1d1d',
    errorBorder: '#991b1b',
  },
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    const saved = localStorage.getItem('ledgerlens-theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('ledgerlens-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return { theme, toggleTheme, colors: THEMES[theme] }
}

