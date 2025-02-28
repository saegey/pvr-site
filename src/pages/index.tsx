import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import { Badge, Flex, Card, Text, Link, Grid, Container, Box } from 'theme-ui';
import { Link as GatsbyLink } from 'gatsby';

import { PageProps } from 'gatsby';
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image';
import SEO from '../components/seo';

interface Show {
  id: string;
  frontmatter: {
    title: string;
    description: string;
    slug: string;
    date: string;
    tags: string[];
    coverImage?: IGatsbyImageData;
    host: string[];
  };
}

interface DataProps {
  allMdx: {
    nodes: Show[];
  };
}

const MyDynamicImage = ({ coverImage }: { coverImage: IGatsbyImageData }) => {
  const image = getImage(coverImage);

  return (
    <GatsbyImage
      image={image}
      alt='Example Image'
      layout='constrained'
      style={{ borderRadius: '10px' }}
    />
  );
};

const ShowsPage: React.FC<PageProps<DataProps>> = ({ data }) => {
  const shows = [...data.allMdx.nodes].sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  );

  return (
    <Layout>
      <SEO title='Public Vinyl Radio' />
      <Container
        sx={{
          p: 3,
          maxWidth: ['100%', '540px', '720px', '960px', '1140px'],
          mx: 'auto',
        }}
      >
        <Grid
          gap={2}
          columns={[1, 1, 2]}
          sx={{
            gridAutoFlow: 'row', // Ensures left-to-right ordering
          }}
        >
          {shows.map((show) => (
            <Card
              key={show.id}
              sx={{
                maxWidth: 600,
                borderColor: 'text',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: '5px',
              }}
              p={2}
            >
              <Link
                as={GatsbyLink}
                href={`/shows/${show.frontmatter.slug || '#'}`}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                {show.frontmatter.coverImage && (
                  <MyDynamicImage coverImage={show.frontmatter.coverImage} />
                )}
                <Flex
                  sx={{
                    paddingTop: '10px',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <Flex
                    sx={{
                      flex: 1,
                      justifyContent: 'space-between',
                      // alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Box>
                      <Flex sx={{ gap: '5px' }}>
                        {(show.frontmatter.host || []).map((host, index) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            sx={{
                              backgroundColor: 'badgeSecondaryBg',
                              color: 'badgeSecondaryText',
                              borderRadius: '20px',
                              borderStyle: 'solid',
                              borderWidth: '1px',
                              borderColor: 'badgeSecondaryBorder',
                            }}
                          >
                            {host}
                          </Badge>
                        ))}
                      </Flex>
                    </Box>
                    <Text>{show.frontmatter.date || 'Unknown Date'}</Text>
                  </Flex>
                  <Text>{show.frontmatter.title || 'Untitled Show'}</Text>
                  <Text sx={{ fontSize: '13px', wordWrap: 'break-word' }}>
                    {show.frontmatter.description ||
                      'No description available.'}
                  </Text>
                  <Flex sx={{ gap: '5px', flexWrap: 'wrap' }}>
                    {(show.frontmatter.tags || []).map((tag, index) => (
                      <Badge key={index} variant='primary'>
                        #{tag}
                      </Badge>
                    ))}
                  </Flex>
                </Flex>
              </Link>
            </Card>
          ))}
        </Grid>
      </Container>
    </Layout>
  );
};

export default ShowsPage;

// GraphQL Query
export const query = graphql`
  query {
    allMdx(sort: { frontmatter: { date: DESC } }) {
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
