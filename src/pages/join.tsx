import React from 'react';

import Layout from '../components/layout';
import { Text, Container } from 'theme-ui';

const JoinPage = () => {
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
          Join
        </Text>
        <Text as='p' sx={{ fontSize: 3, mb: 3 }}>
          Join us in the chat room!
        </Text>
      </Container>
    </Layout>
  );
};

export default JoinPage;
