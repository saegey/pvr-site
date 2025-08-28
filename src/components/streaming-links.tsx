import React from "react";
import { Flex, Link } from "theme-ui";
import { FaApple, FaSpotify, FaPlay, FaYoutubeSquare, FaYoutube } from "react-icons/fa";
import { SiDiscogs } from "react-icons/si";
import { trackStreamClickDeduped } from "../utils/analytics";

type Props = {
  discogs_url?: string | null;
  apple_music_url?: string | null;
  spotify_url?: string | null;
  soundcloud_url?: string | null;
  youtube_url?: string | null;
  containerSx?: any;
  trackingLocation?: string; // e.g., 'track_card' or 'show_template'
  showSlug?: string;
  trackTitle?: string;
};

const iconLinkSx = {
  p: 1,
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
  youtube_url,
  containerSx,
  trackingLocation = "streaming_links",
  showSlug,
  trackTitle,
}) => {
  // Build a small config list and filter to available links
  const services = (
    [
      { key: "discogs", url: discogs_url, Icon: SiDiscogs },
      { key: "apple_music", url: apple_music_url, Icon: FaApple },
      { key: "spotify", url: spotify_url, Icon: FaSpotify },
      { key: "soundcloud", url: soundcloud_url, Icon: FaPlay },
      { key: "youtube", url: youtube_url, Icon: FaYoutube },
    ] as const
  ).filter((s) => !!s.url) as Array<{
    key: "discogs" | "apple_music" | "spotify" | "soundcloud";
    url: string;
    Icon: React.ComponentType<{ size?: number }>;
  }>;

  const onInteract = (
    service: "discogs" | "apple_music" | "spotify" | "soundcloud" | "youtube",
    url: string
  ) => ({
    onMouseDown: () =>
      trackStreamClickDeduped({
        service,
        linkUrl: url,
        location: trackingLocation,
        showSlug,
        trackTitle,
      }),
    onClick: () =>
      trackStreamClickDeduped({
        service,
        linkUrl: url,
        location: trackingLocation,
        showSlug,
        trackTitle,
      }),
  });

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
      {services.map(({ key, url, Icon }) => (
        <Link
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          sx={iconLinkSx}
          {...onInteract(key, url)}
        >
          <Icon size={20} />
        </Link>
      ))}
    </Flex>
  );
};

export default StreamingLinks;
