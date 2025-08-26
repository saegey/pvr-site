import React from "react";
import { Box } from "theme-ui";

type Props = {
  videoId: string;
};

const ResponsiveYouTube: React.FC<Props> = ({ videoId }) => (
  <Box
    sx={{
      position: "relative",
      width: "100%",
      paddingBottom: "56.25%", // 16:9 aspect ratio
      height: 0,
      overflow: "hidden",
    }}
 >
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?si=EaheM0eWWNF_J6-x`}
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
  </Box>
);

export default ResponsiveYouTube;
