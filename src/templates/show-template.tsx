import React, { useState, useEffect } from 'react';
import { Box, Flex, Grid, Badge, Text, Container, Button } from 'theme-ui';
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
  const image = getImage(coverImage);
  if (!image) return null;

  return (
    <GatsbyImage
      image={image}
      alt='Cover Image'
      style={{ borderRadius: '10px' }}
    />
  );
};

import { useColorMode } from 'theme-ui';

const BottomDrawer = ({
  isOpen,
  onClose,
  iframeSrc,
}: {
  isOpen: boolean;
  onClose: () => void;
  iframeSrc: string;
}) => {
  const [colorMode] = useColorMode();
  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        // height: '200px',
        bg: 'background',
        // boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        transition: 'transform 0.3s ease-in-out',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Button
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          bg: 'transparent',
          color: 'text',
          fontSize: 3,
          cursor: 'pointer',
        }}
      >
        ✕
      </Button>
      <iframe
        width='100%'
        height='60px'
        src={`${iframeSrc}&light=${colorMode === 'dark' ? '0' : '1'}`}
        frameBorder='0'
      ></iframe>
    </Box>
  );
};

interface PageContext {
  title: string;
  description: string;
  episode: number;
  date: string;
  tags: string[];
  iframeSrc: string;
  content: string;
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const doCompile = async () => {
      try {
        const compiled = await compile(content, {
          outputFormat: 'function-body',
        });

        const result = await run(compiled, runtime);
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
      <Container sx={{ p: 3, mx: 'auto' }}>
        <Grid gap='10px' columns={[1, 2]}>
          <Box>
            <MyDynamicImage coverImage={coverImage} />
          </Box>
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

            {/* Play Mix Button */}
            <Box sx={{ paddingTop: '20px' }}>
              <Button
                onClick={() => setIsDrawerOpen(true)}
                sx={{
                  // width: '200%',
                  bg: 'primary',
                  color: 'background',
                  padding: '10px',
                  borderRadius: '20px',
                  fontFamily: 'body',
                  paddingX: '20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background 0.3s',
                  '&:hover': { bg: 'secondary' },
                }}
              >
                Listen to Mix
              </Button>
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
                  <Box key={index}>
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

      {/* Bottom Drawer */}
      <BottomDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        iframeSrc={iframeSrc}
      />
    </Layout>
  );
};

export default ShowTemplate;
