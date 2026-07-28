declare module 'react-image-gallery' {
  import * as React from 'react'

  type GalleryImage = {
    original: string
    thumbnail?: string
    description?: string
  }

  type ImageGalleryProps = {
    items: GalleryImage[]
    showThumbnails?: boolean
    autoPlay?: boolean
    showPlayButton?: boolean
    showFullscreenButton?: boolean
    showIndex?: boolean
    lazyLoad?: boolean
    slideDuration?: number
    slideOnThumbnailOver?: boolean
    additionalClass?: string
  }

  export default class ImageGallery extends React.Component<ImageGalleryProps> {}
}
