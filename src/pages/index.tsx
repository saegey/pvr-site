import React from 'react'
import { graphql, Link, PageProps, HeadProps } from 'gatsby'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import SEO from '../components/seo'
import { formatDate } from '../utils/date'
import { youTubeHQThumb, youTubeMaxResThumb } from '../utils/youtube'
import { partitionEvents, formatEventDate, formatEventDateShort, formatTimeRange, eventCoverSrc, PublicEvent } from '../data/public-events'

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
    featured?: boolean
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
  const featuredShow = data.allMdx.nodes[0]
  const { upcoming, past } = partitionEvents()
  const upcomingEvents = upcoming.slice(0, 3)
  const recentEvents = past.slice(0, 4)
  const [leadEvent, ...gridEvents] = recentEvents

  const eventThumb = eventCoverSrc
  const eventMeta = (e: PublicEvent) =>
    [
      e.photos?.length ? `${e.photos.length} photos` : null,
      e.tracklist?.length ? `${e.tracklist.length} tracks` : null,
      e.audioUrl ? 'Set audio' : null,
    ]
      .filter(Boolean)
      .join(' · ')

  return (
    <>
      {/* ── Hero band ── */}
      <section className="relative min-h-[380px] flex flex-col justify-end overflow-hidden">
        {/* Background image */}
        <div
          className="hero-bg absolute inset-0 bg-cover bg-center grayscale"
          style={{ opacity: 0.2 }}
        />
        {/* Grain overlay */}
        <div
          className="hidden md:block absolute inset-0 grain-overlay pointer-events-none"
          style={{
            backgroundImage: 'url(/images/grain.webp)',
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
            mixBlendMode: 'overlay',
            opacity: 0.3,
          }}
        />
        {/* Hero text */}
        <div className="relative z-10 max-w-[1320px] w-full mx-auto px-6 md:px-12 pb-10 md:pb-14 pt-24 md:pt-28">
          <p className="hero-fadeup-1 text-xs tracking-[2px] uppercase text-fg/55 mb-5">
            Seattle, WA — Est. 2025
          </p>
          <h1
            className="hero-fadeup-2 text-fg leading-none tracking-tight mb-8"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 6vw, 88px)',
              letterSpacing: '-0.5px',
            }}
          >
            The future<br />is analog.
          </h1>
          <div className="hero-fadeup-3 border-t border-fg/12 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
            <p className="font-text text-base text-fg/70 leading-relaxed">
              A Seattle collective built around vinyl and the rooms it plays in. Live and intimate —
              custom setups, curated sounds, original art.
            </p>
            <p className="font-text text-base text-fg/70 leading-relaxed">
              Come to a night, hear the recaps.{' '}
              <Link to="/events" className="text-fg underline underline-offset-2 hover:text-fg/70 transition-colors">
                See events →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[1320px] mx-auto px-4 md:px-12 py-12 md:py-16 space-y-14 md:space-y-20">
        {/* ── Upcoming events ── */}
        {upcomingEvents.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between border-t border-b border-fg/12 py-4">
              <span className="text-xs tracking-[2px] uppercase text-fg/55">Upcoming</span>
              <Link to="/events" className="text-xs tracking-[1px] uppercase text-fg/55 hover:text-fg transition-colors">All events →</Link>
            </div>
            {upcomingEvents.map((event) => (
              <Link key={event.slug} to={`/events/${event.slug}`} className="group flex flex-col md:flex-row md:items-center gap-3 md:gap-10 py-6 border-b border-fg/12 hover:bg-fg/[0.03] transition-colors -mx-4 px-4">
                <p className="text-xs tracking-[2px] uppercase text-fg/55 md:w-36 shrink-0">{formatEventDate(event.startDateTime)}</p>
                <div className="flex-1">
                  <h2 className="text-fg leading-snug" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 34px)' }}>{event.title}</h2>
                  <p className="mt-1 text-sm text-fg/55">{event.venue} · {formatTimeRange(event.startDateTime, event.endDateTime)}</p>
                </div>
                <span className="text-xs tracking-[1px] uppercase text-fg/55 group-hover:text-fg transition-colors">{event.rsvpEnabled ? 'RSVP →' : 'Details →'}</span>
              </Link>
            ))}
          </div>
        )}

        {/* ── Recent events (recaps) ── */}
        {recentEvents.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between border-t border-b border-fg/12 py-4 mb-6">
              <span className="text-xs tracking-[2px] uppercase text-fg/55">{upcomingEvents.length > 0 ? 'Recent nights' : 'Latest nights'}</span>
              <Link to="/events" className="text-xs tracking-[1px] uppercase text-fg/55 hover:text-fg transition-colors">All events →</Link>
            </div>

            {/* Lead recap */}
            {leadEvent && (
              <Link to={`/events/${leadEvent.slug}`} className="group grid md:grid-cols-2 border border-fg/12 hover:border-fg/30 transition-colors">
                <div className="aspect-video md:aspect-auto bg-fg/5 overflow-hidden">
                  {eventThumb(leadEvent) && (
                    <img src={eventThumb(leadEvent)} alt={leadEvent.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-[1.02]" loading="lazy" decoding="async" />
                  )}
                </div>
                <div className="p-6 md:p-10 flex flex-col justify-between">
                  <div>
                    <p className="text-xs tracking-[2px] uppercase text-fg/55 mb-5">{formatEventDate(leadEvent.startDateTime)}</p>
                    <h2 className="text-fg leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 48px)', letterSpacing: '-0.5px' }}>{leadEvent.title}</h2>
                    <p className="mt-3 text-sm text-fg/55">{leadEvent.venue}{leadEvent.location ? ` · ${leadEvent.location}` : ''}</p>
                    <p className="font-text mt-4 text-[15px] leading-relaxed text-fg/65 line-clamp-3">{leadEvent.description}</p>
                  </div>
                  <div className="mt-8 flex items-center justify-between gap-4">
                    {eventMeta(leadEvent) && <span className="text-xs tracking-[1px] uppercase text-fg/45">{eventMeta(leadEvent)}</span>}
                    <span className="text-xs tracking-[1px] uppercase text-fg/55 group-hover:text-fg transition-colors shrink-0">View recap →</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Recap grid */}
            {gridEvents.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 mt-8">
                {gridEvents.map((event) => (
                  <Link key={event.slug} to={`/events/${event.slug}`} className="group flex flex-col">
                    <div className="aspect-video bg-fg/5 overflow-hidden mb-4">
                      {eventThumb(event) && (
                        <img src={eventThumb(event)} alt={event.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-[1.02]" loading="lazy" decoding="async" />
                      )}
                    </div>
                    <p className="text-[11px] tracking-[2px] uppercase text-fg/55">{formatEventDateShort(event.startDateTime)}</p>
                    <h3 className="card-title mt-1.5 text-fg leading-snug" style={{ fontSize: '19px' }}>{event.title}</h3>
                    <p className="mt-1 text-sm text-fg/55">{event.venue}</p>
                    {eventMeta(event) && <p className="mt-3 text-[11px] tracking-[1px] uppercase text-fg/45">{eventMeta(event)}</p>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Featured show (single) ── */}
        {featuredShow && (() => {
          const coverImageData = featuredShow.frontmatter.coverImage ? getImage(featuredShow.frontmatter.coverImage as any) : null
          return (
            <div>
              <div className="flex items-baseline justify-between border-t border-b border-fg/12 py-4 mb-6">
                <span className="text-xs tracking-[2px] uppercase text-fg/55">From the archive</span>
                <Link to="/shows" className="text-xs tracking-[1px] uppercase text-fg/55 hover:text-fg transition-colors">All shows →</Link>
              </div>
              <Link to={`/shows/${featuredShow.frontmatter.slug}`} className="group grid md:grid-cols-2 border border-fg/12 hover:border-fg/30 transition-colors">
                <div className="aspect-video bg-fg/5 overflow-hidden">
                  {featuredShow.frontmatter.youtubeId ? (
                    <picture>
                      <source media="(max-width: 768px)" srcSet={youTubeHQThumb(featuredShow.frontmatter.youtubeId)} />
                      <img src={youTubeMaxResThumb(featuredShow.frontmatter.youtubeId)} alt={featuredShow.frontmatter.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" decoding="async" onError={(e) => { const image = e.currentTarget; image.onerror = null; image.src = youTubeHQThumb(featuredShow.frontmatter.youtubeId) }} />
                    </picture>
                  ) : coverImageData ? (
                    <GatsbyImage image={coverImageData} alt={featuredShow.frontmatter.title} className="w-full h-full" imgStyle={{ objectFit: 'cover' }} />
                  ) : null}
                </div>
                <div className="p-6 md:p-10 flex flex-col justify-between">
                  <div>
                    <p className="text-xs tracking-[2px] uppercase text-fg/55 mb-5">{formatDate(featuredShow.frontmatter.date)}</p>
                    <h2 className="text-fg leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 48px)', letterSpacing: '-0.5px' }}>{featuredShow.frontmatter.title}</h2>
                    <p className="font-text mt-4 text-[15px] leading-relaxed text-fg/65">{featuredShow.frontmatter.description}</p>
                  </div>
                  <p className="mt-8 text-xs tracking-[1px] uppercase text-fg/55 group-hover:text-fg transition-colors">Listen to the set →</p>
                </div>
              </Link>
            </div>
          )
        })()}

        {/* ── PVR approach ── */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-fg/12 pt-6">
          <p className="text-xs tracking-[2px] uppercase text-fg/55">The PVR approach</p>
          <div>
            <p className="text-fg leading-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 46px)' }}>Built for listening rooms, bike houses, and late nights.</p>
            <p className="font-text mt-6 max-w-2xl text-base leading-relaxed text-fg/70">Every PVR set is selected and mixed on vinyl: deep cuts, worldwide rhythms, and the kind of sequencing that rewards staying through the last record. We build custom setups for spaces where the music can take over.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/events" className="text-xs tracking-[1px] uppercase px-5 py-3 border border-fg/25 text-fg/70 hover:border-fg hover:text-fg transition-colors">See events →</Link>
              <Link to="/shop" className="text-xs tracking-[1px] uppercase px-5 py-3 border border-fg/25 text-fg/70 hover:border-fg hover:text-fg transition-colors">Visit the shop →</Link>
              <Link to="/join" className="text-xs tracking-[1px] uppercase px-5 py-3 border border-fg/25 text-fg/70 hover:border-fg hover:text-fg transition-colors">Join the newsletter →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ShowsPage

export const Head = ({ data }: HeadProps<DataProps>) => {
  const { siteMetadata } = data.site
  return (
    <>
      <SEO title="Public Vinyl Radio" url={siteMetadata.siteUrl} />
      <link rel="preload" as="image" href="/images/hero-bg-mobile.webp" type="image/webp" media="(max-width: 768px)" />
      <link rel="preload" as="image" href="/images/hero-bg.webp" type="image/webp" media="(min-width: 769px)" />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          url: siteMetadata.siteUrl,
          name: siteMetadata.title,
          description: siteMetadata.description,
        })}
      </script>
    </>
  )
}

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
        frontmatter: { isActive: { eq: true }, featured: { eq: true } }
        parent: { internal: { description: { regex: "/content/shows/" } } }
      }
      limit: 1
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
                width: 900
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
