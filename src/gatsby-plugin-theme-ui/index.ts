// src/gatsby-plugin-theme-ui/index.js
import { base } from "@theme-ui/presets";

const theme = {
  ...base,
  config: {
    useColorSchemeMediaQuery: "system", // Automatically respects system preferences
  },
  colors: {
    ...base.colors,
    primary: "#232323ff",
    secondary: "#30c",
    muted: "#575757ff",
    badgePrimaryBg: "rgba(251, 251, 251, 1)",
    badgePrimaryText: "rgba(0, 0, 0, 1)",
    badgeSecondaryBg: "black",
    badgeSecondaryText: "white",
    badgeSecondaryBorder: "black",
    primaryText: "white",
    cardBorderColor: "#e1e1e1",
    cardBackgroundColor: "#e8e8e8ff",
    showCardBackground: "#f5f5f5",

    modes: {
      dark: {
        text: "white",
        background: "black",
        badgePrimaryBg: "#000000",
        badgePrimaryText: "rgba(193, 191, 196, 1)",
        badgeSecondaryBg: "black",
        badgeSecondaryText: "white",
        badgeSecondaryBorder: "white",
        primary: "white",
        primaryText: "black",
        cardBorderColor: "#212121ff",
        cardBackgroundColor: "#3e3e3eff",
        showCardBackground: "#3b3b3b",
      },
    },
  },
  // body: '"SF Mono", "SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace',
  // body: '"Helvetica Neue", sans-serif',
  fonts: {
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace:
      '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.25,
  },
  styles: {
    root: {
      fontFamily: "body",
      fontWeight: "body",
      // lineHeight: 'body',
    },
    h1: {
      fontFamily: "heading",
      fontWeight: "heading",
      lineHeight: "heading",
      fontSize: 5,
    },
    h2: {
      fontFamily: "heading",
      fontWeight: "heading",
      lineHeight: "heading",
      fontSize: 4,
    },
    p: {
      fontFamily: "body",
      fontWeight: "body",
      lineHeight: "body",
      fontSize: 2,
    },
    span: {
      lineHeight: "unset",
    },
  },
  badges: {
    primary: {
      bg: "badgePrimaryBg",
      color: "badgePrimaryText",
      borderRadius: "15px",
      px: 2,
      py: 1,
      fontSize: 1,
      fontWeight: "bold",
      border: "1px solid black",
    },
    secondary: {
      bg: "secondary",
      color: "background",
      borderRadius: "4px",
      px: 2,
      py: 1,
      fontSize: 1,
      fontWeight: "bold",
    },
    outline: {
      bg: "transparent",
      color: "primary",
      border: "1px solid",
      borderColor: "primary",
      borderRadius: "4px",
      px: 2,
      py: 1,
      fontSize: 1,
    },
  },
  variants: {
    linkCard: {
      display: "flex",
      textDecoration: "none",
      alignItems: "center",
      p: 3,
      mb: 3,
      border: "2px solid",
      borderColor: "primary",
      borderRadius: 2,
      transition: "box-shadow 0.2s ease",
      "&:hover": {
        boxShadow: "card",
      },
    },
  },
};

export default theme;
