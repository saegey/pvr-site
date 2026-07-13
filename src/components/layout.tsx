import React, { ReactNode, useState, useEffect } from 'react'
import { Link } from 'gatsby'
import HeadIcon from '../icons/head.svg'

const NAV_LINKS = [
  { label: 'Archive', to: '/' },
  { label: 'Events', to: '/events' },
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/about' },
]

const EXTERNAL_LINKS = [
  { label: 'YouTube', href: 'https://www.youtube.com/@PublicVinylRadio' },
  { label: 'IG', href: 'https://www.instagram.com/PublicVinylRadio' },
]

const Layout = ({ children }: { children: ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-bg text-fg font-mono">
      {/* Sticky header */}
      <header
        className="sticky top-0 z-50 border-b border-fg/12"
        style={{ backgroundColor: 'rgba(11,11,10,0.85)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 h-14 flex items-center justify-between">
          {/* Logo + wordmark */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0 text-fg"
            onClick={() => setMenuOpen(false)}
          >
            <HeadIcon width={22} height={22} aria-hidden="true" />
            <span className="text-xs font-bold tracking-[2px] uppercase">
              Public Vinyl Radio
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="text-xs tracking-[1px] uppercase border-b border-transparent hover:border-fg/60 pb-px transition-colors duration-150"
                activeClassName="border-fg!"
              >
                {label}
              </Link>
            ))}
            {EXTERNAL_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-[1px] uppercase text-fg/40 border-b border-transparent pb-px hover:text-fg/60 transition-colors duration-150"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 shrink-0"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span
              className="block h-px bg-fg transition-all duration-200 origin-center"
              style={menuOpen ? { transform: 'translateY(6px) rotate(45deg)' } : {}}
            />
            <span
              className="block h-px bg-fg transition-all duration-200"
              style={menuOpen ? { opacity: 0 } : {}}
            />
            <span
              className="block h-px bg-fg transition-all duration-200 origin-center"
              style={menuOpen ? { transform: 'translateY(-6px) rotate(-45deg)' } : {}}
            />
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-bg flex flex-col px-8 pt-24 pb-12">
          <nav className="flex flex-col gap-2 flex-1">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="text-fg/80 hover:text-fg transition-colors duration-150 py-4 border-b border-fg/12"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(36px, 10vw, 56px)',
                  letterSpacing: '-0.5px',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* External links at bottom */}
          <div className="flex gap-6 pt-8 border-t border-fg/12">
            {EXTERNAL_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-[2px] uppercase text-fg/40 hover:text-fg/70 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}

      <main>{children}</main>

      <footer className="border-t border-fg/12 mt-24 px-6 md:px-12 py-8 max-w-[1320px] mx-auto flex items-center justify-between">
        <span className="text-xs tracking-[1px] uppercase text-fg/40">
          &copy; {new Date().getFullYear()} Public Vinyl Radio
        </span>
        <div className="flex gap-6">
          {EXTERNAL_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-[1px] uppercase text-fg/40 hover:text-fg/70 transition-colors duration-150"
            >
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}

export default Layout
