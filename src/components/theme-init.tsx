'use client'

import { useLayoutEffect } from 'react'

export function ThemeInit() {
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem('site-theme')
      const theme =
        stored === 'light' || stored === 'dark'
          ? stored
          : matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
      document.documentElement.setAttribute('data-theme', theme)
    } catch {}
  }, [])

  return null
}
