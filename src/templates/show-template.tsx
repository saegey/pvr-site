import React from "react";
import { Box, Flex, Grid, Badge, Text, Container } from "theme-ui";
import { MDXProvider } from "@mdx-js/react";
import { format } from "date-fns";
import SEO from "../components/seo";
import { graphql, PageProps } from "gatsby";
import { Helmet } from "react-helmet";

import TrackCard from "../components/track-card";
import { MdxNode } from "../types/content";
import ResponsiveYouTube from "../components/responsive-youtube";
import { youTubeMaxResThumb, youTubeHQThumb } from "../utils/youtube";

export const formatDate = (dateString: string) =>
  format(new Date(dateString), "MM.dd.yyyy");

type DataProps = {
  mdx: MdxNode & { excerpt?: string };
  site: { siteMetadata: { siteUrl: string; image?: string } };
};

const ShowTemplate: React.FC<PageProps<DataProps>> = ({ data, children }) => {
  const { title, description, date, tags, youtubeId, tracklist, host, slug } =
    data.mdx.frontmatter as any;

  // Build SEO description: prefer MDX excerpt, then frontmatter description
  const seoDescription = (data.mdx.excerpt as string) || description || "";

  // Canonical URL for this show
  const siteUrl = data.site.siteMetadata.siteUrl.replace(/\/$/, "");
  const pageUrl = `${siteUrl}/shows/${slug || ""}`;

  // OG image preference: YouTube maxres -> cover publicURL -> site default
  const ogFromYouTube = youtubeId ? youTubeMaxResThumb(youtubeId) : undefined;
  const ogFallback = data.site.siteMetadata.image
    ? `${siteUrl}${data.site.siteMetadata.image.startsWith("/") ? "" : "/"}${
        data.site.siteMetadata.image
      }`
    : undefined;
  const coverUrl = (data.mdx.frontmatter as any)?.coverImage?.publicURL
    ? `${siteUrl}${
        (
          (data.mdx.frontmatter as any)?.coverImage?.publicURL as string
        ).startsWith("/")
          ? ""
          : "/"
      }${(data.mdx.frontmatter as any)?.coverImage?.publicURL as string}`
    : undefined;
  const ogImage = ogFromYouTube || coverUrl || ogFallback;

  return (
    <>
      <SEO
        title={`${title} | Public Vinyl Radio`}
        description={seoDescription}
        image={ogImage}
        url={pageUrl}
        type="article"
      />
      {youtubeId && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoObject",
              name: title,
              description: seoDescription,
              uploadDate: date,
              thumbnailUrl: [
                youTubeHQThumb(youtubeId),
                youTubeMaxResThumb(youtubeId),
              ],
              embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
              url: pageUrl,
            })}
          </script>
        </Helmet>
      )}
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

                <Flex sx={{ gap: "5px", marginTop: "10px", flexWrap: "wrap" }}>
                  {(tags || []).map((tag: string, index: number) => (
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
                {tracklist.map((t: any, idx: number) => (
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
    site {
      siteMetadata {
        siteUrl
        image
      }
    }
    mdx: mdx(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
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
