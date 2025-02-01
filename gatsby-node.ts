exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type Mdx implements Node {
      frontmatter: Frontmatter
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
                    width: 800
                    layout: CONSTRAINED
                    formats: [AUTO, WEBP]
                  )
                }
              }
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

  result.data.allMdx.edges.forEach(({ node }) => {
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
      },
    });
  });
};
