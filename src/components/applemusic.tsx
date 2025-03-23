import React from 'react';
import { Box } from 'theme-ui';

const AppleMusicEmbed = ({ url }: { url: string }) => (
  <Box
    sx={{
      position: 'relative',
      width: '100%',
      paddingTop: '100px',
      paddingBottom: '56.25%', // 16:9 aspect ratio
      height: 0,
      overflow: 'hidden',
    }}
  >
    <iframe
      allow='autoplay *; encrypted-media *; fullscreen *; clipboard-write'
      frameBorder='0'
      height='450'
      style={{
        width: '100%',
        maxWidth: '660px',
        overflow: 'hidden',
        borderRadius: '10px',
      }}
      sandbox='allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation'
      src={url}
    ></iframe>
  </Box>
);

export default AppleMusicEmbed;
