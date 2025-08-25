import React from 'react';
import Layout from '../components/layout';
import { Text, Container, Box, Heading, Flex, Link } from 'theme-ui';
import { FaYoutube, FaMixcloud, FaInstagram } from 'react-icons/fa';

const AboutPage = () => {
  return (
      <Container
        sx={{
          p: 3,
          maxWidth: ['100%', '800px', '800px', '960px', '1140px'],
          mx: 'auto',
        }}
      >
        <Box sx={{ maxWidth: '800px', mx: 'auto', mt: 4 }}>

          <Text as='p' sx={{ fontSize: 2, lineHeight: '1.6', mb: 4 }}>
            Welcome to <strong>PUBLIC VINYL RADIO</strong>, an internet radio
            station dedicated to the art of vinyl mixtapes. Every set is crafted
            exclusively from records, bringing warmth, depth, and character that
            only vinyl can provide.
          </Text>

          <Heading as='h2' sx={{ fontSize: 4, mt: 4, mb: 3 }}>
            Why Vinyl?
          </Heading>
          <Text as='p' sx={{ fontSize: 2, lineHeight: '1.6', mb: 4 }}>
            Vinyl isn’t just a format—it’s a philosophy. The ritual of
            selecting, cueing, and mixing records fosters a deeper connection to
            the music. There’s an unpredictability, a rawness, and a soul to
            every record that makes each mix a living, breathing experience.
          </Text>

          <Heading as='h2' sx={{ fontSize: 4, mt: 4, mb: 3 }}>
            A Soundtrack for Your Moments
          </Heading>
          <Text as='p' sx={{ fontSize: 2, lineHeight: '1.6', mb: 4 }}>
            Music has the power to shape our moods, enhance our surroundings,
            and transport us to new places. Whether you need
            <strong>
              {' '}
              uplifting energy, deep introspection, or just a sonic companion
              for your day
            </strong>
            , our mixtapes are here to set the tone.
          </Text>

          <Heading as='h2' sx={{ fontSize: 4, mt: 4, mb: 3 }}>
            Stay Connected
          </Heading>
          <Text as='p' sx={{ fontSize: 2, lineHeight: '1.6', mb: 3 }}>
            Follow us for the latest mixes, behind-the-scenes vinyl finds, and
            special live sets. If you love what we do, spread the word, and
            let’s grow this community of music lovers together.
          </Text>

          {/* Social Media Links */}
          <Flex
            sx={{
              justifyContent: 'center',
              gap: 4,
              mt: 3,
            }}
          >
            <Link
              href='https://www.youtube.com/@PublicVinylRadio'
              target='_blank'
              sx={{ color: 'text', '&:hover': { color: 'primary' } }}
            >
              <FaYoutube size={32} />
            </Link>

            <Link
              href='https://www.mixcloud.com/public-vinyl-radio/'
              target='_blank'
              sx={{ color: 'text', '&:hover': { color: 'primary' } }}
            >
              <FaMixcloud size={32} />
            </Link>

            <Link
              href='https://www.instagram.com/PublicVinylRadio'
              target='_blank'
              sx={{ color: 'text', '&:hover': { color: 'primary' } }}
            >
              <FaInstagram size={32} />
            </Link>
          </Flex>
        </Box>
      </Container>
  );
};

export default AboutPage;
