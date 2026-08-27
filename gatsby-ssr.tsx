import React from 'react'
import './src/styles/global.css'
import rootWrapper from './rootWrapper'

export const wrapPageElement = rootWrapper

export const onRenderBody = ({ setHeadComponents, setHtmlAttributes }: { setHeadComponents: (components: React.ReactNode[]) => void; setHtmlAttributes: (attrs: Record<string, string>) => void }) => {
  setHtmlAttributes({ lang: 'en' })
  setHeadComponents([
    // Apply a saved theme choice before first paint to avoid a flash. When no
    // choice is stored, we leave data-theme unset so the CSS prefers-color-scheme
    // rules follow the OS (and stay live-reactive to OS changes).
    <script
      key="theme-init"
      dangerouslySetInnerHTML={{
        __html:
          "try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}",
      }}
    />,
    // Experiment (Direction A): Zilla Slab (display) + Literata (body) via
    // Google Fonts. Self-host these before shipping to match the JetBrains/
    // Lubalin setup (preloaded woff2, font-display: block).
    <link key="gf-preconnect-1" rel="preconnect" href="https://fonts.googleapis.com" />,
    <link key="gf-preconnect-2" rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />,
    <link
      key="gf-fonts"
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Zilla+Slab:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;1,7..72,400&display=swap"
    />,
    <link
      key="font-jetbrains"
      rel="preload"
      href="/fonts/JetBrainsMono-Regular.woff2"
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />,
    <link
      key="font-jetbrains-bold"
      rel="preload"
      href="/fonts/JetBrainsMono-Bold.ttf"
      as="font"
      type="font/ttf"
      crossOrigin="anonymous"
    />,
    <link
      key="font-lubalin"
      rel="preload"
      href="/fonts/ITC-Lubalin-Graph-Std-Demi.otf"
      as="font"
      type="font/otf"
      crossOrigin="anonymous"
    />,
    // Cloudflare Web Analytics beacon (token is public — it ships in page HTML)
    <script
      key="cf-analytics"
      type="module"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon='{"token": "4a3dabb9c8ec4fbea9c6e57d8deddd9c"}'
    />,
  ])
}
