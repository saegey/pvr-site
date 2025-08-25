import React, { useState } from "react";
import {
  Box,
  Flex,
  Grid,
  Badge,
  Text,
  Container,
  Button,
  Card,
  Link,
} from "theme-ui";
import { MDXProvider } from "@mdx-js/react";

import {
  FaApple,
  FaBookOpen,
  FaPlay,
  FaPlayCircle,
  FaPlayCircle as FaSolidPlay,
  FaSpotify,
  FaYoutube,
  FaWindowClose,
} from "react-icons/fa";
import { SiDiscogs } from "react-icons/si";

import { format } from "date-fns";
import SEO from "../components/seo";

const EmbedModal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bg: "rgba(0,0,0,0.7)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 0,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          // full-screen on mobile, then 90%/600px on larger screens
          width: ["100vw", "90%", "600px"],
          height: ["100vh", "auto", "auto"],
          maxHeight: ["100vh", "90vh", "90vh"],
          bg: "background",
          borderRadius: ["0px", "10px", "10px"],
          p: ["10px", "20px", "20px"],
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button always top-right */}
        <Button
          onClick={onClose}
          sx={{
            position: "absolute",
            top: ["10px", "20px", "20px"],
            right: ["10px", "20px", "20px"],
            zIndex: 2,
            bg: "transparent",
            color: "text",
            fontSize: 4,
            cursor: "pointer",
          }}
        >
          <FaWindowClose />
        </Button>

        {/* Scrollable content area */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>{children}</Box>
      </Box>
    </Box>
  );
};

const ResponsiveYouTube = ({ videoId }: { videoId: string }) => (
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
      frameBorder="0"
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
    ></iframe>
  </Box>
);

export const formatDate = (dateString: string) =>
  format(new Date(dateString), "MM.dd.yyyy");

const isIOS = () => {
  return (
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1))
  );
};

const components = {
  ResponsiveYouTube,
  AppleMusicEmbed,
  SpotifyEmbed,
};

import AppleMusicEmbed from "../components/applemusic";
import SpotifyEmbed from "../components/spotify";
import StreamingLinks from "../components/streaming-links";
import TrackCard from "../components/track-card";
import { graphql, PageProps } from "gatsby";
import { MdxNode } from "../types/content";

type DataProps = {
  mdx: MdxNode;
};

const ShowTemplate: React.FC<PageProps<DataProps>> = ({ data, children }) => {
  const { title, description, date, tags, youtubeId, tracklist, host } =
    data.mdx.frontmatter;

  console.log(tracklist);

  return (
    <>
      <SEO title={`${title} | Public Vinyl Radio`} description={description} />
      <Container
        sx={{
          maxWidth: "800px",
          mx: "auto",
          marginTop: [0, "20px", "20px"],
        }}
      >
        <Grid
          columns={[1, 1]}
          sx={{
            gap: "20px",
          }}
        >
          <Flex
            sx={{
              flexDirection: "column",
              gap: "10px",
              justifyContent: "space-between",
              paddingX: ["20px", 0, 0],
              height: "100%",
            }}
          >
            <Box>
              <Flex sx={{ flexDirection: "column", paddingY: "20px" }}>
                {youtubeId && <ResponsiveYouTube videoId={youtubeId} />}
                <Box p={2} backgroundColor="cardBackgroundColor">
                  <Box sx={{ flexDirection: "column", gap: "10px" }}>
                    <Text>{formatDate(date || "") || "Unknown Date"}</Text>
                    {" · "}
                    <Text>Seattle</Text>
                  </Box>
                  <Box>
                    <Text as="h2" sx={{ marginBottom: 0 }}>
                      {title}
                    </Text>
                    <Box>
                      <Text>with</Text>{" "}
                      {(host || []).map((h: string, index: number) => (
                        <Text key={index} sx={{ fontWeight: 600 }}>
                          {h}
                        </Text>
                      ))}
                    </Box>
                  </Box>
                  <Text
                    as="h4"
                    style={{ wordWrap: "break-word", fontWeight: 400 }}
                  >
                    {description}
                  </Text>

                  <Flex
                    sx={{ gap: "5px", marginTop: "10px", flexWrap: "wrap" }}
                  >
                    {(tags || []).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="primary"
                        sx={{
                          borderRadius: "0px",
                          textTransform: "uppercase",
                          fontSize: "13px",
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Grid>

        <Container
          sx={{
            maxWidth: "800px",
            mx: "auto",
            marginTop: "20px",
            paddingX: ["20px", 0, 0],
          }}
        >
          <MDXProvider components={components}>{children}</MDXProvider>
          {tracklist && tracklist.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Text as="h3" sx={{ mb: 2 }}>
                Tracklist
              </Text>
              <Grid columns={[1]} gap={2}>
                {tracklist.map((t, idx) => (
                  <TrackCard key={`${t.artist || "artist"}-${t.title || "title"}-${idx}`} track={t as any} index={idx} />
                ))}
              </Grid>
            </Box>
          )}
        </Container>
      </Container>
    </>
  );
};

export default ShowTemplate;

export const query = graphql`
  query Show($id: String!) {
    mdx: mdx(id: { eq: $id }) {
      id
      frontmatter {
        template
        title
        description
        episode
        date
        tags
        iframeSrc
        youtubeId
        appleMusicUrl
        spotifyId
        slug
        coverImage {
          publicURL # ✅ Get direct URL for Open Graph images
          childImageSharp {
            gatsbyImageData(
              width: 700
              layout: CONSTRAINED
              formats: [AUTO, WEBP]
            )
          }
        }
        tracklist {
          title
          artist
          year
          album
          discogs_url
          album_thumbnail
          duration_seconds
          apple_music_url
          spotify_url
          soundcloud_url
        }
        host
      }
    }
  }
`;
