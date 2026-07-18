import React from "react";

const AppleMusicEmbed = ({ url }: { url: string }) => (
  <div style={{ position: "relative", width: "100%", height: 450, overflow: "hidden" }}>
    <iframe
      allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
      frameBorder="0"
      height="450"
      style={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        borderRadius: "10px",
      }}
      sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
      src={`${url}?theme=dark`}
    ></iframe>
  </div>
);

export default AppleMusicEmbed;
