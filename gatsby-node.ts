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
    }
  `);
};

exports.createPages = async ({ actions, graphql }) => {
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

  result.data.allMdx.edges.forEach(
    ({
      node,
    }: {
      node: {
        id: string;
        frontmatter: {
          title: string;
          description: string;
          episode: number;
          date: string;
          tags: string[];
          iframeSrc: string;
          slug: string;
        };
        body: string;
      };
    }) => {
      const { frontmatter } = node;

      createPage({
        path: `/shows/${frontmatter.slug}`, // Use frontmatter.slug for the path
        component: showTemplate, // Ensure this resolves correctly
        context: {
          title: frontmatter.title,
          description: frontmatter.description,
          episode: frontmatter.episode,
          date: frontmatter.date,
          tags: frontmatter.tags,
          iframeSrc: frontmatter.iframeSrc,
          content: node.body,
        },
      });
    }
  );
};
