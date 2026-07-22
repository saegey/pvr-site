import React from 'react'
import { graphql, Link, PageProps } from 'gatsby'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import { Helmet } from 'react-helmet'
import SEO from '../components/seo'
import { formatDate } from '../utils/date'
import { youTubeHQThumb, youTubeMaxResThumb } from '../utils/youtube'
import { PUBLIC_EVENTS } from '../data/public-events'

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
  const featuredShow = data.allMdx.nodes[0]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingEvents = [...PUBLIC_EVENTS]
    .filter((event) => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2)
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

      <section className="max-w-[1320px] mx-auto px-4 md:px-12 py-16 md:py-24 space-y-20 md:space-y-28">
        {/* ── Upcoming events ── */}
        {upcomingEvents.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between border-t border-b border-fg/12 py-4">
              <span className="text-xs tracking-[2px] uppercase text-fg/55">Upcoming</span>
              <Link to="/events" className="text-xs tracking-[1px] uppercase text-fg/40 hover:text-fg transition-colors">All events →</Link>
            </div>
            {upcomingEvents.map((event) => (
              <Link key={event.slug} to={`/events/${event.slug}`} className="group flex flex-col md:flex-row md:items-center gap-3 md:gap-10 py-7 border-b border-fg/12 hover:bg-fg/[0.03] transition-colors -mx-4 px-4">
                <p className="text-xs tracking-[2px] uppercase text-fg/45 md:w-36 shrink-0">{event.date}</p>
                <div className="flex-1">
                  <h2 className="text-fg leading-snug" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 34px)' }}>{event.title}</h2>
                  <p className="mt-1 text-sm text-fg/55">{event.venue} · {event.time}</p>
                </div>
                <span className="text-xs tracking-[1px] uppercase text-fg/45 group-hover:text-fg transition-colors">Details →</span>
              </Link>
            ))}
          </div>
        )}

        {/* ── Featured archive show ── */}
        {featuredShow && (() => {
          const coverImageData = featuredShow.frontmatter.coverImage ? getImage(featuredShow.frontmatter.coverImage as any) : null
          return (
            <div>
              <div className="flex items-baseline justify-between border-t border-b border-fg/12 py-4 mb-6">
                <span className="text-xs tracking-[2px] uppercase text-fg/55">From the archive</span>
                <Link to="/shows" className="text-xs tracking-[1px] uppercase text-fg/40 hover:text-fg transition-colors">All shows →</Link>
              </div>
              <Link to={`/shows/${featuredShow.frontmatter.slug}`} className="group grid md:grid-cols-2 border border-fg/12 hover:border-fg/30 transition-colors">
                <div className="aspect-video bg-fg/5 overflow-hidden">
                  {featuredShow.frontmatter.youtubeId ? (
                    <img src={youTubeMaxResThumb(featuredShow.frontmatter.youtubeId)} alt={featuredShow.frontmatter.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" onError={(e) => { const image = e.currentTarget; image.onerror = null; image.src = youTubeHQThumb(featuredShow.frontmatter.youtubeId) }} />
                  ) : coverImageData ? (
                    <GatsbyImage image={coverImageData} alt={featuredShow.frontmatter.title} className="w-full h-full" imgStyle={{ objectFit: 'cover' }} />
                  ) : null}
                </div>
                <div className="p-6 md:p-10 flex flex-col justify-between">
                  <div>
                    <p className="text-xs tracking-[2px] uppercase text-fg/45 mb-5">{formatDate(featuredShow.frontmatter.date)}</p>
                    <h2 className="text-fg leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 48px)', letterSpacing: '-0.5px' }}>{featuredShow.frontmatter.title}</h2>
                    <p className="mt-4 text-sm leading-relaxed text-fg/60">{featuredShow.frontmatter.description}</p>
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
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-fg/60">Every PVR set is selected and mixed on vinyl: deep cuts, worldwide rhythms, and the kind of sequencing that rewards staying through the last record. We build custom setups for spaces where the music can take over.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/about" className="text-xs tracking-[1px] uppercase px-5 py-3 border border-fg/25 text-fg/70 hover:border-fg hover:text-fg transition-colors">About PVR →</Link>
              <Link to="/shop" className="text-xs tracking-[1px] uppercase px-5 py-3 border border-fg/25 text-fg/70 hover:border-fg hover:text-fg transition-colors">Visit the shop →</Link>
            </div>
          </div>
        </div>
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
        frontmatter: { isActive: { eq: true }, slug: { eq: "tropical-sunsets" } }
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
