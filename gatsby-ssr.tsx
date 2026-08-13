import React from 'react'
import './src/styles/global.css'
import rootWrapper from './rootWrapper'

export const wrapPageElement = rootWrapper

export const onRenderBody = ({ setHeadComponents, setHtmlAttributes }: { setHeadComponents: (components: React.ReactNode[]) => void; setHtmlAttributes: (attrs: Record<string, string>) => void }) => {
  setHtmlAttributes({ lang: 'en' })
  setHeadComponents([
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
