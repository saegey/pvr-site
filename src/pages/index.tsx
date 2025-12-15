import React from "react";
import { graphql } from "gatsby";
import { Badge, Flex, Card, Text, Grid, Container, Box } from "theme-ui";
import { Link as GatsbyLink } from "gatsby";
import { PageProps } from "gatsby";
import { GatsbyImage, getImage, IGatsbyImageData } from "gatsby-plugin-image";
import { Helmet } from "react-helmet";

import SEO from "../components/seo";
import { formatDate } from "../utils/date";
import { youTubeHQThumb, youTubeMaxResThumb } from "../utils/youtube";
import { useOgImageFromPath } from "../hooks/useOgImage";

interface Show {
  id: string;
  frontmatter: {
    title: string;
    description: string;
    slug: string;
    date: string;
    tags: string[];
    coverImage?: {
      childImageSharp?: {
        gatsbyImageData?: IGatsbyImageData;
      };
    };
    host: string[];
    youtubeId: string;
    isActive?: boolean;
  };
}

interface DataProps {
  allMdx: {
    nodes: Show[];
  };
  site: {
    siteMetadata: {
      title: string;
      description: string;
      siteUrl: string;
      image?: string;
    };
  };
}

const ShowsPage: React.FC<PageProps<DataProps>> = ({ data }) => {
  const shows = [...data.allMdx.nodes]
    .filter((s) => s.frontmatter.isActive !== false)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );

  const ogImage = useOgImageFromPath("DSC_0955.png");
  const { siteMetadata } = data.site;

  return (
    <>
      <SEO
        title="Public Vinyl Radio"
        image={ogImage}
        url={siteMetadata.siteUrl}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: siteMetadata.siteUrl,
            name: siteMetadata.title,
            description: siteMetadata.description,
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            url: siteMetadata.siteUrl,
            name: siteMetadata.title,
            logo: ogImage,
            sameAs: [
              "https://www.youtube.com/@PublicVinylRadio",
              "https://www.mixcloud.com/public-vinyl-radio/",
              "https://www.instagram.com/PublicVinylRadio",
            ],
          })}
        </script>
      </Helmet>
      <Container
        sx={{
          p: 3,
          maxWidth: ["100%", "540px", "720px"],
          mx: "auto",
        }}
      >
        <Grid
          gap={[3, 4, 4]}
          mt={3}
          columns={[1, 1, 1]}
          sx={{
            gridAutoFlow: "row", // Ensures left-to-right ordering
          }}
        >
          {shows.map((show) => {
          const coverImageData = show.frontmatter.coverImage ? getImage(show.frontmatter.coverImage as any) : null;

          return (
            <Card
              key={show.id}
              sx={{
                borderColor: "cardBorderColor",
                borderWidth: "2px",
                borderStyle: "solid",
                borderRadius: 5,
                backgroundColor: "cardBackgroundColor",
              }}
              p={2}
            >
              <GatsbyLink
                to={`/shows/${show.frontmatter.slug || "#"}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {(show.frontmatter.youtubeId || coverImageData) && (
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      paddingBottom: "56.25%", // 16:9 aspect ratio
                      height: 0,
                      bg: "muted",
                      borderRadius: 8,
                      overflow: "hidden",
                      flex: "0 0 auto",
                    }}
                  >
                    {show.frontmatter.youtubeId ? (
                      <img
                        src={youTubeMaxResThumb(show.frontmatter.youtubeId)}
                        alt={`${show.frontmatter.title} thumbnail`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.onerror = null; // prevent loop
                          target.src = youTubeHQThumb(show.frontmatter.youtubeId);
                        }}
                      />
                    ) : coverImageData ? (
                      <GatsbyImage
                        image={coverImageData}
                        alt={`${show.frontmatter.title} cover`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                        }}
                        imgStyle={{
                          objectFit: "cover",
                        }}
                      />
                    ) : null}
                  </Box>
                )}
                <Flex
                  sx={{
                    paddingTop: "10px",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <Flex sx={{ flexDirection: "column" }}>
                    <Text sx={{ lineHeight: "20px", marginBottom: "10px" }}>
                      {formatDate(show.frontmatter.date) || "Unknown Date"}
                    </Text>
                    <Text
                      as="h2"
                      sx={{
                        fontWeight: 600,
                        fontSize: 18,
                        fontFamily: "body",
                        textTransform: "uppercase",
                        lineHeight: "20px",
                      }}
                    >
                      {show.frontmatter.title || "Untitled Show"}
                    </Text>{" "}
                    <Text>
                      {" with "}{" "}
                      {(show.frontmatter.host || []).join(", ") ||
                        "Unknown Host"}
                    </Text>
                  </Flex>
                  <Text
                    sx={{
                      fontSize: "15px",
                      lineHeight: "20px",
                      wordWrap: "break-word",
                      display: "-webkit-box",
                      WebkitLineClamp: "3",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      minHeight: "60px", // 3 lines * 20px
                    }}
                  >
                    {show.frontmatter.description ||
                      "No description available."}
                  </Text>
                  <Flex sx={{ gap: "5px", flexWrap: "wrap" }}>
                    {(show.frontmatter.tags || []).map((tag, index) => (
                      <Badge
                        key={index}
                        sx={{
                          borderRadius: "0px",
                          fontSize: "13px",
                          textTransform: "uppercase",
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Flex>
                </Flex>
              </GatsbyLink>
            </Card>
          );
        })}
        </Grid>
      </Container>
    </>
  );
};

export default ShowsPage;

// GraphQL Query
export const query = graphql`
  query IndexPageQuery {
    site {
      siteMetadata {
        title
        description
        siteUrl
        image
      }
    }
    allMdx(
      sort: { frontmatter: { date: DESC } }
      filter: {
        frontmatter: { isActive: { eq: true } }
        parent: { internal: { description: { regex: "/content/shows/" } } }
      }
    ) {
      nodes {
        id
        frontmatter {
          title
          description
          slug
          date
          tags
          youtubeId
          isActive
          coverImage {
            childImageSharp {
              gatsbyImageData(
                width: 600
                layout: CONSTRAINED
                formats: [AUTO, WEBP]
              )
            }
          }
          host
        }
      }
    }
  }
`;
