import React from "react";
import { Box, useThemeUI } from "theme-ui";

const SpotifyEmbed = ({ id }: { id: string }) => {
  const { colorMode } = useThemeUI();
  const isDarkMode = colorMode === "dark";

  const theme = isDarkMode ? "0" : "1";
  const src = `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=${theme}`;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        // paddingTop: "100px",
        paddingBottom: "56.25%", // 16:9 aspect ratio
        height: 500,
        overflow: "hidden",
      }}
    >
      <iframe
        style={{ borderRadius: "10px" }}
        src={src}
        width="100%"
        height="500"
        frameBorder="0"
        allowFullScreen={false}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </Box>
  );
};

export default SpotifyEmbed;
