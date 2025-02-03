import React, { useState } from 'react';

import Layout from '../components/layout';
import { Text, Container, Input, Button, Flex, Box } from 'theme-ui';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log('email', email);
    const response = await fetch(
      'https://api.buttondown.email/v1/subscribers',
      {
        method: 'POST',
        headers: {
          Authorization: `Token 95c23da4-3415-4cde-a755-36a02cd53d4d`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_address: email }),
      }
    );

    const data = await response.json();
    setMessage(data.detail || 'Successfully subscribed!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex sx={{ flexDirection: 'column', gap: '20px' }}>
        <Box>
          <Input
            type='email'
            placeholder='Your email'
            value={email}
            onChange={(e) => {
              console.log(e.target.value);
              setEmail(e.target.value);
            }}
            required
          />
        </Box>
        <Box>
          <Button type='submit'>Subscribe</Button>
        </Box>
        {message && <p>{message}</p>}
      </Flex>
    </form>
  );
};

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
          Subscribe to our newsletter for the latest updates.
        </Text>
        <NewsletterForm />
      </Container>
    </Layout>
  );
};

export default JoinPage;
