exports.createSchemaCustomization = ({ actions }: { actions: any }) => {
  const { createTypes } = actions;

  createTypes(`
    type Mdx implements Node {
      frontmatter: Frontmatter
    }

    type Track {
      title: String
      artist: String
      year: Int
    }

    type Frontmatter {
      title: String!
      description: String
      episode: Int
      date: Date @dateformat
      tags: [String!]
      iframeSrc: String
      youtubeId: String
      appleMusicUrl: String
      spotifyId: String
      slug: String
      coverImage: File @fileByRelativePath
      tracklist: [Track]
      host: [String]
    }

    type DataYaml implements Node {
      links: [Link!]!
    }

    type Link {
      title: String!
      url: String!
      subtitle: String
      linkImage: File @fileByRelativePath
    }
  `);
};

const path = require('path');

exports.createPages = async ({
  actions,
  graphql,
}: {
  actions: any;
  graphql: any;
}) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      allMdx {
        edges {
          node {
            id
            frontmatter {
              template
              title
              description
              episode
              date
              tags
              iframeSrc
              youtubeId
              appleMusicUrl
              spotifyId
              slug
              coverImage {
                publicURL # ✅ Get direct URL for Open Graph images
                childImageSharp {
                  gatsbyImageData(
                    width: 700
                    layout: CONSTRAINED
                    formats: [AUTO, WEBP]
                  )
                }
              }
              tracklist {
                title
                artist
                year
              }
              host
            }
            body
          }
        }
      }
    }
  `);

  if (result.errors) {
    console.error(result.errors);
    throw new Error('There was a problem with the GraphQL query.');
  }

  const showTemplate = path.resolve(`src/templates/show-template.tsx`);
  const blogTemplate = path.resolve(`src/templates/blog-template.tsx`);

  interface MdxNode {
    id: string;
    frontmatter: {
      template: string;
      title: string;
      description?: string;
      episode?: number;
      date?: string;
      tags?: string[];
      iframeSrc?: string;
      youtubeId?: string;
      appleMusicUrl?: string;
      spotifyId?: string;
      slug: string;
      coverImage?: {
        publicURL?: string;
        childImageSharp?: {
          gatsbyImageData?: any;
        };
      };
      tracklist?: {
        title?: string;
        artist?: string;
        year?: number;
      }[];
      host?: string[];
    };
    body: string;
  }

  (result.data.allMdx.edges as { node: MdxNode }[]).forEach(({ node }) => {
    const { template, slug } = node.frontmatter;

    if (template === 'blog') {
      createPage({
        path: `/blog/${slug}`,
        component: blogTemplate,
        context: {
          title: node.frontmatter.title,
          description: node.frontmatter.description,
          date: node.frontmatter.date,
          tags: node.frontmatter.tags,
          content: node.body,
          // pass additional blog-specific fields if needed
        },
      });
    } else if (template === 'show') {
      createPage({
        path: `/shows/${slug}`,
        component: showTemplate,
        context: {
          title: node.frontmatter.title,
          description: node.frontmatter.description,
          episode: node.frontmatter.episode,
          date: node.frontmatter.date,
          tags: node.frontmatter.tags,
          iframeSrc: node.frontmatter.iframeSrc,
          youtubeId: node.frontmatter.youtubeId,
          appleMusicUrl: node.frontmatter.appleMusicUrl,
          spotifyId: node.frontmatter.spotifyId,
          content: node.body,
          coverImage:
            node.frontmatter.coverImage?.childImageSharp?.gatsbyImageData ||
            null,

          publicURL: node.frontmatter.coverImage?.publicURL || null,
          tracklist: node.frontmatter.tracklist,
          host: node.frontmatter.host,
        },
      });
    }
  });
};
