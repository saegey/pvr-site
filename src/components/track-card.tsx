import React from "react";
import { Card, Flex, Badge, Box, Text } from "theme-ui";
import StreamingLinks from "./streaming-links";
import type { TrackItem } from "../types/content";

type Props = {
  track: TrackItem;
  index: number;
};

const formatDuration = (totalSeconds?: number | null): string | null => {
  if (totalSeconds == null || Number.isNaN(totalSeconds)) return null;
  const sec = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

const TrackCard: React.FC<Props> = ({ track: t, index: idx }) => {
  return (
    <Card
      sx={{
        borderColor: "cardBorderColor",
        borderWidth: "2px",
        borderStyle: "solid",
        borderRadius: "0px",
        backgroundColor: "cardBackgroundColor",
      }}
      p={2}
    >
      <Flex sx={{ flexDirection: "column", flex: 1, minWidth: 0 }}>
        <Flex sx={{ alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Badge
            variant="primary"
            sx={{ borderRadius: "0px", minWidth: 24, textAlign: "center" }}
          >
            {idx + 1}
          </Badge>

          <Flex sx={{ gap: 2 }}>
            {t.album_thumbnail ? (
              <Box sx={{ width: 60, height: 60, flexShrink: 0 }}>
                <img
                  src={t.album_thumbnail as unknown as string}
                  alt={t.album || t.title || "Album art"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </Box>
            ) : (
              <Box sx={{ width: 60, height: 60, flexShrink: 0, bg: "muted" }} />
            )}

            <Flex sx={{ flexDirection: "column", flexWrap: "wrap" }}>
              <Text sx={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {t.title || "Untitled"}
              </Text>
              <Text
                sx={{
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {t.artist || "Unknown Artist"}
              </Text>
              {t.album && (
                <Text sx={{ color: "primary", fontSize: 1 }}>
                  {t.album} ({t.year}) - {formatDuration(t.duration_seconds)}
                </Text>
              )}
            </Flex>
          </Flex>

          <StreamingLinks
            discogs_url={t.discogs_url as string | undefined}
            apple_music_url={t.apple_music_url as string | undefined}
            spotify_url={t.spotify_url as string | undefined}
            soundcloud_url={t.soundcloud_url as string | undefined}
            containerSx={{ flex: "1 1 auto", minWidth: 0, ml: "auto" }}
          />
        </Flex>
      </Flex>
    </Card>
  );
};

export default TrackCard;
