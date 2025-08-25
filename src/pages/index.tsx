import React from "react";
import { graphql } from "gatsby";
import { Badge, Flex, Card, Text, Link, Grid, Container, Box } from "theme-ui";
import { Link as GatsbyLink } from "gatsby";

import { PageProps } from "gatsby";
import { IGatsbyImageData } from "gatsby-plugin-image";
import SEO from "../components/seo";
import { formatDate } from "../templates/show-template";

interface Show {
  id: string;
  frontmatter: {
    title: string;
    description: string;
    slug: string;
    date: string;
    tags: string[];
    coverImage?: IGatsbyImageData;
    host: string[];
    youtubeId: string;
    isActive?: boolean;
  };
}

interface DataProps {
  allMdx: {
    nodes: Show[];
  };
}

const getYouTubeThumb = (id: string) =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

const ShowsPage: React.FC<PageProps<DataProps>> = ({ data }) => {
  const shows = [...data.allMdx.nodes]
    .filter((s) => s.frontmatter.isActive !== false)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );

  return (
    <>
      <SEO title="Public Vinyl Radio" />
      <Container
        sx={{
          p: 3,
          maxWidth: ["100%", "540px", "720px", "960px", "1140px"],
          mx: "auto",
        }}
      >
        <Grid
          gap={2}
          columns={[1, 1, 2]}
          sx={{
            gridAutoFlow: "row", // Ensures left-to-right ordering
          }}
        >
          {shows.map((show) => (
            <Card
              key={show.id}
              sx={{
                borderColor: "cardBorderColor",
                borderWidth: "2px",
                borderStyle: "solid",
                borderRadius: "0px",
                backgroundColor: "cardBackgroundColor",
              }}
              p={2}
            >
              <Link
                as={GatsbyLink}
                href={`/shows/${show.frontmatter.slug || "#"}`}
                sx={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                {show.frontmatter.coverImage && (
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
                    <img
                      src={`https://img.youtube.com/vi/${show.frontmatter.youtubeId}/maxresdefault.jpg`}
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
                        target.src = getYouTubeThumb(
                          show.frontmatter.youtubeId
                        );
                      }}
                    />
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
              </Link>
            </Card>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default ShowsPage;

// GraphQL Query
export const query = graphql`
  query {
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
