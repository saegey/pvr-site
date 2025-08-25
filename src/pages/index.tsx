import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import { Badge, Flex, Card, Text, Link, Grid, Container, Box } from "theme-ui";
import { Link as GatsbyLink } from "gatsby";

import { PageProps } from "gatsby";
import { GatsbyImage, getImage, IGatsbyImageData } from "gatsby-plugin-image";
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
  };
}

interface DataProps {
  allMdx: {
    nodes: Show[];
  };
}

const getYouTubeThumb = (id: string) =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

const MyDynamicImage = ({ coverImage }: { coverImage: IGatsbyImageData }) => {
  const image = getImage(coverImage);

  if (!image) return null;

  return (
    <GatsbyImage
      image={image}
      alt="Example Image"
      style={{ borderRadius: "0px" }}
    />
  );
};

const ShowsPage: React.FC<PageProps<DataProps>> = ({ data }) => {
  const shows = [...data.allMdx.nodes].sort(
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
                // maxWidth: 600,
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
                      width: '100%',
                      height: 'auto',
                      bg: "muted",
                      borderRadius: 8,
                      overflow: "hidden",
                      flex: "0 0 auto",
                    }}
                  >
                    <img
                      src={getYouTubeThumb(show.frontmatter.youtubeId)}
                      alt={`${show.frontmatter.title} thumbnail`}
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                      }}
                      loading="lazy"
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
                  <Text sx={{ fontSize: "15px", wordWrap: "break-word" }}>
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
