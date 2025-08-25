import React from 'react';
import { Helmet } from 'react-helmet';
import { useStaticQuery, graphql } from 'gatsby';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, url }) => {
  const { site } = useStaticQuery(graphql`
    query SiteMetadataQuery {
      site {
        siteMetadata {
          title
          description
          siteUrl
          image
          twitterUsername
        }
      }
    }
  `);

  const metaTitle = title || site.siteMetadata.title;
  const metaDescription = description || site.siteMetadata.description;
  const metaImage = `${site.siteMetadata.siteUrl}${
    image || site.siteMetadata.image
  }`;
  const metaUrl = url || site.siteMetadata.siteUrl;

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{metaTitle}</title>
      <meta name='description' content={metaDescription} />

      {/* Open Graph (Facebook, Apple Messages, etc.) */}
      <meta property='og:type' content='website' />
      <meta property='og:title' content={metaTitle} />
      <meta property='og:description' content={metaDescription} />
      <meta property='og:image' content={metaImage} />
      <meta property='og:url' content={metaUrl} />

      {/* Twitter Card */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={metaTitle} />
      <meta name='twitter:description' content={metaDescription} />
      <meta name='twitter:image' content={metaImage} />
      <meta name='twitter:site' content={site.siteMetadata.twitterUsername} />

      {/* Apple Messages Metadata */}
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
    </Helmet>
  );
};

export default SEO;
