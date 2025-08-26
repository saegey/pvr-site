import React, { useState, useCallback } from "react";
import { Box } from "theme-ui";
import { FaPlay } from "react-icons/fa";
import { trackEventDeduped } from "../utils/analytics";
import { youTubeHQThumb, youTubeMaxResThumb } from "../utils/youtube";

type Props = {
  videoId: string;
};

const ResponsiveYouTube: React.FC<Props> = ({ videoId }) => {
  const [playing, setPlaying] = useState(false);
  const [thumbSrc, setThumbSrc] = useState(youTubeMaxResThumb(videoId));

  const handlePlay = useCallback(() => {
    // Track play intent once
    trackEventDeduped(
      "video_play",
      {
        provider: "youtube",
        video_id: videoId,
        location: "responsive_youtube",
      },
      { key: `yt:${videoId}` }
    );
    setPlaying(true);
  }, [videoId]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        paddingBottom: "56.25%", // 16:9 aspect ratio
        height: 0,
        overflow: "hidden",
      }}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title="YouTube video player"
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      ) : (
        <>
          {/* Thumbnail */}
          <img
            src={thumbSrc}
            alt="YouTube thumbnail"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null;
              setThumbSrc(youTubeHQThumb(videoId));
            }}
          />

          {/* Click overlay with centered play icon */}
          <Box
            role="button"
            aria-label="Play video"
            tabIndex={0}
            onClick={handlePlay}
            onMouseDown={handlePlay}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePlay();
              }
            }}
            sx={{
              position: "absolute",
              inset: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bg: "rgba(0,0,0,0.2)",
              transition: "background-color 0.2s ease",
              ":hover": { bg: "rgba(0,0,0,0.35)" },
              ":focus": { outline: "2px solid", outlineColor: "primary" },
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bg: "rgba(0,0,0,0.6)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              <FaPlay size={22} />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ResponsiveYouTube;
