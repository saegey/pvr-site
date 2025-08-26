import React from "react";
import { Box, Flex, Heading, Link, Text, Badge, Image } from "theme-ui";

export type PersonCardProps = {
  name: string;
  role: string;
  bio: string;
  imgSrc?: string;
  image?: React.ReactNode; // allows StaticImage or any custom node
  website?: string;
};

const PersonCard: React.FC<PersonCardProps> = ({
  name,
  role,
  bio,
  imgSrc,
  image,
  website,
}) => (
  <Box
    sx={{
      bg: "muted",
      borderRadius: "2xl",
      overflow: "hidden",
      transition: "transform 200ms ease",
      "&:hover": { transform: "translateY(-4px)" },
    }}
  >
    {image ? (
      image
    ) : imgSrc ? (
      <Image
        src={imgSrc}
        alt={`${name} portrait`}
        sx={{
          display: "block",
          width: "100%",
          height: 280,
          objectFit: "cover",
        }}
      />
    ) : null}
    <Box sx={{ p: 3 }}>
      <Flex sx={{ alignItems: "center", gap: 2 }}>
        <Heading as="h3" sx={{ fontSize: 3, mb: 1 }}>
          {name}
        </Heading>
        {website && (
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <Link
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "primary",
                textDecoration: "none",
                border: "2px solid",
                borderColor: "primary",
                px: 2,
                py: 1,
                borderRadius: 2,
                fontSize: 1,
                "&:hover": { bg: "primary", color: "background" },
              }}
            >
              Website
            </Link>
          </Box>
        )}
      </Flex>
      <Badge sx={{ mb: 2 }}>{role}</Badge>
      <Text as="p" sx={{ fontSize: 1, lineHeight: 1.6 }}>
        {bio}
      </Text>
    </Box>
  </Box>
);

export default PersonCard;
