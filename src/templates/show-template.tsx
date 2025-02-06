import React, { useState, useEffect } from 'react';
import { Box, Flex, Grid, Badge, Text, Container } from 'theme-ui';
import Layout from '../components/layout';
import { MDXProvider } from '@mdx-js/react';
import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image';
import { format } from 'date-fns';
import SEO from '../components/seo';

const formatDate = (dateString: string) =>
  format(new Date(dateString), 'MM.dd.yyyy');

const MyDynamicImage = ({ coverImage }: { coverImage: IGatsbyImageData }) => {
  const image = getImage(coverImage); // Convert Gatsby Image data
  if (!image) {
    return null;
  }

  return (
    <GatsbyImage
      image={image}
      alt='Example Image'
      style={{ borderRadius: '10px' }}
    />
  );
};

import { useColorMode } from 'theme-ui';

const ResponsiveIframe = ({ iframeSrc }: { iframeSrc: string }) => {
  const [colorMode] = useColorMode(); // Get the current color mode

  return (
    <iframe
      width='100%'
      height='120'
      src={`${iframeSrc}&light=${colorMode === 'dark' ? '0' : '1'}`} // Toggle light mode
      frameBorder='0'
    ></iframe>
  );
};

interface PageContext {
  title: string;
  description: string;
  episode: number;
  date: string;
  tags: string[];
  iframeSrc: string;
  content: string; // Raw MDX content
  coverImage: IGatsbyImageData;
  tracklist: { title: string; artist: string }[];
  host: string[];
}

const ShowTemplate = ({ pageContext }: { pageContext: PageContext }) => {
  const {
    title,
    description,
    episode,
    date,
    tags,
    iframeSrc,
    content,
    coverImage,
    tracklist,
    host,
  } = pageContext;

  const [MDXComponent, setMDXComponent] = useState<React.ComponentType | null>(
    null
  );

  useEffect(() => {
    const doCompile = async () => {
      try {
        // 1. Compile to JS
        const compiled = await compile(content, {
          outputFormat: 'function-body',
        });

        // 2. Run the compiled code to get the actual component
        const result = await run(compiled, runtime);

        // result.default is your React component
        setMDXComponent(() => result.default);
      } catch (error) {
        console.error(error);
      }
    };

    doCompile();
  }, [content]);

  return (
    <Layout>
      <SEO title={`${title} | Public Vinyl Radio`} />
      <Container
        sx={{
          p: 3,
          mx: 'auto',
        }}
      >
        {/* Main Content Grid */}
        <Grid gap='10px' columns={[1, 2]}>
          <Box>
            <MyDynamicImage coverImage={coverImage} />
          </Box>
          {/* Metadata and Content */}
          <Flex
            sx={{
              flexDirection: 'column',
              gap: '10px',
              height: '100%',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Flex sx={{ flexDirection: 'column', gap: '10px' }}>
                <Text as='h3'>{formatDate(date) || 'Unknown Date'}</Text>
                <Box sx={{ marginTop: ['0px', '0px', '80px'] }}>
                  <Flex sx={{ gap: '5px' }}>
                    {(host || []).map((h: string, index: number) => (
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
                        {h}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
                <Text as='h2'>{title}</Text>
                <Text as='h4'>{description}</Text>
                <Flex sx={{ gap: '5px', marginTop: '10px' }}>
                  {tags.map((tag, index) => (
                    <Badge key={index} variant='primary'>
                      #{tag}
                    </Badge>
                  ))}
                </Flex>
              </Flex>
            </Box>

            {/* Pushes the iframe to the bottom */}
            <Box sx={{ paddingTop: '20px' }}>
              <ResponsiveIframe iframeSrc={iframeSrc} />
            </Box>
          </Flex>
        </Grid>
        <Container
          sx={{ maxWidth: '800px', mx: 'auto', p: 3, marginTop: '20px' }}
        >
          {tracklist && (
            <Box>
              <Text as='h3'>Tracklist</Text>
              <Flex sx={{ flexDirection: 'column', gap: '5px' }}>
                {tracklist.map(({ artist, title }, index) => (
                  <Box>
                    <Text>
                      {artist} - {title}
                    </Text>
                  </Box>
                ))}
              </Flex>
            </Box>
          )}
          <MDXProvider>
            {MDXComponent ? <MDXComponent /> : <Text>Loading content...</Text>}
          </MDXProvider>
        </Container>
      </Container>
    </Layout>
  );
};

export default ShowTemplate;
