import React from "react";
import { Box, useColorMode } from "theme-ui";

const SpotifyEmbed = ({ url }: { url: string }) => {
  const [colorMode] = useColorMode();

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        paddingTop: "100px",
        paddingBottom: "56.25%", // 16:9 aspect ratio
        height: 0,
        overflow: "hidden",
      }}
    >
      <iframe
        style={{ borderRadius: "10px" }}
        src="https://open.spotify.com/embed/playlist/0TkqrAwu0XBc0Rii5I0FC4?utm_source=generator&theme=0"
        width="100%"
        height="352"
        frameBorder="0"
        allowFullScreen={false}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </Box>
  );
};

export default SpotifyEmbed;
