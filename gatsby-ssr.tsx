import React from 'react'
import './src/styles/global.css'
import rootWrapper from './rootWrapper'

export const wrapPageElement = rootWrapper

export const onRenderBody = ({ setHeadComponents }: { setHeadComponents: (components: React.ReactNode[]) => void }) => {
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
      key="font-lubalin"
      rel="preload"
      href="/fonts/ITC-Lubalin-Graph-Std-Demi.otf"
      as="font"
      type="font/otf"
      crossOrigin="anonymous"
    />,
  ])
}
