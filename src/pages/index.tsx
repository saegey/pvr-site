import React, { useState } from 'react'
import { graphql, Link, PageProps } from 'gatsby'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import { Helmet } from 'react-helmet'
import SEO from '../components/seo'
import { formatDate } from '../utils/date'
import { youTubeHQThumb, youTubeMaxResThumb } from '../utils/youtube'

const PAGE_SIZE = 6

interface Show {
  id: string
  frontmatter: {
    title: string
    description: string
    slug: string
    date: string
    tags: string[]
    coverImage?: {
      childImageSharp?: { gatsbyImageData?: IGatsbyImageData }
    }
    host: string[]
    youtubeId: string
    isActive?: boolean
  }
}

interface DataProps {
  allMdx: { nodes: Show[] }
  site: {
    siteMetadata: {
      title: string
      description: string
      siteUrl: string
      image?: string
    }
  }
}

const ShowsPage: React.FC<PageProps<DataProps>> = ({ data }) => {
  const [visible, setVisible] = useState(PAGE_SIZE)

  const shows = [...data.allMdx.nodes]
    .filter((s) => s.frontmatter.isActive !== false)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    )

  const visibleShows = shows.slice(0, visible)
  const hasMore = visible < shows.length

  const { siteMetadata } = data.site

  return (
    <>
      <SEO title="Public Vinyl Radio" url={siteMetadata.siteUrl} />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: siteMetadata.siteUrl,
            name: siteMetadata.title,
            description: siteMetadata.description,
          })}
        </script>
      </Helmet>

      {/* ── Hero band ── */}
      <section className="relative min-h-[520px] flex flex-col justify-end overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{
            backgroundImage: 'url(/images/hero-bg.png)',
            opacity: 0.2,
          }}
        />
        {/* Grain overlay */}
        <div
          className="absolute inset-0 grain-overlay pointer-events-none"
          style={{
            backgroundImage: 'url(/images/grain.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
            mixBlendMode: 'overlay',
            opacity: 0.06,
          }}
        />
        {/* Hero text */}
        <div className="relative z-10 max-w-[1320px] w-full mx-auto px-12 pb-24 pt-40">
          <p className="hero-fadeup-1 text-xs tracking-[2px] uppercase text-fg/55 mb-6">
            Seattle, WA — Est. 2025
          </p>
          <h1
            className="hero-fadeup-2 text-fg leading-none tracking-tight mb-10"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 6vw, 88px)',
              letterSpacing: '-0.5px',
            }}
          >
            The future<br />is analog.
          </h1>
          <div className="hero-fadeup-3 border-t border-fg/12 pt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <p className="text-sm text-fg/65 leading-relaxed">
              A Seattle collective built around the art and culture of vinyl. Live and intimate —
              custom setups, curated sounds, original art. Always evolving.
            </p>
            <p className="text-sm text-fg/65 leading-relaxed">
              We collect, we collaborate, we share.{' '}
              <Link to="/events" className="text-fg underline underline-offset-2 hover:text-fg/70 transition-colors">
                See events →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Show archive ── */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-12 py-16">
        {/* Archive header */}
        <div className="flex items-baseline justify-between border-t border-b border-fg/12 py-4 mb-0">
          <span className="text-xs tracking-[2px] uppercase text-fg/55">Recent Shows</span>
          <span className="text-xs tracking-[1px] text-fg/40">
            {Math.min(visible, shows.length)} of {shows.length}
          </span>
        </div>

        {/* Show rows */}
        <div>
          {visibleShows.map((show, i) => {
            const coverImageData = show.frontmatter.coverImage
              ? getImage(show.frontmatter.coverImage as any)
              : null

            return (
              <Link
                key={show.id}
                to={`/shows/${show.frontmatter.slug || '#'}`}
                className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 py-6 border-b border-fg/12 hover:bg-fg/[0.03] transition-colors duration-150 -mx-4 px-4"
              >
                {/* Thumbnail — full width on mobile, fixed 160px on desktop */}
                <div className="w-full md:w-40 md:shrink-0 overflow-hidden bg-fg/5 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                  {show.frontmatter.youtubeId ? (
                    <img
                      src={youTubeMaxResThumb(show.frontmatter.youtubeId)}
                      alt={show.frontmatter.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        const t = e.currentTarget as HTMLImageElement
                        t.onerror = null
                        t.src = youTubeHQThumb(show.frontmatter.youtubeId)
                      }}
                    />
                  ) : coverImageData ? (
                    <GatsbyImage
                      image={coverImageData}
                      alt={show.frontmatter.title}
                      className="w-full h-full"
                      imgStyle={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background:
                          'repeating-linear-gradient(135deg, #141412, #141412 4px, #1a1a17 4px, #1a1a17 8px)',
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-xs text-fg/30 tabular-nums hidden md:inline">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-xs tracking-[2px] uppercase text-fg/40">
                      {formatDate(show.frontmatter.date)}
                    </p>
                  </div>
                  <h2
                    className="text-fg mb-1 leading-snug"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(20px, 4vw, 26px)',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {show.frontmatter.title || 'Untitled Show'}
                  </h2>
                  <p className="text-sm text-fg/55 mb-4">
                    with {(show.frontmatter.host || []).join(', ')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(show.frontmatter.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] tracking-[1px] uppercase px-2 py-1 border border-fg/20 text-fg/55"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="text-xs tracking-[2px] uppercase px-8 py-4 border border-fg/20 text-fg/65 hover:border-fg/50 hover:text-fg transition-colors duration-150"
            >
              Load More Shows
            </button>
          </div>
        )}
      </section>
    </>
  )
}

export default ShowsPage

export const query = graphql`
  query IndexPageQuery {
    site {
      siteMetadata {
        title
        description
        siteUrl
        image
      }
    }
    allMdx(
      sort: { frontmatter: { date: DESC } }
      filter: {
        frontmatter: { isActive: { eq: true } }
        parent: { internal: { description: { regex: "/content/shows/" } } }
      }
    ) {
      nodes {
        id
        frontmatter {
          title
          description
          slug
          date
          tags
          youtubeId
          isActive
          coverImage {
            childImageSharp {
              gatsbyImageData(
                width: 320
                layout: CONSTRAINED
                formats: [AUTO, WEBP]
              )
            }
          }
          host
        }
      }
    }
  }
`
