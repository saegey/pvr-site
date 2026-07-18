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
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  showThumbnails = true,
  autoPlay = false,
}) => {
  if (!images || images.length === 0) return null

  const shouldShowThumbnails = images.length <= 10 ? showThumbnails : false

  return (
    <div className="w-full">
      <style>{`
        .image-gallery { width: 100%; }
        .image-gallery-slide {
          display: flex; align-items: center; justify-content: center;
          height: 500px; background-color: rgb(11 11 10);
        }
        .image-gallery-slide img { width: auto; height: 100%; max-width: 100%; max-height: 100%; object-fit: contain; }
        .image-gallery-thumbnail img { height: 60px; object-fit: cover; }
        .image-gallery-icon { color: white; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }
        .image-gallery-svg { width: 30px; height: 30px; }
        .image-gallery-thumbnail.active { border: 1px solid rgba(236,236,230,0.4); }
        .image-gallery-index { background: rgba(0,0,0,0.4); color: white; padding: 8px 12px; font-size: 14px; }
      `}</style>
      <ImageGallery
        items={images}
        showThumbnails={shouldShowThumbnails}
        autoPlay={autoPlay}
        showPlayButton={false}
        showFullscreenButton={true}
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
