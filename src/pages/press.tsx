import React from "react";
import { Box, Container, Grid, Heading, Text, Card, Link } from "theme-ui";
import { graphql, useStaticQuery } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import SEO from "../components/seo";
import { useOgImageFromPath } from "../hooks/useOgImage";

const PressPage = () => {
  const ogImage = useOgImageFromPath("DSC_0955.png");

  const data = useStaticQuery(graphql`
    query PressKitQuery {
      allFile(
        filter: {
          sourceInstanceName: { eq: "images" }
          relativeDirectory: { eq: "press" }
        }
        sort: { name: ASC }
      ) {
        nodes {
          id
          name
          extension
          publicURL
          childImageSharp {
            gatsbyImageData(
              width: 400
              height: 300
              layout: CONSTRAINED
              formats: [AUTO, WEBP]
            )
          }
        }
      }
    }
  `);

  const pressFiles = data.allFile.nodes;

  return (
    <Box as="main">
      <SEO
        title="Press Kit · Public Vinyl Radio"
        description="Download high-resolution logos and press materials for Public Vinyl Radio"
        url="https://publicvinylradio.com/press"
        image={ogImage}
      />

      <Container sx={{ p: 3, maxWidth: ["100%", "800px", "960px", "1140px"] }}>
        <Box sx={{ textAlign: "center", mb: 5, mt: 4 }}>
          <Heading as="h1" sx={{ fontSize: [4, 5], mb: 3 }}>
            Press Kit
          </Heading>
          <Text as="p" sx={{ fontSize: 2, maxWidth: 600, mx: "auto" }}>
            Download high-resolution logos and press materials for Public Vinyl Radio.
            All assets are available for press and promotional use.
          </Text>
        </Box>

        <Grid columns={[1, 2, 3]} gap={4}>
          {pressFiles.map((file: any) => {
            const image = getImage(file.childImageSharp);
            const isImage = ['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(
              file.extension.toLowerCase()
            );

            return (
              <Card
                key={file.id}
                sx={{
                  borderColor: "cardBorderColor",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  borderRadius: 5,
                  backgroundColor: "cardBackgroundColor",
                  p: 3,
                  textAlign: "center",
                }}
              >
                {isImage && image && (
                  <Box sx={{ mb: 3 }}>
                    <GatsbyImage
                      image={image}
                      alt={`${file.name} preview`}
                      style={{
                        borderRadius: "4px",
                      }}
                    />
                  </Box>
                )}

                {isImage && !image && file.extension === 'svg' && (
                  <Box sx={{ mb: 3, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img
                      src={file.publicURL}
                      alt={`${file.name} preview`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                )}

                <Text
                  sx={{
                    fontWeight: 600,
                    fontSize: 1,
                    mb: 2,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {file.name}.{file.extension}
                </Text>

                <Link
                  href={file.publicURL}
                  download
                  sx={{
                    variant: "buttons.primary",
                    display: "inline-block",
                    textDecoration: "none",
                    fontSize: 1,
                    px: 3,
                    py: 2,
                  }}
                >
                  Download
                </Link>
              </Card>
            );
          })}
        </Grid>

        <Box sx={{ mt: 5, textAlign: "center" }}>
          <Text sx={{ fontSize: 1, color: "muted" }}>
            For additional press materials or questions, contact:{" "}
            <Link href="mailto:adam.saegebarth@gmail.com">
              adam.saegebarth@gmail.com
            </Link>
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default PressPage;