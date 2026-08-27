import React, { useEffect, useState } from 'react'
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5'

type Theme = 'light' | 'dark'

/** Resolve the theme in effect: an explicit choice on <html>, else the OS. */
function resolveTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'light' || attr === 'dark') return attr
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

const ThemeToggle = ({ className = '' }: { className?: string }) => {
  // Default matches SSR (dark) so the first client render doesn't mismatch;
  // the effect below syncs to the real theme right after mount.
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    setTheme(resolveTheme())

    // While the user hasn't made an explicit choice, keep following the OS.
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => {
      try {
        if (!localStorage.getItem('theme')) setTheme(mq.matches ? 'light' : 'dark')
      } catch {}
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('theme', next)
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`flex items-center justify-center text-fg/60 hover:text-fg transition-colors ${className}`}
    >
      {theme === 'dark' ? <IoSunnyOutline size={18} /> : <IoMoonOutline size={18} />}
    </button>
  )
}

export default ThemeToggle
