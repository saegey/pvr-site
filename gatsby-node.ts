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
  album: String
  discogs_url: String
  album_thumbnail: String
  duration_seconds: Int
  apple_music_url: String
  spotify_url: String
  soundcloud_url: String
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
      carouselImages: [File] @fileByRelativePath
      tracklist: [Track]
      host: [String]
      isActive: Boolean
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

exports.createResolvers = ({ createResolvers }: { createResolvers: any }) => {
  createResolvers({
    Frontmatter: {
      isActive: {
        type: "Boolean",
        resolve(source: any) {
          // Default to true when not set
          return typeof source.isActive === "boolean" ? source.isActive : true;
        },
      },
    },
  });
};

const path = require("path");

exports.createPages = async ({
  actions,
  graphql,
}: {
  actions: any;
  graphql: any;
}) => {
  const { createPage } = actions;

  const result = await graphql(`
    query CreatePagesAllMdxQuery {
      allMdx(sort: { frontmatter: { date: DESC } }) {
        nodes {
          id
          frontmatter {
            slug
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `);

  if (result.errors) {
    console.error(result.errors);
    throw new Error(
      "There was a problem with the GraphQL query.",
      result.errors
    );
  }

  const showTemplate = path.resolve(`src/templates/show-template.tsx`);
  // const blogTemplate = path.resolve(`src/templates/blog-template.tsx`);

  result.data.allMdx.nodes
    // .filter(post => post.internal.contentFilePath.includes(dir))
    .map(
      (post: {
        frontmatter: { slug: string };
        internal: { contentFilePath: string };
        id: string;
      }) => {
        console.log(`Creating page for ${post.frontmatter.slug}`);
        createPage({
          path: `/shows/${post.frontmatter.slug}`,
          component: `${showTemplate}?__contentFilePath=${post.internal.contentFilePath}`,
          context: { id: post.id, slug: post.frontmatter.slug },
        });
      }
    );

  // (result.data.allMdx.nodes as MdxNode[]).forEach((node) => {
  //   const { template, slug } = node.frontmatter;

  //   if (template === "blog") {
  //     createPage({
  //       path: `/blog/${slug}`,
  //       component: blogTemplate,
  //       context: {
  //         title: node.frontmatter.title,
  //         description: node.frontmatter.description,
  //         date: node.frontmatter.date,
  //         tags: node.frontmatter.tags,
  //         content: node.body,
  //         // pass additional blog-specific fields if needed
  //       },
  //     });
  //   } else if (template === "show") {
  //     createPage({
  //       path: `/shows/${slug}`,
  //       component: `${showTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
  //       context: {
  //         id: node.id,
  //         slug: node.frontmatter.slug,
  //       },
  //     });
  //   }
  // });
};
