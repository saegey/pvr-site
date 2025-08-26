import React from "react";
import { Flex, Link } from "theme-ui";
import { FaYoutube, FaMixcloud, FaInstagram } from "react-icons/fa";

const Social: React.FC = () => (
  <Flex sx={{ justifyContent: "center", gap: 4, mt: 3 }}>
    <Link
      href="https://www.youtube.com/@PublicVinylRadio"
      target="_blank"
      sx={{ color: "white", "&:hover": { color: "primary" } }}
      rel="noopener noreferrer"
    >
      <FaYoutube size={32} />
    </Link>
    <Link
      href="https://www.mixcloud.com/public-vinyl-radio/"
      target="_blank"
      sx={{ color: "white", "&:hover": { color: "primary" } }}
      rel="noopener noreferrer"
    >
      <FaMixcloud size={32} />
    </Link>
    <Link
      href="https://www.instagram.com/PublicVinylRadio"
      target="_blank"
      sx={{ color: "white", "&:hover": { color: "primary" } }}
      rel="noopener noreferrer"
    >
      <FaInstagram size={32} />
    </Link>
  </Flex>
);

export default Social;
