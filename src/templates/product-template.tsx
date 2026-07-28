import React, { useState } from 'react'
import { Link } from 'gatsby'
import SEO from '../components/seo'
import { Product, ProductVariant } from '../data/products'
import { useCart } from '../context/cart-context'

const formatPrice = (price: number) => `$${price.toFixed(2)}`
const webpImageSrc = (src: string) => src.replace(/\.(png|jpe?g)$/i, '.webp')
const thumbnailImageSrc = (src: string) => webpImageSrc(src).replace(/\.webp$/i, '-thumb.webp')

type ProductPageContext = { product: Product }

const ProductTemplate = ({ pageContext }: { pageContext: ProductPageContext }) => {
  const { product } = pageContext
  const { addItem } = useCart()
  const [imageIndex, setImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null
  )
  const [added, setAdded] = useState(false)

  const priceLookupKey = selectedVariant?.priceLookupKey ?? product.priceLookupKey ?? ''
  const activeImage = product.images[imageIndex]
  const activeWebpImage = activeImage ? webpImageSrc(activeImage) : ''
  const activeThumbnailImage = activeImage ? thumbnailImageSrc(activeImage) : ''
  const productUrl = `https://publicvinylradio.com/shop/${product.id}`
  const socialImage = product.images[0]
    ? `https://publicvinylradio.com${product.images[0]}`
    : undefined

  const handleAdd = () => {
    if (!priceLookupKey) return
    addItem({
      productId: product.id,
      productName: product.name,
      variantLabel: selectedVariant?.label,
      priceLookupKey,
      price: product.price,
      image: product.images[0],
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <>
      <SEO
        title={`${product.name} · Public Vinyl Radio`}
        description={product.description}
        image={socialImage}
        url={productUrl}
        type="product"
      />

      <div className="max-w-[1320px] mx-auto px-4 md:px-12 pt-10 md:pt-16 pb-24">
        <Link
          to="/shop"
          className="inline-flex text-xs tracking-[1px] uppercase text-fg/55 hover:text-fg transition-colors mb-8"
        >
          ← Back to shop
        </Link>

        <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] gap-10 lg:gap-16 items-start">
          <section className="space-y-3" aria-label={`${product.name} images`}>
            <div className="bg-fg/5 overflow-hidden" style={{ aspectRatio: '5/4' }}>
              {product.images.length > 0 ? (
                <picture className="block w-full h-full">
                  <source
                    type="image/webp"
                    srcSet={`${activeThumbnailImage} 320w, ${activeWebpImage} 1200w`}
                    sizes="(max-width: 1023px) 100vw, 58vw"
                  />
                  <img
                    src={activeImage}
                    alt={`${product.name} — image ${imageIndex + 1}`}
                    className="w-full h-full object-cover"
                    decoding="async"
                  />
                </picture>
              ) : (
                <div
                  className="w-full h-full"
                  style={{ background: 'repeating-linear-gradient(135deg, #141412, #141412 8px, #1a1a17 8px, #1a1a17 16px)' }}
                />
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={index === imageIndex}
                    className="bg-fg/5 overflow-hidden transition-opacity"
                    style={{
                      aspectRatio: '5/4',
                      opacity: index === imageIndex ? 1 : 0.5,
                      outline: index === imageIndex ? '1px solid rgb(var(--pvr-fg))' : '1px solid transparent',
                      outlineOffset: '2px',
                    }}
                  >
                    <picture className="block w-full h-full">
                      <source type="image/webp" srcSet={thumbnailImageSrc(image)} />
                      <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    </picture>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="lg:sticky lg:top-24">
            <p className="text-xs tracking-[2px] uppercase text-fg/55 mb-6">Shop</p>
            <h1
              className="text-fg leading-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(34px, 4vw, 54px)',
                letterSpacing: '-0.5px',
              }}
            >
              {product.name}
            </h1>
            <p className="text-sm text-fg/70 mt-4">{formatPrice(product.price)}</p>
            <p className="text-sm text-fg/60 leading-[1.8] mt-8">{product.description}</p>

            <div className="border-t border-fg/12 mt-10 pt-7 space-y-6">
              {product.variants && product.variants.length > 0 && (
                <div>
                  <p className="text-xs tracking-[1px] uppercase text-fg/55 mb-3">Select option</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(variant => (
                      <button
                        key={variant.label}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className="px-3 py-2 text-xs tracking-[1px] uppercase border transition-colors"
                        style={{
                          borderColor: selectedVariant?.label === variant.label ? 'rgb(var(--pvr-fg))' : 'rgb(var(--pvr-fg) / 0.2)',
                          color: selectedVariant?.label === variant.label ? 'rgb(var(--pvr-fg))' : 'rgb(var(--pvr-fg) / 0.5)',
                        }}
                      >
                        {variant.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAdd}
                disabled={!priceLookupKey}
                className="w-full py-3 text-xs tracking-[2px] uppercase border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  borderColor: added ? 'rgb(var(--pvr-fg))' : 'rgb(var(--pvr-fg) / 0.3)',
                  color: added ? 'rgb(var(--pvr-fg))' : 'rgb(var(--color-fg) / 0.7)',
                }}
              >
                {added ? 'Added ✓' : 'Add to Cart'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default ProductTemplate
