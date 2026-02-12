import React from "react";
import { graphql } from "gatsby";
import { Box, Container, Heading, Text, Flex, Link } from "theme-ui";
import { Link as GatsbyLink } from "gatsby";
import { GatsbyImage, getImage, IGatsbyImageData } from "gatsby-plugin-image";
import InstagramIcon from "../icons/instagram.svg";
import YouTubeIcon from "../icons/youtube.svg";
import WebsiteIcon from "../icons/website.svg";
import PVRLogo from "../icons/heads.svg";
import { formatDate } from "../utils/date";
import { trackLinkClickDeduped } from "../utils/analytics";
import { youTubeHQThumb, youTubeMaxResThumb } from "../utils/youtube";

type Show = {
  id: string;
  frontmatter: {
    slug: string;
    title: string;
    date: string;
    host: string[];
    youtubeId?: string;
    coverImage?: {
      childImageSharp?: {
        gatsbyImageData?: IGatsbyImageData;
      };
    };
    isActive?: boolean;
  };
};

type DataProps = {
  shows: { nodes: Show[] };
};

const socialLinks = [
  {
    title: "Follow on Instagram",
    url: "https://www.instagram.com/publicvinylradio",
    icon: InstagramIcon,
  },
  {
    title: "Subscribe on YouTube",
    url: "https://www.youtube.com/@PublicVinylRadio",
    icon: YouTubeIcon,
  },
  {
    title: "Visit Our Website",
    url: "/",
    icon: WebsiteIcon,
  },
  {
    title: "Join Our Newsletter",
    url: "/join",
    icon: null,
  },
];

export default function QRPage({ data }: { data: DataProps }) {
  const latestShows = (data.shows.nodes || []).slice(0, 2);

  return (
    <Container sx={{ maxWidth: 560, mx: "auto", px: 3, py: 4 }}>
      {/* Logo */}
      <Flex sx={{ justifyContent: "center", mb: 3 }}>
        <Box sx={{ width: "100px" }}>
          <Box
            as={PVRLogo}
            aria-label="Public Vinyl Radio logo"
            sx={{
              display: "block",
              width: "100%",
              height: "100%",
              color: "text",
              "path, rect, circle, polygon, line, polyline": {
                fill: "currentColor",
                stroke: "currentColor",
              },
            }}
          />
        </Box>
      </Flex>

      {/* Title */}
      <Heading
        as="h1"
        sx={{
          fontSize: [4, 5],
          mb: 2,
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        Public Vinyl Radio
      </Heading>

      {/* Subtitle */}
      <Text
        as="p"
        sx={{
          fontSize: 2,
          lineHeight: "body",
          textAlign: "center",
          color: "text",
          mb: 4,
          maxWidth: 560,
          mx: "auto",
        }}
      >
        All vinyl. World Rhythms. Tropical Vibes. Hi-Fi
      </Text>

      {/* Social Links */}
      <Box as="nav" sx={{ display: "grid", gap: 3, mb: 4 }}>
        {socialLinks.map((link, i) => {
          const IconComponent = link.icon;
          const isExternal = link.url.startsWith("http");

          return (
            <Link
              key={i}
              href={link.url}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                py: 3,
                px: 3,
                border: "2px solid",
                borderColor: "primary",
                borderRadius: 2,
                textDecoration: "none",
                color: "primary",
                fontWeight: 600,
                fontSize: [2, 3],
                textTransform: "uppercase",
                transition:
                  "background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  bg: "transparent",
                  color: "primary",
                  boxShadow: "card",
                },
              }}
              onMouseDown={() =>
                trackLinkClickDeduped({
                  linkText: link.title,
                  linkUrl: link.url,
                  linkType: isExternal ? "external" : "internal",
                  location: "qr_page",
                })
              }
              onClick={() =>
                trackLinkClickDeduped({
                  linkText: link.title,
                  linkUrl: link.url,
                  linkType: isExternal ? "external" : "internal",
                  location: "qr_page",
                })
              }
            >
              {IconComponent && (
                <Box
                  as={IconComponent}
                  aria-hidden
                  sx={{ width: 24, height: 24, color: "primary" }}
                />
              )}
              <Text as="span" sx={{ color: "primary" }}>
                {link.title}
              </Text>
            </Link>
          );
        })}
      </Box>

      {/* Latest Shows */}
      {latestShows.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Heading as="h2" sx={{ fontSize: 3, mb: 3, textAlign: "center" }}>
            Latest Shows
          </Heading>
          <Box sx={{ display: "grid", gap: 3 }}>
            {latestShows.map((show) => {
              const coverImageData = show.frontmatter.coverImage
                ? getImage(show.frontmatter.coverImage as any)
                : null;

              return (
                <Box
                  key={show.id}
                  sx={{
                    border: "2px solid",
                    borderColor: "primary",
                    borderRadius: 2,
                    overflow: "hidden",
                    bg: "cardBackgroundColor",
                  }}
                >
                  <GatsbyLink
                    to={`/shows/${show.frontmatter.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                    onMouseDown={() =>
                      trackLinkClickDeduped({
                        linkText: show.frontmatter.title,
                        linkUrl: `/shows/${show.frontmatter.slug}`,
                        linkType: "internal",
                        location: "qr_page_shows",
                      })
                    }
                    onClick={() =>
                      trackLinkClickDeduped({
                        linkText: show.frontmatter.title,
                        linkUrl: `/shows/${show.frontmatter.slug}`,
                        linkType: "internal",
                        location: "qr_page_shows",
                      })
                    }
                  >
                    {(show.frontmatter.youtubeId || coverImageData) && (
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          pb: "56.25%",
                          height: 0,
                          bg: "muted",
                        }}
                      >
                        {show.frontmatter.youtubeId ? (
                          <img
                            src={youTubeMaxResThumb(show.frontmatter.youtubeId)}
                            alt={`${show.frontmatter.title} thumbnail`}
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.onerror = null;
                              target.src = youTubeHQThumb(
                                show.frontmatter.youtubeId!
                              );
                            }}
                          />
                        ) : coverImageData ? (
                          <GatsbyImage
                            image={coverImageData}
                            alt={`${show.frontmatter.title} cover`}
                            style={{
                              position: "absolute",
                              inset: 0,
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
                    <Box sx={{ p: 3 }}>
                      <Text sx={{ lineHeight: "20px", mb: 2 }}>
                        {formatDate(show.frontmatter.date)}
                      </Text>
                      <Heading
                        as="h3"
                        sx={{ fontSize: 2, mb: 1, textTransform: "uppercase" }}
                      >
                        {show.frontmatter.title}
                      </Heading>
                      <Text sx={{ color: "text" }}>
                        {`with ${(show.frontmatter.host || []).join(", ")}`}
                      </Text>
                    </Box>
                  </GatsbyLink>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Container>
  );
}

export const query = graphql`
  query QRPageQuery {
    shows: allMdx(
      sort: { frontmatter: { date: DESC } }
      filter: {
        frontmatter: { isActive: { eq: true } }
        parent: { internal: { description: { regex: "/content/shows/" } } }
      }
      limit: 2
    ) {
      nodes {
        id
        frontmatter {
          slug
          title
          date
          host
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
        }
      }
    }
  }
`;
