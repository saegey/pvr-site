import React, { useState, useEffect } from 'react';
import { Box, Flex, Grid, Badge, Text, Container, AspectImage } from 'theme-ui';
import Layout from '../components/layout';
import { MDXProvider } from '@mdx-js/react';
import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
// import { StaticImage } from 'gatsby-plugin-image';

import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image';

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

interface PageContext {
  title: string;
  description: string;
  episode: number;
  date: string;
  tags: string[];
  iframeSrc: string;
  content: string; // Raw MDX content
  coverImage: IGatsbyImageData;
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
            {/* <AspectImage
              as={StaticImage}
              ratio={3 / 3}
              src={coverImage}
              sx={{ borderRadius: '10px' }}
            /> */}
            <MyDynamicImage coverImage={coverImage} />
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
            <Box sx={{ paddingTop: '20px' }}>
              <iframe
                width='100%'
                height='120'
                src={iframeSrc}
                frameBorder='0'
              ></iframe>
            </Box>
            <MDXProvider>
              {MDXComponent ? (
                <MDXComponent />
              ) : (
                <Text>Loading content...</Text>
              )}
            </MDXProvider>
          </Flex>
        </Grid>
      </Container>
    </Layout>
  );
};

export default ShowTemplate;
