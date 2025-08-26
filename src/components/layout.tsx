import {
  Box,
  Link,
  MenuButton,
  Flex,
  Text,
  Close,
  useColorMode,
} from "theme-ui";
import { ReactNode, useEffect, useState } from "react";
import React from "react";
import { Link as GatsbyLink } from "gatsby";
import { FaYoutube, FaInstagram } from "react-icons/fa";
import HeadsIcon from "../icons/heads.svg";

const Layout = ({ children }: { children: ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorMode, setColorMode] = useColorMode();

  // React to system theme changes without a hard refresh
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (e: MediaQueryList | MediaQueryListEvent) => {
      const matches = "matches" in e ? e.matches : mq.matches;
      setColorMode(matches ? "dark" : "default");
    };
    // set initial in case Theme UI hasn't yet
    apply(mq);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    } else if (typeof mq.addListener === "function") {
      // Safari fallback
      mq.addListener(apply);
      return () => mq.removeListener(apply);
    }
  }, [setColorMode]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <Box
      sx={{
        fontFamily: "body",
        lineHeight: "body",
        color: "text",
        bg: "background",
      }}
    >
      {/* Header */}
      <Box
        as="header"
        sx={{
          bg: "background",
          borderBottomColor: "cardBorderColor",
          borderBottomWidth: "2px",
          borderBottomStyle: "solid",
          p: 1,
          textAlign: "center",
          position: "relative",
        }}
      >
        <Flex
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px",
          }}
        >
          {/* Left-aligned Menu Button */}
          <MenuButton
            aria-label="Toggle Menu"
            onClick={toggleMenu}
            sx={{
              color: "text",
            }}
          />

          {/* Absolutely centered Title (independent of menu button) */}
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 1,
              // Link + hover styling
              a: { textDecoration: "none" },
              "a:hover h1": { color: "primary" },
            }}
          >
            <GatsbyLink to="/">
              <Text
                as="h1"
                sx={{
                  margin: 0,
                  fontSize: 4,
                  fontWeight: 700,
                  color: "text",
                  letterSpacing: "-0.02em",
                  transition: "color 0.2s ease",
                  display: ["none", "block"],
                }}
              >
                PUBLIC VINYL RADIO
              </Text>
              <Box sx={{ width: "40px", display: ["block", "none"] }}>
                <Box
                  as={HeadsIcon}
                  aria-label="Public Vinyl Radio mark"
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
            </GatsbyLink>
          </Box>
        </Flex>
      </Box>

      {/* Full-Screen Menu */}
      {menuOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bg: "black",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Close
            onClick={toggleMenu}
            sx={{
              position: "absolute",
              top: 3,
              left: 3,
              color: "white",
              bg: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 3,
            }}
          />
          <Flex
            as="nav"
            sx={{
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Text
              as="span"
              sx={{
                color: "white",
                fontSize: [80, 100, 100],
                fontWeight: 600,
                textTransform: "uppercase",
                // style the nested anchor
                a: {
                  color: "inherit",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                },
                "a:hover": { color: "primary" },
              }}
            >
              <GatsbyLink to="/" onClick={() => setMenuOpen(false)}>
                Shows
              </GatsbyLink>
            </Text>
            <Text
              as="span"
              sx={{
                color: "white",
                fontSize: [80, 100, 100],
                fontWeight: 600,
                textTransform: "uppercase",
                a: {
                  color: "inherit",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                },
                "a:hover": { color: "primary" },
              }}
            >
              <GatsbyLink to="/about" onClick={() => setMenuOpen(false)}>
                About
              </GatsbyLink>
            </Text>
            <Text
              as="span"
              sx={{
                color: "white",
                fontSize: [80, 100, 100],
                fontWeight: 600,
                textTransform: "uppercase",
                a: {
                  color: "inherit",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                },
                "a:hover": { color: "primary" },
              }}
            >
              <GatsbyLink to="/join" onClick={() => setMenuOpen(false)}>
                Join
              </GatsbyLink>
            </Text>
          </Flex>
        </Box>
      )}

      {children}

      {/* Footer */}
      <Flex
        as="footer"
        sx={{
          p: 3,
          borderTopColor: "cardBorderColor",
          borderTopWidth: "2px",
          borderTopStyle: "solid",
          marginTop: "100px",
        }}
      >
        <Box>
          <Text
            as="p"
            sx={{
              color: "text",
              fontWeight: 600,
              height: "100%",
              alignContent: "center",
              textTransform: "uppercase",
            }}
          >
            &copy; {new Date().getFullYear()} Public Vinyl Radio
          </Text>
        </Box>

        {/* Social Media Links */}
        <Flex
          sx={{
            justifyContent: "right",
            gap: 3,
            flexGrow: 1,
            height: "100%",
            alignContent: "center",
          }}
        >
          <Link
            href="https://www.youtube.com/@PublicVinylRadio"
            target="_blank"
            sx={{ color: "text", "&:hover": { color: "primary" } }}
          >
            <FaYoutube size={24} />
          </Link>

          <Link
            href="https://www.instagram.com/PublicVinylRadio"
            target="_blank"
            sx={{ color: "text", "&:hover": { color: "primary" } }}
          >
            <FaInstagram size={24} />
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Layout;
