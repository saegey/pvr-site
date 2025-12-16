import React from "react";
import ImageGallery from "react-image-gallery";
import { Box } from "theme-ui";
import "react-image-gallery/styles/css/image-gallery.css";

interface CarouselImage {
  original: string;
  thumbnail?: string;
  description?: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  showThumbnails?: boolean;
  autoPlay?: boolean;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  showThumbnails = true,
  autoPlay = false,
}) => {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        ".image-gallery": {
          width: "100%",
        },
        ".image-gallery-slide img": {
          width: "100%",
          height: "auto",
          maxHeight: ["400px", "500px", "600px"],
          objectFit: "cover",
        },
        ".image-gallery-thumbnail img": {
          height: "60px",
          objectFit: "cover",
        },
        ".image-gallery-icon": {
          color: "white",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
        },
        ".image-gallery-left-nav, .image-gallery-right-nav": {
          padding: ["10px", "20px"],
        },
        ".image-gallery-thumbnail.active": {
          border: "2px solid",
          borderColor: "primary",
        },
      }}
    >
      <ImageGallery
        items={images}
        showThumbnails={showThumbnails}
        autoPlay={autoPlay}
        showPlayButton={false}
        showFullscreenButton={true}
        lazyLoad={true}
        slideDuration={450}
        loading="lazy"
        // Preload only adjacent slides for smoother navigation
        slideOnThumbnailOver={false}
        additionalClass="lazy-carousel"
      />
    </Box>
  );
};

export default ImageCarousel;
