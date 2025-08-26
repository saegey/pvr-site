import React from "react";

interface BlogData {
  allMdx: {
    nodes: {
      id: string;
      frontmatter: {
        title: string;
        description: string;
        slug: string;
        date: string;
        // tags: string[];
        // coverImage: {
        //   childImageSharp: {
        //     gatsbyImageData: any;
        //   };
        // };
        // host: string;
      };
    }[];
  };
}
import { Text, Container, Box, Heading, Flex, Link } from "theme-ui";
import { graphql } from "gatsby";

const BlogPage = ({ data }: { data: BlogData }) => {
  const shows = [...data.allMdx.nodes].sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  );
  console.log(shows);

  return (
    <Container
      sx={{
        p: 3,
        maxWidth: ["100%", "540px", "720px", "960px", "1140px"],
        mx: "auto",
      }}
    >
      <Box sx={{ maxWidth: "800px", mx: "auto", px: 4, py: 5 }}>
        <Heading as="h1" sx={{ fontSize: 5, mb: 3, lineHeight: 5 }}>
          Behind the Music
        </Heading>
        {shows.map((node) => (
          <Box key={node.id} sx={{ mb: 4 }}>
            <Heading as="h2" sx={{ fontSize: 3, mb: 2 }}>
              {node.frontmatter.title}
            </Heading>
            <Text sx={{ color: "text", fontSize: 1, mb: 2 }}>
              {node.frontmatter.date}
            </Text>
            <Text sx={{ mb: 2 }}>{node.frontmatter.description}</Text>
            <Flex>
              <Link href={`/blog/${node.frontmatter.slug}`}>Read More</Link>
            </Flex>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default BlogPage;

// GraphQL Query
export const query = graphql`
  query BlogPageQuery {
    allMdx(
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { template: { eq: "blog" } } }
    ) {
      nodes {
        id
        frontmatter {
          title
          description
          slug
          date
          tags
          coverImage {
            childImageSharp {
              gatsbyImageData(
                width: 600
                layout: CONSTRAINED
                formats: [AUTO, WEBP]
              )
            }
          }
          host
        }
      }
    }
  }
`;
