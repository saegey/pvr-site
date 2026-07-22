import React, { useState } from 'react'
import { useCart } from '../context/cart-context'

const thumbnailSrc = (src: string) => src.replace(/\.(png|jpe?g)$/i, '-thumb.webp')

const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQty, total, count, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            priceLookupKey: i.priceLookupKey,
            quantity: i.quantity,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-bg/70"
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[400px] bg-bg border-l border-fg/12 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-fg/12">
          <span
            className="text-fg"
            style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}
          >
            Cart {count > 0 && <span className="text-fg/40 text-sm">({count})</span>}
          </span>
          <button
            onClick={closeCart}
            className="text-fg/40 hover:text-fg transition-colors text-xl leading-none"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-fg/40">Your cart is empty.</p>
            </div>
          ) : (
            <ul>
              {items.map(item => (
                <li
                  key={item.cartKey}
                  className="flex gap-4 px-6 py-5 border-b border-fg/12"
                >
                  {/* Thumbnail */}
                  {item.image && (
                    <div
                      className="w-16 h-16 shrink-0 bg-fg/5 overflow-hidden"
                    >
                      <img
                        src={thumbnailSrc(item.image)}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        decoding="async"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-fg leading-snug text-sm"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {item.productName}
                    </p>
                    {item.variantLabel && (
                      <p className="text-xs text-fg/40 mt-0.5">{item.variantLabel}</p>
                    )}
                    <p className="text-xs text-fg/55 mt-1">
                      ${item.price.toFixed(2)}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => updateQty(item.cartKey, item.quantity - 1)}
                        className="w-6 h-6 border border-fg/20 text-fg/60 hover:text-fg hover:border-fg/50 transition-colors flex items-center justify-center text-sm leading-none"
                      >
                        −
                      </button>
                      <span className="text-xs tabular-nums w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.cartKey, item.quantity + 1)}
                        className="w-6 h-6 border border-fg/20 text-fg/60 hover:text-fg hover:border-fg/50 transition-colors flex items-center justify-center text-sm leading-none"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.cartKey)}
                        className="ml-2 text-xs text-fg/30 hover:text-fg/60 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <p className="text-xs text-fg/55 shrink-0 tabular-nums">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-6 border-t border-fg/12">
            <div className="flex justify-between mb-6">
              <span className="text-xs tracking-[1px] uppercase text-fg/50">Total</span>
              <span
                className="text-fg"
                style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}
              >
                ${total.toFixed(2)}
              </span>
            </div>

            {error && (
              <p className="text-xs text-red-400 mb-3">{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 text-xs tracking-[2px] uppercase border border-fg/40 text-fg hover:bg-fg hover:text-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Redirecting…' : 'Checkout'}
            </button>

            <button
              onClick={clearCart}
              className="w-full mt-3 text-xs text-fg/30 hover:text-fg/60 transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer
