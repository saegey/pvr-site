import { Box, Link, MenuButton, Flex, Text, Close } from 'theme-ui';
import { ReactNode, useState } from 'react';
import React from 'react';
import { Link as GatsbyLink } from 'gatsby';
import { FaYoutube, FaInstagram } from 'react-icons/fa';

const Layout = ({ children }: { children: ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <Box
      sx={{
        fontFamily: 'body',
        lineHeight: 'body',
        color: 'text',
        bg: 'background',
      }}
    >
      {/* Header */}
      <Box
        as='header'
        sx={{
          bg: 'background',
          borderBottomColor: 'cardBorderColor',
          borderBottomWidth: '2px',
          borderBottomStyle: 'solid',
          p: 1,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Flex
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px',
          }}
        >
          {/* Left-aligned Menu Button */}
          <MenuButton
            aria-label='Toggle Menu'
            onClick={toggleMenu}
            sx={{
              color: 'text',
            }}
          />

          {/* Centered Title */}
          <Link
            as={GatsbyLink}
            href='/'
            sx={{
              textAlign: 'center',
              flex: 1,
              color: 'background',
              textDecoration: 'none',
            }}
          >
            <Text
              as='h1'
              sx={{
                margin: 0,
                fontSize: 4,
                fontWeight: 700,
                color: 'text',
                letterSpacing: '-0.02em',
              }}
            >
              PUBLIC VINYL RADIO
            </Text>
          </Link>
        </Flex>
      </Box>

      {/* Full-Screen Menu */}
      {menuOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bg: 'black',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Close
            onClick={toggleMenu}
            sx={{
              position: 'absolute',
              top: 3,
              left: 3,
              color: 'white',
              bg: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 3,
            }}
          />
          <Flex
            as='nav'
            sx={{
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Link
              as={GatsbyLink}
              href='/'
              sx={{
                color: 'white',
                fontSize: [80, 100, 100],
                fontWeight: 600,
                textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              Shows
            </Link>
            <Link
              as={GatsbyLink}
              href='/about'
              sx={{
                color: 'white',
                fontSize: [80, 100, 100],
                fontWeight: 600,
                textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              About
            </Link>
            <Link
              as={GatsbyLink}
              href='/join'
              sx={{
                color: 'white',
                fontSize: [80, 100, 100],
                fontWeight: 600,
                textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              Join
            </Link>
          </Flex>
        </Box>
      )}

      {children}

      {/* Footer */}
      <Flex
        as='footer'
        sx={{
          p: 3,
          borderTopColor: 'cardBorderColor',
          borderTopWidth: '2px',
          borderTopStyle: 'solid',
          marginTop: '100px',
        }}
      >
        <Box>
          <Text
            as='p'
            sx={{
              color: 'text',
              fontWeight: 600,
              // mb: 2,
              height: '100%',
              alignContent: 'center',
              textTransform: 'uppercase',
              // backgroundColor: 'red',
            }}
          >
            &copy; {new Date().getFullYear()} Public Vinyl Radio1
          </Text>
        </Box>

        {/* Social Media Links */}
        <Flex
          sx={{
            justifyContent: 'right',
            gap: 3,
            flexGrow: 1,
            height: '100%',
            alignContent: 'center',
          }}
        >
          <Link
            href='https://www.youtube.com/@PublicVinylRadio'
            target='_blank'
            sx={{ color: 'text', '&:hover': { color: 'primary' } }}
          >
            <FaYoutube size={24} />
          </Link>

          <Link
            href='https://www.instagram.com/PublicVinylRadio'
            target='_blank'
            sx={{ color: 'text', '&:hover': { color: 'primary' } }}
          >
            <FaInstagram size={24} />
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Layout;
