import type { GatsbyConfig } from 'gatsby';

const config: GatsbyConfig = {
  siteMetadata: {
    title: 'Public Vinyl Radio',
    description:
      'A vinyl-focused internet radio station with curated mixtapes.',
    siteUrl: 'https://publicvinylradio.com',
    image: '/default-social-image.jpg',
    twitterUsername: '@your_twitter_handle',
  },
  graphqlTypegen: true,
  plugins: [
    // analytics + fonts
    {
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: ['G-J46E6ZPHFF'],
        pluginConfig: { head: true },
      },
    },
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [`Work Sans\:300,400,500,600,700`],
        display: 'swap',
      },
    },

    // theming + images
    `gatsby-plugin-theme-ui`,
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,

    // netlify headers + sitemap
    {
      resolve: `gatsby-plugin-netlify`,
      options: {
        headers: { '/*': ['Cache-Control: public, max-age=31536000, immutable'] },
      },
    },
    `gatsby-plugin-sitemap`,

    // icons + manifest
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
        icon: `src/images/favicon.png`,
      },
    },

    // content sources
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/src/content`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `links`,
        path: `${__dirname}/src/data/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: `${__dirname}/src/blog`,
      },
    },

    // → transformer-yaml must come after the filesystem that points at your .yml files
    `gatsby-transformer-yaml`,

    // MDX for your posts
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [],
        mdxOptions: {
          useDynamicImport: true,
          rehypePlugins: [],
        },
      },
    },

     {
      resolve: `gatsby-plugin-react-svg`,
      options: {
        rule: {
          // <-- adjust this regex to match wherever you keep your SVGs
          include: /src\/icons/,
        },
      },
    },
  ],
};

export default config;