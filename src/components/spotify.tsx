import React from "react";

const SpotifyEmbed = ({ id }: { id: string }) => {
  const src = `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;

  return (
    <div style={{ position: "relative", width: "100%", height: 500, overflow: "hidden" }}>
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
    </div>
  );
};

export default SpotifyEmbed;
