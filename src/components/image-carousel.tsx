import React from 'react'
import ImageGallery from 'react-image-gallery'
import 'react-image-gallery/styles/css/image-gallery.css'

interface CarouselImage {
  original: string
  thumbnail?: string
  description?: string
}

interface ImageCarouselProps {
  images: CarouselImage[]
  showThumbnails?: boolean
  autoPlay?: boolean
  showFullscreenButton?: boolean
  startIndex?: number
}

const Chevron: React.FC<{ dir: 'left' | 'right' }> = ({ dir }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
  </svg>
)

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  showThumbnails = true,
  autoPlay = false,
  showFullscreenButton = true,
  startIndex = 0,
}) => {
  if (!images || images.length === 0) return null

  const shouldShowThumbnails = images.length <= 10 ? showThumbnails : false

  const renderNav = (
    dir: 'left' | 'right',
    onClick: React.MouseEventHandler<HTMLElement>,
    disabled: boolean
  ) => (
    <button
      type="button"
      className={`image-gallery-icon image-gallery-${dir}-nav`}
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'left' ? 'Previous image' : 'Next image'}
      style={{
        padding: '10px',
        color: 'white',
        opacity: 0.4,
        transition: 'opacity 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.4')}
    >
      <Chevron dir={dir} />
    </button>
  )

  return (
    <div className="w-full">
      <style>{`
        .image-gallery { width: 100%; }
        .image-gallery-slides { border: 1px solid rgb(var(--pvr-fg) / 0.14); }
        .image-gallery-slide {
          display: flex; align-items: center; justify-content: center;
          height: 500px; background-color: rgb(var(--pvr-fg) / 0.05);
        }
        .image-gallery-slide img { width: auto; height: 100%; max-width: 100%; max-height: 100%; object-fit: contain; }
        .image-gallery-thumbnail img { height: 60px; object-fit: cover; }
        .image-gallery-fullscreen-button { opacity: 0.4; filter: none; }
        .image-gallery-fullscreen-button:hover { opacity: 1; color: white; }
        .image-gallery-fullscreen-button .image-gallery-svg { width: 20px; height: 20px; }
        .image-gallery-thumbnail.active { border: 1px solid rgb(var(--pvr-fg) / 0.4); }
        .image-gallery-index { background: rgba(0,0,0,0.4); color: white; padding: 8px 12px; font-size: 14px; }
      `}</style>
      {/* startIndex is spread in because react-image-gallery's bundled types omit it (supported at runtime). */}
      <ImageGallery
        items={images}
        {...({ startIndex } as any)}
        showThumbnails={shouldShowThumbnails}
        autoPlay={autoPlay}
        showPlayButton={false}
        showFullscreenButton={showFullscreenButton}
        renderLeftNav={(onClick, disabled) => renderNav('left', onClick, disabled)}
        renderRightNav={(onClick, disabled) => renderNav('right', onClick, disabled)}
        showIndex={!shouldShowThumbnails}
        lazyLoad={true}
        slideDuration={450}
        slideOnThumbnailOver={false}
        additionalClass="lazy-carousel"
      />
      {!shouldShowThumbnails && (
        <p className="mt-2 text-xs text-fg/50">
          Use arrow keys or click the arrows to navigate through {images.length} images
        </p>
      )}
    </div>
  )
}

export default ImageCarousel
