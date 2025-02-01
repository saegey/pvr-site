import React from 'react';

import Layout from '../components/layout';
import { Text, Container } from 'theme-ui';

const AboutPage = () => {
  return (
    <Layout>
      <Container
        sx={{
          p: 3,
          maxWidth: ['100%', '540px', '720px', '960px', '1140px'],
          mx: 'auto',
        }}
      >
        <Text as='h1' sx={{ fontSize: 5, mb: 3 }}>
          About
        </Text>
        <Text as='p' sx={{ fontSize: 3, mb: 3 }}>
          This is a simple Gatsby site that uses Theme UI and MDX to create a
          podcast website.
        </Text>
      </Container>
    </Layout>
  );
};

export default AboutPage;
