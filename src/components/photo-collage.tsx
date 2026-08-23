import React, { useEffect, useState } from 'react'
import ImageCarousel from './image-carousel'

export type CollagePhoto = {
  original: string
  thumbnail?: string
  description?: string
}

/**
 * A grayscale square-tile collage (2 cols mobile / 3 desktop) in the Human
 * Vibrations style. Tiles animate to full color on hover; clicking one opens a
 * fullscreen carousel (ImageCarousel) starting on that photo.
 */
const PhotoCollage: React.FC<{ photos: CollagePhoto[] }> = ({ photos }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const isOpen = openIndex !== null

  // Lock body scroll and allow Escape to close while the lightbox is open.
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  if (!photos || photos.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-px">
        {photos.map((photo, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group overflow-hidden block"
            style={{ aspectRatio: '1/1' }}
            aria-label={`Open photo ${index + 1} of ${photos.length}`}
          >
            <img
              src={photo.thumbnail ?? photo.original}
              alt={photo.description ?? ''}
              loading="lazy"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-[filter,transform] duration-300 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-bg flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Event photos"
        >
          {/* Fullscreen viewer: override ImageCarousel's fixed 500px slide so the
              photo fills the viewport on desktop. Scoped to .pc-fullscreen so
              inline gallery/flyer carousels keep their default height. */}
          <style>{`
            .pc-fullscreen .image-gallery-slide { height: calc(100vh - 200px); }
          `}</style>
          <div className="shrink-0 bg-bg border-b border-fg/12">
            <div className="max-w-[1600px] mx-auto px-8 py-5 sm:px-12 flex items-center justify-between gap-4">
              <p className="text-xs tracking-[2px] uppercase text-fg/55">
                Photos · {photos.length}
              </p>
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                className="text-xs tracking-[1.5px] uppercase border border-fg px-4 py-3 hover:bg-fg hover:text-bg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex items-center">
            <div className="pc-fullscreen w-full max-w-[1600px] mx-auto px-4 sm:px-12">
              <ImageCarousel
                images={photos}
                startIndex={openIndex ?? 0}
                showThumbnails={photos.length <= 10}
                showFullscreenButton={false}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PhotoCollage
