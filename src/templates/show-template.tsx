import React from 'react'
import { MDXProvider } from '@mdx-js/react'
import { format } from 'date-fns'
import SEO from '../components/seo'
import { graphql, Link, PageProps, HeadProps } from 'gatsby'
import { GatsbyImage, getImage, getSrc } from 'gatsby-plugin-image'
import ImageCarousel from '../components/image-carousel'
import TracklistRow from '../components/tracklist-row'
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
  const [isTracklistOpen, setIsTracklistOpen] = React.useState(false)
  const scrollPosition = React.useRef(0)
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

  // iOS Safari lets the document scroll behind a fixed overlay unless the
  // document itself is frozen. Keeping its current offset lets us restore the
  // page exactly where the listener opened the tracklist when the modal closes.
  React.useEffect(() => {
    if (!isTracklistOpen) return

    const { body, documentElement } = document
    scrollPosition.current = window.scrollY
    const previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    }
    const previousHtmlOverflow = documentElement.style.overflow

    body.style.position = 'fixed'
    body.style.top = `-${scrollPosition.current}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    documentElement.style.overflow = 'hidden'

    return () => {
      Object.assign(body.style, previousBodyStyles)
      documentElement.style.overflow = previousHtmlOverflow
      window.scrollTo(0, scrollPosition.current)
    }
  }, [isTracklistOpen])

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
            background: 'repeating-linear-gradient(135deg, #141412, #141412 8px, #1a1a17 8px, #1a1a17 16px)',
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
            {tracklist.slice(0, 10).map((track: any, index: number) => (
              <TracklistRow key={`${track.artist}-${track.title}-${index}`} track={track} index={index} />
            ))}
            {tracklist.length > 10 && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsTracklistOpen(true)}
                  className="text-xs tracking-[1.5px] uppercase border border-fg px-4 py-3 hover:bg-fg hover:text-bg transition-colors"
                >
                  View all {tracklist.length} tracks
                </button>
              </div>
            )}
          </div>
        )}

        {isTracklistOpen && tracklist && (
          <div
            className="fixed inset-0 z-50 bg-bg flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Full tracklist"
          >
            <div className="shrink-0 bg-bg border-b border-fg/12">
              <div className="max-w-3xl mx-auto px-8 py-5 sm:px-12 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[2px] uppercase text-fg/55">Tracklist</p>
                  <p className="mt-1 text-xs text-fg/55">{tracklist.length} tracks</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTracklistOpen(false)}
                  className="text-xs tracking-[1.5px] uppercase border border-fg px-4 py-3 hover:bg-fg hover:text-bg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div
              className="flex-1 min-h-0 overflow-y-scroll"
              style={{
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
              }}
            >
              <div className="max-w-3xl mx-auto px-8 pb-8 sm:px-12 sm:pb-12">
              {tracklist.map((track: any, index: number) => (
                <TracklistRow key={`${track.artist}-${track.title}-${index}`} track={track} index={index} />
              ))}
              </div>
            </div>
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
