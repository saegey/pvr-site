import React, { useState, useEffect } from 'react'
import { graphql, Link } from 'gatsby'
import SEO from '../components/seo'
import { PRODUCTS, Product } from '../data/products'

const formatPrice = (n: number) => `$${n.toFixed(2)}`
const cardImageSrc = (src: string) => src.replace(/\.(png|jpe?g)$/i, '.webp')

// ─── Product Card ─────────────────────────────────────────────────────────────
// A clean browse tile. Purchasing (variants, add-to-cart) and the full image
// gallery live on the product page (/shop/<id>), so the list just needs to
// invite a click — no cart controls here.
const ProductCard = ({ product }: { product: Product }) => {
  const [loaded, setLoaded] = useState(false)
  const image = product.images[0]

  return (
    <Link to={`/shop/${product.id}`} className="group flex flex-col">
      {/* Image */}
      <div className="relative bg-fg/5 overflow-hidden" style={{ aspectRatio: '5/4' }}>
        {image ? (
          <>
            {!loaded && (
              <div
                className="absolute inset-0 animate-pulse"
                aria-hidden="true"
                style={{ background: 'linear-gradient(110deg, rgb(var(--pvr-fg) / 0.04), rgb(var(--pvr-fg) / 0.12), rgb(var(--pvr-fg) / 0.04))' }}
              />
            )}
            <img
              src={cardImageSrc(image)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <div
            className="w-full h-full"
            style={{ background: 'repeating-linear-gradient(135deg, rgb(var(--pvr-fg) / 0.04), rgb(var(--pvr-fg) / 0.04) 8px, rgb(var(--pvr-fg) / 0.08) 8px, rgb(var(--pvr-fg) / 0.08) 16px)' }}
          />
        )}
      </div>

      {/* Info */}
      <div className="pt-3 sm:pt-4 flex items-baseline justify-between gap-2 sm:gap-4">
        <h2 className="card-title text-[15px] sm:text-lg text-fg leading-snug group-hover:text-fg/65 transition-colors">
          {product.name}
        </h2>
        <p className="text-[11px] sm:text-xs text-fg/55 tabular-nums shrink-0">{formatPrice(product.price)}</p>
      </div>

      {product.description && (
        <p className="hidden sm:block font-text mt-1.5 text-[13px] text-fg/55 leading-relaxed line-clamp-2">{product.description}</p>
      )}

      <span className="hidden sm:inline-block mt-3 text-[11px] tracking-[1px] uppercase text-fg/45 group-hover:text-fg/80 transition-colors">
        View →
      </span>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const ShopPage = () => {
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('success') === 'true') {
        // The cart is cleared by CartProvider (which owns cart storage); here we
        // only surface the confirmation banner and scroll to it.
        setSuccess(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }, [])

  const heroImages = PRODUCTS.map((p) => p.images[0]).filter(Boolean).slice(0, 4)

  return (
    <>
      {/* Hero */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-12 pt-14 md:pt-16 pb-10 md:pb-14">
        <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 items-center">
          <div>
            <p className="text-xs tracking-[2px] uppercase text-fg/55 mb-5">Shop</p>
            <h1
              className="text-fg leading-[0.9]"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 9vw, 104px)', letterSpacing: '-0.5px' }}
            >
              Gear.
            </h1>
            <p className="font-text mt-6 text-base text-fg/70 leading-relaxed max-w-[420px]">
              Tees, totes, cyanotype prints, and whatever else we make — designed and printed
              by the collective, worn at the shows.
            </p>
          </div>

          {heroImages.length > 0 && (
            <div className="hidden md:grid grid-cols-2 gap-2">
              {heroImages.map((src, i) => (
                <div key={i} className="aspect-square overflow-hidden bg-fg/5">
                  <img
                    src={cardImageSrc(src)}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {success && (
        <div className="max-w-[1320px] mx-auto px-4 md:px-12 mb-10">
          <div className="border border-fg/20 px-6 py-4 text-sm text-fg/70">
            Order confirmed — thanks for supporting PVR.
          </div>
        </div>
      )}

      {/* Product grid */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-12 pb-24">
        <div className="border-t border-fg/12 pt-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-8 sm:gap-y-14">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default ShopPage

export const Head = () => (
  <SEO
    title="Shop · Public Vinyl Radio"
    description="Gear from Public Vinyl Radio — tees, totes, and whatever else we make."
    url="https://publicvinylradio.com/shop"
  />
)

export const query = graphql`
  query ShopPageQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
