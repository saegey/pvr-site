import React from "react";
import { Flex, Link } from "theme-ui";
import { FaApple, FaSpotify, FaPlay } from "react-icons/fa";
import { SiDiscogs } from "react-icons/si";

type Props = {
  discogs_url?: string | null;
  apple_music_url?: string | null;
  spotify_url?: string | null;
  soundcloud_url?: string | null;
  containerSx?: any;
};

const iconLinkSx = {
  p: 1,
  // border: "2px solid",
  // borderColor: "cardBorderColor",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "primary",
} as const;

const StreamingLinks: React.FC<Props> = ({
  discogs_url,
  apple_music_url,
  spotify_url,
  soundcloud_url,
  containerSx,
}) => {
  return (
    <Flex
      sx={{
        gap: 2,
        flexWrap: "wrap",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        alignSelf: "flex-start",
        ...containerSx,
      }}
    >
      {discogs_url && (
        <Link href={discogs_url} target="_blank" rel="noopener noreferrer" sx={iconLinkSx}>
          <SiDiscogs size={20} />
        </Link>
      )}
      {apple_music_url && (
        <Link href={apple_music_url} target="_blank" rel="noopener noreferrer" sx={iconLinkSx}>
          <FaApple size={20} />
        </Link>
      )}
      {spotify_url && (
        <Link href={spotify_url} target="_blank" rel="noopener noreferrer" sx={iconLinkSx}>
          <FaSpotify size={20} />
        </Link>
      )}
      {soundcloud_url && (
        <Link href={soundcloud_url} target="_blank" rel="noopener noreferrer" sx={iconLinkSx}>
          <FaPlay size={20} />
        </Link>
      )}
    </Flex>
  );
};

export default StreamingLinks;
