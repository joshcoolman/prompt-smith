'use client'

import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    root.setAttribute('data-theme', next)
    try {
      localStorage.setItem('site-theme', next)
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light or dark theme"
      className="border-border bg-surface text-text-muted hover:text-text fixed top-5 right-5 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
    >
      <Moon size={16} className="dark:hidden" />
      <Sun size={16} className="hidden dark:block" />
    </button>
  )
}
