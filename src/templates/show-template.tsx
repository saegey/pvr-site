import React, { useState, useEffect, useMemo } from "react";
import { Box, Flex, Grid, Badge, Text, Container, Button } from "theme-ui";
import Layout from "../components/layout";
import {
  FaApple,
  FaBookOpen,
  FaPlay,
  FaPlayCircle,
  FaPlayCircle as FaSolidPlay,
  FaSpotify,
  FaYoutube,
  FaWindowClose
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
          <FaWindowClose/>
        </Button>

        {/* Scrollable content area */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {children}
        </Box>
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

const MyDynamicImage = ({ coverImage }: { coverImage: IGatsbyImageData }) => {
  const image = getImage(coverImage);
  if (!image) return null;

  return (
    <GatsbyImage
      image={image}
      alt="Cover Image"
      style={{ borderRadius: "0px" }}
    />
  );
};

import { useColorMode } from "theme-ui";
import AppleMusicEmbed from "../components/applemusic";
import SpotifyEmbed from "../components/spotify";

const BottomDrawer = ({
  isOpen,
  onClose,
  iframeSrc,
}: {
  isOpen: boolean;
  onClose: () => void;
  iframeSrc: string;
}) => {
  const [colorMode] = useColorMode();

  // Ensure iframeSrc is valid before parsing
  if (!isOpen || !iframeSrc) return null;

  try {
    const urlObject = new URL(iframeSrc);
    const path = urlObject.pathname.replace(/\/$/, ""); // Remove trailing slash
    const encodedPath = encodeURIComponent(path);

    const url = `https://player-widget.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&autoplay=1&feed=${encodedPath}%2F&light=${
      colorMode === "dark" ? "0" : "1"
    }`;

    return (
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          bg: "background",
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
          transition: "transform 0.3s ease-in-out",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            bg: "transparent",
            color: "text",
            fontSize: 3,
            cursor: "pointer",
          }}
        >
          ✕
        </Button>
        <iframe width="100%" height="60px" src={url} frameBorder="0"></iframe>
      </Box>
    );
  } catch (error) {
    console.error("Invalid iframeSrc:", iframeSrc, error);
    return null;
  }
};

interface PageContext {
  title: string;
  description: string;
  episode: number;
  date: string;
  tags: string[];
  iframeSrc: string;
  youtubeId: string;
  content: string;
  coverImage: IGatsbyImageData;
  publicURL: string;
  tracklist: { title: string; artist: string; year: number }[];
  host: string[];
  appleMusicUrl?: string;
  spotifyId?: string;
}

const ShowTemplate = ({ pageContext }: { pageContext: PageContext }) => {
  const {
    title,
    description,
    episode,
    date,
    tags,
    iframeSrc,
    youtubeId,
    content,
    coverImage,
    publicURL,
    tracklist,
    host,
    appleMusicUrl,
    spotifyId,
  } = pageContext;
  console.log("Page Context:", pageContext);

  const [MDXComponent, setMDXComponent] = useState<React.ComponentType | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Add this with your other useState imports
  const [showTracklist, setShowTracklist] = useState(false);
  const [showAppleModal, setShowAppleModal] = useState(false);
  const [showSpotifyModal, setShowSpotifyModal] = useState(false);

  useEffect(() => {
    const doCompile = async () => {
      try {
        const compiled = await compile(content, {
          outputFormat: "function-body",
          useDynamicImport: true, // ✅ Fix: Allows imports in MDX
          baseUrl: "/", // ✅ Fix: Required to resolve imports
        });

        const result = await run(compiled, runtime);
        setMDXComponent(() => result.default);
      } catch (error) {
        console.error(error);
      }
    };

    doCompile();
  }, [content]);

  const memoizedIframeSrc = useMemo(() => iframeSrc, [iframeSrc]);
  console.log(publicURL);

  return (
    <Layout>
      <SEO
        title={`${title} | Public Vinyl Radio`}
        description={description}
        image={publicURL} // ✅ Pass OG image dynamically
      />
      <Container
        sx={{
          maxWidth: "960px",
          mx: "auto",
          marginTop: [0, "20px", "20px"],
        }}
      >
        <Grid
          columns={[1, 2]}
          sx={{
            gap: "20px",
            backgroundColor: [
              "background",
              "showCardBackground",
              "showCardBackground",
            ],
          }}
        >
          <Box
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <MyDynamicImage coverImage={coverImage} />
          </Box>
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
                  <Text>{formatDate(date) || "Unknown Date"}</Text>
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

          {MDXComponent ? (
            <MDXComponent components={components} />
          ) : (
            <Text>Loading content...</Text>
          )}
        </Container>
      </Container>

      {/* Bottom Drawer */}
      {iframeSrc && (
        <BottomDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          iframeSrc={memoizedIframeSrc}
        />
      )}
    </Layout>
  );
};

export default ShowTemplate;
