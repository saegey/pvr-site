import React, { useState } from "react";
import { Box, Flex, Grid, Badge, Text, Container, Button } from "theme-ui";
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

import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { GatsbyImage, getImage, IGatsbyImageData } from "gatsby-plugin-image";
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
import { graphql, PageProps } from "gatsby";
import { MdxNode } from "../types/content";

type DataProps = {
  mdx: MdxNode;
};

const ShowTemplate: React.FC<PageProps<DataProps>> = ({ data, children }) => {
  const {
    title,
    description,
    episode,
    date,
    tags,
    iframeSrc,
    youtubeId,
    coverImage,
    tracklist,
    host,
    appleMusicUrl,
    spotifyId,
  } = data.mdx.frontmatter;

  console.log(data, children);

  // Add this with your other useState imports
  const [showTracklist, setShowTracklist] = useState(false);
  const [showAppleModal, setShowAppleModal] = useState(false);
  const [showSpotifyModal, setShowSpotifyModal] = useState(false);

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
            backgroundColor: [
              "background",
              "showCardBackground",
              "showCardBackground",
            ],
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
              <Flex
                sx={{ flexDirection: "column", gap: "10px", paddingY: "20px" }}
              >
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

                <Flex sx={{ gap: "5px", marginTop: "10px", flexWrap: "wrap" }}>
                  {tags.map((tag, index) => (
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
              </Flex>
            </Box>

            {/* Buttons Grouped */}
            <Flex
              sx={{ flexDirection: "column", gap: "10px", paddingY: "20px" }}
            >
              <Flex sx={{ flexWrap: "wrap", gap: "10px" }}>
                {youtubeId && (
                  <Button
                    onClick={() => {
                      window.open(
                        `https://www.youtube.com/watch?v=${youtubeId}`,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                    sx={{
                      bg: "primary",
                      color: "background",
                      padding: "10px",
                      borderRadius: 0,
                      fontFamily: "body",
                      paddingX: "20px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "background 0.3s",
                      "&:hover": { bg: "secondary" },
                    }}
                  >
                    <Flex sx={{ gap: "10px", alignItems: "center" }}>
                      <FaYoutube />
                      <Text>YouTube</Text>
                    </Flex>
                  </Button>
                )}

                {iframeSrc && (
                  <Button
                    onClick={() => {
                      window.open(iframeSrc, "_blank", "noopener,noreferrer");
                    }}
                    sx={{
                      bg: "primary",
                      color: "background",
                      padding: "10px",
                      borderRadius: 0,
                      fontFamily: "body",
                      paddingX: "20px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "background 0.3s",
                      "&:hover": { bg: "secondary" },
                    }}
                  >
                    <Flex sx={{ gap: "10px", alignItems: "center" }}>
                      <FaPlay />
                      <Text>Mixcloud</Text>
                    </Flex>
                  </Button>
                )}

                {appleMusicUrl && (
                  <Button
                    onClick={() => setShowAppleModal(true)}
                    sx={{
                      bg: "primary",
                      color: "background",
                      padding: "10px",
                      borderRadius: 0,
                      fontFamily: "body",
                      paddingX: "20px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "background 0.3s",
                      "&:hover": { bg: "secondary" },
                    }}
                  >
                    <Flex sx={{ gap: "10px", alignItems: "center" }}>
                      <FaApple />
                      <Text>Apple Music</Text>
                    </Flex>
                  </Button>
                )}

                {spotifyId && (
                  <Button
                    onClick={() => setShowSpotifyModal(true)}
                    sx={{
                      bg: "primary",
                      color: "background",
                      padding: "10px",
                      borderRadius: 0,
                      fontFamily: "body",
                      paddingX: "20px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "background 0.3s",
                      "&:hover": { bg: "secondary" },
                    }}
                  >
                    <Flex sx={{ gap: "10px", alignItems: "center" }}>
                      <FaSpotify />
                      <Text>Spotify</Text>
                    </Flex>
                  </Button>
                )}
              </Flex>
              <Flex>
                <Button
                  onClick={() => setShowTracklist(!showTracklist)}
                  sx={{
                    bg: "primary",
                    color: "background",
                    padding: "10px",
                    borderRadius: 0,
                    fontFamily: "body",
                    paddingX: "20px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "background 0.3s",
                    "&:hover": { bg: "highlight" },
                  }}
                >
                  <Flex sx={{ gap: "10px", alignItems: "center" }}>
                    <FaBookOpen />
                    <Text>
                      {showTracklist ? "Hide Tracklist" : "Tracklist"}
                    </Text>
                  </Flex>
                </Button>
              </Flex>
            </Flex>
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
          {tracklist && showTracklist && (
            <EmbedModal
              isOpen={showTracklist}
              onClose={() => setShowTracklist(false)}
            >
              <Box sx={{ marginTop: "20px" }}>
                <Text as="h3">Tracklist</Text>
                <Flex sx={{ flexDirection: "column", gap: "5px" }}>
                  {tracklist.map(({ artist, title, year }, index) => (
                    <Box key={index}>
                      <Text>
                        <Text style={{ fontWeight: 600 }}>{artist}</Text> -{" "}
                        {title} {year && <>({year})</>}
                      </Text>
                    </Box>
                  ))}
                </Flex>
              </Box>
            </EmbedModal>
          )}

          {showAppleModal && (
            <EmbedModal
              isOpen={showAppleModal}
              onClose={() => setShowAppleModal(false)}
            >
              {appleMusicUrl && <AppleMusicEmbed url={appleMusicUrl} />}
            </EmbedModal>
          )}

          {showSpotifyModal && (
            <EmbedModal
              isOpen={showSpotifyModal}
              onClose={() => setShowSpotifyModal(false)}
            >
              {spotifyId && <SpotifyEmbed id={spotifyId} />}
            </EmbedModal>
          )}

          <Container>
            <MDXProvider components={components}>{data.mdx.body}</MDXProvider>
          </Container>
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
        }
        host
      }
      body
    }
  }
`;
