import React from 'react'
import { MDXProvider } from '@mdx-js/react'
import { format } from 'date-fns'
import SEO from '../components/seo'
import { graphql, Link, PageProps } from 'gatsby'
import { Helmet } from 'react-helmet'
import { GatsbyImage, getImage, getSrc } from 'gatsby-plugin-image'
import ImageCarousel from '../components/image-carousel'
import StreamingLinks from '../components/streaming-links'
import { MdxNode } from '../types/content'
import { youTubeMaxResThumb, youTubeHQThumb } from '../utils/youtube'

export const formatDate = (dateString: string) =>
  format(new Date(dateString), 'MMMM d, yyyy')

const formatDuration = (seconds?: number) => {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

type DataProps = {
  mdx: MdxNode & { excerpt?: string }
  site: { siteMetadata: { siteUrl: string; image?: string } }
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

  const seoDescription = (data.mdx.excerpt as string) || description || ''
  const siteUrl = data.site.siteMetadata.siteUrl.replace(/\/$/, '')
  const pageUrl = `${siteUrl}/shows/${slug || ''}`
  const ogFromYouTube = youtubeId ? youTubeMaxResThumb(youtubeId) : undefined
  const ogFallback = data.site.siteMetadata.image
    ? `${siteUrl}${data.site.siteMetadata.image}`
    : undefined
  const coverUrl = (data.mdx.frontmatter as any)?.coverImage?.publicURL
    ? `${siteUrl}${(data.mdx.frontmatter as any).coverImage.publicURL}`
    : undefined
  const ogImage = ogFromYouTube || coverUrl || ogFallback

  return (
    <>
      <SEO
        title={`${title} | Public Vinyl Radio`}
        description={seoDescription}
        image={ogImage}
        url={pageUrl}
        type="article"
      />
      {youtubeId && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'VideoObject',
              name: title,
              description: seoDescription,
              uploadDate: date,
              thumbnailUrl: [youTubeHQThumb(youtubeId), youTubeMaxResThumb(youtubeId)],
              embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
              url: pageUrl,
            })}
          </script>
        </Helmet>
      )}

      {/* ── Full-bleed cover band ── */}
      <div className="w-full border-b border-fg/12 overflow-hidden grayscale" style={{ aspectRatio: '21/9' }}>
        {youtubeId ? (
          <img
            src={youTubeMaxResThumb(youtubeId)}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement
              t.onerror = null
              t.src = youTubeHQThumb(youtubeId)
            }}
          />
        ) : coverImageData ? (
          <GatsbyImage
            image={coverImageData}
            alt={title || 'Show cover'}
            className="w-full h-full"
            imgStyle={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                'repeating-linear-gradient(135deg, #141412, #141412 8px, #1a1a17 8px, #1a1a17 16px)',
            }}
          />
        )}
      </div>

      {/* ── Content column ── */}
      <div className="max-w-[860px] mx-auto px-12 py-14">
        {/* Back link */}
        <Link
          to="/"
          className="text-xs tracking-[1px] uppercase text-fg/40 hover:text-fg/70 transition-colors mb-10 inline-block"
        >
          ← Back to archive
        </Link>

        {/* Meta + title */}
        <div className="mb-8">
          <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-4">
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
            with {(host || []).join(', ')}
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
            className="text-sm text-fg/75 leading-[1.8] mb-10"
            style={{ maxWidth: '640px' }}
          >
            {description}
          </p>
        )}

        {/* MDX content (audio player etc.) */}
        <div className="mb-10">
          <MDXProvider
            components={{
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
            {tracklist.map((t: any, idx: number) => (
              <div
                key={`${t.artist}-${t.title}-${idx}`}
                className="flex items-center gap-4 py-4 border-b border-fg/12 hover:bg-fg/[0.02] transition-colors -mx-4 px-4"
              >
                {/* Index */}
                <span className="text-xs text-fg/30 w-6 shrink-0 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Title / artist / album */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-fg leading-snug truncate"
                    style={{ fontFamily: 'var(--font-display)', fontSize: '15px' }}
                  >
                    {t.title}
                  </p>
                  <p className="text-xs text-fg/55 truncate mt-0.5">
                    {t.artist}
                    {t.album && (
                      <span className="text-fg/35">
                        {' — '}{t.album}{t.year ? ` (${t.year})` : ''}
                      </span>
                    )}
                  </p>
                </div>

                {/* Duration */}
                {!!t.duration_seconds && (
                  <span className="text-xs text-fg/35 tabular-nums shrink-0">
                    {formatDuration(t.duration_seconds)}
                  </span>
                )}

                {/* Streaming links */}
                <StreamingLinks
                  discogs_url={t.discogs_url}
                  apple_music_url={t.apple_music_url}
                  spotify_url={t.spotify_url}
                  soundcloud_url={t.soundcloud_url}
                  youtube_url={t.youtube_url}
                  trackingLocation="track_card"
                  trackTitle={t.title}
                  showSlug={slug}
                />
              </div>
            ))}
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
