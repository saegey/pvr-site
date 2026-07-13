import React, { useState, useEffect } from 'react'
import SEO from '../components/seo'
import { PRODUCTS, Product, ProductVariant } from '../data/products'
import { useCart } from '../context/cart-context'

const formatPrice = (n: number) => `$${n.toFixed(2)}`

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart()
  const [imageIndex, setImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null
  )
  const [added, setAdded] = useState(false)

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
    <article className="flex flex-col">
      {/* Image area */}
      <div className="relative bg-fg/5 overflow-hidden" style={{ aspectRatio: '4/5' }}>
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
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: i === imageIndex ? 'rgb(var(--pvr-fg))' : 'rgb(var(--pvr-fg) / 0.3)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        )}

        {/* Hover: cycle images on click */}
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
            borderColor: added
              ? 'rgb(var(--pvr-fg))'
              : 'rgb(var(--pvr-fg) / 0.3)',
            color: added
              ? 'rgb(var(--pvr-fg))'
              : 'rgb(var(--color-fg) / 0.7)',
          }}
        >
          {added ? 'Added ✓' : 'Add to Cart'}
        </button>
      </div>
    </article>
  )
}

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

      {/* ── Header band ── */}
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

      {/* ── Success banner ── */}
      {success && (
        <div className="max-w-[1320px] mx-auto px-4 md:px-12 mb-10">
          <div className="border border-fg/20 px-6 py-4 text-sm text-fg/70">
            Order confirmed — thanks for supporting PVR.
          </div>
        </div>
      )}

      {/* ── Product grid ── */}
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
