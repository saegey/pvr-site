// src/gatsby-plugin-theme-ui/index.js
import { base } from '@theme-ui/presets';

const theme = {
  ...base,
  config: {
    useColorSchemeMediaQuery: 'system', // Automatically respects system preferences
  },
  colors: {
    ...base.colors,
    primary: 'black',
    secondary: '#30c',
    badgeSecondaryBg: 'black',
    badgeSecondaryText: 'white',
    badgeSecondaryBorder: 'black',
    primaryText: 'white',

    modes: {
      dark: {
        text: 'white',
        background: 'black',
        badgeSecondaryBg: 'black',
        badgeSecondaryText: 'white',
        badgeSecondaryBorder: 'white',
        primary: 'white',
        primaryText: 'black',
      },
    },
  },
  fonts: {
    body: '"SF Mono", "SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace',
    heading:
      '"SF Mono", "SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace',
    monospace: '"SF Mono", monospace',
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
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
    },
    h1: {
      fontFamily: 'heading',
      fontWeight: 'heading',
      lineHeight: 'heading',
      fontSize: 5,
    },
    h2: {
      fontFamily: 'heading',
      fontWeight: 'heading',
      lineHeight: 'heading',
      fontSize: 4,
    },
    p: {
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
      fontSize: 2,
    },
  },
  badges: {
    primary: {
      bg: 'white',
      color: 'black',
      borderRadius: '15px',
      px: 2,
      py: 1,
      fontSize: 1,
      fontWeight: 'bold',
      border: '1px solid black',
    },
    secondary: {
      bg: 'secondary',
      color: 'background',
      borderRadius: '4px',
      px: 2,
      py: 1,
      fontSize: 1,
      fontWeight: 'bold',
    },
    outline: {
      bg: 'transparent',
      color: 'primary',
      border: '1px solid',
      borderColor: 'primary',
      borderRadius: '4px',
      px: 2,
      py: 1,
      fontSize: 1,
    },
  },
};

export default theme;
