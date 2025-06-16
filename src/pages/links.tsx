import React from "react";
import { graphql } from "gatsby";
import {
  GatsbyImage,
  IGatsbyImageData,
  StaticImage,
} from "gatsby-plugin-image";
import { Box, Container, Heading, Text, useColorMode } from "theme-ui";

// 1) Import each SVG from /src/icons
import InstagramIcon from "../icons/instagram.svg";
import YouTubeIcon from "../icons/youtube.svg";
import WebsiteIcon from "../icons/website.svg"; // Add more icons as needed
import MixcloudIcon from "../icons/mixcloud.svg";

// 2) Build a simple map from your yaml‐string → actual component
const iconMap: Record<string, React.ComponentType<unknown>> = {
  InstagramIcon,
  YouTubeIcon,
  WebsiteIcon,
  MixcloudIcon,
  // …add other SVGs here if you need
};

type LinkItem = {
  title: string;
  url: string;
  subtitle?: string;

  // either of these two will be present
  linkImage?: {
    childImageSharp: {
      gatsbyImageData: IGatsbyImageData;
    };
  };
  svgIcon?: string;
};

type Props = {
  data: {
    allDataYaml: {
      nodes: Array<{ links: LinkItem[] }>;
    };
  };
};

export default function LinkTreePage({ data }: Props) {
  const items = data.allDataYaml.nodes[0].links || [];
  if (items.length === 0) {
    return <Container>No links found.</Container>;
  }

  // 3) Separate out the first item to render as “featured”
  const [featuredLink, ...otherLinks] = items;
  const [colorMode] = useColorMode();

  return (
    <Container sx={{ maxWidth: 640, mx: "auto", px: 3, py: 4 }}>
      {/* ─── Static Logo + Heading ─── */}
      <Box
        sx={{
          textAlign: "center",
          mb: 2, // apply `invert(1)` in dark mode to turn a black logo into white
        }}
      >
        {/* <StaticImage
          src="../images/logo-black.png"
          alt="My Static Avatar"
          width={60}
          placeholder="none"
          style={{ margin: "0 auto", display: "block" }}
          imgStyle={{
            filter: colorMode === "dark" ? "invert(1)" : "none",
          }}
        /> */}
      </Box>
      <Heading as="h1" sx={{ fontSize: 4, mb: 3, textAlign: "center" }}>
        PUBLIC VINYL RADIO
      </Heading>

      {/* ─── FEATURED ITEM ─── */}
      <Box
        as="a"
        href={featuredLink.url}
        key="featured"
        variant="linkCard"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textDecoration: "none",
          mb: 2,
          color: "primary",
          border: "2px solid",
          borderColor: "primary",
          borderRadius: 0,
          overflow: "hidden",
        }}
      >
        {/* If it has an SVG icon, render that large on top */}
        {featuredLink.svgIcon && iconMap[featuredLink.svgIcon] && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              bg: "background",
              py: 4,
            }}
          >
            {/**  
              If you prefer a big background color behind SVG, adjust sx above  
            **/}
            <Box
              as={iconMap[featuredLink.svgIcon]!}
              aria-label={featuredLink.title}
              sx={{ width: 200, height: 200 }}
            />
          </Box>
        )}

        {/* If it has a raster image, render it full‐width on top */}
        {featuredLink.linkImage?.childImageSharp?.gatsbyImageData && (
          <Box sx={{ width: "100%", height: "auto" }}>
            <GatsbyImage
              image={featuredLink.linkImage.childImageSharp.gatsbyImageData}
              alt={featuredLink.title}
              style={{ width: "100%", height: "auto" }}
              imgStyle={{ objectFit: "cover" }}
            />
          </Box>
        )}

        {/* Title + subtitle below the image/icon */}
        <Box
          sx={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
          }}
        >
          <Heading
            as="h2"
            sx={{ fontSize: 4, mb: 1, paddingTop: "10px", color: "primary" }}
          >
            {featuredLink.title}
          </Heading>
          {featuredLink.subtitle && (
            <Text sx={{ fontSize: 2, color: "primary" }}>
              {featuredLink.subtitle}
            </Text>
          )}
        </Box>
      </Box>

      {/* ─── ALL OTHER ITEMS ─── */}
      {otherLinks.map((link, i) => {
        const imageData = link.linkImage?.childImageSharp?.gatsbyImageData;
        const SvgComponent = link.svgIcon && iconMap[link.svgIcon];

        return (
          <Box
            as="a"
            href={link.url}
            key={i}
            variant="linkCard"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              mb: 2,
            }}
          >
            {imageData ? (
              // fixed 72×72 container, never shrinks, same margin as below
              <Box sx={{ flexShrink: 0, width: 72, height: 72, mr: 3 }}>
                <GatsbyImage
                  image={imageData}
                  alt={link.title}
                  style={{ width: "100%", height: "100%" }}
                  imgStyle={{ objectFit: "cover" }}
                />
              </Box>
            ) : SvgComponent ? (
              <Box
                as={SvgComponent}
                aria-label={link.title}
                sx={{
                  flexShrink: 0,
                  width: 72,
                  height: 72,
                  mr: 3,
                  color: "primary",
                }}
              />
            ) : null}

            <Box>
              <Heading as="h3" sx={{ fontSize: 2, mb: 1, color: "primary" }}>
                {link.title}
              </Heading>
              {link.subtitle && (
                <Text
                  sx={{ fontSize: 1, color: "primary", lineHeight: "12px" }}
                >
                  {link.subtitle}
                </Text>
              )}
            </Box>
          </Box>
        );
      })}
    </Container>
  );
}

export const query = graphql`
  query {
    allDataYaml {
      nodes {
        links {
          title
          url
          subtitle

          # still query linkImage as before
          linkImage {
            childImageSharp {
              gatsbyImageData(
                width: 600 # for featured, you can query a larger size if you like
                placeholder: BLURRED
                layout: CONSTRAINED
              )
            }
          }

          # and also pick up svgIcon if defined in the YAML
          svgIcon
        }
      }
    }
  }
`;
