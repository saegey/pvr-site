import React from 'react'

import Layout from './src/components/layout'
import { CartProvider } from './src/context/cart-context'

type Props = {
  element: JSX.Element
  props?: any
}

const shouldBypassLayout = (pathname?: string) => {
  if (!pathname) return false
  // Normalize (remove trailing slash)
  const p = pathname.replace(/\/+$/, '') || '/'
  // Add any routes that shouldn't use Layout here
  const noLayout = new Set(['/links', '/link-in-bio'])
  return noLayout.has(p)
}

const rootWrapper = ({ element, props }: Props) => {
  const pathname = props?.location?.pathname as string | undefined
  if (shouldBypassLayout(pathname)) {
    return <>{element}</>
  }
  return <CartProvider><Layout>{element}</Layout></CartProvider>
}

export default rootWrapper