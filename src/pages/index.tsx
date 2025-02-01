import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import {
  Badge,
  Flex,
  Card,
  Image,
  Text,
  Link,
  Grid,
  Container,
} from 'theme-ui';
import { Link as GatsbyLink } from 'gatsby';

import { PageProps } from 'gatsby';
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image';

interface Show {
  id: string;
  frontmatter: {
    title: string;
    description: string;
    slug: string;
    date: string;
    tags: string[];
    coverImage?: IGatsbyImageData;
  };
}

interface DataProps {
  allMdx: {
    nodes: Show[];
  };
}

const MyDynamicImage = ({ coverImage }: { coverImage: IGatsbyImageData }) => {
  const image = getImage(coverImage); // Convert Gatsby Image data

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
  const shows = data.allMdx.nodes; // Fetch the queried nodes

  return (
    <Layout>
      <Container
        sx={{
          p: 3,
          maxWidth: ['100%', '540px', '720px', '960px', '1140px'],
          mx: 'auto',
        }}
      >
        <Grid gap={2} columns={[1, 2, 2]}>
          {shows.map((show) => (
            <Card
              key={show.id}
              sx={{
                maxWidth: 600,
                border: '1px solid black',
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
                {/* <Image
                  src={show.frontmatter.image || 'https://placehold.co/600x400'}
                  sx={{ borderRadius: '5px' }}
                /> */}
                <MyDynamicImage coverImage={show.frontmatter.coverImage} />
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
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Badge variant='badges.primary'>Episode</Badge>
                    <Text>{show.frontmatter.date || 'Unknown Date'}</Text>
                  </Flex>
                  <Text>{show.frontmatter.title || 'Untitled Show'}</Text>
                  <Text sx={{ fontSize: '13px' }}>
                    {show.frontmatter.description ||
                      'No description available.'}
                  </Text>
                  <Flex sx={{ gap: '5px' }}>
                    {(show.frontmatter.tags || []).map((tag, index) => (
                      <Badge key={index} variant='primary'>
                        {tag}
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
    allMdx(filter: {}) {
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
                formats: [AUTO, WEBP, AVIF]
              )
            }
          }
        }
      }
    }
  }
`;
