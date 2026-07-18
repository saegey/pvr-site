import React, { useState, useEffect, useCallback } from 'react'
import SEO from '../components/seo'
import { PRODUCTS, Product, ProductVariant } from '../data/products'
import { useCart } from '../context/cart-context'

const formatPrice = (n: number) => `$${n.toFixed(2)}`

// ─── Lightbox ────────────────────────────────────────────────────────────────
const Lightbox = ({
  images,
  index,
  onClose,
}: {
  images: string[]
  index: number
  onClose: () => void
}) => {
  const [current, setCurrent] = useState(index)
  const touchStartX = React.useRef<number | null>(null)

  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(11,11,10,0.95)' }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close */}
      <button
        className="absolute top-5 right-5 text-fg/50 hover:text-fg transition-colors"
        onClick={onClose}
        aria-label="Close"
        style={{ fontSize: '28px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ×
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          className="absolute left-4 text-fg/40 hover:text-fg transition-colors"
          onClick={e => { e.stopPropagation(); prev() }}
          aria-label="Previous"
          style={{ fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer', padding: '16px' }}
        >
          ‹
        </button>
      )}

      {/* Image */}
      <img
        src={images[current]}
        alt={`Image ${current + 1}`}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          userSelect: 'none',
        }}
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          className="absolute right-4 text-fg/40 hover:text-fg transition-colors"
          onClick={e => { e.stopPropagation(); next() }}
          aria-label="Next"
          style={{ fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer', padding: '16px' }}
        >
          ›
        </button>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-5 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrent(i) }}
              style={{
                width: 6, height: 6, borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer',
                background: i === current ? 'rgb(236 236 230)' : 'rgba(236,236,230,0.3)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart()
  const [imageIndex, setImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null
  )
  const [added, setAdded] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const stripePrice = selectedVariant?.stripePrice ?? product.stripePrice ?? ''

  const handleAdd = () => {
    if (!stripePrice) return
    addItem({
      productId: product.id,
      productName: product.name,
      variantLabel: selectedVariant?.label,
      stripePrice,
      price: product.price,
      image: product.images[0],
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <>
      <article className="flex flex-col">
        {/* Image area */}
        <div className="relative bg-fg/5 overflow-hidden group" style={{ aspectRatio: '5/4' }}>
          {product.images.length > 0 ? (
            <img
              src={product.images[imageIndex]}
              alt={`${product.name} — image ${imageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background:
                  'repeating-linear-gradient(135deg, #141412, #141412 8px, #1a1a17 8px, #1a1a17 16px)',
              }}
            />
          )}

          {/* Expand button */}
          {product.images.length > 0 && (
            <button
              onClick={() => setLightboxIndex(imageIndex)}
              aria-label="Zoom image"
              className="absolute top-2.5 right-2.5 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center"
              style={{
                width: 32, height: 32,
                background: 'rgba(11,11,10,0.7)',
                border: '1px solid rgba(236,236,230,0.2)',
                cursor: 'pointer',
                color: 'rgb(236 236 230)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Image switcher dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  aria-label={`Image ${i + 1}`}
                  className="transition-colors"
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: i === imageIndex ? 'rgb(var(--pvr-fg))' : 'rgb(var(--pvr-fg) / 0.3)',
                    border: 'none', padding: 0, cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}

          {/* Click to cycle images */}
          {product.images.length > 1 && (
            <button
              className="absolute inset-0 w-full h-full opacity-0"
              aria-hidden="true"
              onClick={() => setImageIndex(i => (i + 1) % product.images.length)}
            />
          )}
        </div>

        {/* Info */}
        <div className="pt-5 flex flex-col gap-4 flex-1">
          <div>
            <h2
              className="text-fg leading-snug"
              style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}
            >
              {product.name}
            </h2>
            <p className="text-xs text-fg/40 mt-1">{formatPrice(product.price)}</p>
          </div>

          <p className="text-xs text-fg/55 leading-[1.7]">{product.description}</p>

          {/* Variant selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.variants.map(v => (
                <button
                  key={v.label}
                  onClick={() => setSelectedVariant(v)}
                  className="px-3 py-1.5 text-xs tracking-[1px] uppercase border transition-colors"
                  style={{
                    borderColor:
                      selectedVariant?.label === v.label
                        ? 'rgb(var(--pvr-fg))'
                        : 'rgb(var(--pvr-fg) / 0.2)',
                    color:
                      selectedVariant?.label === v.label
                        ? 'rgb(var(--pvr-fg))'
                        : 'rgb(var(--pvr-fg) / 0.5)',
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            disabled={!stripePrice?.startsWith('price_')}
            className="mt-auto py-3 text-xs tracking-[2px] uppercase border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              borderColor: added ? 'rgb(var(--pvr-fg))' : 'rgb(var(--pvr-fg) / 0.3)',
              color: added ? 'rgb(var(--pvr-fg))' : 'rgb(var(--color-fg) / 0.7)',
            }}
          >
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
      </article>

      {lightboxIndex !== null && (
        <Lightbox
          images={product.images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const ShopPage = () => {
  const [success, setSuccess] = useState(false)
  const { clearCart } = useCart()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('success') === 'true') {
        setSuccess(true)
        clearCart()
        localStorage.removeItem('pvr-cart')
        window.history.replaceState({}, '', '/shop')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }, [])

  return (
    <>
      <SEO
        title="Shop · Public Vinyl Radio"
        description="Gear from Public Vinyl Radio — tees, totes, and whatever else we make."
        url="https://publicvinylradio.com/shop"
      />

      <div className="max-w-[1320px] mx-auto px-4 md:px-12 pt-16 pb-12">
        <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-6">Shop</p>
        <h1
          className="text-fg leading-tight"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(34px, 4.5vw, 60px)',
            letterSpacing: '-0.5px',
          }}
        >
          Gear.
        </h1>
      </div>

      {success && (
        <div className="max-w-[1320px] mx-auto px-4 md:px-12 mb-10">
          <div className="border border-fg/20 px-6 py-4 text-sm text-fg/70">
            Order confirmed — thanks for supporting PVR.
          </div>
        </div>
      )}

      <div className="max-w-[1320px] mx-auto px-4 md:px-12 pb-24">
        <div className="border-t border-fg/12 pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {PRODUCTS.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default ShopPage
