exports.createSchemaCustomization = ({ actions }: { actions: any }) => {
  const { createTypes } = actions;

  createTypes(`
    type Mdx implements Node {
      frontmatter: Frontmatter
    }

    type Track {
      title: String
      artist: String
    }

    type Frontmatter {
      title: String!
      description: String
      episode: Int
      date: Date @dateformat
      tags: [String!]
      iframeSrc: String
      slug: String
      coverImage: File @fileByRelativePath
      tracklist: [Track]
      host: [String]
    }
  `);
};

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
              title
              description
              episode
              date
              tags
              iframeSrc
              slug
              coverImage {
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

  const path = require('path');
  const showTemplate = path.resolve(`src/templates/show-template.tsx`);

  result.data.allMdx.edges.forEach(({ node }: { node: any }) => {
    createPage({
      path: `/shows/${node.frontmatter.slug}`,
      component: showTemplate,
      context: {
        title: node.frontmatter.title,
        description: node.frontmatter.description,
        episode: node.frontmatter.episode,
        date: node.frontmatter.date,
        tags: node.frontmatter.tags,
        iframeSrc: node.frontmatter.iframeSrc,
        content: node.body,
        coverImage:
          node.frontmatter.coverImage?.childImageSharp?.gatsbyImageData || null,
        tracklist: node.frontmatter.tracklist,
        host: node.frontmatter.host,
      },
    });
  });
};
