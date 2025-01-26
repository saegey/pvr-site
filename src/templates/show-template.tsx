import React from 'react';
import { Box, Flex, Grid, Badge, Text, Container, AspectImage } from 'theme-ui';
import Layout from '../components/layout';

interface PageContext {
  title: string;
  description: string;
  episode: number;
  date: string;
  tags: string[];
  iframeSrc: string;
  content: string;
}

const ShowTemplate = ({ pageContext }: { pageContext: PageContext }) => {
  const { title, description, episode, date, tags, iframeSrc, content } =
    pageContext;

  return (
    <Layout>
      <Container
        sx={{
          p: 3,
          mx: 'auto',
        }}
      >
        {/* Main Content Grid */}
        <Grid gap='10px' columns={[1, 2]}>
          {/* Image */}
          <Box>
            <AspectImage
              ratio={3 / 3}
              src='https://placehold.co/800x800'
              sx={{ borderRadius: '10px' }}
            />
          </Box>
          {/* Metadata and Content */}
          <Flex sx={{ flexDirection: 'column', gap: '10px' }}>
            <Text as='h3'>{date}</Text>
            <Box>
              <Badge>Episode {episode}</Badge>
            </Box>
            <Text as='h2'>{title}</Text>
            <Text as='h4'>{description}</Text>
            <Flex sx={{ gap: '5px' }}>
              {tags.map((tag, index) => (
                <Badge key={index} variant='primary'>
                  {tag}
                </Badge>
              ))}
            </Flex>
            <Text as='p'>{content}</Text>
            <iframe
              width='100%'
              height='120'
              src={iframeSrc}
              frameBorder='0'
            ></iframe>
          </Flex>
        </Grid>
      </Container>
    </Layout>
  );
};

export default ShowTemplate;
