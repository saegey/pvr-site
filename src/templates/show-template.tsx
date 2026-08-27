import React from 'react'
import { MDXProvider } from '@mdx-js/react'
import { format } from 'date-fns'
import SEO from '../components/seo'
import { graphql, Link, PageProps, HeadProps } from 'gatsby'
import { GatsbyImage, getImage, getSrc } from 'gatsby-plugin-image'
import ImageCarousel from '../components/image-carousel'
import Tracklist from '../components/tracklist'
import { MdxNode } from '../types/content'
import { youTubeMaxResThumb, youTubeHQThumb } from '../utils/youtube'
import { hostByHandle } from '../data/hosts'

export const formatDate = (dateString: string) =>
  format(new Date(dateString), 'MMMM d, yyyy')

type DataProps = {
  mdx: MdxNode & { excerpt?: string }
  site: { siteMetadata: { siteUrl: string; image?: string } }
}

// Shared SEO derivation so the page body and the Head export stay in sync.
const getShowSeo = (data: DataProps) => {
  const fm = data.mdx.frontmatter as any
  const seoDescription = (data.mdx.excerpt as string) || fm?.description || ''
  const siteUrl = data.site.siteMetadata.siteUrl.replace(/\/$/, '')
  const pageUrl = `${siteUrl}/shows/${fm?.slug || ''}`
  const ogFromYouTube = fm?.youtubeId ? youTubeMaxResThumb(fm.youtubeId) : undefined
  const ogFallback = data.site.siteMetadata.image
    ? `${siteUrl}${data.site.siteMetadata.image}`
    : undefined
  const coverUrl = fm?.coverImage?.publicURL
    ? `${siteUrl}${fm.coverImage.publicURL}`
    : undefined
  return {
    title: fm?.title as string,
    description: seoDescription,
    date: fm?.date as string,
    youtubeId: fm?.youtubeId as string | undefined,
    image: ogFromYouTube || coverUrl || ogFallback,
    url: pageUrl,
  }
}

const ShowTemplate: React.FC<PageProps<DataProps>> = ({ data, children }) => {
  const {
    title,
    description,
    date,
    tags,
    youtubeId,
    tracklist,
    host,
    slug,
    coverImage,
    carouselImages,
  } = data.mdx.frontmatter as any

  const coverImageData = coverImage ? getImage(coverImage) : null

  const carouselData =
    carouselImages?.map((img: any) => {
      const mainImageSrc = getSrc(img)
      const thumbnailSrc = img?.childImageSharp?.thumbnail
        ? getSrc(img.childImageSharp.thumbnail)
        : mainImageSrc
      const fullscreenSrc = img?.childImageSharp?.fullscreen
        ? getSrc(img.childImageSharp.fullscreen)
        : img.publicURL
      return {
        original: mainImageSrc || img.publicURL,
        thumbnail: thumbnailSrc || img.publicURL,
        fullscreen: fullscreenSrc,
        originalAlt: title || 'Show image',
        thumbnailAlt: title || 'Show image',
      }
    }) || []

  return (
    <>
      {/* ── Full-bleed cover band ── */}
      {youtubeId ? (
        <div className="w-full border-b border-fg/12">
          <div className="max-w-[960px] mx-auto aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?si=EaheM0eWWNF_J6-x`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      ) : coverImageData ? (
        <div className="w-full border-b border-fg/12 grayscale overflow-hidden" style={{ maxHeight: '560px' }}>
          <GatsbyImage
            image={coverImageData}
            alt={title || 'Show cover'}
            className="w-full"
            imgStyle={{ objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div
          className="w-full border-b border-fg/12"
          style={{
            height: '320px',
            background: 'repeating-linear-gradient(135deg, rgb(var(--pvr-fg) / 0.04), rgb(var(--pvr-fg) / 0.04) 8px, rgb(var(--pvr-fg) / 0.08) 8px, rgb(var(--pvr-fg) / 0.08) 16px)',
          }}
        />
      )}

      {/* ── Content column ── */}
      <div className="max-w-[860px] mx-auto px-4 md:px-12 py-14">
        {/* Back link */}
        <Link
          to="/"
          className="text-xs tracking-[1px] uppercase text-fg/55 hover:text-fg/70 transition-colors mb-10 inline-block"
        >
          ← Back to archive
        </Link>

        {/* Meta + title */}
        <div className="mb-8">
          <p className="text-xs tracking-[2px] uppercase text-fg/55 mb-4">
            {formatDate(date)}
          </p>
          <h1
            className="text-fg leading-tight mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(30px, 4.5vw, 52px)',
              letterSpacing: '-0.5px',
            }}
          >
            {title}
          </h1>
          <p className="text-sm text-fg/55 mb-5">
            with{' '}
            {(host || []).map((h: string, i: number) => {
              const collaborator = hostByHandle(h)
              return (
                <React.Fragment key={h}>
                  {i > 0 && ', '}
                  {collaborator ? (
                    <Link
                      to={`/collaborators/${collaborator.slug}`}
                      className="underline decoration-fg/30 underline-offset-2 hover:decoration-fg hover:text-fg transition-colors"
                    >
                      {h}
                    </Link>
                  ) : (
                    h
                  )}
                </React.Fragment>
              )
            })}
          </p>
          <div className="flex flex-wrap gap-2">
            {(tags || []).map((tag: string) => (
              <span
                key={tag}
                className="text-[11px] tracking-[1px] uppercase px-2 py-1 border border-fg/20 text-fg/55"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        {description && (
          <p
            className="font-text text-base text-fg/75 leading-[1.8] mb-10"
            style={{ maxWidth: '640px' }}
          >
            {description}
          </p>
        )}

        {/* MDX content (audio player etc.) */}
        <div className="mb-10">
          <MDXProvider
            components={{
              p: (props) => <p className="font-text text-fg/80 leading-[1.85]" {...props} />,
              li: (props) => <li className="font-text text-fg/80" {...props} />,
              h2: (props) => (
                <h2 className="font-display text-fg mt-10 mb-4" style={{ fontSize: 'clamp(24px, 4vw, 32px)' }} {...props} />
              ),
              h3: (props) => (
                <h3 className="font-display text-fg mt-8 mb-3" style={{ fontSize: '20px' }} {...props} />
              ),
              ShowCarousel: () =>
                carouselData.length > 0 ? (
                  <div className="my-10">
                    <ImageCarousel images={carouselData} showThumbnails={true} />
                  </div>
                ) : null,
            }}
          >
            {children}
          </MDXProvider>
        </div>

        {/* Tracklist */}
        {tracklist && tracklist.length > 0 && (
          <div className="mt-12">
            <div className="border-t border-fg/12 pt-6 mb-4">
              <span className="text-xs tracking-[2px] uppercase text-fg/55">Tracklist</span>
            </div>
            <Tracklist tracks={tracklist} />
          </div>
        )}

        {/* Photos carousel */}
        {carouselData.length > 0 && (
          <div className="mt-12">
            <div className="border-t border-fg/12 pt-6 mb-4">
              <span className="text-xs tracking-[2px] uppercase text-fg/55">Photos</span>
            </div>
            <div className="grid grid-cols-3 gap-px">
              {carouselData.map((img: any, idx: number) => (
                <div
                  key={idx}
                  className="overflow-hidden grayscale"
                  style={{ aspectRatio: '1/1' }}
                >
                  <img
                    src={img.original}
                    alt={img.originalAlt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ShowTemplate

export const Head = ({ data }: HeadProps<DataProps>) => {
  const { title, description, date, youtubeId, image, url } = getShowSeo(data)
  return (
    <>
      <SEO
        title={`${title} | Public Vinyl Radio`}
        description={description}
        image={image}
        url={url}
        type="article"
      />
      {youtubeId && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: title,
            description,
            uploadDate: date,
            thumbnailUrl: [youTubeHQThumb(youtubeId), youTubeMaxResThumb(youtubeId)],
            embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
            url,
          })}
        </script>
      )}
    </>
  )
}

export const query = graphql`
  query Show($id: String!) {
    site {
      siteMetadata {
        siteUrl
        image
      }
    }
    mdx: mdx(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      frontmatter {
        template
        title
        description
        episode
        date
        tags
        iframeSrc
        youtubeId
        appleMusicUrl
        spotifyId
        slug
        coverImage {
          publicURL
          childImageSharp {
            gatsbyImageData(
              width: 1400
              layout: CONSTRAINED
              formats: [AUTO, WEBP]
            )
          }
        }
        carouselImages {
          publicURL
          childImageSharp {
            gatsbyImageData(
              width: 1200
              quality: 85
              layout: CONSTRAINED
              formats: [AUTO, WEBP]
            )
            thumbnail: gatsbyImageData(
              width: 150
              height: 100
              quality: 80
              layout: FIXED
              formats: [AUTO, WEBP]
            )
            fullscreen: gatsbyImageData(
              width: 2400
              quality: 90
              layout: CONSTRAINED
              formats: [AUTO, WEBP]
            )
          }
        }
        tracklist {
          title
          artist
          year
          album
          discogs_url
          album_thumbnail
          duration_seconds
          apple_music_url
          spotify_url
          soundcloud_url
          youtube_url
        }
        host
      }
    }
  }
`
