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

  // For large galleries (>10 images), disable thumbnails by default to improve performance
  // Users can still navigate with arrows/keyboard
  const shouldShowThumbnails = images.length <= 10 ? showThumbnails : false;

  return (
    <Box
      sx={{
        ".image-gallery": {
          width: "100%",
        },
        ".image-gallery-slide": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: ["500px", "600px", "700px"],
          backgroundColor: "black",
        },
        ".image-gallery-slide img": {
          width: "auto",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        },
        ".image-gallery-thumbnail img": {
          height: "60px",
          objectFit: "cover",
        },
        ".image-gallery-icon": {
          color: "white",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
        },
        ".image-gallery-svg": {
          width: ["40px", "30px", "30px"], // Smaller on desktop
          height: ["40px", "30px", "30px"],
        },
        ".image-gallery-left-nav, .image-gallery-right-nav": {
          padding: ["10px", "15px", "15px"], // Less padding on desktop
        },
        ".image-gallery-thumbnail.active": {
          border: "2px solid",
          borderColor: "primary",
        },
        // Add image counter for galleries without thumbnails
        ".image-gallery-index": {
          background: "rgba(0, 0, 0, 0.4)",
          color: "white",
          padding: "8px 12px",
          fontSize: "14px",
        },
      }}
    >
      <ImageGallery
        items={images}
        showThumbnails={shouldShowThumbnails}
        autoPlay={autoPlay}
        showPlayButton={false}
        showFullscreenButton={true}
        showIndex={!shouldShowThumbnails} // Show "1 / 41" counter instead
        lazyLoad={true}
        slideDuration={450}
        slideOnThumbnailOver={false}
        additionalClass="lazy-carousel"
      />
      {!shouldShowThumbnails && (
        <Box sx={{ mt: 2, fontSize: "14px", color: "text", opacity: 0.7 }}>
          Use arrow keys or click the arrows to navigate through {images.length} images
        </Box>
      )}
    </Box>
  );
};

export default ImageCarousel;
