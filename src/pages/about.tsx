import React from "react";

import { Box, Container, Flex, Grid, Heading, Link, Text } from "theme-ui";
import { StaticImage } from "gatsby-plugin-image";
import heroTexture from "../images/Scan167279.jpeg";
import PersonCard from "../components/person-card";
import SEO from "../components/seo";
import Social from "../components/social";
import { graphql, useStaticQuery } from "gatsby";
import { useOgImageFromPath } from "../hooks/useOgImage";

// replaced with hook useOgImageFromPath

const AboutPage = () => {
  const ogImage = useOgImageFromPath("Scan167279.jpeg");

  return (
    <Box as="main">
      <SEO
        title="About · Public Vinyl Radio"
        description="About Public Vinyl Radio — an all‑vinyl platform for deep, unfiltered sounds. Meet the people behind PVR and the ethos of analog selections."
        url="https://publicvinylradio.com/about"
        image={ogImage}
      />
      {/* HERO — bold/arty */}
      <Box
        sx={{
          bg: "black",
          color: "text",
          pt: [5, 6],
          pb: [5, 6],
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* background texture image */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${heroTexture})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.4,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <Container
          sx={{
            maxWidth: ["100%", "800px", "800px", "800px"],
            position: "relative",
            zIndex: 1,
          }}
        >
          <Flex sx={{ justifyContent: "center" }}>
            <Box sx={{ width: ["100px", "120px"] }}>
              <StaticImage
                src="../images/logo-black.png"
                alt="Logo PVR Black with wordmark"
                placeholder="blurred"
                formats={["auto", "webp"]}
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                }}
                imgStyle={{
                  objectFit: "cover",
                  filter: "invert(1)", // apply directly to the <img>
                }}
              />
            </Box>
          </Flex>

          <Social />
        </Container>
      </Box>

      {/* WHY / WHAT */}
      <Container sx={{ p: 3, maxWidth: ["100%", "800px", "960px", "1140px"] }}>
        <Text
          as="p"
          sx={{ mt: 3, fontSize: [2, 3], fontWeight: 500, maxWidth: 720 }}
        >
          An analog platform in a digital world. 100% vinyl DJ sets, recorded
          and edited by the people who spin them. We collect, we curate, we
          share our favorite music with the world.
        </Text>
        <Grid
          columns={[1, null, 2]}
          gap={4}
          sx={{ alignItems: "center", mt: 5 }}
        >
          <Box>
            <Heading as="h2" sx={{ fontSize: [3, 4], mb: 2 }}>
              Why Vinyl?
            </Heading>
            <Text as="p" sx={{ fontSize: 2, lineHeight: 1.7 }}>
              Vinyl isn't just a format—it's a philosophy. The ritual of
              selecting, cueing, and mixing records creates a tactile connection
              to the music. Every set has its own fingerprints: warm, raw, and
              human.
            </Text>
          </Box>
          <Box
            sx={{
              // bg: "muted",
              borderRadius: "2xl",
              height: [280, 320],
            }}
          >
            <StaticImage
              src="../images/DSC00847.png"
              alt="DSC00847"
              placeholder="blurred"
              formats={["auto", "webp"]}
              style={{
                display: "block",
                width: "auto",
                height: "100%",
              }}
              imgStyle={{
                objectFit: "cover",
              }}
            />
          </Box>
        </Grid>

        <Grid
          columns={[1, null, 2]}
          gap={4}
          sx={{ alignItems: "center", mt: [4, 5] }}
        >
          <Box
            sx={{
              order: [2, null, 1],
              // bg: "muted",
              borderRadius: "2xl",
              height: [280, 320],
              backgroundImage: "url('/images/about/ben-placeholder.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <StaticImage
              src="../images/DSC_0955.png"
              alt="DSC_0955"
              placeholder="blurred"
              formats={["auto", "webp"]}
              style={{
                display: "block",
                width: "auto",
                height: "100%",
              }}
            />
          </Box>
          <Box sx={{ order: [1, null, 2] }}>
            <Heading as="h2" sx={{ fontSize: [3, 4], mb: 2 }}>
              What PVR Is
            </Heading>
            <Text as="p" sx={{ fontSize: 2, lineHeight: 1.7 }}>
              Public Vinyl Radio is a channel for vinyl selectors. Adam and Ben
              both record and edit their own sets, and the platform exists to
              collaborate with other crate diggers and storytellers who share
              the love of analog sound.
            </Text>
          </Box>
        </Grid>
      </Container>

      {/* TEAM — people behind it */}
      <Container sx={{ p: 3, maxWidth: ["100%", "800px", "960px", "1140px"] }}>
        <Heading as="h2" sx={{ fontSize: [3, 4], mt: [5, 6], mb: 3 }}>
          The People Behind It
        </Heading>
        <Grid columns={[1, 2, 3]} gap={4}>
          <PersonCard
            name="Adam Saegebarth"
            role="Founder · DJ · Editor"
            website="http://saegey.com"
            image={
              <StaticImage
                src="../images/DSC_0851.jpeg"
                alt="Adam Saegebarth portrait"
                placeholder="blurred"
                formats={["auto", "webp"]}
                style={{ display: "block", width: "100%", height: "auto" }}
                imgStyle={{ objectFit: "cover" }}
              />
            }
            bio="Curates and mixes every PVR set with a global ear. Software engineer by trade, vinyl lifer by heart. Precision, flow, and feel."
          />
          <PersonCard
            name="Ben Schauland"
            role="DJ · Editor · Visual Collab"
            website="https://www.benschauland.com"
            image={
              <StaticImage
                src="../images/DSC00661.jpeg"
                alt="Ben Schauland portrait"
                placeholder="blurred"
                formats={["auto", "webp"]}
                style={{ display: "block", width: "100%", height: "auto" }}
                imgStyle={{ objectFit: "cover" }}
              />
            }
            bio="Designer and selector. Records/edits his own sets and helps shape the visual identity that matches PVR's eclectic energy."
          />

          <PersonCard
            name="Scarlett Saegebarth"
            role="Photography · Social"
            image={
              <StaticImage
                src="../images/DSC00586.jpeg"
                alt="Scarlett Saegebarth portrait"
                placeholder="blurred"
                formats={["auto", "webp"]}
                style={{ display: "block", width: "100%", height: "auto" }}
                imgStyle={{ objectFit: "cover" }}
              />
            }
            bio="Captures the vibe behind the lens and carries it across platforms so the images resonate as strongly as the music."
          />
        </Grid>
      </Container>

      {/* COLLABORATION — CTA */}
      <Container sx={{ p: 3, maxWidth: ["100%", "800px", "960px", "1140px"] }}>
        <Box
          sx={{
            mt: [5, 6],
            p: [3, 4],
            border: "2px solid",
            borderColor: "primary",
            borderRadius: "2xl",
            textAlign: "center",
          }}
        >
          <Heading as="h2" sx={{ fontSize: [3, 4], mb: 2 }}>
            Collaborate with Public Vinyl Radio
          </Heading>
          <Text as="p" sx={{ fontSize: 2, mb: 3 }}>
            Are you a vinyl selector with a story to tell? We're building a home
            for analog mixes and global sounds.
          </Text>
          <Link
            href="mailto:adam.saegebarth@gmail.com?subject=PVR%20Collab"
            sx={{ variant: "buttons.primary" }}
          >
            Pitch Your Set
          </Link>
        </Box>
      </Container>

      {/* FOOTER BLURB */}
      <Container
        sx={{ p: 3, maxWidth: ["100%", "800px", "960px", "1140px"], mb: 5 }}
      >
        <Heading as="h2" sx={{ fontSize: [3, 4], mt: [5, 6], mb: 2 }}>
          A Soundtrack for Your Moments
        </Heading>
        <Text as="p" sx={{ fontSize: 2, lineHeight: 1.7 }}>
          Whether you need uplifting energy, deep introspection, or a sonic
          companion for your day, our mixes are here to set the tone. Follow
          along for new sets, behind‑the‑scenes digs, and live sessions.
        </Text>
        <Social />
      </Container>
    </Box>
  );
};

export default AboutPage;
