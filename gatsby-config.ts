import type { GatsbyConfig } from 'gatsby';

const config: GatsbyConfig = {
  siteMetadata: {
    title: 'Public Vinyl Radio',
    description:
      'A vinyl-focused internet radio station with curated mixtapes.',
    siteUrl: 'https://publicvinylradio.com', // Update with your domain
    image: '/default-social-image.jpg', // Default OG image (1200x630 recommended)
    twitterUsername: '@your_twitter_handle', // Your Twitter handle
  },
  graphqlTypegen: true,
  plugins: [
    {
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: ['G-J46E6ZPHFF'], // Replace with your GA Measurement ID
        pluginConfig: {
          head: true, // Places the tracking script in <head>
        },
      },
    },
    'gatsby-plugin-theme-ui',
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-netlify`,
      options: {
        headers: {
          '/*': ['Cache-Control: public, max-age=31536000, immutable'],
        },
      },
    },
    'gatsby-plugin-sitemap',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        icon: 'src/images/icon.png',
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`, // Name of the source, useful for GraphQL queries
        path: `${__dirname}/src/content`, // Adjust the path to your MDX content directory
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [], // ✅ Required for proper rendering
        mdxOptions: {
          useDynamicImport: true, // ✅ Allows dynamic components like ResponsiveYouTube
          rehypePlugins: [], // ✅ Avoids unwanted transformations
        },
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Public Vinyl Radio`,
        short_name: `PVR`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#000000`,
        display: `standalone`,
        icon: `src/images/favicon.png`, // Path to your updated favicon
      },
    },
    // {
    // 	resolve: `gatsby-omni-font-loader`,
    // 	options: {
    // 		enableListener: true,
    // 		preconnect: [
    // 			`https://fonts.googleapis.com`,
    // 			`https://fonts.gstatic.com`,
    // 		],
    // 		web: [
    // 			{
    // 				name: `Open Sans`,
    // 				file: `https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap`,
    // 			},
    // 		],
    // 	},
    // },
  ],
};

export default config;
