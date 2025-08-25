import React from "react";
import { Box, Flex, Grid, Badge, Text, Container, Button } from "theme-ui";
import { MDXProvider } from "@mdx-js/react";
import { format } from "date-fns";
import SEO from "../components/seo";
import { graphql, PageProps } from "gatsby";

import AppleMusicEmbed from "../components/applemusic";
import SpotifyEmbed from "../components/spotify";
import TrackCard from "../components/track-card";
import { MdxNode } from "../types/content";
import ResponsiveYouTube from "../components/responsive-youtube";

export const formatDate = (dateString: string) =>
  format(new Date(dateString), "MM.dd.yyyy");

const isIOS = () => {
  return (
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1))
  );
};

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
          <Flex
            sx={{
              flexDirection: "column",
              gap: "10px",
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            <Box>
              <Flex sx={{ flexDirection: "column", paddingY: [0, "20px"] }}>
                {youtubeId && <ResponsiveYouTube videoId={youtubeId} />}
                <Box p={"20px"} backgroundColor="cardBackgroundColor">
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

        <Container
          sx={{
            maxWidth: "800px",
            mx: "auto",
            marginTop: "20px",
            paddingX: ["20px", 0, 0],
          }}
        >
          <MDXProvider>{children}</MDXProvider>
          {tracklist && tracklist.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Text as="h3" sx={{ mb: 2 }}>
                Tracklist
              </Text>
              <Grid columns={[1]} gap={2}>
                {tracklist.map((t, idx) => (
                  <TrackCard
                    key={`${t.artist || "artist"}-${t.title || "title"}-${idx}`}
                    track={t as any}
                    index={idx}
                  />
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
