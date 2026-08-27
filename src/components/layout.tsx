import React, { ReactNode, useState, useEffect, lazy, Suspense } from 'react'
import { Link } from 'gatsby'
import { IoCartOutline } from 'react-icons/io5'
import HeadIcon from '../icons/head.svg'
import PVRLogo from '../icons/pvr-logo.svg'
import { useCart } from '../context/cart-context'
import ThemeToggle from './theme-toggle'

const CartDrawer = lazy(() => import('./cart-drawer'))

const NAV_LINKS = [
  { label: 'Events', to: '/events' },
  { label: 'Shop', to: '/shop' },
  { label: 'Archive', to: '/shows' },
  { label: 'About', to: '/about' },
]

const EXTERNAL_LINKS = [
  { label: 'YouTube', href: 'https://www.youtube.com/@PublicVinylRadio' },
  { label: 'IG', href: 'https://www.instagram.com/PublicVinylRadio' },
]

// Floating cart — only rendered inside the shop, so it never disturbs the
// header/nav layout on the rest of the site.
const FloatingCart = () => {
  const { count, openCart } = useCart()
  if (count <= 0) return null
  return (
    <button
      onClick={openCart}
      aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-12 h-12 bg-fg text-bg shadow-lg hover:opacity-90 transition-opacity"
    >
      <IoCartOutline size={22} aria-hidden="true" />
      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-bg text-fg text-[10px] font-medium flex items-center justify-center tabular-nums">
        {count}
      </span>
    </button>
  )
}

const Layout = ({ children, pathname }: { children: ReactNode; pathname?: string }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const normalized = (pathname ?? '').replace(/\/+$/, '')
  const isShop = normalized === '/shop' || normalized.startsWith('/shop/')

  useEffect(() => { setMounted(true) }, [])

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
        style={{ backgroundColor: 'rgb(var(--pvr-bg) / 0.85)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 h-14 flex items-center justify-between relative">
          {/* Desktop: full logo */}
          <Link
            to="/"
            className="hidden md:flex items-center shrink-0 text-fg"
            onClick={() => setMenuOpen(false)}
            aria-label="Public Vinyl Radio"
          >
            <PVRLogo className="h-7 w-auto" aria-hidden="true" />
          </Link>

          {/* Mobile: icon only, centered */}
          <Link
            to="/"
            className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-fg"
            onClick={() => setMenuOpen(false)}
            aria-label="Public Vinyl Radio"
          >
            <HeadIcon width={24} height={24} aria-hidden="true" />
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
            {/*{EXTERNAL_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-[1px] uppercase text-fg/55 border-b border-transparent pb-px hover:text-fg/60 transition-colors duration-150"
              >
                {label}
              </a>
            ))}*/}
            <ThemeToggle />
          </nav>

          {/* Mobile: theme + hamburger */}
          <div className="flex items-center gap-4 md:hidden ml-auto">
            <ThemeToggle />
          <button
            className="relative flex w-8 h-8 shrink-0 items-center justify-center"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span
              className="absolute h-px w-8 bg-fg transition-transform duration-200"
              style={{ transform: menuOpen ? 'rotate(45deg)' : 'translateY(-6px)' }}
            />
            <span
              className="absolute h-px w-8 bg-fg transition-opacity duration-200"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="absolute h-px w-8 bg-fg transition-transform duration-200"
              style={{ transform: menuOpen ? 'rotate(-45deg)' : 'translateY(6px)' }}
            />
          </button>
          </div>
        </div>
      </header>

      {mounted && (
        <Suspense fallback={null}>
          <CartDrawer />
        </Suspense>
      )}

      {/* Floating cart — shop routes only */}
      {isShop && <FloatingCart />}

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
                className="text-xs tracking-[2px] uppercase text-fg/55 hover:text-fg/70 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}

      <main>{children}</main>

      <footer className="border-t border-fg/12 mt-24 px-6 md:px-12 py-8 max-w-[1320px] mx-auto flex items-center justify-between">
        <span className="text-xs tracking-[1px] uppercase text-fg/55">
          &copy; {new Date().getFullYear()} Public Vinyl Radio
        </span>
        <div className="flex gap-6">
          {EXTERNAL_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-[1px] uppercase text-fg/55 hover:text-fg/70 transition-colors duration-150"
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
